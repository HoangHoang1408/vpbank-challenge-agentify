from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_session
from ...core.tones import get_tone_presets
from ...models.crm import DimRM, DimRMPreference
from ...schemas.tone import TonePreset, ToneSelectionRequest, ToneSelectionResponse


router = APIRouter(prefix="/tones", tags=["Tone Preferences"])


@router.get("/presets", response_model=list[TonePreset])
async def list_tone_presets() -> list[TonePreset]:
    return get_tone_presets()


@router.get("/rms/{rm_key}", response_model=ToneSelectionResponse)
async def get_rm_tone_preferences(
    rm_key: int, session: AsyncSession = Depends(get_session)
) -> ToneSelectionResponse:
    preference = await session.get(DimRMPreference, rm_key)
    if preference is None:
        rm = await session.get(DimRM, rm_key)
        if rm is None:
            raise HTTPException(status_code=404, detail="RM not found")
        return ToneSelectionResponse(
            rm_key=rm_key,
            communication_style=None,
            llm_prompt_snippet=None,
        )
    return ToneSelectionResponse(
        rm_key=rm_key,
        communication_style=preference.communication_style,
        llm_prompt_snippet=preference.llm_prompt_snippet,
    )


@router.post("/rms/{rm_key}", response_model=ToneSelectionResponse)
async def upsert_rm_tone_preferences(
    rm_key: int,
    payload: ToneSelectionRequest,
    session: AsyncSession = Depends(get_session),
) -> ToneSelectionResponse:
    rm = await session.get(DimRM, rm_key)
    if rm is None:
        raise HTTPException(status_code=404, detail="RM not found")

    presets = {preset.key: preset for preset in get_tone_presets()}

    communication_style: str | None = None
    prompt_snippet: str | None = None

    if payload.preset_key:
        preset = presets.get(payload.preset_key)
        if preset is None:
            raise HTTPException(status_code=400, detail="Unknown tone preset key")
        communication_style = preset.label
        prompt_snippet = payload.custom_description or preset.description
    elif payload.custom_description:
        communication_style = "Custom"
        prompt_snippet = payload.custom_description
    else:
        raise HTTPException(
            status_code=400, detail="Submit a preset key or provide a custom description"
        )

    preference = await session.get(DimRMPreference, rm_key)
    if preference is None:
        preference = DimRMPreference(
            rm_key=rm_key,
            communication_style=communication_style,
            llm_prompt_snippet=prompt_snippet,
        )
        session.add(preference)
    else:
        preference.communication_style = communication_style
        preference.llm_prompt_snippet = prompt_snippet

    await session.commit()
    await session.refresh(preference)

    return ToneSelectionResponse(
        rm_key=rm_key,
        communication_style=preference.communication_style,
        llm_prompt_snippet=preference.llm_prompt_snippet,
    )

