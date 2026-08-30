export type LiveDegradation = {
  id: string
  dimensions: { merchant?: string; provider?: string; method?: string; country?: string; issuingBank?: string }
  approvalRate: number
  failureReason: string
  targetTransactionsPerTick: number
  startedAt: string
  expiresAt: string
  status: string
}

export type LiveStatus = {
  state: 'RUNNING' | 'STOPPED'
  startedAt: string | null
  uptimeSeconds: number
  generator: { tickIntervalMs: number; transactionsPerTick: number; ticks: number; generatedTransactions: number; lastError: string | null }
  detection: { intervalMs: number; windowMinutes: number; runs: number; skippedDetectionRuns: number; running: boolean; lastRunAt: string | null; lastOutcome: string | null; lastRunId: string | null; lastDurationMs: number | null; latestIncidentCount: number; lastError: string | null }
  prediction: { enabled: boolean; intervalMs: number; runs: number; skippedRuns: number; running: boolean; lastRunAt: string | null; lastEvaluatedSegments: number; lastWatchRiskCount: number; lastElevatedRiskCount: number; lastError: string | null }
  latestPredictiveRisks: unknown[]
  activeDegradationCount: number
  activeDegradations: LiveDegradation[]
}

export type AddLiveDegradationInput = {
  dimensions: { merchant?: string; provider?: string; method?: string; country?: string; issuingBank?: string }
  approvalRate: number
  durationSeconds?: number
  failureReason?: string
  targetTransactionsPerTick?: number
}
