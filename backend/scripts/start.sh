export DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>:<port>/<db>"

uvicorn app.main:app --reload --port 8000 --app-dir backend