#!/usr/bin/env bash
set -e

# Change to project root directory
cd "$(dirname "$0")/.."

echo "========================================================"
echo "          LossLab Catastrophe Risk Platform             "
echo "========================================================"

# Check if Python virtual environment exists
if [ ! -d "backend/.venv" ]; then
    echo "[1/4] Setting up Python virtual environment..."
    python3 -m venv backend/.venv
    backend/.venv/bin/pip install -r backend/requirements.txt
fi

echo "[2/4] Initializing DuckDB and verifying pipeline..."
PYTHONPATH=. backend/.venv/bin/python -c "
from backend.app.db.duckdb import db
import json
from pathlib import Path
if db.count_events() == 0 and Path('backend/data/sample_events.json').exists():
    with open('backend/data/sample_events.json') as f:
        events = json.load(f)
        db.insert_events(events)
print(f'DuckDB initialized with {db.count_events()} catastrophe events.')
"

echo "[3/4] Starting FastAPI backend on http://127.0.0.1:8000..."
PYTHONPATH=. backend/.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "[4/4] Starting Next.js frontend on http://localhost:3000..."
trap "kill $BACKEND_PID 2>/dev/null || true" EXIT

npm run dev
