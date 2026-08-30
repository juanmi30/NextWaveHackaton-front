import { useCallback, useEffect, useRef, useState } from 'react'
import { MetricCard } from '../components/dashboard/MetricCard'
import { BreakdownTable } from '../components/dashboard/BreakdownTable'
import { detectRisk, getAnalyticsBreakdown, getAnalyticsSummary, seedDemo } from '../features/dashboard/dashboardApi'
import { getIncidents } from '../features/incidents/incidentsApi'
import type { AnalyticsBreakdown, AnalyticsSummary, Incident } from '../types/domain'
import { AgentSummaryCard } from '../features/agent/components/AgentSummaryCard'
import { RouteHealthTable } from '../features/routes/components/RouteHealthTable'
import { useRouteHealth } from '../features/routes/hooks/useRouteHealth'
import { RoutingRecommendationCard } from '../features/routing/components/RoutingRecommendationCard'
import { dataSources } from '../config/dataSources'
import { useLiveMonitor } from '../features/live/useLiveMonitor'
import { LiveControlTower } from '../features/live/LiveControlTower'
import { TrialByFire } from '../features/live/TrialByFire'
import { PaymentHealthTape } from '../components/live/PaymentHealthTape'
import { NewIncidentToast } from '../components/live/NewIncidentToast'
import { LiveIndicator } from '../components/live/LiveIndicator'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { useLiveFreshness } from '../hooks/useLiveFreshness'
import { useValueFlash } from '../hooks/useValueFlash'
import { getIncidentAnalysisStatus } from '../features/agent/utils/incidentAnalysisStatus'
import { getUserFacingError } from '../lib/api'

const percent = (value?: number | null) => typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : 'N/A'

