import type { AgentEvent } from '../types/agent.types'
import type { DemoStatus } from '../types/demo.types'
const statusByPhase = { OBSERVE: 'OBSERVING', ANALYZE: 'ANALYZING', DECIDE: 'DECIDING', ACT: 'ACTING', VERIFY: 'VERIFYING' } as const
export function AgentStatus({ latestEvent, demoStatus }: { latestEvent: AgentEvent | null; demoStatus: DemoStatus }) {
  const status = demoStatus === 'RUNNING' && latestEvent ? statusByPhase[latestEvent.phase] : demoStatus
  const isRunning = demoStatus === 'RUNNING'
  return <article className="agent-status panel" aria-live="polite">
    <span className={`agent-pulse ${isRunning ? 'active' : demoStatus === 'COMPLETED' ? 'complete' : 'idle'}`} />
    <div><span className="metric-label">Agent {isRunning && latestEvent ? '● LIVE' : ''}</span><strong>{status}</strong><span className="metric-detail">Current phase: {latestEvent?.title ?? 'Waiting for activity...'}</span></div>
    <span className={`pill ${latestEvent ? `agent-${latestEvent.status}` : 'neutral'}`}>{status}</span>
  </article>
}
