from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.agent import stream_stubbed_agent_response
from ...core.database import get_session
from ...models.crm import DimRM, DimRMPreference
from ...schemas.agent import AgentTestRequest


router = APIRouter(prefix="/agent", tags=["Agent"])


@router.post("/test")
async def test_agent_endpoint(
    payload: AgentTestRequest, session: AsyncSession = Depends(get_session)
) -> StreamingResponse:
    # Load RM context so the frontend knows we validated the RM and tone
    rm = await session.get(DimRM, payload.rm_key)
    if rm is None:
        raise HTTPException(status_code=404, detail="RM not found")

    # Load the preference to emulate the eventual agent runtime wiring.
    await session.get(DimRMPreference, payload.rm_key)

    # In a real implementation we would trigger the agent here.
    # The stub simply streams the word "hello" token-by-token.
    return StreamingResponse(
        stream_stubbed_agent_response(), media_type="text/event-stream"
    )

