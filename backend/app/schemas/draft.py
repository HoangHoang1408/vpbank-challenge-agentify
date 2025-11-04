from typing import Optional

from pydantic import BaseModel


class DraftChannelContent(BaseModel):
    subject: Optional[str] = None
    body: str
    compliance_note: Optional[str] = None


class DraftMessageResponse(BaseModel):
    rm_key: int
    customer_key: int
    tone: Optional[str]
    email: DraftChannelContent
    message: DraftChannelContent

