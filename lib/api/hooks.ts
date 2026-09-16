'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from './client'
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

export function useOverview(year?: string) {
  const [data, setData] = useState<OverviewMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getOverview(year)
      setData(res)
      setError(null)
    } catch (err: any) {
      console.warn('Using baseline fallback for overview:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  return { data, loading, error, refetch: fetchOverview }
}

export function useEvents(params?: { peril?: string; year?: number; search?: string; page?: number }) {
  const [data, setData] = useState<EventListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getEvents(params)
      setData(res)
      setError(null)
    } catch (err: any) {
      console.warn('Using fallback events catalog:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params?.peril, params?.year, params?.search, params?.page])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { data, loading, error, refetch: fetchEvents }
}

export function useModelComparison(peril?: string) {
  const [data, setData] = useState<ModelComparisonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.compareModels(peril)
      setData(res)
      setError(null)
    } catch (err: any) {
      console.warn('Using default distribution fits:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [peril])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return { data, loading, error, refetch: fetchModels }
}
