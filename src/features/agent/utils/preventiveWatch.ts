import type { PreventiveWatch } from '../types/preventive-watch.types'

const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
const number = (source: Record<string, unknown>, names: string[]) => { for (const name of names) if (typeof source[name] === 'number') return source[name] as number; return undefined }
const string = (source: Record<string, unknown>, names: string[]) => { for (const name of names) if (typeof source[name] === 'string') return source[name] as string; return undefined }

export function normalizePredictiveRisks(values: unknown[]): PreventiveWatch[] {
  return values.flatMap((value, index) => {
    const source = record(value)
    if (!source) return []
    const rawDimensions = record(source.dimensions) ?? record(source.segment) ?? record(source.route) ?? {}
    const dimensions = Object.fromEntries(Object.entries(rawDimensions).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
    const dimensionIdentity = Object.keys(dimensions).length > 0 ? JSON.stringify(dimensions) : null
    const identity = string(source, ['id', 'fingerprint', 'routeKey', 'segmentKey']) ?? dimensionIdentity ?? `watch-${index}`
    return [{
      id: identity || `watch-${index}`,
      dimensions,
      riskLevel: string(source, ['riskLevel', 'level', 'status']) ?? 'WATCH',
      riskScore: number(source, ['riskScore', 'score', 'failureProbability', 'failureProbabilityPercent']),
      observedApproval: number(source, ['observedApprovalRate', 'currentApprovalRate', 'approvalRate']),
      baselineApproval: number(source, ['baselineApprovalRate', 'expectedApprovalRate', 'baselineRate']),
      drift: number(source, ['approvalDropPp', 'drift', 'deviation']),
      attempts: number(source, ['attempts', 'transactionCount', 'currentAttempts']),
      potentialImpactCents: number(source, ['potentialImpactCents', 'lossPerMinuteCents']),
      statement: string(source, ['statement', 'summary', 'reason']),
    }]
  })
}
