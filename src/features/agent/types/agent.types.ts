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
  affectedScope: { merchant?: string | null; provider?: string | null; method?: string | null; country?: string | null; issuingBank?: string | null; failureReason?: string | null }
  rootCause: { statement: string; dimensions: AgentDiagnosis['affectedScope']; confidence: number } | null
  impact: { expectedApprovalRate: number | null; observedApprovalRate: number | null; lossPerMinuteCents: number | null; startedAt: string | null }
  evidence: Array<{ statement: string; metric?: string | null; baseline?: number | null; observed?: number | null; attempts?: number | null }>
  recurrence: string | Record<string, unknown>
  recommendation: { action: string; requiresHumanApproval: boolean }
  summaries: { operations?: string; executive?: string }
}

export interface AgentToolActivity { toolName: string; status: 'running' | 'completed'; startedAt: string; completedAt?: string }
