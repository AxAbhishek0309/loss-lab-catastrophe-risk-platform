export interface CatEvent {
  id: string
  name: string
  peril: string
  country: string
  region: string
  date: string
  year: number
  magnitude: string
  economic_loss: number
  insured_loss: number
  casualties: number
  risk_level: string
  lat: number
  lon: number
}

export interface EventListResponse {
  total: number
  page: number
  page_size: number
  events: CatEvent[]
}

export interface OverviewMetrics {
  expected_annual_loss: number
  average_event_loss: number
  var_99: number
  tvar_99: number
  annual_event_frequency: number
  total_exposure: number
  total_events: number
  countries_count: number
  frequency_data: Array<{ year: string; value: number }>
  severity_data: Array<{ type: string; min: number; q1: number; med: number; q3: number; max: number }>
  loss_density_data: Array<{ loss: number; density: number }>
  peril_mix: Array<{ name: string; value: number; color: string }>
}

export interface DistributionFit {
  family: string
  category: string
  aic: number
  bic: number
  ks_stat: number
  p_value: number
  parameters: Record<string, number>
  status: string
  notes?: string
}

export interface ModelComparisonResponse {
  peril: string
  frequency_fits: DistributionFit[]
  severity_fits: DistributionFit[]
  recommended_frequency: string
  recommended_severity: string
}

export interface SimulationRequest {
  trials: number
  seed: number
  freq_model: string
  sev_model: string
  peril?: string
  tail_threshold?: number
}

export interface ExceedancePoint {
  return_period_years: number
  exceedance_probability: number
  annual_loss: number
  tvar: number
}

export interface SimulationResponse {
  trials: number
  seed: number
  runtime_ms: number
  aal: number
  aal_std_err: number
  aal_ci_lower: number
  aal_ci_upper: number
  var_90: number
  var_95: number
  var_99: number
  var_99_5: number
  tvar_90: number
  tvar_95: number
  tvar_99: number
  tvar_99_5: number
  exceedance_curve: ExceedancePoint[]
  loss_histogram: Array<{ loss: number; density: number }>
}

export interface StressTestRequest {
  warming_scenario: string
  freq_delta_pct: number
  sev_delta_pct: number
  peril?: string
}

export interface StressTestResponse {
  baseline_aal: number
  stressed_aal: number
  aal_delta_pct: number
  baseline_var99: number
  stressed_var99: number
  var_delta_pct: number
  stressed_tvar99: number
  summary: string
}
