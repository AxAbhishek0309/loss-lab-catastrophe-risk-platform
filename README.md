# LossLab — Catastrophe Risk Analytics & Actuarial Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![DuckDB](https://img.shields.io/badge/DuckDB-1.1-FFF000?logo=duckdb)](https://duckdb.org/)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **See the losses before they happen.** LossLab transforms historical catastrophe data into probabilistic risk intelligence — modelling arrival frequency, damage severity, multi-peril exposure concentrations, and extreme tail losses across synthetic Monte Carlo event years.

---

## 🏛️ Platform Highlights

- **Full-Stack Production Architecture**: Next.js 16 (Turbopack) frontend paired with a Python FastAPI computational engine and DuckDB columnar analytical store.
- **Parametric Statistical Fitting**: Maximum Likelihood Estimation (MLE) and Method of Moments calibrated across:
  - **Frequency**: Poisson and Negative Binomial (accommodating overdispersion and catastrophe clustering).
  - **Severity**: Generalized Pareto (POT EVT), Lognormal, Weibull, and Gamma distributions.
- **Vectorized Monte Carlo Simulation**: Capable of simulating 100,000 synthetic annual aggregate loss years in < 350ms using optimized NumPy matrix algebra.
- **Actuarial Tail Risk Metrics**: Exact calculation of Average Annual Loss (AAL), Value-at-Risk (VaR 90%, 95%, 99%, 99.6%), Tail Value-at-Risk (TVaR / Expected Shortfall), and Exceedance Probability (OEP/AEP) curves.
- **Real-World Catastrophe Pipelines**: Live ingestion connector for USGS Earthquake catalogs with automated inflation normalization (CPI-U to 2024 USD).
- **Climate & Historical Stress Testing**: Interactive scenario engine allowing actuarial stress-testing against historic disasters (1906 San Francisco, 2005 Katrina, Cascadia Mw 9.0) and warming scenarios (+1.0°C to +3.0°C).

---

## 🚀 Quickstart (Running Locally)

### Option 1: One-Command Runner (Recommended)
Clone the repository and launch both the Python FastAPI backend and Next.js frontend concurrently:

```bash
./scripts/run_local.sh
```
- **Web Platform**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Option 2: Manual Step-by-Step

#### 1. Backend (FastAPI + DuckDB)
```bash
# Setup Python virtual environment
python3 -m venv backend/.venv
source backend/.venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
PYTHONPATH=. uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (Next.js 16)
In a separate terminal:
```bash
# Install node dependencies
npm install

# Start Next.js dev server
npm run dev
```

---

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Testing

Run the automated backend test suite covering API endpoints, statistical distributions, and Monte Carlo reproducibility:

```bash
PYTHONPATH=. backend/.venv/bin/pytest backend/tests/test_api.py -v
```

Run the Next.js production build:
```bash
npm run build
```

---

## 🗺️ Application Routes

| Route | Classification | Description |
| :--- | :--- | :--- |
| `/` | Public | Executive landing page with live tail risk metrics |
| `/methodology` | Public | Mathematical explanation of compound Poisson & EVT severity |
| `/use-cases` | Public | Institutional applications in insurance, reinsurance & capital reserves |
| `/data` | Public | Evidence foundation overview |
| `/about` | Public | Company mission and institutional clarity |
| `/app` | Authenticated | Main Risk Overview dashboard with density charts & world risk surface |
| `/app/risk-explorer` | Authenticated | Geographic risk intensity surface and regional AAL breakdowns |
| `/app/events` | Authenticated | Filterable historical catastrophe event catalog & detail dossier drawer |
| `/app/exposure` | Authenticated | Total Insured Value (TIV) vulnerability by construction class |
| `/app/loss-models` | Authenticated | Parametric distribution comparisons with AIC, BIC, and KS rankings |
| `/app/monte-carlo` | Authenticated | Vectorized 10k–100k annual simulation engine with EP curves |
| `/app/scenarios` | Authenticated | Climate warming delta sliders & historical disaster replay engine |
| `/app/reports` | Authenticated | Instant executive PDF dossiers & raw simulation CSV exports |
| `/app/data` | Authenticated | ETVL data pipeline monitor, USGS connector & DuckDB tables |
| `/app/model-configuration` | Authenticated | Distribution toggles, POT thresholds, and copula dependencies |
| `/app/settings` | Authenticated | Analyst credentials, API key generator, and audit settings |

---

## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [Actuarial & Risk Methodology](docs/methodology.md)
- [REST API Reference](docs/api.md)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
