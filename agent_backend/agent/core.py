"""Core agent implementation using LangGraph and MCP tools."""
import json
from datetime import datetime
from typing import List, Optional, AsyncGenerator

from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
    AIMessageChunk,
    AnyMessage,
)
from langchain_core.runnables import RunnablePassthrough
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command
from langchain_mcp_adapters.client import MultiServerMCPClient  # type: ignore

from .config import settings


def get_today_date() -> str:
    """Get formatted today's date."""
    today = datetime.today()
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_of_week = day_names[today.weekday()]
    month_name_full = today.strftime("%B")
    return f"{day_of_week}, {month_name_full} {today.day}th, {today.year}"


def get_messages(state: MessagesState) -> List[AnyMessage]:
    """Filter and prepare messages for the LLM."""
    max_successful_tool_calls = 2
    add_fail_tool_call = True
    system_message = SystemMessage(
        content="Hôm nay là " + get_today_date() + ".\n"
        "Bạn là trợ lý thông minh cho Quản lý Quan hệ Khách hàng (Relationship Manager) tại Việt Nam, "
        "được thiết kế để tối ưu hóa quy trình làm việc và cung cấp thông tin chi tiết dựa trên dữ liệu "
        "bằng cách sử dụng thành thạo bộ công cụ nội bộ."
    )
    filtered_messages: List[AnyMessage] = []
    
    for message in reversed(state["messages"]):
        if message.type == "human":
            if len(filtered_messages) > 2 and filtered_messages[-2].type == "tool":
                max_successful_tool_calls -= 1
            filtered_messages.append(message)
        if message.type == "tool":
            # Parse tool response
            try:
                if isinstance(message.content, str):
                    tool_result = json.loads(message.content)
                else:
                    tool_result = message.content
                
                tool_code = tool_result.get("code", "succeeded")
                if tool_code == "succeeded":
                    if add_fail_tool_call:
                        add_fail_tool_call = False
                    if max_successful_tool_calls > 0:
                        filtered_messages.append(message)
                else:
                    if add_fail_tool_call:
                        filtered_messages.append(message)
            except (json.JSONDecodeError, AttributeError):
                # If parsing fails, include the message anyway
                if add_fail_tool_call:
                    filtered_messages.append(message)
        elif message.type == "ai":
            if len(filtered_messages) == 0 or filtered_messages[-1].type != "ai":
                filtered_messages.append(message)
    
    filtered_messages.append(system_message)
    return filtered_messages[::-1]


def postprocess_message(message: AnyMessage) -> List[AnyMessage]:
    """Post-process LLM message."""
    return [message]


def approval_node(state: MessagesState):
    """Check if any tool results need user confirmation."""
    last_message = state["messages"][-1]
    
    if hasattr(last_message, 'type') and last_message.type == 'tool':
        # Parse tool result
        if isinstance(last_message.content, str):
            try:
                tool_result = json.loads(last_message.content)
            except Exception:
                return Command(goto="rm_assistant")
        elif isinstance(last_message.content, dict):
            tool_result = last_message.content
        else:
            return Command(goto="rm_assistant")
        
        # Check if confirmation is needed
        if 'ask_confirmation' in tool_result:
            ask_confirmation = tool_result.get('ask_confirmation', False)
            if ask_confirmation:
                # Interrupt and ask for user confirmation
                prev_message = state["messages"][-2]
                if hasattr(prev_message, "tool_calls") and prev_message.tool_calls:
                    tool_call = prev_message.tool_calls[0]
                    tool_name = tool_call.get("name", "unknown")
                    tool_args = tool_call.get("args", {})
                    tool_call_str = (
                        tool_name + "(" +
                        ", ".join([
                            f"{k}='{v}'" if isinstance(v, str) else f"{k}={v}"
                            for k, v in tool_args.items()
                        ]) + ")"
                    )
                else:
                    tool_call_str = "unknown_task"
                ai_message = (
                    "Hãy confirm task sau: " + tool_call_str + "\n"
                    "Nhập 'yes' nếu muốn tiếp tục, 'no' nếu muốn hủy bỏ. "
                    "Nếu nhập bất cứ điều gì khác, task sẽ bị hủy bỏ."
                )
                user_response = interrupt(ai_message)
                user_response_str = str(user_response)
                normalized_response = user_response_str.strip().lower()
                if normalized_response == "yes":
                    return Command(
                        goto="proceed_confirmed_tool",
                        update={
                            "messages": [
                                AIMessage(content=ai_message),
                                HumanMessage(content=user_response_str),
                            ]
                        }
                    )
                else:
                    return Command(
                        goto="rm_assistant",
                        update={
                            "messages": [
                                AIMessage(content=ai_message),
                                HumanMessage(content=user_response_str),
                            ]
                        }
                    )
        else:
            return Command(goto="rm_assistant")
    
    # No confirmation needed, continue normally
    return Command(goto="rm_assistant")




