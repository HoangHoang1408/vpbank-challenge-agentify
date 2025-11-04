from typing import Optional

from pydantic import BaseModel


class TonePreset(BaseModel):
    key: str
    label: str
    description: str


class ToneSelectionRequest(BaseModel):
    preset_key: Optional[str] = None
    custom_description: Optional[str] = None


class ToneSelectionResponse(BaseModel):
    rm_key: int
    communication_style: Optional[str]
    llm_prompt_snippet: Optional[str]

