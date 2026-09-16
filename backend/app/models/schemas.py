from typing import Any, Optional
from pydantic import BaseModel, Field

# --- Event Schemas ---

class CatEvent(BaseModel):
    id: str
    name: str
    peril: str
    country: str
    region: str
    date: str
    year: int
    magnitude: str
    economic_loss: float = Field(description="Economic loss in USD billions")
    insured_loss: float = Field(description="Insured loss in USD billions")
    casualties: int
    risk_level: str
    lat: float
    lon: float

class EventListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    events: list[CatEvent]

class OverviewMetrics(BaseModel):
    expected_annual_loss: float
    average_event_loss: float
    var_99: float
    tvar_99: float
    annual_event_frequency: float
    total_exposure: float
    total_events: int
    countries_count: int
    frequency_data: list[dict[str, Any]]
    severity_data: list[dict[str, Any]]
    loss_density_data: list[dict[str, Any]]
    peril_mix: list[dict[str, Any]]

# --- Statistical Model Schemas ---

class DistributionFit(BaseModel):
    family: str
    category: str  # "Frequency" or "Severity"
    aic: float
    bic: float
    ks_stat: float
    p_value: float
    parameters: dict[str, float]
    status: str
    notes: Optional[str] = None

class ModelComparisonResponse(BaseModel):
    peril: str
    frequency_fits: list[DistributionFit]
    severity_fits: list[DistributionFit]
    recommended_frequency: str
    recommended_severity: str

# --- Monte Carlo Simulation Schemas ---

class SimulationRequest(BaseModel):
    trials: int = Field(default=50000, ge=1000, le=500000)
    seed: int = Field(default=42)
    freq_model: str = Field(default="Negative Binomial")
    sev_model: str = Field(default="Generalized Pareto")
    peril: Optional[str] = "All Perils"
    tail_threshold: float = Field(default=0.5, description="POT threshold in USD billions")

class ExceedancePoint(BaseModel):
    return_period_years: float
    exceedance_probability: float
    annual_loss: float
    tvar: float

class SimulationResponse(BaseModel):
    trials: int
    seed: int
    runtime_ms: float
    aal: float
    aal_std_err: float
    aal_ci_lower: float
    aal_ci_upper: float
    var_90: float
    var_95: float
    var_99: float
    var_99_5: float
    tvar_90: float
    tvar_95: float
    tvar_99: float
    tvar_99_5: float
    exceedance_curve: list[ExceedancePoint]
    loss_histogram: list[dict[str, Any]]

# --- Scenario & Stress Testing Schemas ---

class ScenarioDef(BaseModel):
    id: str
    name: str
    description: str
    peril: str
    aal_multiplier: float
    var_multiplier: float
    capital_at_risk_usd_billions: float

class StressTestRequest(BaseModel):
    warming_scenario: str = "+1.5°C Warming"
    freq_delta_pct: float = Field(default=15.0, ge=-50.0, le=100.0)
    sev_delta_pct: float = Field(default=22.0, ge=-50.0, le=100.0)
    peril: Optional[str] = "All Perils"

class StressTestResponse(BaseModel):
    baseline_aal: float
    stressed_aal: float
    aal_delta_pct: float
    baseline_var99: float
    stressed_var99: float
    var_delta_pct: float
    stressed_tvar99: float
    summary: str

# --- Exposure Schemas ---

class ExposureZone(BaseModel):
    zone: str
    perils: list[str]
    tiv_billions: float
    vulnerability: str
    aal_ratio_pct: float

class ExposureSummary(BaseModel):
    total_tiv_billions: float
    commercial_tiv_billions: float
    residential_tiv_billions: float
    infrastructure_tiv_billions: float
    concentration_hhi: float
    zones: list[ExposureZone]

# --- System & Audit Schemas ---

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    records_count: int
