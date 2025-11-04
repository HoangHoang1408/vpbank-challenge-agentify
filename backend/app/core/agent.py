import asyncio
from collections.abc import AsyncGenerator


async def stream_stubbed_agent_response() -> AsyncGenerator[str, None]:
    word = "hello"
    for index, character in enumerate(word):
        await asyncio.sleep(0.05 if index else 0)
        yield f"data: {character}\n\n"
    yield "event: end\ndata: [DONE]\n\n"

