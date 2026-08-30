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

export function AgentLivePage() {
  const {
    events,
    latestEvent,
    demoStatus,
    diagnosis,
    toolActivities,
    incidentId,
    isSse,
    resetDemo,
  } = useAgentStreamContext()

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

    <AgentLiveErrorBoundary onReset={resetDemo}>
      <AgentStatus latestEvent={latestEvent} demoStatus={demoStatus} />

      <DemoControls />

      {incidentId ? (
        <RootCauseExplorer incidentId={incidentId} />
      ) : null}

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
            diagnosis={diagnosis}
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