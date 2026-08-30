import { useCallback, useEffect, useState } from 'react'
import { acknowledgeIncident, getIncidents, resolveIncident } from '../features/incidents/incidentsApi'
import type { Incident, IncidentStatus } from '../types/domain'

const percent = (value?: number | null) => typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : 'N/A'
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

export function IncidentsPage() {
  const [status, setStatus] = useState<IncidentStatus | 'ALL'>('ALL')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setIncidents(await getIncidents(status === 'ALL' ? undefined : status, 100))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load incidents')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { void load() }, [load])

  const update = async (id: string, action: 'ack' | 'resolve') => {
    setBusyId(id)
    try {
      if (action === 'ack') await acknowledgeIncident(id)
      else await resolveIncident(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update incident')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h2>Incidents</h2>
          <p>Acknowledge and resolve detected payment-route degradation.</p>
        </div>
        <select className="select" value={status} onChange={(event) => setStatus(event.target.value as IncidentStatus | 'ALL')}>
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {error ? <div className="notice error-notice">{error}</div> : null}

      <article className="panel panel-wide">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Priority</th><th>Incident</th><th>Status</th><th>Approval</th><th>Impact</th><th>Detected</th><th>Actions</th></tr></thead>
            <tbody>
              {incidents.map((incident) => (
                <tr className={incident.status === 'OPEN' ? 'incident-open-row' : ''} key={incident.id}>
                  <td><strong className="priority-rank">{incident.priorityRank ? `#${incident.priorityRank}` : '—'}</strong><span className={`pill severity-${incident.severity}`}>{incident.severity >= 4 ? 'CRITICAL' : incident.severity >= 3 ? 'HIGH' : incident.severity >= 2 ? 'MEDIUM' : 'LOW'}</span></td>
                  <td><strong>{incident.summaryOps ?? 'No operational summary'}</strong><span className="cell-subtitle">{incident.summaryExec ?? 'No executive summary'}</span></td>
                  <td><span className={`pill status-${incident.status.toLowerCase()}`}>{incident.status}</span></td>
                  <td>{incident.diagnoses?.[0] ? <>{percent(incident.diagnoses[0].observedRate)} <span className="muted">vs {percent(incident.diagnoses[0].baselineRate)}</span></> : <span className="muted">No diagnosis available</span>}</td>
                  <td><strong>{money(incident.lossPerMinuteCents)}/min</strong><span className="cell-subtitle">{money(incident.lossPerMinuteCents * 60)}/hour</span></td>
                  <td>{new Date(incident.detectedAt).toLocaleString()}</td>
                  <td>
                    <div className="row-actions">
                      <a className="button tiny ghost" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>Analyze</a>
                      {incident.status === 'OPEN' ? <button className="button tiny secondary" type="button" disabled={busyId === incident.id} onClick={() => void update(incident.id, 'ack')}>Acknowledge</button> : null}
                      {incident.status !== 'RESOLVED' ? <button className="button tiny primary" type="button" disabled={busyId === incident.id} onClick={() => void update(incident.id, 'resolve')}>Resolve</button> : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && incidents.length === 0 ? <tr><td colSpan={7}><div className="empty-state">No incidents for this filter.</div></td></tr> : null}
              {loading ? <tr><td colSpan={7}><div className="skeleton-stack" aria-label="Loading incidents"><i /><i /><i /></div></td></tr> : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
