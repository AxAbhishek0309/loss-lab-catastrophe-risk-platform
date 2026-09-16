import os
import json
import duckdb
from pathlib import Path
from backend.app.core.config import settings

class Database:
    def __init__(self, db_path: str = settings.DUCKDB_PATH):
        self.db_path = db_path
        # Ensure parent directory exists
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = duckdb.connect(self.db_path)
        self.init_schema()

    def get_connection(self):
        return self.conn

    def init_schema(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cat_events (
                id VARCHAR PRIMARY KEY,
                name VARCHAR,
                peril VARCHAR,
                country VARCHAR,
                region VARCHAR,
                date VARCHAR,
                year INTEGER,
                magnitude VARCHAR,
                economic_loss DOUBLE,
                insured_loss DOUBLE,
                casualties INTEGER,
                risk_level VARCHAR,
                lat DOUBLE,
                lon DOUBLE
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS exposure_zones (
                zone VARCHAR PRIMARY KEY,
                perils VARCHAR,
                tiv_billions DOUBLE,
                vulnerability VARCHAR,
                aal_ratio_pct DOUBLE
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS scenarios (
                id VARCHAR PRIMARY KEY,
                name VARCHAR,
                description VARCHAR,
                peril VARCHAR,
                aal_multiplier DOUBLE,
                var_multiplier DOUBLE,
                capital_at_risk_usd_billions DOUBLE
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id VARCHAR PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                action VARCHAR,
                details VARCHAR,
                version_hash VARCHAR
            );
        """)

    def load_csv_dataset(self, csv_path: str = "data/catastrophe_events.csv"):
        if Path(csv_path).exists():
            self.conn.execute(f"""
                INSERT OR REPLACE INTO cat_events
                SELECT 
                    event_id as id,
                    name,
                    peril,
                    country,
                    region,
                    date,
                    year,
                    magnitude,
                    economic_loss_usd_b as economic_loss,
                    insured_loss_usd_b as insured_loss,
                    casualties,
                    risk_level,
                    lat,
                    lon
                FROM read_csv_auto('{csv_path}');
            """)
            print(f"[DuckDB] Loaded dataset from {csv_path}: {self.count_events()} records.")

    def count_events(self) -> int:
        result = self.conn.execute("SELECT COUNT(*) FROM cat_events;").fetchone()
        return result[0] if result else 0

    def insert_events(self, events: list[dict]):
        if not events:
            return
        for e in events:
            self.conn.execute("""
                INSERT OR REPLACE INTO cat_events VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                );
            """, [
                e["id"], e["name"], e["peril"], e["country"], e["region"],
                e["date"], e["year"], e["magnitude"], e["economic_loss"],
                e["insured_loss"], e["casualties"], e["risk_level"],
                e["lat"], e["lon"]
            ])

    def query_events(self, peril: str = None, year: int = None, search: str = None, limit: int = 100, offset: int = 0):
        query = "SELECT * FROM cat_events WHERE 1=1"
        params = []

        if peril and peril != "All" and peril != "All Perils":
            query += " AND peril = ?"
            params.append(peril)

        if year:
            query += " AND year = ?"
            params.append(year)

        if search:
            query += " AND (LOWER(name) LIKE ? OR LOWER(country) LIKE ?)"
            params.append(f"%{search.lower()}%")
            params.append(f"%{search.lower()}%")

        count_query = f"SELECT COUNT(*) FROM ({query})"
        total = self.conn.execute(count_query, params).fetchone()[0]

        query += " ORDER BY economic_loss DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = self.conn.execute(query, params).fetchall()
        cols = [desc[0] for desc in self.conn.description]
        events = [dict(zip(cols, row)) for row in rows]

        return total, events

    def get_all_losses(self, peril: str = None) -> list[float]:
        query = "SELECT economic_loss FROM cat_events WHERE economic_loss > 0"
        params = []
        if peril and peril != "All" and peril != "All Perils":
            query += " AND peril = ?"
            params.append(peril)
        rows = self.conn.execute(query, params).fetchall()
        return [r[0] for r in rows]

    def get_annual_frequencies(self, peril: str = None) -> list[int]:
        query = """
            SELECT year, COUNT(*) as cnt 
            FROM cat_events 
            WHERE 1=1
        """
        params = []
        if peril and peril != "All" and peril != "All Perils":
            query += " AND peril = ?"
            params.append(peril)
        query += " GROUP BY year ORDER BY year;"
        rows = self.conn.execute(query, params).fetchall()
        return [r[1] for r in rows] if rows else [7]

# Global DB instance
db = Database()
