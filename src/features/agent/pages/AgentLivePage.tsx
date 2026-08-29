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
import { DemoControls } from '../components/DemoControls'
import { dataSources } from '../../../config/dataSources'
export function AgentLivePage() {
  const { events, latestEvent, demoStatus } = useAgentStreamContext()
  const { watchedRoute } = useRouteHealth()
  const routing = useRoutingRecommendation()
  return <section className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Real-time observability</p><h2>Agent Live</h2><p>Follow the agent as it monitors, evaluates, and responds to route risk.</p></div><span className="data-source-label">Source: {dataSources.agent === 'mock' ? 'Demo' : 'Live API'}</span></div>
    <AgentStatus latestEvent={latestEvent} demoStatus={demoStatus} />
    <DemoControls />
    <div className="route-live-grid"><RouteHealthLive route={watchedRoute} /><RiskEvolution /></div>
    <div className="agent-live-grid">
      <article className="panel"><div className="panel-header"><div><h3>Agent timeline</h3><p>{events.length} events in this run</p></div></div><AgentTimeline events={events} /></article>
      <aside><CurrentDecision events={events} /></aside>
    </div>
    <section className="routing-section">
      <div className="routing-section-heading"><p className="eyebrow">Payment routing decision</p><h2>Alternative route evaluation</h2></div>
      <RoutingDecisionFlow recommendation={routing} source={watchedRoute} />
      <div className="routing-detail-grid"><RoutingRecommendation recommendation={routing} source={watchedRoute} /><RoutingCandidateTable candidates={routing.candidates} /></div>
    </section>
  </section>
}
