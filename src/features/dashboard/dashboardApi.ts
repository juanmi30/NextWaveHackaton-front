import { api, withQuery } from '../../lib/api'
import type { AnalyticsBreakdown, AnalyticsSummary, DetectionRunResult } from '../../types/domain'

export type RiskQuery = {
  groupBy?: 'merchant' | 'provider' | 'method' | 'country' | 'issuingBank' | 'route'
  timeWindowMinutes?: number
  baselineHours?: number
  minSampleSize?: number
  includeLowRisk?: boolean
}

const DEFAULT_RISK_QUERY: RiskQuery = {
  groupBy: 'route',
  timeWindowMinutes: 60,
  baselineHours: 24,
  minSampleSize: 10,
}

export const getAnalyticsSummary = () => api<AnalyticsSummary>('/api/analytics/summary')

export const getAnalyticsBreakdown = (query: RiskQuery = DEFAULT_RISK_QUERY) =>
  api<AnalyticsBreakdown>(withQuery('/api/analytics/breakdown', { ...DEFAULT_RISK_QUERY, ...query }))

export const detectRisk = () => api<DetectionRunResult>('/api/detection/run', { method: 'POST', body: JSON.stringify({}) })

export const seedDemo = (reset = true) =>
  api<{ seeded: boolean; transactions: number; scenario: Record<string, string> }>(
    `/api/demo/seed?reset=${String(reset)}`,
    { method: 'POST' },
  )
