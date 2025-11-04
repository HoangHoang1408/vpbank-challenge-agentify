from datetime import date
from typing import Optional

from pydantic import BaseModel


class ReminderItem(BaseModel):
    task_key: int
    client_initials: str
    client_name: str
    client_segment: Optional[str]
    priority_tier: Optional[str]
    event_summary: str
    due_date: date
    days_until_due: int
    last_contact_date: Optional[date]
    task_status: str


class ReminderListResponse(BaseModel):
    rm_key: int
    reminders: list[ReminderItem]