class AgentCore:
    """Core agent implementation."""
    
    def __init__(self):
        """Initialize the agent with MCP tools and LLM."""
        # Initialize OpenAI LLM
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.7,
        )
        
        # Initialize MCP client (will be configured per request with RM ID)
        self.mcp_client = MultiServerMCPClient(
            {
                "tools": {
                    "transport": "streamable_http",
                    "url": settings.mcp_server_url,
                    "headers": {},  # Will be set per request
                },
            }
        )
        
        # Initialize tools (will be loaded asynchronously)
        self.tools = None
        self.all_tools = None  # All tools including internal ones
        self.graph = None
        self.checkpointer = MemorySaver()
        self.current_rm_id: Optional[int] = None
        self.last_state: Optional[MessagesState] = None

        
    async def initialize(self, rm_id: Optional[int] = None):
        """Initialize tools and build the graph."""
        # Re-initialize MCP client with headers if rm_id is provided
        if rm_id is not None:
            self.mcp_client = MultiServerMCPClient(
                {
                    "tools": {
                        "transport": "streamable_http",
                        "url": settings.mcp_server_url,
                        "headers": {"x-rm-id": str(rm_id)},
                    },
                }
            )
            self.current_rm_id = rm_id
        
        # Get tools from MCP server
        all_tools = await self.mcp_client.get_tools()
        
        # Filter out internal tools that should not be bound to LLM
        # These tools (_create_rm_task, _update_rm_task) are only called programmatically after approval
        self.tools = [tool for tool in all_tools if tool.name not in ["_create_rm_task", "_update_rm_task"]]
        
        # Store all tools (including internal ones) for use in proceed_confirmed_tool
        self.all_tools = all_tools
        
        # Build the graph
        builder = StateGraph(MessagesState)
        
        # Create the assistant node using RunnablePassthrough pattern
        rm_assistant = RunnablePassthrough.assign(
            messages=get_messages
            | self.llm.bind_tools(self.tools)
            | postprocess_message
        )
        
        builder.add_node("rm_assistant", rm_assistant)
        builder.add_node("tools", ToolNode(self.tools))
        builder.add_node("approval", approval_node)
        builder.add_node("proceed_confirmed_tool", self.proceed_confirmed_tool)
        
        # Define edges
        builder.add_edge(START, "rm_assistant")
        builder.add_conditional_edges(
            "rm_assistant",
            tools_condition,
        )
        builder.add_edge("tools", "approval")
        builder.add_conditional_edges(
            "approval",
            approval_node,
        )
        builder.add_edge("proceed_confirmed_tool", END)
        
        # Compile the graph
        self.graph = builder.compile(checkpointer=self.checkpointer)
        
    async def chat(
        self,
        message: str,
        thread_id: str,
        rm_id: int,
    ) -> dict:
        """
        Process a chat message.
        
        Args:
            message: User message
            thread_id: Thread identifier for conversation history
            rm_id: Relationship Manager ID
            
        Returns:
            Response dictionary with AI message. If graph interrupts, returns the
            interrupt question as the AI message.
        """
        # Check if we need to re-initialize (new rm_id or first time)
        if self.graph is None or self.current_rm_id != rm_id:
            await self.initialize(rm_id=rm_id)
        
        config = {
            "configurable": {
                "thread_id": thread_id,
            }
        }
        
        # Check if there's a pending interrupt
        interrupt_message = self.check_for_interrupt(thread_id)
        
        if interrupt_message is not None:
            # Resume with user's response
            result = await self.graph.ainvoke(
                Command(resume=message.strip()),
                config=config,
            )
        else:
            # Normal invocation
            input_state = {"messages": [HumanMessage(content=message)]}
            result = await self.graph.ainvoke(input_state, config=config)

        self.last_state = result
        
        # Check if graph interrupted
        if "__interrupt__" in result:
            interrupts = result.get("__interrupt__")
            if interrupts and len(interrupts) > 0:
                interrupt_value = interrupts[0].value
                if interrupt_value is not None:
                    # Return the interrupt question as AI message
                    return {
                        "message": str(interrupt_value),
                        "interrupted": True,
                    }
        
        # Normal response - return the last AI message
        messages = result.get("messages", [])
        ai_messages = [msg for msg in messages if isinstance(msg, AIMessage)]
        last_message = ai_messages[-1].content if ai_messages else ""
        
        return {
            "message": last_message,
            "interrupted": False,
        }
    
    async def stream_chat(
        self,
        message: str,
        thread_id: str,
        rm_id: int,
    ) -> AsyncGenerator[dict, None]:
        """
        Stream chat responses.
        
        Args:
            message: User message
            thread_id: Thread identifier
            rm_id: Relationship Manager ID
            
        Yields:
            Dictionary with 'content' (text chunk), 'done' (boolean), and 'interrupted' (boolean)
        """
        # Check if we need to re-initialize (new rm_id or first time)
        if self.graph is None or self.current_rm_id != rm_id:
            await self.initialize(rm_id=rm_id)
        
        config = {
            "configurable": {
                "thread_id": thread_id,
            }
        }
        
        # Check if there's a pending interrupt
        interrupt_message = self.check_for_interrupt(thread_id)
        
        try:
            if interrupt_message is not None:
                # Resume with user's response
                stream = self.graph.stream(
                    Command(resume=message.strip()),
                    config=config,
                    stream_mode="messages",
                )
            else:
                # Normal invocation
                input_state = {"messages": [HumanMessage(content=message)]}
                stream = self.graph.stream(
                    input_state,
                    config=config,
                    stream_mode="messages",
                )
            
            # Stream AI message chunks
            async for chunk in stream:
                if isinstance(chunk, tuple) and len(chunk) >= 2:
                    chunk_msg, _ = chunk[0], chunk[1]
                    if isinstance(chunk_msg, AIMessageChunk):
                        yield {
                            "content": chunk_msg.content,
                            "done": False,
                            "interrupted": False,
                        }
                    elif isinstance(chunk_msg, AIMessage):
                        yield {
                            "content": chunk_msg.content,
                            "done": False,
                            "interrupted": False,
                        }
            
            # After streaming, check if graph interrupted
            state = self.graph.get_state(config)
            if state and hasattr(state, 'values'):
                result = state.values
                if "__interrupt__" in result:
                    interrupts = result.get("__interrupt__")
                    if interrupts and len(interrupts) > 0:
                        interrupt_value = interrupts[0].value
                        if interrupt_value is not None:
                            # Stream the interrupt question
                            interrupt_text = str(interrupt_value)
                            yield {
                                "content": interrupt_text,
                                "done": True,
                                "interrupted": True,
                            }
                            return
            
            # Normal completion
            yield {
                "content": "",
                "done": True,
                "interrupted": False,
            }
            
        except Exception as e:
            yield {
                "content": f"Lỗi: {str(e)}",
                "done": True,
                "interrupted": False,
            }
    

    def check_for_interrupt(self, thread_id: str) -> Optional[str]:
        """
        Check if the graph is waiting for an interrupt.
        
        Args:
            thread_id: Thread identifier
            
        Returns:
            Interrupt message if present, None otherwise
        """
        state = self.last_state
        if state and "__interrupt__" in state:
            interrupts = state["__interrupt__"]
            if interrupts and len(interrupts) > 0:
                return interrupts[0].value
        return None
    
    async def proceed_confirmed_tool(self, state: MessagesState):
        """Execute the actual tool operation after user confirmation via MCP.
        
        This function is called after user approves a create_rm_task or update_rm_task call.
        It then calls the internal MCP tools _create_rm_task or _update_rm_task to actually
        perform the database operation.
        """
        # Find the last tool call that was made by the assistant
        tool_call = None
        for message in reversed(state["messages"]):
            if hasattr(message, 'tool_calls') and message.tool_calls:
                tool_call = message.tool_calls[0]  # Get the first tool call
                break
        
        if not tool_call:
            return {"messages": [AIMessage(content="Lỗi: Không tìm thấy lệnh công cụ để thực thi.")]}
        
        # Get the tool name from the tool call (will be "create_rm_task" or "update_rm_task")
        tool_name = tool_call.get("name")
        tool_args = tool_call.get("args", {})
        
        # Find the internal MCP tool by prepending underscore
        # e.g., "create_rm_task" -> "_create_rm_task", "update_rm_task" -> "_update_rm_task"
        # These internal tools are NOT bound to the LLM and are only called here after approval
        internal_tool = None
        if self.all_tools:
            internal_tool_name = f"_{tool_name}"
            for tool in self.all_tools:
                if tool.name == internal_tool_name:
                    internal_tool = tool
                    break
        
        if not internal_tool:
            raise ValueError(f"Không tìm thấy công cụ _{tool_name} trong MCP Server")
        
        try:
            # Prepare arguments for the internal tool
            if tool_name == "create_rm_task":
                if self.current_rm_id is None:
                    return {"messages": [AIMessage(content="Lỗi: Không tìm thấy ID của Quản lý Quan hệ Khách hàng.")]}
                # Add rmId to the arguments
                mcp_args = {
                    "rmId": int(self.current_rm_id),
                    "customerId": int(tool_args.get("customerId")),  # type: ignore
                    "taskType": str(tool_args.get("taskType")),  # type: ignore
                    "taskStatus": str(tool_args.get("taskStatus")),  # type: ignore
                    "taskDueDate": str(tool_args.get("taskDueDate")),  # type: ignore
                    "taskDetails": str(tool_args.get("taskDetails", "")),  # type: ignore
                }
            elif tool_name == "update_rm_task":
                mcp_args = {
                    "rmTaskId": int(tool_args.get("rmTaskId")),  # type: ignore
                    "updateTaskStatus": tool_args.get("updateTaskStatus"),  # type: ignore
                    "updateTaskDueDate": tool_args.get("updateTaskDueDate"),  # type: ignore
                    "updateTaskDetails": tool_args.get("updateTaskDetails"),  # type: ignore
                }
            else:
                return {"messages": [AIMessage(content="Công cụ đã chạy thành công!")]}
            
            # Execute the actual tool via MCP
            result = await internal_tool.ainvoke(mcp_args)
            
            # Return success message
            success_message = f"Nhiệm vụ đã được thực thi thành công! {result.get('message', '') if isinstance(result, dict) else str(result)}"
            return {
                "messages": [
                    AIMessage(content=success_message)
                ]
            }
        except Exception as e:
            return {
                "messages": [
                    AIMessage(content=f"Lỗi khi thực thi công cụ: {str(e)}")
                ]
            }



