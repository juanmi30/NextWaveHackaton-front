export type AgentPhase = 'OBSERVE' | 'ANALYZE' | 'DECIDE' | 'ACT' | 'VERIFY'
export type AgentEventStatus = 'running' | 'success' | 'warning' | 'error'
export type AgentEvent = {
  id: string; runId: string; timestamp: string; phase: AgentPhase; status: AgentEventStatus; title: string; summary: string
  route?: { provider: string; paymentMethod: string; country: string; issuer: string }
  metrics?: { currentApproval: number; baselineApproval: number; deviation: number; transactionCount: number }
  decision?: { riskLevel: string; confidence: number; action: string }
  durationMs?: number
}
