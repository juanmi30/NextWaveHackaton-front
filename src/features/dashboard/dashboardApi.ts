import { api, withQuery } from '../../lib/api'
import type { AnalyticsSummary, AnalyticsSummaryResponse, RiskAnalysis } from '../../types/domain'

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

const mapAnalyticsSummary = (response: AnalyticsSummaryResponse): AnalyticsSummary => ({ transactionCount: response.transactions, approvalRate: response.approvalRate, failureRate: response.failureRate, openIncidentCount: response.incidents.open, highCriticalIncidentCount: response.incidents.highCritical })
export const getAnalyticsSummary = async () => mapAnalyticsSummary(await api<AnalyticsSummaryResponse>('/api/analytics/summary'))

export const getRiskAnalysis = (query: RiskQuery = DEFAULT_RISK_QUERY) =>
  api<RiskAnalysis>(withQuery('/api/analytics/breakdown', { ...DEFAULT_RISK_QUERY, ...query }))

export const detectRisk = () => api<{ incidentsCreated?: number }>('/api/detection/run', { method: 'POST' })

export const seedDemo = (reset = true) =>
  api<{ seeded: boolean; transactions: number; scenario: Record<string, string> }>(
    `/api/demo/seed?reset=${String(reset)}`,
    { method: 'POST' },
  )
