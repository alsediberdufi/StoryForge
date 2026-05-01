#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_URL="http://127.0.0.1:8000"
FRONTEND_URL="http://127.0.0.1:5173"

if command -v brew >/dev/null 2>&1; then
  brew services start postgresql@16 >/dev/null
else
  echo "Homebrew was not found. Start PostgreSQL manually before running this script."
fi

if command -v pg_isready >/dev/null 2>&1; then
  pg_isready -h 127.0.0.1 -p 5432
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$BACKEND_DIR"
if [[ ! -x ".venv/bin/python" ]]; then
  echo "Backend virtualenv is missing dependencies. Run: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

if curl -fsS "$BACKEND_URL/" >/dev/null 2>&1; then
  echo "Backend is already running at $BACKEND_URL"
else
  .venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
  BACKEND_PID=$!
fi

cd "$FRONTEND_DIR"
if [[ ! -d "node_modules" ]]; then
  npm install
fi

if curl -fsS "$FRONTEND_URL/" >/dev/null 2>&1; then
  echo "Frontend is already running at $FRONTEND_URL"
  echo "Open $FRONTEND_URL"
else
  npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
fi
