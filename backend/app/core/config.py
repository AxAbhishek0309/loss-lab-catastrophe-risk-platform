import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "LossLab Catastrophe Risk Platform API"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DUCKDB_PATH: str = os.getenv("DUCKDB_PATH", str(BASE_DIR / "data" / "cat_risk.duckdb"))
    SAMPLE_DATA_PATH: str = str(BASE_DIR / "data" / "sample_events.json")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
