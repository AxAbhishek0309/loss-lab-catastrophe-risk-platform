# LossLab System Architecture

```
                                  LOSSLAB ARCHITECTURE
                                  
   +-------------------------------------------------------------------------+
   |                     Next.js 16 + React 19 Frontend                      |
   |                                                                         |
   |  [ Landing & Public ]        [ Authenticated Application Shell ]        |
   |  - /                        - /app (Dashboard Overview)                 |
   |  - /methodology             - /app/risk-explorer                        |
   |  - /use-cases               - /app/events                               |
   |  - /data                    - /app/exposure                             |
   |  - /about                   - /app/loss-models                          |
   |                             - /app/monte-carlo                          |
   |                             - /app/scenarios                            |
   |                             - /app/reports                              |
   |                             - /app/data                                 |
   |                             - /app/model-configuration                  |
   |                             - /app/settings                             |
   |                                                                         |
   |               Recharts / Lucide Icons / Vanilla CSS Design              |
   +------------------------------------+------------------------------------+
                                        |
                 HTTP Proxy Rewrites (`/api/*` -> port 8000)
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                       Python FastAPI 0.115+ Backend                     |
   |                                                                         |
   |   [ API Routers ]                   [ Analytical & Engine Layer ]       |
   |   - /api/health                     - Vectorized NumPy Monte Carlo      |
   |   - /api/overview                   - SciPy Parametric Fitting (MLE)    |
   |   - /api/events                     - Non-linear Scenario Stresstester  |
   |   - /api/models/compare             - Data Ingestion & CPI Normalizer   |
   |   - /api/models/simulate                                                |
   |   - /api/scenarios/stress-test                                          |
   |   - /api/data/ingest                                                    |
   +------------------------------------+------------------------------------+
                                        |
                            In-Memory / Columnar SQL
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                           DuckDB Columnar Store                         |
   |                                                                         |
   |   - `cat_events`      : Historical USGS quakes & NOAA storm events      |
   |   - `exposure_zones`  : Portfolio TIV & vulnerability indices           |
   |   - `scenarios`       : Benchmark historical replay definitions         |
   |   - `audit_logs`      : Parameter reproducibility & hash logs           |
   +------------------------------------+------------------------------------+
                                        |
                            Public Government REST APIs
                                        |
                                        v
                    [ USGS Earthquake Catalog API (GeoJSON) ]
                    [ NOAA Storm Events Database Bulk CSVs  ]
```

## Key Design Principles
1. **Separation of Presentation & Computation**: Next.js provides instant, reactive client-side interactivity, while Python handles compute-heavy matrix algebra and distributions.
2. **Columnar In-Process Analytics**: DuckDB provides high-speed OLAP aggregations with zero configuration files, daemon processes, or external database servers.
3. **Deterministic Reproducibility**: Every simulation run can be seeded to generate bit-identical event loss tables for regulatory audits.
4. **Graceful Fallback**: Frontend hooks gracefully degrade to initial historical catalog data if the computational backend is initializing.
