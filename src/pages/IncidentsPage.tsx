import { useCallback, useEffect, useState } from 'react'
import { acknowledgeIncident, getIncidents, resolveIncident } from '../features/incidents/incidentsApi'
import type { Incident, IncidentStatus } from '../types/domain'

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
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
            <thead><tr><th>Incident</th><th>Status</th><th>Approval</th><th>Impact</th><th>Detected</th><th>Actions</th></tr></thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td><strong>{incident.title}</strong><span className="cell-subtitle">{incident.recommendation ?? 'No recommendation'}</span></td>
                  <td><span className={`pill status-${incident.status.toLowerCase()}`}>{incident.status}</span></td>
                  <td>{percent(incident.observedRate)} <span className="muted">vs {percent(incident.baselineRate)}</span></td>
                  <td>{money(incident.estimatedLoss)}</td>
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
              {!loading && incidents.length === 0 ? <tr><td colSpan={6}><div className="empty-state">No incidents for this filter.</div></td></tr> : null}
              {loading ? <tr><td colSpan={6}><div className="empty-state">Loading incidents…</div></td></tr> : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
