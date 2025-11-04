from typing import Optional

from pydantic import BaseModel


class AgentTestRequest(BaseModel):
    rm_key: int
    prompt: str
    tone_override: Optional[str] = None
    conversation_id: Optional[str] = None

