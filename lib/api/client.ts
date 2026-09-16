import {
  CatEvent,
  EventListResponse,
  ModelComparisonResponse,
  OverviewMetrics,
  SimulationRequest,
  SimulationResponse,
  StressTestRequest,
  StressTestResponse
} from './types'

const API_BASE = '/api'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error')
    throw new Error(`API error ${res.status}: ${errorText}`)
  }

  return res.json()
}

export const api = {
  getHealth: () => apiFetch<{ status: string; version: string; database: string; records_count: number }>('/health'),

  getOverview: (year?: string) =>
    apiFetch<OverviewMetrics>(year ? `/overview?year=${year}` : '/overview'),

  getEvents: (params?: { peril?: string; year?: number; search?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams()
    if (params?.peril && params.peril !== 'All') query.set('peril', params.peril)
    if (params?.year) query.set('year', params.year.toString())
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.pageSize) query.set('page_size', params.pageSize.toString())
    return apiFetch<EventListResponse>(`/events?${query.toString()}`)
  },

  getEventDetail: (id: string) => apiFetch<CatEvent>(`/events/${id}`),

  compareModels: (peril?: string) =>
    apiFetch<ModelComparisonResponse>(peril ? `/models/compare?peril=${encodeURIComponent(peril)}` : '/models/compare'),

  runSimulation: (req: SimulationRequest) =>
    apiFetch<SimulationResponse>('/models/simulate', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  runStressTest: (req: StressTestRequest) =>
    apiFetch<StressTestResponse>('/scenarios/stress-test', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  triggerIngest: () =>
    apiFetch<{ status: string; usgs_events_fetched: number; total_records_in_db: number }>('/data/ingest', {
      method: 'POST',
    }),
}
