import type { AgentEvent, AgentRoute } from '../types/agent.types'
import type { RoutingCandidate } from '../../routing/types/routing.types'
type ScenarioEvent = Omit<AgentEvent, 'id' | 'runId' | 'scenarioId' | 'timestamp'>
type ScenarioCandidate = Omit<RoutingCandidate, 'score' | 'recommended'>
const route: AgentRoute = { provider: 'dLocal', paymentMethod: 'CARD', country: 'CO', issuer: 'Bancolombia' }
export const approvalDropColombia = {
  id: 'approval-drop-colombia', name: 'Approval Drop Colombia', intervalMs: 1700,
  initialRoute: { id: 'dlocal-card-co-bancolombia', ...route, currentApproval: 82, baselineApproval: 83, transactionCount: 35 },
  events: [
    { phase: 'OBSERVE', status: 'running', title: 'Monitoring payment route', summary: 'Monitoring dLocal / CARD / CO / Bancolombia', route, metrics: { currentApproval: 82, baselineApproval: 83, deviation: -1, transactionCount: 35 } },
    { phase: 'OBSERVE', status: 'running', title: 'Volume increasing on route', summary: '67 transactions analyzed as volume increases.', route, metrics: { currentApproval: 78, baselineApproval: 83, deviation: -5, transactionCount: 67 }, durationMs: 1180 },
    { phase: 'ANALYZE', status: 'warning', title: 'Approval rate trending below baseline', summary: 'Approval has declined to 74% against the 83% baseline.', route, metrics: { currentApproval: 74, baselineApproval: 83, deviation: -9, transactionCount: 91 }, durationMs: 1260 },
    { phase: 'ANALYZE', status: 'warning', title: 'Significant degradation detected', summary: 'Current approval is 61% versus an 83% baseline.', route, metrics: { currentApproval: 61, baselineApproval: 83, deviation: -22, transactionCount: 120 }, durationMs: 1320 },
    { phase: 'DECIDE', status: 'warning', title: 'Route classified as HIGH risk', summary: 'The route requires immediate operational attention.', route, metrics: { currentApproval: 61, baselineApproval: 83, deviation: -22, transactionCount: 120 }, decision: { riskLevel: 'HIGH', confidence: 94, action: 'Create incident' }, durationMs: 1090 },
    { phase: 'ACT', status: 'running', title: 'Creating payment incident', summary: 'Opening an incident for the affected payment route.', route },
    { phase: 'VERIFY', status: 'success', title: 'Incident created successfully', summary: 'The payment incident is ready for investigation.', route, durationMs: 1240 },
  ] satisfies ScenarioEvent[],
  routingCandidates: [
    { id: 'stripe-card-co', provider: 'Stripe', paymentMethod: 'CARD', country: 'CO', approvalRate: 92, latencyMs: 410, estimatedCost: 1.9, availability: 'AVAILABLE' },
    { id: 'adyen-card-co', provider: 'Adyen', paymentMethod: 'CARD', country: 'CO', approvalRate: 89, latencyMs: 360, estimatedCost: 1.7, availability: 'AVAILABLE' },
    { id: 'mercadopago-card-co', provider: 'MercadoPago', paymentMethod: 'CARD', country: 'CO', approvalRate: 80, latencyMs: 290, estimatedCost: 1.4, availability: 'AVAILABLE' },
  ] satisfies ScenarioCandidate[],
} as const
