"""FastAPI application for the agent backend."""
from contextlib import asynccontextmanager
from typing import Optional
import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agent.core import AgentCore
from agent.config import settings


# Global agent instance
agent: Optional[AgentCore] = None


def get_thread_id_from_rm_id(rm_id: int) -> str:
    """
    Automatically map rm_id to thread_id.
    
    Args:
        rm_id: Relationship Manager ID
        
    Returns:
        Thread identifier string
    """
    return f"rm_{rm_id}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    global agent
    # Startup - initialize agent (tools will be loaded on first request with RM ID)
    agent = AgentCore()
    # Note: Full initialization happens on first request when RM ID is available
    yield
    # Shutdown
    agent = None


app = FastAPI(
    title="Agent Backend API",
    description="Production-ready agent backend using LangGraph and MCP tools",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)


# Request/Response models
class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., description="User message")
    rm_id: int = Field(..., description="Relationship Manager ID")


class ChatResponse(BaseModel):
    """Chat response model."""
    message: str = Field(..., description="AI response message")
    interrupted: bool = Field(..., description="Whether the agent is waiting for user confirmation")


class StreamChatRequest(BaseModel):
    """Stream chat request model."""
    message: str = Field(..., description="User message")
    rm_id: int = Field(..., description="Relationship Manager ID")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Agent Backend API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "agent_initialized": agent is not None
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return the response.
    
    This endpoint handles both new messages and resuming from interrupts automatically.
    When the graph interrupts (e.g., asking for confirmation), the interrupt question
    is returned as the AI message with interrupted=True.
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        # Auto-generate thread_id from rm_id
        thread_id = get_thread_id_from_rm_id(request.rm_id)
        
        result = await agent.chat(
            message=request.message,
            thread_id=thread_id,
            rm_id=request.rm_id,
        )
        
        return ChatResponse(
            message=result["message"],
            interrupted=result["interrupted"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.post("/chat/stream")
async def stream_chat(request: StreamChatRequest):
    """
    Stream chat responses in real-time.
    
    Returns a Server-Sent Events (SSE) stream of message chunks.
    When the graph interrupts (e.g., asking for confirmation), the interrupt question
    is streamed with interrupted=True and done=True.
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    async def generate():
        """Generate streaming response."""
        try:
            # Auto-generate thread_id from rm_id
            thread_id = get_thread_id_from_rm_id(request.rm_id)
            
            async for chunk_data in agent.stream_chat(
                message=request.message,
                thread_id=thread_id,
                rm_id=request.rm_id,
            ):
                # chunk_data is a dict with 'content', 'done', and 'interrupted' keys
                yield f"data: {json.dumps(chunk_data)}\n\n"
                
                # If done, break
                if chunk_data.get("done", False):
                    break
            
            # Send final done signal
            yield "data: [DONE]\n\n"
        except Exception as e:
            error_data = {
                "content": f"Error: {str(e)}",
                "done": True,
                "interrupted": False,
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.get("/interrupt/{rm_id}")
async def check_interrupt(rm_id: int):
    """
    Check if there's a pending interrupt for a relationship manager.
    
    Args:
        rm_id: Relationship Manager ID
        
    Returns:
        Dictionary with interrupt status and message if present, None otherwise.
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    # Auto-generate thread_id from rm_id
    thread_id = get_thread_id_from_rm_id(rm_id)
    interrupt_message = agent.check_for_interrupt(thread_id)
    return {
        "has_interrupt": interrupt_message is not None,
        "interrupt_message": interrupt_message,
    }


@app.delete("/chat/history/{rm_id}")
async def clear_chat_history(rm_id: int):
    """
    Clear chat history for a relationship manager.
    
    Args:
        rm_id: Relationship Manager ID
        
    Returns:
        Dictionary with success status and message.
    """
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        # Auto-generate thread_id from rm_id
        thread_id = get_thread_id_from_rm_id(rm_id)
        
        # Delete the thread from checkpointer
        agent.checkpointer.delete_thread(thread_id)
        
        return {
            "success": True,
            "message": f"Chat history cleared for RM ID {rm_id}",
            "thread_id": thread_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=True,
    )

