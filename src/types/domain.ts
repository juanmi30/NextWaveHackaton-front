export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export type PaymentStatus = 'APPROVED' | 'DECLINED' | 'ERROR' | 'TIMEOUT'

export type Health = {
  status: string
  db: string
  uptime: number
  ts: string
}

export type AnalyticsSummary = {
  window: { from: string; to: string; minutes: number }
  transactions: number
  approved: number
  approvalRate: number
  failureRate: number
  volumeUsdCents: number
  incidents: { open: number; acknowledged: number; resolved: number; highCritical: number }
  detection: { total: number; noAnomaly: number; insufficientEvidence: number; incidentsFound: number; quietRatio: number }
  state: 'NORMAL' | 'DEGRADED' | 'INCIDENT'
}

export type AnalyticsBreakdownRow = {
  dimensions: Record<string, string>
  attempts: number
  approved: number
  approvalRate: number
  baselineRate: number
  baselineAttempts: number
  hasBaseline: boolean
  drop: number
  volumeUsdCents: number
}
export type AnalyticsBreakdown = {
  config: { groupBy: string; windowMinutes: number; baselineHours: number; minSampleSize: number }
  windows: { baseline: { from: string; to: string }; current: { from: string; to: string } }
  rows: AnalyticsBreakdownRow[]
}

export type Incident = {
  id: string
  detectionRunId: string
  anchorFingerprint: string
  fingerprint: string
  summaryOps?: string | null
  summaryExec?: string | null
  severity: number
  priorityRank?: number
  priorityScore?: number
  analysisStatus?: 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  diagnosisAvailable?: boolean
  status: IncidentStatus
  expectedApprovals: number
  actualApprovals: number
  lostApprovals: number
  averageTicketCents: number
  lossPerMinuteCents: number
  recommendation?: string | null
  confidenceStatement?: string | null
  diagnoses: Array<{ id: string; version: number; fingerprint: string; baselineRate?: number | null; observedRate?: number | null; baselineAttempts: number; observedAttempts: number; confidence: number; dimensionDepth: number; dimensions?: Record<string, string | null>; evidence?: Array<Record<string, unknown>>; sampleTransactionIds: string[]; createdAt: string }>
  startedAt: string
  detectedAt: string
  lastSeenAt: string
  resolvedAt: string | null
}

export type DetectionRunResult = {
  runId: string
  outcome: string
  window: unknown
  combosEvaluated: number
  slicesWithSample: number
  candidates: unknown[]
  incidents: Incident[]
  autoResolved: number
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
