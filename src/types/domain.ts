export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export type PaymentStatus = 'APPROVED' | 'DECLINED' | 'ERROR' | 'TIMEOUT'

export type Health = {
  status: string
  db: string
  uptime: number
  ts: string
}

export type AnalyticsSummary = {
  transactionCount: number
  approvalRate: number
  failureRate: number
  openIncidentCount: number
  highCriticalIncidentCount: number
}
export type AnalyticsSummaryResponse = {
  transactions: number
  approved: number
  approvalRate: number
  failureRate: number
  incidents: { open: number; acknowledged: number; resolved: number; highCritical: number }
  detection: unknown
  state: unknown
}

export type WindowMetrics = {
  total: number
  approved: number
  declined: number
  errors: number
  timeouts: number
  approvalRate: number
  failureRate: number
  p95LatencyMs: number | null
  averageAmountCents: number
}

export type RiskItem = {
  key: string
  label: string
  groupBy: string
  dimensions: Record<string, string>
  score: number
  riskLevel: RiskLevel
  confidence: number
  current: WindowMetrics
  baseline: WindowMetrics
  approvalDrop: number
  estimatedLossCents: number
  recommendation: string
}

export type RiskAnalysis = {
  config: {
    groupBy: string
    windowMinutes: number
    baselineHours: number
    minSampleSize: number
  }
  summary: {
    transactionsAnalyzed: number
    currentTransactions: number
    baselineTransactions: number
    entitiesAnalyzed: number
    critical: number
    high: number
    medium: number
  }
  risks: RiskItem[]
}

export type Incident = {
  id: string
  summaryOps?: string | null
  summaryExec?: string | null
  severity: number
  status: IncidentStatus
  lossPerMinuteCents: number
  diagnoses: Array<{ baselineRate?: number | null; observedRate?: number | null; dimensions?: Record<string, string | null>; evidence?: Array<Record<string, unknown>> }>
  detectedAt: string
  resolvedAt: string | null
}

export type Transaction = {
  id: string
  merchant: string
  provider: string
  method: string
  country: string
  issuingBank: string
  status: PaymentStatus
  declineCode: string | null
  errorType: string | null
  latencyMs: number | null
  amountCents: number
  currency: string
  occurredAt: string
}
