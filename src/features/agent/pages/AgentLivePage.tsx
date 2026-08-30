import { CurrentDecision } from '../components/CurrentDecision'
import { AgentStatus } from '../components/AgentStatus'
import { AgentTimeline } from '../components/AgentTimeline'
import { useAgentStreamContext } from '../context/AgentStreamContext'
import { RouteHealthLive } from '../../routes/components/RouteHealthLive'
import { RiskEvolution } from '../../routes/components/RiskEvolution'
import { useRouteHealth } from '../../routes/hooks/useRouteHealth'
import { useRoutingRecommendation } from '../../routing/hooks/useRoutingRecommendation'
import { RoutingDecisionFlow } from '../../routing/components/RoutingDecisionFlow'
import { RoutingRecommendation } from '../../routing/components/RoutingRecommendation'
import { RoutingCandidateTable } from '../../routing/components/RoutingCandidateTable'
import { RootCauseExplorer } from '../../graph/RootCauseExplorer'
import { DemoControls } from '../components/DemoControls'
import { dataSources } from '../../../config/dataSources'
import { AgentLiveErrorBoundary } from '../components/AgentLiveErrorBoundary'
import type { Incident } from '../../../types/domain'
import { AgentOperationsQueue } from '../components/AgentOperationsQueue'
import { useAgentOperations } from '../hooks/useAgentOperations'
import { useLiveMonitor } from '../../live/useLiveMonitor'
import { PreventiveWatchList } from '../components/PreventiveWatchList'
import { normalizePredictiveRisks } from '../utils/preventiveWatch'
import type { WatchtowerState } from '../components/AgentStatus'
import { useMemo } from 'react'

export function AgentLivePage({ openIncidents = [], openIncidentsLoaded = false, priorityIncident = null, onSwitchIncident }: { openIncidents?: Incident[]; openIncidentsLoaded?: boolean; priorityIncident?: Incident | null; onSwitchIncident?: (id: string) => void }) {
  const stream = useAgentStreamContext()
  const {
    events,
    latestEvent,
    demoStatus,
    diagnosis,
    toolActivities,
    incidentId,
    isSse,
    resetDemo,
    connectionState,
  } = stream
  const incidentStates = useAgentOperations(openIncidents, stream)
  const live = useLiveMonitor(isSse)
  const preventiveWatches = useMemo(() => normalizePredictiveRisks(live.status?.latestPredictiveRisks ?? []), [live.status?.latestPredictiveRisks])
  const selectedDiagnosis = (incidentId ? incidentStates[incidentId]?.diagnosis : null) ?? (diagnosis?.incidentId === incidentId ? diagnosis : null)
  const selectedStatus = incidentId ? incidentStates[incidentId]?.analysisStatus : null
  const watchtowerState: WatchtowerState = live.error ? 'OFFLINE' : connectionState === 'RECONNECTING' ? 'RECONNECTING' : connectionState === 'ERROR' ? 'ERROR' : selectedStatus === 'COMPLETED' ? 'REPORT_READY' : selectedStatus === 'RUNNING' ? 'DIAGNOSING' : incidentId ? 'CONFIRMED' : preventiveWatches.length > 0 ? 'PRE_INVESTIGATING' : live.status?.state === 'RUNNING' ? 'MONITORING' : 'OFFLINE'

  const { watchedRoute } = useRouteHealth()
  const routing = useRoutingRecommendation()

  return <section className="page-content">
    <div className="page-heading">
      <div>
        <p className="eyebrow">Real-time observability</p>
        <h2>Agent Live</h2>
        <p>Follow observable lifecycle, tool activity, diagnosis, and recommendations.</p>
      </div>

      <span className="data-source-label">
        {dataSources.agent === 'mock' ? 'DEMO / MOCK' : 'LIVE BACKEND'}
      </span>
    </div>

    {priorityIncident ? <div className="notice priority-incident-notice" role="status"><div><strong>New priority incident detected</strong><span>{priorityIncident.summaryOps ?? `Incident #${priorityIncident.priorityRank ?? '—'}`}</span></div><button className="button tiny secondary" type="button" onClick={() => onSwitchIncident?.(priorityIncident.id)}>Switch</button></div> : null}

    {isSse && openIncidentsLoaded && !incidentId ? <div className="panel agent-waiting-state"><strong>No confirmed incidents</strong><span>{live.status?.state === 'RUNNING' ? 'The watchtower is continuously monitoring payment routes.' : 'The live monitor is currently offline.'}</span></div> : null}

    {isSse ? <PreventiveWatchList watches={preventiveWatches} /> : null}
    {isSse ? <AgentOperationsQueue incidents={openIncidents} states={incidentStates} selectedIncidentId={incidentId} monitoredRoutes={live.status?.prediction.lastEvaluatedSegments ?? 0} earlyWarnings={preventiveWatches.length} onSelect={(id) => onSwitchIncident?.(id)} /> : null}

    <AgentLiveErrorBoundary onReset={resetDemo}>
      <AgentStatus latestEvent={latestEvent} demoStatus={demoStatus} connectionState={connectionState} watchtowerState={isSse ? watchtowerState : undefined} />

      <DemoControls watchtowerState={isSse ? watchtowerState : undefined} />

      <RootCauseExplorer incidentId={incidentId} />

      {!isSse ? (
        <div className="route-live-grid">
          <RouteHealthLive route={watchedRoute} />
          <RiskEvolution />
        </div>
      ) : null}

      <div className="agent-live-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h3>Agent timeline</h3>
              <p>{events.length} events · {toolActivities.length} tools</p>
            </div>
          </div>

          <AgentTimeline
            events={events}
            toolActivities={toolActivities}
          />
        </article>

        <aside>
          <CurrentDecision
            events={events}
            diagnosis={selectedDiagnosis}
          />
        </aside>
      </div>

      {!isSse ? (
        <section className="routing-section">
          <div className="routing-section-heading">
            <p className="eyebrow">Payment routing decision</p>
            <h2>Alternative route evaluation</h2>
          </div>

          <RoutingDecisionFlow
            recommendation={routing}
            source={watchedRoute}
          />

          <div className="routing-detail-grid">
            <RoutingRecommendation
              recommendation={routing}
              source={watchedRoute}
            />

            <RoutingCandidateTable
              candidates={routing.candidates}
            />
          </div>
        </section>
      ) : null}
    </AgentLiveErrorBoundary>
  </section>
}
