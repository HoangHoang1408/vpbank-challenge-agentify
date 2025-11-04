from typing import Final

from ..schemas.tone import TonePreset


DEFAULT_TONES: Final[list[TonePreset]] = [
    TonePreset(
        key="formal",
        label="Formal & Professional",
        description="Structured, respectful communication.",
    ),
    TonePreset(
        key="friendly",
        label="Friendly & Warm",
        description="Approachable and personable.",
    ),
    TonePreset(
        key="balanced",
        label="Balanced",
        description="Professional yet personable.",
    ),
]


def get_tone_presets() -> list[TonePreset]:
    return DEFAULT_TONES

