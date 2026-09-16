# LossLab REST API Documentation

All API endpoints are prefixed with `/api`. Interactive OpenAPI / Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

## 1. System Health
### `GET /api/health`
Returns backend health status, DuckDB version, and total records count.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.4.0",
  "database": "DuckDB 1.1 Columnar",
  "records_count": 22
}
```

---

## 2. Dashboard Overview
### `GET /api/overview`
**Parameters:**
- `year` (optional, integer): Historical base year (e.g. `2026`).

**Response:**
Returns Expected Annual Loss (`expected_annual_loss`), 99% VaR, 99% TVaR, annual frequency, loss density bins, and peril distributions.

---

## 3. Catastrophe Events
### `GET /api/events`
**Parameters:**
- `peril` (string, optional): Filter by peril (`Earthquake`, `Cyclone`, `Flood`, `Wildfire`).
- `year` (integer, optional): Event occurrence year.
- `search` (string, optional): Search keyword against name or country.
- `page` (integer, default `1`): Pagination page.
- `page_size` (integer, default `20`): Items per page.

---

## 4. Statistical Models
### `GET /api/models/compare`
**Parameters:**
- `peril` (string, optional): Target peril.

**Response:**
Returns AIC, BIC, Kolmogorov-Smirnov statistics, and calibrated parameters for:
- Frequency: Poisson, Negative Binomial
- Severity: Lognormal, Generalized Pareto (GPD), Weibull, Gamma

---

## 5. Monte Carlo Simulation Engine
### `POST /api/models/simulate`
**Request Body:**
```json
{
  "trials": 50000,
  "seed": 42,
  "freq_model": "Negative Binomial",
  "sev_model": "Generalized Pareto",
  "tail_threshold": 0.5
}
```

**Response:**
```json
{
  "trials": 50000,
  "seed": 42,
  "runtime_ms": 328.4,
  "aal": 2.84,
  "aal_std_err": 0.041,
  "aal_ci_lower": 2.76,
  "aal_ci_upper": 2.92,
  "var_90": 9.42,
  "var_95": 14.10,
  "var_99": 18.72,
  "var_99_5": 34.80,
  "tvar_90": 17.80,
  "tvar_95": 21.90,
  "tvar_99": 27.34,
  "tvar_99_5": 42.10,
  "exceedance_curve": [
    {
      "return_period_years": 100.0,
      "exceedance_probability": 0.01,
      "annual_loss": 18.72,
      "tvar": 27.34
    }
  ],
  "loss_histogram": [...]
}
```

---

## 6. Climate & Historical Stress Testing
### `POST /api/scenarios/stress-test`
**Request Body:**
```json
{
  "warming_scenario": "+1.5°C Warming",
  "freq_delta_pct": 15.0,
  "sev_delta_pct": 22.0
}
```

---

## 7. Data Pipeline Ingestion
### `POST /api/data/ingest`
Pulls recent earthquakes from USGS API, normalizes damage footprints, and updates DuckDB.
