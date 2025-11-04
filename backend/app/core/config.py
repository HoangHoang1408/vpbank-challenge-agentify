from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "RM Co-Pilot API"
    environment: Literal["development", "staging", "production"] = "development"
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/rm_copilot"
    )
    api_v1_prefix: str = "/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

