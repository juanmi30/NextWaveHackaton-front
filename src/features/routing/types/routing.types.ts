export interface RoutingCandidate {
  id: string
  provider: string
  paymentMethod: string
  country: string
  approvalRate: number
  latencyMs: number
  estimatedCost: number
  availability: 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE'
  score: number
  recommended: boolean
}

export interface RoutingRecommendation {
  sourceRouteId: string
  candidates: RoutingCandidate[]
  recommendedCandidate?: RoutingCandidate
  expectedApprovalRecovery?: number
  confidence?: number
  reason?: string
  status: 'WAITING' | 'EVALUATING' | 'RECOMMENDED' | 'COMPLETED'
}
