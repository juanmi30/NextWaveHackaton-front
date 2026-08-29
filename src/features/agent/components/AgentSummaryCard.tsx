import { useAgentStreamContext } from '../context/AgentStreamContext'

const activityLabel = { OBSERVE: 'Currently observing', ANALYZE: 'Currently analyzing', DECIDE: 'Currently deciding', ACT: 'Currently acting', VERIFY: 'Currently verifying' } as const

export function AgentSummaryCard() {
  const { events, latestEvent, isRunning, currentPhase, demoStatus, startDemo } = useAgentStreamContext()
  const route = [...events].reverse().find((event) => event.route)?.route
  const metrics = [...events].reverse().find((event) => event.metrics)?.metrics
  const decision = [...events].reverse().find((event) => event.decision)?.decision
  const country = route ? new Intl.DisplayNames(['en'], { type: 'region' }).of(route.country) ?? route.country : null
  const activity = demoStatus === 'IDLE' ? 'Ready to monitor payment routes' : demoStatus === 'PAUSED' ? 'Demo paused' : demoStatus === 'COMPLETED' ? 'Analysis completed' : currentPhase ? activityLabel[currentPhase] : 'Starting monitor...'

  return <article className="panel agent-summary">
    <div className="agent-summary-heading"><div><p className="eyebrow">AI Agent</p><h3>{activity}</h3>{route ? <p>{route.provider} · {route.paymentMethod} · {country}</p> : null}</div>{isRunning && latestEvent ? <span className="agent-live-label"><i /> LIVE</span> : null}</div>
    <div className="agent-summary-stats">
      <div><span>Approval deviation</span><strong>{metrics ? `${metrics.deviation}%` : '--'}</strong></div>
      <div><span>Confidence</span><strong>{decision ? `${decision.confidence}%` : '--'}</strong></div>
      <div><span>Risk</span><strong>{decision?.riskLevel ?? '--'}</strong></div>
    </div>
    {demoStatus === 'IDLE' ? <button type="button" className="button primary agent-summary-link" onClick={startDemo}>Start demo</button> : demoStatus === 'COMPLETED' ? <button type="button" className="button secondary agent-summary-link" onClick={startDemo}>Replay</button> : <a className="button secondary agent-summary-link" href="#/agent-live">View live activity →</a>}
  </article>
}
