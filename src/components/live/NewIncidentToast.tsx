import type { Incident } from '../../types/domain'

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
export function NewIncidentToast({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  if (!incident) return null
  return <aside className="incident-toast" aria-live="polite"><button type="button" onClick={onClose} aria-label="Dismiss new incident">×</button><p>New incident</p><strong>{incident.summaryOps ?? 'Payment degradation detected'}</strong><span>{money(incident.lossPerMinuteCents)}/min estimated impact</span><a className="button tiny primary" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>Analyze</a></aside>
}
