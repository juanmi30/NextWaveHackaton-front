import type { RoutingCandidate } from '../types/routing.types'

export function calculateRoutingScore(candidate: RoutingCandidate): number {
  if (candidate.availability === 'UNAVAILABLE') return 0

  // Approval contributes 70%; bounded latency and cost quality each contribute 15%.
  const approvalComponent = candidate.approvalRate * 0.7
  const latencyQuality = Math.max(0, Math.min(100, 100 - candidate.latencyMs / 10))
  const costQuality = Math.max(0, Math.min(100, 100 - candidate.estimatedCost * 20))
  const availabilityMultiplier = candidate.availability === 'DEGRADED' ? 0.7 : 1

  return Math.round(Math.max(0, Math.min(100, (approvalComponent + latencyQuality * 0.15 + costQuality * 0.15) * availabilityMultiplier)))
}
