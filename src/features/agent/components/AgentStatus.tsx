import type { AgentEvent } from '../types/agent.types'
export function AgentStatus({ latestEvent, isRunning }: { latestEvent: AgentEvent | null; isRunning: boolean }) {
  return <article className="agent-status panel" aria-live="polite">
    <span className={`agent-pulse ${isRunning ? 'active' : 'complete'}`} />
    <div><span className="metric-label">Agent status</span><strong>{latestEvent ? (isRunning ? 'Running' : 'Run complete') : 'Connecting'}</strong><span className="metric-detail">{latestEvent ? `${latestEvent.phase} · ${latestEvent.title}` : 'Waiting for the first event…'}</span></div>
    {latestEvent ? <span className={`pill agent-${latestEvent.status}`}>{latestEvent.phase}</span> : null}
  </article>
}
