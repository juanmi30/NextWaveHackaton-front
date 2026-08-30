import { useAgentStreamContext } from '../context/AgentStreamContext'
import type { AgentPhase } from '../types/agent.types'
import type { WatchtowerState } from './AgentStatus'

const mockPhases: AgentPhase[] = ['OBSERVE', 'ANALYZE', 'DECIDE', 'ACT', 'VERIFY']
const livePhases: AgentPhase[] = ['OBSERVE', 'INVESTIGATE', 'DIAGNOSE', 'RECOMMEND', 'REPORT']
const watchtowerCopy: Record<WatchtowerState, string> = { MONITORING: 'Monitoring live payment telemetry', PRE_INVESTIGATING: 'Preventive investigation in progress', CONFIRMED: 'Incident confirmed', DIAGNOSING: 'AI diagnosis in progress', REPORT_READY: 'Report ready', RECONNECTING: 'Reconnecting to live analysis', OFFLINE: 'Watchtower offline', ERROR: 'Watchtower error' }

export function DemoControls({ watchtowerState }: { watchtowerState?: WatchtowerState }) {
  const { events, currentPhase, demoStatus, startDemo, resetDemo, pauseDemo, resumeDemo, retryAnalysis, reconnectAttempt, isSse, incidentId, error } = useAgentStreamContext()
  const phases = isSse ? livePhases : mockPhases
  const completedPhases = new Set(events.map((event) => event.phase))
  const statusText = isSse && watchtowerState ? `${watchtowerCopy[watchtowerState]}${watchtowerState === 'RECONNECTING' ? ` · attempt ${reconnectAttempt} of 4` : ''}` : isSse ? 'Connecting…' : demoStatus === 'PAUSED' ? 'Demo paused' : demoStatus === 'COMPLETED' ? 'Analysis completed' : demoStatus === 'RUNNING' ? 'Running demo…' : 'Ready to start'
  return <article className="panel demo-controls">
    <div className="demo-control-row"><div><span className="metric-label">{isSse ? incidentId ? `Confirmed incident diagnosis · ${incidentId}` : 'Payment AI watchtower' : 'Demo scenario'}</span><strong>{statusText}</strong><span className="metric-detail">{isSse ? `${events.length} observable events received` : `Scenario progress · ${events.length} / 7`}</span>{error ? <span className="agent-control-error">{error}</span> : null}</div><div className="actions">
      {demoStatus === 'IDLE' && !isSse ? <button type="button" className="button primary" onClick={startDemo}>Start demo</button> : null}
      {watchtowerState === 'ERROR' ? <button type="button" className="button secondary" onClick={retryAnalysis}>Retry connection</button> : null}
      {demoStatus === 'ERROR' && !isSse ? <button type="button" className="button secondary" onClick={startDemo}>Start demo</button> : null}
      {demoStatus === 'RUNNING' && !isSse ? <button type="button" className="button secondary" onClick={pauseDemo}>Pause</button> : null}
      {demoStatus === 'PAUSED' && !isSse ? <button type="button" className="button primary" onClick={resumeDemo}>Resume</button> : null}
      {watchtowerState === 'REPORT_READY' ? <button type="button" className="button primary" onClick={() => document.querySelector('.diagnosis-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>View diagnosis</button> : null}
      {demoStatus === 'COMPLETED' && !isSse ? <button type="button" className="button primary" onClick={startDemo}>Replay demo</button> : null}
      {demoStatus !== 'IDLE' && !isSse ? <button type="button" className="button ghost" onClick={resetDemo}>Reset</button> : null}
    </div></div>
    {!isSse || incidentId ? <ol className="scenario-progress">{phases.map((phase) => { const current = demoStatus !== 'COMPLETED' && currentPhase === phase; const complete = demoStatus === 'COMPLETED' || (completedPhases.has(phase) && !current); return <li key={phase} className={current ? 'current' : complete ? 'complete' : 'pending'}><i />{phase}</li> })}</ol> : null}
  </article>
}
