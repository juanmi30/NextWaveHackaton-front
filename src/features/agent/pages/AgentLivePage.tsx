import { CurrentDecision } from '../components/CurrentDecision'
import { AgentStatus } from '../components/AgentStatus'
import { AgentTimeline } from '../components/AgentTimeline'
import { useAgentStreamContext } from '../context/AgentStreamContext'
import { RouteHealthLive } from '../../routes/components/RouteHealthLive'
import { RiskEvolution } from '../../routes/components/RiskEvolution'
import { useRouteHealth } from '../../routes/hooks/useRouteHealth'
export function AgentLivePage() {
  const { events, latestEvent, isRunning } = useAgentStreamContext()
  const { watchedRoute } = useRouteHealth()
  return <section className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Real-time observability</p><h2>Agent Live</h2><p>Follow the agent as it monitors, evaluates, and responds to route risk.</p></div></div>
    <AgentStatus latestEvent={latestEvent} isRunning={isRunning} />
    <div className="route-live-grid"><RouteHealthLive route={watchedRoute} /><RiskEvolution /></div>
    <div className="agent-live-grid">
      <article className="panel"><div className="panel-header"><div><h3>Agent timeline</h3><p>{events.length} events in this run</p></div></div><AgentTimeline events={events} /></article>
      <aside><CurrentDecision events={events} /></aside>
    </div>
  </section>
}
