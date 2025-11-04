from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import agent, drafts, reminders, tones
from .core.config import get_settings


settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(tones.router, prefix=settings.api_v1_prefix)
app.include_router(agent.router, prefix=settings.api_v1_prefix)
app.include_router(reminders.router, prefix=settings.api_v1_prefix)
app.include_router(drafts.router, prefix=settings.api_v1_prefix)

