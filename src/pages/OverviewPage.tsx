import { useCallback, useEffect, useState } from 'react'
import { MetricCard } from '../components/dashboard/MetricCard'
import { RiskTable } from '../components/dashboard/RiskTable'
import { detectRisk, getAnalyticsSummary, getRiskAnalysis, seedDemo } from '../features/dashboard/dashboardApi'
import { getIncidents } from '../features/incidents/incidentsApi'
import type { AnalyticsSummary, Incident, RiskAnalysis } from '../types/domain'
import { AgentSummaryCard } from '../features/agent/components/AgentSummaryCard'
import { RouteHealthTable } from '../features/routes/components/RouteHealthTable'
import { useRouteHealth } from '../features/routes/hooks/useRouteHealth'
import { RoutingRecommendationCard } from '../features/routing/components/RoutingRecommendationCard'

const percent = (value = 0) => `${(value * 100).toFixed(1)}%`

export function OverviewPage() {
  const { routes, watchedRouteId } = useRouteHealth()
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [summaryData, analysisData, incidentData] = await Promise.all([
        getAnalyticsSummary(),
        getRiskAnalysis(),
        getIncidents('OPEN', 5),
      ])
      setSummary(summaryData)
      setAnalysis(analysisData)
      setIncidents(incidentData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const runSeed = async () => {
    setAction('Seeding demo data…')
    setError(null)
    try {
      await seedDemo(true)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo seed failed')
    } finally {
      setAction(null)
    }
  }

  const runDetection = async () => {
    setAction('Detecting incidents…')
    setError(null)
    try {
      const result = await detectRisk()
      setAction(`${result.incidentsCreated} incident(s) created`)
      await refresh()
      window.setTimeout(() => setAction(null), 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Risk detection failed')
      setAction(null)
    }
  }

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Live overview</p>
          <h2>Route health at a glance</h2>
          <p>Compares the last 60 minutes against a 24-hour baseline.</p>
        </div>
        <div className="actions">
          <button className="button secondary" type="button" onClick={() => void runSeed()} disabled={Boolean(action)}>Seed demo</button>
          <button className="button primary" type="button" onClick={() => void runDetection()} disabled={Boolean(action)}>Detect risk</button>
          <button className="button ghost" type="button" onClick={() => void refresh()} disabled={loading}>Refresh</button>
        </div>
      </div>

      {action ? <div className="notice success-notice">{action}</div> : null}
      {error ? <div className="notice error-notice">{error}</div> : null}

      <div className="metric-grid">
        <MetricCard label="Transactions" value={loading ? '—' : String(summary?.transactionCount ?? 0)} detail="All ingested transactions" />
        <MetricCard label="Approval rate" value={loading ? '—' : percent(summary?.approvalRate)} detail={`Failure ${percent(summary?.failureRate)}`} tone="success" />
        <MetricCard label="Open incidents" value={loading ? '—' : String(summary?.openIncidentCount ?? 0)} detail={`${summary?.highCriticalIncidentCount ?? 0} high / critical`} tone={(summary?.openIncidentCount ?? 0) > 0 ? 'warning' : 'default'} />
        <MetricCard label="Critical routes" value={loading ? '—' : String(analysis?.summary.critical ?? 0)} detail={`${analysis?.summary.high ?? 0} high risk`} tone={(analysis?.summary.critical ?? 0) > 0 ? 'danger' : 'default'} />
      </div>

      <AgentSummaryCard />
      <RoutingRecommendationCard />

      <article className="panel route-health-overview">
        <div className="panel-header"><div><h3>Route health</h3><p>Live payment performance and agent monitoring status.</p></div></div>
        <RouteHealthTable routes={routes} watchedRouteId={watchedRouteId} />
      </article>

      <div className="panel-grid">
        <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <h3>Risk analysis</h3>
              <p>{analysis?.summary.transactionsAnalyzed ?? 0} transactions analyzed</p>
            </div>
            <span className="pill neutral">groupBy: route</span>
          </div>
          {loading ? <div className="empty-state">Loading risk analysis…</div> : <RiskTable risks={analysis?.risks ?? []} />}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h3>Latest open incidents</h3>
              <p>Actionable anomalies created by detection.</p>
            </div>
          </div>
          <div className="incident-list">
            {incidents.length === 0 ? (
              <div className="empty-state compact">No open incidents.</div>
            ) : incidents.map((incident) => (
              <div className="incident-item" key={incident.id}>
                <span className={`severity-dot severity-${incident.severity}`} />
                <div>
                  <strong>{incident.title}</strong>
                  <span>{percent(incident.observedRate)} now · {percent(incident.baselineRate)} baseline</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
