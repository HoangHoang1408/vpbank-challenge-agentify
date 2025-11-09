"""Configuration management for the agent backend."""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    # OpenAI Configuration
    openai_api_key: str = ""
    
    # MCP Server Configuration
    mcp_server_url: str = "http://localhost:3000/mcp"
    
    # PostgreSQL Configuration
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "postgres"
    
    # Application Configuration
    app_port: int = 8000
    app_host: str = "0.0.0.0"
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


try:
    settings = Settings()
    # Validate that API key is set (but allow empty string for Pydantic validation)
    if not settings.openai_api_key:
        import os
        # Only raise if not in test mode
        if os.getenv("SKIP_VALIDATION") != "true":
            raise ValueError(
                "OPENAI_API_KEY is required. Please set it in your .env file or environment variables."
            )
except ValueError:
    # Re-raise validation errors
    raise
except Exception:
    # For other errors, create a dummy settings object if in test mode
    import os
    if os.getenv("SKIP_VALIDATION") == "true":
        settings = Settings(openai_api_key="dummy")  # type: ignore
    else:
        raise

