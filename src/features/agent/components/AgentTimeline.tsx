import type { AgentEvent } from '../types/agent.types'
import { AgentEventItem } from './AgentEventItem'
import type { AgentToolActivity } from '../types/agent.types'
const toolLabels: Record<string, string> = { get_incident: 'Load incident', get_breakdown: 'Compare dimensions', get_timeseries: 'Analyze timeline', get_decline_reason_distribution: 'Analyze decline reasons', get_incident_history: 'Check incident history', list_active_incidents: 'Compare active incidents' }
export function AgentTimeline({ events, toolActivities = [] }: { events: AgentEvent[]; toolActivities?: AgentToolActivity[] }) {
  return <div className="agent-timeline">{events.length === 0 && toolActivities.length === 0 ? <div className="empty-state">No agent activity yet.</div> : <>{events.map((event) => <AgentEventItem event={event} key={event.id} />)}{toolActivities.map((activity, index) => <article className={`agent-event agent-${activity.status === 'completed' ? 'success' : 'running'}`} key={`${activity.toolName}-${index}`}><span className="agent-event-dot" /><div className="agent-event-card"><div className="agent-event-meta"><span className="pill neutral">TOOL</span><span>{activity.status}</span><code>{activity.toolName}</code></div><h3>{toolLabels[activity.toolName] ?? activity.toolName}</h3><p>{activity.status === 'completed' ? 'Tool completed' : 'Tool started'}</p></div></article>)}</>}</div>
}
