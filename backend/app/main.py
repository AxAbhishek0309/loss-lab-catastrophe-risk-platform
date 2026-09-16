import json
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.duckdb import db
from backend.app.api.router import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed 50,000 catastrophe events into DuckDB from CSV
    try:
        csv_path = "data/catastrophe_events.csv"
        if Path(csv_path).exists() and db.count_events() < 1000:
            db.load_csv_dataset(csv_path)
        elif db.count_events() == 0 and Path(settings.SAMPLE_DATA_PATH).exists():
            with open(settings.SAMPLE_DATA_PATH, "r") as f:
                sample_events = json.load(f)
                db.insert_events(sample_events)
                print(f"[LossLab] Seeded {len(sample_events)} catastrophe events into DuckDB.")
    except Exception as ex:
        print(f"[LossLab] Error initializing database: {ex}")

    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Catastrophe Risk Analytics & Actuarial Monte Carlo Simulation Platform API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
