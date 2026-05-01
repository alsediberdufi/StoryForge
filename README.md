# StoryForge

StoryForge is a full-stack social story platform with a FastAPI backend and React frontend.

## Structure

```text
storyforge/
├── backend/   # FastAPI, SQLAlchemy, PostgreSQL, JWT auth
├── frontend/  # React, Axios, TailwindCSS
└── run-dev.sh # Starts PostgreSQL, backend, and frontend together
```

## Run Everything

From this folder:

```bash
./run-dev.sh
```

This starts:

- PostgreSQL with Homebrew
- FastAPI backend at `http://127.0.0.1:8000`
- React frontend at `http://127.0.0.1:5173`

Swagger docs are available at `http://127.0.0.1:8000/docs`.

Uploaded profile and story images are saved locally in `backend/uploads/` and served from `http://127.0.0.1:8000/uploads/...`.

## Manual Run

Backend:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```
