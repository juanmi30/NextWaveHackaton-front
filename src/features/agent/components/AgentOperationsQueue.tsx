import type { Incident } from '../../../types/domain'
import type { AgentIncidentStateMap } from '../types/agent-operations.types'
import { getIncidentAnalysisStatus } from '../utils/incidentAnalysisStatus'
import { summarizeOperationStatuses } from '../utils/agentOperations'

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
const copy = { PENDING: ['Pending', 'Awaiting backend scheduling'], QUEUED: ['Queued', 'Waiting for backend capacity'], RUNNING: ['Diagnosing', 'AI diagnosis in progress'], COMPLETED: ['Report ready', 'Diagnosis is ready for review'], FAILED: ['Analysis failed', 'Manual retry is available'] } as const

export function AgentOperationsQueue({ incidents, states, selectedIncidentId, monitoredRoutes, earlyWarnings, onSelect }: { incidents: Incident[]; states: AgentIncidentStateMap; selectedIncidentId: string | null; monitoredRoutes: number; earlyWarnings: number; onSelect: (id: string) => void }) {
  const statuses = incidents.map((incident) => states[incident.id]?.analysisStatus ?? getIncidentAnalysisStatus(incident))
  const totalLoss = incidents.reduce((total, incident) => total + incident.lossPerMinuteCents, 0)
  const { diagnosing, queued, reportsReady: ready } = summarizeOperationStatuses(statuses)
  return <section className="panel agent-operations">
    <div className="panel-header"><div><p className="eyebrow">Payment AI watchtower</p><h3>Confirmed incident diagnosis</h3><p>Confirmed incidents remain separate. {diagnosing} diagnosing · {queued} waiting for backend capacity.</p></div></div>
    <div className="agent-operations-summary"><div><span>Monitored routes</span><strong>{monitoredRoutes}</strong></div><div><span>Early warnings</span><strong>{earlyWarnings}</strong></div><div><span>Pre-investigating</span><strong>{earlyWarnings}</strong></div><div><span>Confirmed incidents</span><strong>{incidents.length}</strong></div><div><span>Diagnosing</span><strong>{diagnosing}</strong></div><div><span>Reports ready</span><strong>{ready}</strong></div><div><span>Total loss</span><strong>{money(totalLoss)}/min</strong></div></div>
    {incidents.length === 0 ? <div className="empty-state compact">No confirmed incidents. Monitoring continues automatically.</div> : <div className="agent-operation-list">{incidents.map((incident) => {
      const state = states[incident.id]
      const status = state?.analysisStatus ?? getIncidentAnalysisStatus(incident)
      const [label, detail] = copy[status]
      const dimensions = incident.diagnoses[0]?.dimensions
      const route = dimensions ? [dimensions.merchant, dimensions.provider, dimensions.country, dimensions.issuingBank].filter(Boolean).join(' · ') : incident.summaryOps
      return <article className={`agent-operation-item state-${status.toLowerCase()} ${selectedIncidentId === incident.id ? 'selected' : ''}`} key={incident.id}><button type="button" onClick={() => onSelect(incident.id)} aria-pressed={selectedIncidentId === incident.id}>
        <div><span>CONFIRMED · {incident.priorityRank ? `Priority #${incident.priorityRank}` : 'Priority pending'}{selectedIncidentId === incident.id ? ' · SELECTED' : ''}</span><strong>{route || 'Payment incident'}</strong><b>{money(incident.lossPerMinuteCents)}/min</b></div>
        <div className="agent-operation-status"><strong>{label}</strong><span>{detail}</span>{state?.lastEventAt ? <time dateTime={state.lastEventAt}>Updated {new Date(state.lastEventAt).toLocaleTimeString()}</time> : null}</div>
      </button></article>
    })}</div>}
  </section>
}
