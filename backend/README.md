# RM Co-Pilot Backend (Pseudo APIs)

This FastAPI service exposes provisional endpoints to unblock the frontend while the
production-grade agent and orchestration logic are still in development.

## Features

- Tone onboarding flow: list presets and store Relationship Manager
  communication preferences.
- Agent test endpoint: streams a stubbed `hello` response token-by-token so the
  UI can integrate with streaming responses today.
- Reminder feed: surfaces upcoming client touchpoints from `fact_rm_task` and
  related customer details.
- Draft generation placeholder: returns deterministic email/SMS drafts that
  will later be replaced with LLM-generated content.

## Project Structure

- `app/core`: configuration, database session factory, helper utilities.
- `app/models`: SQLAlchemy models for the shared CRM warehouse tables.
- `app/schemas`: Pydantic response/request contracts shared with the frontend.
- `app/api/routes`: FastAPI routers grouped by product surface area.

## Getting Started

1. **Install dependencies**

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```

2. **Export the database connection string**

   ```bash
   export DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>:<port>/<db>"
   ```

   The default points to `postgresql+asyncpg://postgres:postgres@localhost:5432/rm_copilot`.

3. **Run the API**

   ```bash
   uvicorn app.main:app --reload --port 8000 --app-dir backend
   ```

   The OpenAPI docs live at `http://localhost:8000/docs`.

## Run with Docker Compose

1. Ensure Docker and Docker Compose are installed.
2. From the repository root (`/Users/vinhnguyen/Projects/VPBank_Hackathon`), build and start the services:

   ```bash
   docker compose up --build
   ```

   This launches the FastAPI app on `http://localhost:8000` and a Postgres instance on port `5432` using the `postgres/postgres` credentials and `rm_copilot` database.
3. Press `Ctrl+C` to stop, then run `docker compose down` to clean up containers. The database data persists in the named `postgres_data` volume.

## Notes & Next Steps

- The agent integration currently streams the word `hello`; replace
  `stream_stubbed_agent_response` with real agent orchestration when ready.
- Task prioritisation and last-contact attribution rely on warehouse data; add
  indexes or materialised views as the dataset grows.
- Consider Alembic migrations (not included here) once the schema stabilises.
