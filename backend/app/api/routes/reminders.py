from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_session
from ...core.utils import customer_initials, date_key_to_date
from ...models.crm import DimCustomer, DimRM, FactCustRMHist, FactRMTask
from ...schemas.reminder import ReminderItem, ReminderListResponse


router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get("/rms/{rm_key}", response_model=ReminderListResponse)
async def list_reminders_for_rm(
    rm_key: int, days_ahead: int = 30, session: AsyncSession = Depends(get_session)
) -> ReminderListResponse:
    rm = await session.get(DimRM, rm_key)
    if rm is None:
        raise HTTPException(status_code=404, detail="RM not found")

    today = date.today()
    horizon = today + timedelta(days=max(days_ahead, 1))

    last_contact_stmt = (
        select(
            FactCustRMHist.customer_key,
            func.max(FactCustRMHist.date_key).label("last_contact_key"),
        )
        .where(FactCustRMHist.rm_key == rm_key)
        .group_by(FactCustRMHist.customer_key)
    )
    contact_result = await session.execute(last_contact_stmt)
    last_contact_map = {
        row.customer_key: date_key_to_date(row.last_contact_key)
        for row in contact_result
        if row.last_contact_key is not None
    }

    task_stmt = (
        select(FactRMTask, DimCustomer)
        .join(DimCustomer, FactRMTask.customer_key == DimCustomer.customer_key)
        .where(FactRMTask.rm_key == rm_key)
        .where(FactRMTask.task_status.in_(["Open", "In Progress"]))
        .order_by(FactRMTask.due_date.asc())
    )

    tasks_result = await session.execute(task_stmt)

    reminders: list[ReminderItem] = []
    for task, customer in tasks_result.all():
        if task.due_date > horizon:
            continue
        days_until_due = (task.due_date - today).days
        reminders.append(
            ReminderItem(
                task_key=task.task_key,
                client_initials=customer_initials(customer.customer_name),
                client_name=customer.customer_name,
                client_segment=customer.customer_segment,
                priority_tier=customer.customer_segment,
                event_summary=task.task_details or task.task_type,
                due_date=task.due_date,
                days_until_due=days_until_due,
                last_contact_date=last_contact_map.get(customer.customer_key),
                task_status=task.task_status,
            )
        )

    return ReminderListResponse(rm_key=rm_key, reminders=reminders)

