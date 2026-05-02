# StoryForge Web

React + Axios + TailwindCSS frontend for the StoryForge API.

## Setup

```bash
npm install
```

Create a local `.env` if your API is not running on `http://127.0.0.1:8000`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Run

```bash
npm run dev
```

The frontend runs at `http://127.0.0.1:5173`.

## Screens

- Public story feed with search, category filtering, and pagination
- Register and login
- Create and edit stories
- Story detail page with likes, saves, and comments
- Public profile pages
- Current user's saved stories
- Admin user moderation

The backend must be running separately from `../backend/`:

```bash
cd ../backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Or run everything together from the project root:

```bash
cd ..
./run-dev.sh
```
