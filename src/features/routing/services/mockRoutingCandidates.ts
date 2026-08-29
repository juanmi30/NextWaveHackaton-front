import type { RoutingCandidate } from '../types/routing.types'
import { calculateRoutingScore } from '../utils/routingScore'

type CandidateInput = Omit<RoutingCandidate, 'score' | 'recommended'>
const createCandidate = (candidate: CandidateInput): RoutingCandidate => ({ ...candidate, score: calculateRoutingScore({ ...candidate, score: 0, recommended: false }), recommended: false })

export const mockRoutingCandidates: readonly RoutingCandidate[] = [
  createCandidate({ id: 'stripe-card-co', provider: 'Stripe', paymentMethod: 'CARD', country: 'CO', approvalRate: 92, latencyMs: 410, estimatedCost: 1.9, availability: 'AVAILABLE' }),
  createCandidate({ id: 'adyen-card-co', provider: 'Adyen', paymentMethod: 'CARD', country: 'CO', approvalRate: 89, latencyMs: 360, estimatedCost: 1.7, availability: 'AVAILABLE' }),
  createCandidate({ id: 'mercadopago-card-co', provider: 'MercadoPago', paymentMethod: 'CARD', country: 'CO', approvalRate: 80, latencyMs: 290, estimatedCost: 1.4, availability: 'AVAILABLE' }),
]
