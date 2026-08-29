import { api, withQuery } from '../../lib/api'
import type { AnalyticsSummary, RiskAnalysis } from '../../types/domain'

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

export const getRiskAnalysis = (query: RiskQuery = DEFAULT_RISK_QUERY) =>
  api<RiskAnalysis>(withQuery('/api/analytics/risk', { ...DEFAULT_RISK_QUERY, ...query }))

export const detectRisk = (query: RiskQuery = DEFAULT_RISK_QUERY) =>
  api<{ analysis: RiskAnalysis; incidentsCreated: number }>('/api/analytics/detect', {
    method: 'POST',
    body: JSON.stringify({ ...DEFAULT_RISK_QUERY, ...query }),
  })

export const seedDemo = (reset = true) =>
  api<{ seeded: boolean; transactions: number; scenario: Record<string, string> }>(
    `/api/demo/seed?reset=${String(reset)}`,
    { method: 'POST' },
  )
