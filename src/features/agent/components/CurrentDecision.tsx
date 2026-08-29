import type { AgentEvent } from '../types/agent.types'

export function CurrentDecision({ events }: { events: AgentEvent[] }) {
  const snapshot = [...events].reverse().find((event) => event.route && event.metrics && event.decision)
  const route = snapshot?.route
  const metrics = snapshot?.metrics
  const decision = snapshot?.decision

  return <article className="panel current-decision">
    <div className="panel-header"><div><p className="eyebrow">Current decision</p><h3>Route assessment</h3></div></div>
    <dl className="decision-list">
      <div><dt>Route</dt><dd>{route ? `${route.provider} / ${route.paymentMethod} / ${route.country} / ${route.issuer}` : '--'}</dd></div>
      <div><dt>Risk Level</dt><dd>{decision?.riskLevel ?? '--'}</dd></div>
      <div><dt>Current approval</dt><dd>{metrics ? `${metrics.currentApproval}%` : '--'}</dd></div>
      <div><dt>24h baseline</dt><dd>{metrics ? `${metrics.baselineApproval}%` : '--'}</dd></div>
      <div><dt>Deviation</dt><dd>{metrics ? `${metrics.deviation}%` : '--'}</dd></div>
      <div><dt>Confidence</dt><dd>{decision ? `${decision.confidence}%` : '--'}</dd></div>
      <div className="decision-action"><dt>Action</dt><dd>{decision?.action ?? '--'}</dd></div>
    </dl>
  </article>
}
