import { AgentEventItem } from '../components/AgentEventItem'
import { AgentStatus } from '../components/AgentStatus'
import { AgentTimeline } from '../components/AgentTimeline'
import { useAgentStream } from '../hooks/useAgentStream'
export function AgentLivePage() {
  const { events, latestEvent, isRunning } = useAgentStream()
  return <section className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Real-time observability</p><h2>Agent Live</h2><p>Follow the agent as it monitors, evaluates, and responds to route risk.</p></div></div>
    <AgentStatus latestEvent={latestEvent} isRunning={isRunning} />
    <div className="agent-live-grid">
      <article className="panel"><div className="panel-header"><div><h3>Agent timeline</h3><p>{events.length} events in this run</p></div></div><AgentTimeline events={events} /></article>
      <aside><p className="eyebrow">Latest event</p>{latestEvent ? <AgentEventItem event={latestEvent} highlighted /> : <div className="panel empty-state">The latest event will appear here.</div>}</aside>
    </div>
  </section>
}
