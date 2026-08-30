import type { Incident } from '../../types/domain'
import { getIncidentAnalysisStatus } from '../../features/agent/utils/incidentAnalysisStatus'

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
export function NewIncidentToast({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  if (!incident) return null
  const status = getIncidentAnalysisStatus(incident)
  return <aside className="incident-toast" aria-live="polite"><button type="button" onClick={onClose} aria-label="Dismiss new incident">×</button><p>New incident</p><strong>{incident.summaryOps ?? 'Payment degradation detected'}</strong><span>{money(incident.lossPerMinuteCents)}/min estimated impact</span><span className={`incident-analysis-state state-${status.toLowerCase()}`}>{status === 'COMPLETED' ? 'Diagnosis ready' : status === 'FAILED' ? 'Analysis failed' : 'AI analysis running'}</span>{status === 'COMPLETED' ? <a className="button tiny primary" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>View diagnosis</a> : status === 'FAILED' ? <a className="button tiny secondary" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>Retry analysis</a> : <a className="button tiny ghost" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>View live status</a>}</aside>
}
