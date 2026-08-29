import { useAgentStreamContext } from '../context/AgentStreamContext'
import type { AgentPhase } from '../types/agent.types'
const mockPhases: AgentPhase[] = ['OBSERVE', 'ANALYZE', 'DECIDE', 'ACT', 'VERIFY']
const livePhases: AgentPhase[] = ['OBSERVE', 'INVESTIGATE', 'DIAGNOSE', 'RECOMMEND', 'REPORT']
export function DemoControls() {
  const { events, currentPhase, demoStatus, startDemo, resetDemo, pauseDemo, resumeDemo, isSse, incidentId, error } = useAgentStreamContext()
  const phases = isSse ? livePhases : mockPhases
  const completedPhases = new Set(events.map((event) => event.phase))
  const statusText = demoStatus === 'RUNNING' ? (isSse ? 'Live analysis running...' : 'Running demo...') : demoStatus === 'PAUSED' ? 'Demo paused' : demoStatus === 'COMPLETED' ? 'Analysis completed' : demoStatus === 'ERROR' ? 'Analysis failed' : 'Ready to start'
  return <article className="panel demo-controls">
    <div className="demo-control-row"><div><span className="metric-label">{isSse ? `Incident analysis${incidentId ? ` · ${incidentId}` : ''}` : 'Demo scenario'}</span><strong>{statusText}</strong><span className="metric-detail">{isSse ? `${events.length} observable events received` : `Scenario progress · ${events.length} / 7`}</span>{error ? <span className="agent-control-error">{error}</span> : null}</div><div className="actions">
      {demoStatus === 'IDLE' || demoStatus === 'ERROR' ? <button type="button" className="button primary" onClick={startDemo}>{isSse ? 'Start analysis' : 'Start demo'}</button> : null}
      {demoStatus === 'RUNNING' && !isSse ? <button type="button" className="button secondary" onClick={pauseDemo}>Pause</button> : null}
      {demoStatus === 'PAUSED' && !isSse ? <button type="button" className="button primary" onClick={resumeDemo}>Resume</button> : null}
      {demoStatus === 'COMPLETED' ? <button type="button" className="button primary" onClick={startDemo}>{isSse ? 'Run again' : 'Replay demo'}</button> : null}
      {demoStatus !== 'IDLE' ? <button type="button" className="button ghost" onClick={resetDemo}>Reset</button> : null}
    </div></div>
    <ol className="scenario-progress">{phases.map((phase) => { const current = demoStatus !== 'COMPLETED' && currentPhase === phase; const complete = demoStatus === 'COMPLETED' || (completedPhases.has(phase) && !current); return <li key={phase} className={current ? 'current' : complete ? 'complete' : 'pending'}><i />{phase}</li> })}</ol>
  </article>
}
