import type { AgentEvent } from '../types/agent.types'
export function AgentEventItem({ event, highlighted = false, latest = false }: { event: AgentEvent; highlighted?: boolean; latest?: boolean }) {
  const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(event.timestamp))
  return <article className={`agent-event agent-${event.status} ${highlighted ? 'highlighted' : ''} ${latest ? 'event-new' : ''}`}>
    <span className="agent-event-dot" aria-hidden="true" /><div className="agent-event-card">
      <div className="agent-event-meta"><time dateTime={event.timestamp} title={new Date(event.timestamp).toLocaleString()}>{time}</time><span className="pill neutral">{event.phase}</span>{event.durationMs ? <span>{event.durationMs} ms</span> : null}</div>
      <h3>{event.title}</h3><p>{event.summary}</p>
      {event.metrics ? <div className="agent-event-details"><span>Current <strong>{event.metrics.currentApproval !== undefined ? `${event.metrics.currentApproval}%` : '--'}</strong></span><span>Baseline <strong>{event.metrics.baselineApproval !== undefined ? `${event.metrics.baselineApproval}%` : '--'}</strong></span><span>Deviation <strong>{event.metrics.deviation !== undefined ? `${event.metrics.deviation} pts` : '--'}</strong></span><span>Transactions <strong>{event.metrics.transactionCount ?? '--'}</strong></span></div> : null}
      {event.decision ? <div className="agent-event-details"><span>Risk <strong>{event.decision.riskLevel ?? '--'}</strong></span><span>Decision confidence <strong>{event.decision.confidence !== undefined ? `${event.decision.confidence}%` : '--'}</strong></span><span>Action <strong>{event.decision.action ?? '--'}</strong></span></div> : null}
    </div>
  </article>
}
