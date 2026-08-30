import type { Incident } from '../../types/domain'

export function compareIncidentPriority(left: Incident, right: Incident) {
  if (left.priorityRank !== right.priorityRank && (left.priorityRank !== undefined || right.priorityRank !== undefined)) return (left.priorityRank ?? Number.MAX_SAFE_INTEGER) - (right.priorityRank ?? Number.MAX_SAFE_INTEGER)
  if (left.lossPerMinuteCents !== right.lossPerMinuteCents) return right.lossPerMinuteCents - left.lossPerMinuteCents
  return new Date(right.detectedAt).getTime() - new Date(left.detectedAt).getTime()
}