export function OverviewPage() {
  const { routes, watchedRouteId } = useRouteHealth()
  const liveMode = dataSources.agent === 'sse'
  const live = useLiveMonitor(liveMode)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [breakdown, setBreakdown] = useState<AnalyticsBreakdown | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dashboardUpdatedAt, setDashboardUpdatedAt] = useState(0)
  const [newIncident, setNewIncident] = useState<Incident | null>(null)
  const refreshingRef = useRef(false)
  const knownIncidentIds = useRef<Set<string> | null>(null)

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true
    setError(null)
    try {
      const [summaryData, analysisData, incidentData] = await Promise.all([
        getAnalyticsSummary(),
        getAnalyticsBreakdown(),
        getIncidents('OPEN', 5),
      ])
      setSummary(summaryData)
      setBreakdown(analysisData)
      setIncidents(incidentData)
      setDashboardUpdatedAt(Date.now())
      if (knownIncidentIds.current) {
        const discovered = incidentData.find((incident) => !knownIncidentIds.current?.has(incident.id))
        if (discovered) setNewIncident(discovered)
      }
      knownIncidentIds.current = new Set(incidentData.map((incident) => incident.id))
    } catch (err) {
      setError(getUserFacingError(err, 'Unable to load the dashboard. Please try again.'))
    } finally {
      setLoading(false)
      refreshingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!newIncident) return
    const timer = window.setTimeout(() => setNewIncident(null), 6500)
    return () => window.clearTimeout(timer)
  }, [newIncident])

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void refresh(), 0)
    if (!liveMode) return () => window.clearTimeout(initialTimer)
    const timer = window.setInterval(() => void refresh(), 2500)
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer) }
  }, [liveMode, refresh])

  const runSeed = async () => {
    setAction('Seeding demo data…')
    setError(null)
    try {
      await seedDemo(true)
      await refresh()
    } catch (err) {
      setError(getUserFacingError(err, 'Unable to seed demo data. Please try again.'))
    } finally {
      setAction(null)
    }
  }

  const runDetection = async () => {
    setAction('Detecting incidents…')
    setError(null)
    try {
      const result = await detectRisk()
      setAction(`${result.incidents.length} incident(s) detected · ${result.outcome}`)
      await refresh()
      window.setTimeout(() => setAction(null), 1800)
    } catch (err) {
      setError(getUserFacingError(err, 'Unable to run detection. Please try again.'))
      setAction(null)
    }
  }

  const approvalValue = useAnimatedNumber(summary?.approvalRate ?? 0)
  const approvalFlash = useValueFlash(summary?.approvalRate)
  const transactionFlash = useValueFlash(summary?.transactions)
  const freshness = useLiveFreshness(dashboardUpdatedAt, 2500, Boolean(error || live.error))
  const paymentVolumeAtRisk = incidents.reduce((total, incident) => total + incident.lossPerMinuteCents, 0)

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Live overview</p>
          <h2>Route health at a glance</h2>
          <p>Compares the last 60 minutes against a 24-hour baseline.</p>
        </div>
        {liveMode ? <div className="actions"><TrialByFire triggerLabel="Demo tools" degradations={live.degradations} refreshedAt={live.refreshedAt} onChanged={live.refresh} demoTools={<section className="demo-tools-actions" aria-label="Development actions"><span>Manual fallbacks</span><div><button className="button tiny secondary" type="button" onClick={() => void runSeed()} disabled={Boolean(action)}>Seed demo</button><button className="button tiny ghost" type="button" onClick={() => void runDetection()} disabled={Boolean(action)}>Run detection</button><button className="button tiny ghost" type="button" onClick={() => void refresh()} disabled={loading}>Refresh now</button></div></section>} /></div> : null}
      </div>

      {action ? <div className="notice success-notice">{action}</div> : null}
      {error || live.error ? <div className="notice error-notice">Live data temporarily unavailable. Showing last known state. {error ?? live.error}</div> : null}

      {liveMode ? <PaymentHealthTape summary={summary} incidents={incidents} liveStatus={live.status} /> : null}

      <div className="payment-health-hero">
        <div><span>Payment health</span><strong>{loading ? '—' : `${(approvalValue * 100).toFixed(1)}%`}</strong><small title="Share of attempted payments approved in the current analytics window.">approval rate</small></div>
        <LiveIndicator state={freshness.state === 'DISCONNECTED' ? 'OFFLINE' : freshness.state} detail={freshness.label} />
        <div className="hero-health-state"><strong>{summary?.state ?? 'NOT READY'}</strong><span>{summary?.incidents.open ?? 0} open · {paymentVolumeAtRisk ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(paymentVolumeAtRisk / 100)}/min at risk` : 'no payment volume currently at risk'}</span></div>
      </div>

      {liveMode ? <><LiveControlTower status={live.status} busy={live.busy} onStart={live.start} onStop={live.stop} />{summary?.state === 'NORMAL' && summary.incidents.open === 0 ? <div className="quiet-state"><strong>NORMAL</strong><span>Monitoring continuously · no meaningful anomalies detected</span><small>Detection runs: {summary.detection.total} · Quiet runs: {summary.detection.noAnomaly} · Open incidents: 0</small></div> : null}</> : null}

      <div className="metric-grid">
        <MetricCard label="Transactions" value={loading ? '—' : String(summary?.transactions ?? 0)} detail="All ingested transactions" changed={transactionFlash.changed} direction="changed" />
        <MetricCard label="Approval rate" value={loading ? '—' : percent(summary?.approvalRate)} detail={`Failure ${percent(summary?.failureRate)}`} tone={summary?.state === 'NORMAL' ? 'success' : 'danger'} changed={approvalFlash.changed} direction={approvalFlash.direction === 'UP' ? 'up' : approvalFlash.direction === 'DOWN' ? 'down' : 'changed'} />
        <MetricCard label="Open incidents" value={loading ? '—' : String(summary?.incidents.open ?? 0)} detail={`${summary?.incidents.highCritical ?? 0} high / critical`} tone={(summary?.incidents.open ?? 0) > 0 ? 'warning' : 'default'} />
        <MetricCard label="Payment volume at risk" value={loading ? '—' : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(paymentVolumeAtRisk / 100)}/min`} detail="Estimated across loaded open incidents" tone={paymentVolumeAtRisk > 0 ? 'danger' : 'default'} />
        <MetricCard label="Detection runs" value={loading ? '—' : String(summary?.detection.total ?? 0)} detail={`${summary?.detection.noAnomaly ?? 0} quiet · ${summary?.detection.incidentsFound ?? 0} incidents`} tone={(summary?.detection.incidentsFound ?? 0) > 0 ? 'warning' : 'default'} />
      </div>
      <NewIncidentToast incident={newIncident} onClose={() => setNewIncident(null)} />

      <AgentSummaryCard monitorRunning={live.status?.state === 'RUNNING'} earlyWarnings={live.status?.latestPredictiveRisks.length ?? 0} />
      {!liveMode ? <RoutingRecommendationCard /> : null}

      <article className="panel route-health-overview">
        <div className="panel-header"><div><h3>Route health</h3><p>Live payment performance and agent monitoring status.</p></div></div>
        {liveMode ? <BreakdownTable rows={breakdown?.rows ?? []} /> : <RouteHealthTable routes={routes} watchedRouteId={watchedRouteId} />}
      </article>

      <div className="panel-grid">
        {!liveMode ? <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <h3>Analytics breakdown</h3>
              <p>{breakdown?.rows.length ?? 0} breakdown rows</p>
            </div>
            <span className="pill neutral">groupBy: route</span>
          </div>
          {loading ? <div className="skeleton-stack" aria-label="Loading analytics"><i /><i /><i /></div> : <BreakdownTable rows={breakdown?.rows ?? []} />}
        </article> : null}

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
            ) : incidents.map((incident) => {
              const analysisStatus = getIncidentAnalysisStatus(incident)
              return <div className="incident-item" key={incident.id}>
                <span className={`severity-dot severity-${incident.severity}`} />
                <div>
                  <strong>{incident.summaryOps ?? 'No operational summary'}</strong>
                  <span>{percent(incident.diagnoses?.[0]?.observedRate)} now · {percent(incident.diagnoses?.[0]?.baselineRate)} baseline</span>
                  {analysisStatus === 'COMPLETED' ? <a className="incident-analyze-link primary-link" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>View diagnosis →</a> : analysisStatus === 'FAILED' ? <a className="incident-analyze-link" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>Retry analysis →</a> : <a className="incident-analysis-running" href={`#/agent-live?incidentId=${encodeURIComponent(incident.id)}`}>● {analysisStatus === 'RUNNING' ? 'AI analysis running' : analysisStatus === 'QUEUED' ? 'Queued for analysis' : 'Waiting to be scheduled'}</a>}
                </div>
              </div>
            })}
          </div>
        </article>
      </div>
    </section>
  )
}
