from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "records_count" in data

def test_overview_metrics():
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert "expected_annual_loss" in data
    assert "var_99" in data
    assert "tvar_99" in data
    assert len(data["peril_mix"]) > 0

def test_events_list():
    response = client.get("/api/events?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert len(data["events"]) > 0

def test_models_compare():
    response = client.get("/api/models/compare")
    assert response.status_code == 200
    data = response.json()
    assert len(data["frequency_fits"]) > 0
    assert len(data["severity_fits"]) > 0

def test_monte_carlo_simulation():
    response = client.post("/api/models/simulate", json={
        "trials": 5000,
        "seed": 42,
        "freq_model": "Negative Binomial",
        "sev_model": "Generalized Pareto"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["trials"] == 5000
    assert data["aal"] > 0
    assert data["var_99"] > data["aal"]
    assert data["tvar_99"] >= data["var_99"]
    assert len(data["exceedance_curve"]) > 0

def test_stress_test():
    response = client.post("/api/scenarios/stress-test", json={
        "warming_scenario": "+2.0°C Warming",
        "freq_delta_pct": 20.0,
        "sev_delta_pct": 25.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["stressed_aal"] > data["baseline_aal"]
    assert data["stressed_var99"] > data["baseline_var99"]
