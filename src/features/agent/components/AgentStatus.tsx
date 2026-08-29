import type { AgentEvent } from '../types/agent.types'
const statusByPhase = { OBSERVE: 'OBSERVING', ANALYZE: 'ANALYZING', DECIDE: 'DECIDING', ACT: 'ACTING', VERIFY: 'VERIFYING' } as const
export function AgentStatus({ latestEvent, isRunning }: { latestEvent: AgentEvent | null; isRunning: boolean }) {
  const status = !latestEvent ? 'IDLE' : isRunning ? statusByPhase[latestEvent.phase] : 'COMPLETED'
  return <article className="agent-status panel" aria-live="polite">
    <span className={`agent-pulse ${latestEvent ? (isRunning ? 'active' : 'complete') : 'idle'}`} />
    <div><span className="metric-label">Agent {isRunning && latestEvent ? '● LIVE' : ''}</span><strong>{status}</strong><span className="metric-detail">Current phase: {latestEvent?.title ?? 'Waiting for activity...'}</span></div>
    <span className={`pill ${latestEvent ? `agent-${latestEvent.status}` : 'neutral'}`}>{status}</span>
  </article>
}
