export type AgentPhase = 'OBSERVE' | 'ANALYZE' | 'DECIDE' | 'ACT' | 'VERIFY' | 'INVESTIGATE' | 'DIAGNOSE' | 'RECOMMEND' | 'REPORT'
export type AgentEventStatus = 'running' | 'success' | 'warning' | 'error'
export interface AgentRoute { provider: string; paymentMethod: string; country: string; issuer?: string }
export interface AgentMetrics { currentApproval?: number; baselineApproval?: number; deviation?: number; transactionCount?: number }
export interface AgentDecision { riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; confidence?: number; action?: string }
export interface AgentEvent {
  id: string; runId: string; scenarioId?: string; timestamp: string; phase: AgentPhase; status: AgentEventStatus; title: string; summary: string
  route?: AgentRoute; metrics?: AgentMetrics; decision?: AgentDecision; durationMs?: number
}

export interface AgentDiagnosis {
  incidentId: string
  evidenceStatus: 'SUFFICIENT' | 'INSUFFICIENT'
  affectedScope: DiagnosticDimensions
  rootCause: { statement: string; dimensions: AgentDiagnosis['affectedScope']; confidence: number } | null
  impact: { expectedApprovalRate: number | null; observedApprovalRate: number | null; lossPerMinuteCents: number | null; startedAt: string | null }
  evidence: Array<{ statement: string; metric?: string | null; baselineValue?: number | null; observedValue?: number | null; attempts?: number | null }>
  recurrence: string | Record<string, unknown>
  recommendation: { action: string; requiresHumanApproval: boolean }
  summaries: { operations?: string; executive?: string }
  confidenceAnalysis: { detectorConfidence: number | null; rootCauseConfidence: number | null; score: number; level: 'LOW' | 'MEDIUM' | 'HIGH'; factors: Array<{ code: 'OBSERVED_SAMPLE' | 'BASELINE_SAMPLE' | 'DROP_MAGNITUDE' | 'HEALTHY_SIBLINGS' | 'ROOT_CAUSE_ISOLATION'; effect: 'SUPPORTS' | 'LIMITS' | 'NEUTRAL'; statement: string }>; limitations: string[] }
  ruledOutHypotheses: Array<{ hypothesis: string; reason: string; controlScope: DiagnosticDimensions }>
  counterfactualImpact: { estimatedRecoverableApprovalsPerMinute: number | null; estimatedRecoverableApprovalsPerHour: number | null; estimatedRecoverableRevenuePerHourCents: number }
  diagnosisTrace: Array<{ order: number; type: 'AFFECTED_SCOPE' | 'HEALTHY_CONTROL' | 'ROOT_CAUSE' | 'INSUFFICIENT_EVIDENCE'; scope: DiagnosticDimensions; statement: string; baselineValue: number | null; observedValue: number | null; attempts: number | null }>
  declineIntelligence?: { responseCode: string; transactionStatus: string; declineType: 'HARD' | 'SOFT' | 'N_A' | 'UNKNOWN'; failureDomain: string; actionability: string; retryAdvice: string; unknownCode: boolean } | null
  operationalOwnership?: { suspectedDomain: string; primaryTeam: string; supportingTeams: string[]; statement: string; basis: string[]; requiresHumanApproval: true }
}

export type DiagnosticDimensions = { merchant: string | null; provider: string | null; method: string | null; country: string | null; issuingBank: string | null; failureReason: string | null }

export interface AgentToolActivity { toolName: string; status: 'running' | 'completed'; startedAt: string; completedAt?: string }
