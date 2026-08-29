import type { RouteHealth } from '../../routes/types/route-health.types'
import type { RoutingRecommendation } from '../types/routing.types'

export function RoutingDecisionFlow({ recommendation, source }: { recommendation: RoutingRecommendation; source: RouteHealth | null }) {
  const candidate = recommendation.recommendedCandidate
  return <article className="panel routing-flow">
    <div className="routing-node"><span>Current route</span><strong>{source?.provider ?? '--'}</strong><b>{source ? `${source.currentApproval}% · ${source.riskLevel} risk` : 'Waiting for route'}</b></div>
    <span className="routing-arrow">→</span>
    <div className="routing-node orchestrator"><span>AI orchestrator</span><strong>{recommendation.status === 'WAITING' ? 'Analyzing...' : recommendation.status === 'EVALUATING' ? 'Evaluating routes...' : 'Decision ready'}</strong></div>
    <span className="routing-arrow">→</span>
    <div className={`routing-node ${candidate ? 'recommended-node' : ''}`}><span>Recommended</span><strong>{candidate?.provider ?? 'Waiting...'}</strong><b>{candidate ? `${candidate.approvalRate}% · LOW risk` : '--'}</b>{recommendation.expectedApprovalRecovery !== undefined ? <em>+{recommendation.expectedApprovalRecovery} pp expected recovery</em> : null}</div>
  </article>
}
