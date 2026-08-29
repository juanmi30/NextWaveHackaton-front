import { useMemo } from 'react'
import { useAgentStreamContext } from '../../agent/context/AgentStreamContext'
import { useRouteHealth } from '../../routes/hooks/useRouteHealth'
import { mockRoutingCandidates } from '../services/mockRoutingCandidates'
import type { RoutingRecommendation } from '../types/routing.types'

export function useRoutingRecommendation(): RoutingRecommendation {
  const { events, latestEvent } = useAgentStreamContext()
  const { watchedRoute } = useRouteHealth()

  return useMemo(() => {
    const significantDegradation = events.some((event) => typeof event.metrics?.deviation === 'number' && event.metrics.deviation < -10)
    let status: RoutingRecommendation['status'] = 'WAITING'
    if (latestEvent?.phase === 'VERIFY' && latestEvent.status === 'success') status = 'COMPLETED'
    else if (latestEvent?.phase === 'DECIDE' || latestEvent?.phase === 'ACT' || latestEvent?.phase === 'VERIFY') status = 'RECOMMENDED'
    else if (significantDegradation) status = 'EVALUATING'

    const ranked = [...mockRoutingCandidates].sort((a, b) => b.score - a.score)
    const hasRecommendation = status === 'RECOMMENDED' || status === 'COMPLETED'
    const candidates = ranked.map((candidate, index) => ({ ...candidate, recommended: hasRecommendation && index === 0 }))
    const recommendedCandidate = hasRecommendation ? candidates[0] : undefined
    const decision = [...events].reverse().find((event) => event.decision)?.decision

    return {
      sourceRouteId: watchedRoute?.id ?? '',
      candidates,
      recommendedCandidate,
      expectedApprovalRecovery: recommendedCandidate && watchedRoute ? recommendedCandidate.approvalRate - watchedRoute.currentApproval : undefined,
      confidence: hasRecommendation ? decision?.confidence : undefined,
      reason: hasRecommendation ? 'Higher expected approval rate while maintaining acceptable latency and processing cost.' : undefined,
      status,
    }
  }, [events, latestEvent, watchedRoute])
}
