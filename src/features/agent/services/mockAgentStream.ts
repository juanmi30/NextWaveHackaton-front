import type { AgentEvent } from '../types/agent.types'
export type MockAgentEvent = Omit<AgentEvent, 'id' | 'runId' | 'timestamp'>
export const AGENT_SCENARIO_ID = 'approval-drop-colombia'
export const AGENT_EVENT_INTERVAL_MS = 1700
const route = { provider: 'dLocal', paymentMethod: 'CARD', country: 'CO', issuer: 'Bancolombia' }
export const mockAgentEvents: readonly MockAgentEvent[] = [
  { phase: 'OBSERVE', status: 'running', title: 'Monitoring payment route', summary: 'Monitoring dLocal / CARD / CO / Bancolombia', route, metrics: { currentApproval: 82, baselineApproval: 83, deviation: -1, transactionCount: 35 } },
  { phase: 'OBSERVE', status: 'running', title: 'Volume increasing on route', summary: '67 transactions analyzed as volume increases.', route, metrics: { currentApproval: 78, baselineApproval: 83, deviation: -5, transactionCount: 67 }, durationMs: 1180 },
  { phase: 'ANALYZE', status: 'warning', title: 'Approval rate trending below baseline', summary: 'Approval has declined to 74% against the 83% baseline.', route, metrics: { currentApproval: 74, baselineApproval: 83, deviation: -9, transactionCount: 91 }, durationMs: 1260 },
  { phase: 'ANALYZE', status: 'warning', title: 'Significant degradation detected', summary: 'Current approval is 61% versus an 83% baseline.', route, metrics: { currentApproval: 61, baselineApproval: 83, deviation: -22, transactionCount: 120 }, durationMs: 1320 },
  { phase: 'DECIDE', status: 'warning', title: 'Route classified as HIGH risk', summary: 'The route requires immediate operational attention.', route, metrics: { currentApproval: 61, baselineApproval: 83, deviation: -22, transactionCount: 120 }, decision: { riskLevel: 'HIGH', confidence: 94, action: 'Create incident' }, durationMs: 1090 },
  { phase: 'ACT', status: 'running', title: 'Creating payment incident', summary: 'Opening an incident for the affected payment route.', route },
  { phase: 'VERIFY', status: 'success', title: 'Incident created successfully', summary: 'The payment incident is ready for investigation.', route, durationMs: 1240 },
]
