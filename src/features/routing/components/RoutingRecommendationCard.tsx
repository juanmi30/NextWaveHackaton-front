import { useRouteHealth } from '../../routes/hooks/useRouteHealth'
import { useRoutingRecommendation } from '../hooks/useRoutingRecommendation'

export function RoutingRecommendationCard() {
  const recommendation = useRoutingRecommendation()
  const { watchedRoute } = useRouteHealth()
  const candidate = recommendation.recommendedCandidate
  return <article className="panel routing-summary-card">
    <div><p className="eyebrow">Routing recommendation</p><h3>{candidate ? 'Recommendation ready' : 'Waiting for agent decision...'}</h3></div>
    {candidate ? <div className="routing-summary-values"><span>Current <strong>{watchedRoute?.provider} · {watchedRoute?.currentApproval}%</strong></span><span>Recommended <strong>{candidate.provider} · {candidate.approvalRate}%</strong></span><span>Expected recovery <strong>+{recommendation.expectedApprovalRecovery} pp</strong></span></div> : null}
    <a className="button secondary agent-summary-link" href="#/agent-live">View decision →</a>
  </article>
}
