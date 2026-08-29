import { useAgentStreamContext } from '../context/AgentStreamContext'
import type { AgentPhase } from '../types/agent.types'

const phases: AgentPhase[] = ['OBSERVE', 'ANALYZE', 'DECIDE', 'ACT', 'VERIFY']

export function DemoControls() {
  const { events, currentPhase, demoStatus, startDemo, resetDemo, pauseDemo, resumeDemo } = useAgentStreamContext()
  const completedPhases = new Set(events.map((event) => event.phase))
  const statusText = demoStatus === 'RUNNING' ? 'Running demo...' : demoStatus === 'PAUSED' ? 'Demo paused' : demoStatus === 'COMPLETED' ? 'Demo completed' : 'Ready to start'

  return <article className="panel demo-controls">
    <div className="demo-control-row"><div><span className="metric-label">Demo scenario</span><strong>{statusText}</strong><span className="metric-detail">Scenario progress · {events.length} / 7</span></div><div className="actions">
      {demoStatus === 'IDLE' ? <button type="button" className="button primary" onClick={startDemo}>Start demo</button> : null}
      {demoStatus === 'RUNNING' ? <button type="button" className="button secondary" onClick={pauseDemo}>Pause</button> : null}
      {demoStatus === 'PAUSED' ? <button type="button" className="button primary" onClick={resumeDemo}>Resume</button> : null}
      {demoStatus === 'COMPLETED' ? <button type="button" className="button primary" onClick={startDemo}>Replay demo</button> : null}
      {demoStatus !== 'IDLE' ? <button type="button" className="button ghost" onClick={resetDemo}>Reset</button> : null}
    </div></div>
    <ol className="scenario-progress">{phases.map((phase) => {
      const isCurrent = demoStatus !== 'COMPLETED' && currentPhase === phase
      const isComplete = demoStatus === 'COMPLETED' || (completedPhases.has(phase) && !isCurrent)
      return <li key={phase} className={isCurrent ? 'current' : isComplete ? 'complete' : 'pending'}><i />{phase}</li>
    })}</ol>
  </article>
}
