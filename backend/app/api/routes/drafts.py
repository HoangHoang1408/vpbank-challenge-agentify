from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_session
from ...models.crm import DimCustomer, DimRM, DimRMPreference, FactRMTask
from ...schemas.draft import DraftChannelContent, DraftMessageResponse


router = APIRouter(prefix="/drafts", tags=["Drafts"])


@router.get("/rms/{rm_key}/customers/{customer_key}", response_model=DraftMessageResponse)
async def get_draft_for_client(
    rm_key: int,
    customer_key: int,
    task_key: int | None = None,
    session: AsyncSession = Depends(get_session),
) -> DraftMessageResponse:
    rm = await session.get(DimRM, rm_key)
    if rm is None:
        raise HTTPException(status_code=404, detail="RM not found")

    customer = await session.get(DimCustomer, customer_key)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    if customer.rm_key != rm_key:
        raise HTTPException(status_code=400, detail="Customer does not belong to RM")

    preference = await session.get(DimRMPreference, rm_key)
    tone_label = preference.communication_style if preference else None
    tone_snippet = preference.llm_prompt_snippet if preference else None

    event_summary = None
    if task_key is not None:
        task = await session.get(FactRMTask, task_key)
        if task and task.rm_key == rm_key and task.customer_key == customer_key:
            event_summary = task.task_details or task.task_type

    subject_hint = event_summary or "Client Check-in"
    agent_stub_output = "hello"

    email_body = (
        f"Dear {customer.customer_name},\n\n"
        f"{agent_stub_output}\n\n"
        f"Best regards,\n{rm.rm_name}"
    )

    message_body = f"Hi {customer.customer_name}! {agent_stub_output}"

    compliance_note = (
        "Compliance Note: This message will be copied to your clipboard. "
        "Open your messaging channel to send manually."
    )

    return DraftMessageResponse(
        rm_key=rm_key,
        customer_key=customer_key,
        tone=tone_label or tone_snippet,
        email=DraftChannelContent(subject=subject_hint, body=email_body),
        message=DraftChannelContent(body=message_body, compliance_note=compliance_note),
    )

