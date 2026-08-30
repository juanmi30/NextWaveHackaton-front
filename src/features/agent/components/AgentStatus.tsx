import type { AgentEvent } from '../types/agent.types'
import type { DemoStatus } from '../types/demo.types'

const statusByPhase = { OBSERVE: 'OBSERVING', ANALYZE: 'ANALYZING', DECIDE: 'DECIDING', ACT: 'ACTING', VERIFY: 'VERIFYING', INVESTIGATE: 'INVESTIGATING', DIAGNOSE: 'DIAGNOSING', RECOMMEND: 'RECOMMENDING', REPORT: 'REPORTING' } as const
export type WatchtowerState = 'MONITORING' | 'PRE_INVESTIGATING' | 'CONFIRMED' | 'DIAGNOSING' | 'REPORT_READY' | 'RECONNECTING' | 'OFFLINE' | 'ERROR'
const detailByState: Record<WatchtowerState, string> = { MONITORING: 'Continuously observing payment routes.', PRE_INVESTIGATING: 'Gathering evidence for predictive early warnings.', CONFIRMED: 'A detected anomaly is now a confirmed incident.', DIAGNOSING: 'Building an evidence-backed incident diagnosis.', REPORT_READY: 'The diagnosis report is ready for review.', RECONNECTING: 'Restoring the live analysis connection.', OFFLINE: 'The live monitor is stopped or unavailable.', ERROR: 'The watchtower encountered an error.' }

export function AgentStatus({ latestEvent, demoStatus, connectionState, watchtowerState }: { latestEvent: AgentEvent | null; demoStatus: DemoStatus; connectionState?: string; watchtowerState?: WatchtowerState }) {
  const status = watchtowerState ?? connectionState ?? (demoStatus === 'RUNNING' && latestEvent ? statusByPhase[latestEvent.phase] : demoStatus)
  const active = demoStatus === 'RUNNING' || status === 'MONITORING' || status === 'PRE_INVESTIGATING' || status === 'DIAGNOSING' || status === 'RECONNECTING'
  return <article className="agent-status panel" aria-live="polite">
    <span className={`agent-pulse ${active ? 'active' : demoStatus === 'COMPLETED' ? 'complete' : 'idle'}`} />
    <div><span className="metric-label">Payment AI watchtower {active ? '● LIVE' : ''}</span><strong>{status}</strong><span className="metric-detail">{watchtowerState ? detailByState[watchtowerState] : latestEvent ? `Current phase: ${latestEvent.title}` : 'Waiting for activity…'}</span></div>
    <span className={`pill ${latestEvent ? `agent-${latestEvent.status}` : 'neutral'}`}>{status}</span>
  </article>
}
