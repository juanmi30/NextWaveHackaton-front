import type { AgentEvent } from '../types/agent.types'
type Template = Omit<AgentEvent, 'id' | 'runId' | 'timestamp'>
const route = { provider: 'dLocal', paymentMethod: 'CARD', country: 'CO', issuer: 'Bancolombia' }
const metrics = { currentApproval: 61, baselineApproval: 83, deviation: -22, transactionCount: 120 }
const scenario: Template[] = [
  { phase: 'OBSERVE', status: 'running', title: 'Monitoring payment route', summary: 'Monitoring dLocal / CARD / CO / Bancolombia', route },
  { phase: 'OBSERVE', status: 'success', title: 'Transaction sample collected', summary: '120 transactions analyzed', route, metrics, durationMs: 1180 },
  { phase: 'ANALYZE', status: 'warning', title: 'Approval rate dropped below baseline', summary: 'Current approval is 61% versus an 83% baseline.', route, metrics, durationMs: 1320 },
  { phase: 'DECIDE', status: 'warning', title: 'Route classified as HIGH risk', summary: 'The route requires immediate operational attention.', route, decision: { riskLevel: 'HIGH', confidence: 94, action: 'CREATE_PAYMENT_INCIDENT' }, durationMs: 1090 },
  { phase: 'ACT', status: 'running', title: 'Creating payment incident', summary: 'Opening an incident for the affected payment route.', route },
  { phase: 'VERIFY', status: 'success', title: 'Incident created successfully', summary: 'The payment incident is ready for investigation.', route, durationMs: 1240 },
]
export function subscribeToMockAgentStream(listener: (event: AgentEvent) => void): () => void {
  const runId = `run-${Date.now()}`
  const timeouts: number[] = []
  let elapsed = 250
  scenario.forEach((template, index) => {
    elapsed += index === 0 ? 0 : 1000 + Math.floor(Math.random() * 501)
    timeouts.push(window.setTimeout(() => listener({ ...template, id: `${runId}-${index + 1}`, runId, timestamp: new Date().toISOString() }), elapsed))
  })
  return () => timeouts.forEach(window.clearTimeout)
}
