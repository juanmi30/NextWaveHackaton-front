export type AgentPhase = 'OBSERVE' | 'ANALYZE' | 'DECIDE' | 'ACT' | 'VERIFY'
export type AgentEventStatus = 'running' | 'success' | 'warning' | 'error'
export interface AgentRoute { provider: string; paymentMethod: string; country: string; issuer?: string }
export interface AgentMetrics { currentApproval?: number; baselineApproval?: number; deviation?: number; transactionCount?: number }
export interface AgentDecision { riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; confidence?: number; action?: string }
export interface AgentEvent {
  id: string; runId: string; scenarioId?: string; timestamp: string; phase: AgentPhase; status: AgentEventStatus; title: string; summary: string
  route?: AgentRoute; metrics?: AgentMetrics; decision?: AgentDecision; durationMs?: number
}
