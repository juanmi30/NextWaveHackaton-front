import type { RoutingCandidate } from '../types/routing.types'
import { calculateRoutingScore } from '../utils/routingScore'
import { approvalDropColombia } from '../../agent/scenarios/approvalDropColombia'

type CandidateInput = Omit<RoutingCandidate, 'score' | 'recommended'>
const createCandidate = (candidate: CandidateInput): RoutingCandidate => ({ ...candidate, score: calculateRoutingScore({ ...candidate, score: 0, recommended: false }), recommended: false })

export const mockRoutingCandidates: readonly RoutingCandidate[] = approvalDropColombia.routingCandidates.map(createCandidate)
