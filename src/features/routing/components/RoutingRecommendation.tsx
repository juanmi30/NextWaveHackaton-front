import type { RouteHealth } from '../../routes/types/route-health.types'
import type { RoutingRecommendation as Recommendation } from '../types/routing.types'

export function RoutingRecommendation({ recommendation, source }: { recommendation: Recommendation; source: RouteHealth | null }) {
  const candidate = recommendation.recommendedCandidate
  if (recommendation.status === 'WAITING') return <article className="panel routing-recommendation empty-state"><p className="eyebrow">Routing recommendation</p><h3>Waiting for anomaly detection...</h3></article>
  if (recommendation.status === 'EVALUATING') return <article className="panel routing-recommendation"><div className="panel-header"><div><p className="eyebrow">Routing recommendation</p><h3>Agent evaluating alternatives...</h3></div></div><div className="evaluating-list">{recommendation.candidates.map((item) => <div key={item.id}><strong>{item.provider}</strong><span>Approval {item.approvalRate}%</span><span>Latency {item.latencyMs} ms</span><span>Cost {item.estimatedCost.toFixed(1)}</span></div>)}</div></article>
  if (!candidate) return null

  const reasons = [
    source && candidate.approvalRate > source.currentApproval ? 'Higher approval rate' : null,
    candidate.availability === 'AVAILABLE' ? 'Route currently available' : null,
    candidate.latencyMs <= 500 ? 'Acceptable latency' : null,
    candidate.estimatedCost <= 2 ? 'Processing cost within threshold' : null,
  ].filter((reason): reason is string => Boolean(reason))

  return <article className="panel routing-recommendation">
    <div className="panel-header"><div><p className="eyebrow">Recommended route</p><h3>{candidate.provider} / {candidate.paymentMethod} / {candidate.country}</h3></div>{recommendation.status === 'COMPLETED' ? <span className="pill agent-success">Recommendation ready</span> : null}</div>
    <div className="recommendation-metrics"><div><span>Approval</span><strong>{candidate.approvalRate}%</strong></div><div><span>Current route</span><strong>{source ? `${source.currentApproval}%` : '--'}</strong></div><div><span>Expected recovery</span><strong>{recommendation.expectedApprovalRecovery !== undefined ? `+${recommendation.expectedApprovalRecovery} pp` : '--'}</strong></div><div><span>Routing confidence</span><strong>{recommendation.confidence !== undefined ? `${recommendation.confidence}%` : '--'}</strong></div><div><span>Score</span><strong>{candidate.score} / 100</strong></div></div>
    <div className="recommendation-reason"><strong>Why this route</strong><ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
  </article>
}
