import type { AgentEvent } from '../types/agent.types'
import { AgentEventItem } from './AgentEventItem'
export function AgentTimeline({ events }: { events: AgentEvent[] }) {
  return <div className="agent-timeline">{events.length === 0 ? <div className="empty-state">No agent activity yet.</div> : events.map((event) => <AgentEventItem event={event} key={event.id} />)}</div>
}
