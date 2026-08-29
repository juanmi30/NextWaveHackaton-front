import type { RouteRiskLevel } from '../types/route-health.types'

export function calculateRiskScore(currentApproval: number, baselineApproval: number): number {
  const deviation = currentApproval - baselineApproval
  if (deviation >= -3) return Math.min(25, Math.round(Math.abs(Math.min(0, deviation)) * 25 / 3))
  if (deviation >= -10) return Math.min(50, 26 + Math.round((Math.abs(deviation) - 3) * 24 / 7))
  if (deviation >= -25) return Math.min(85, 51 + Math.round((Math.abs(deviation) - 10) * 34 / 12))
  return Math.min(100, 86 + Math.round((Math.abs(deviation) - 25) * 2))
}

export function riskLevelFromScore(score: number): RouteRiskLevel {
  if (score <= 25) return 'LOW'
  if (score <= 50) return 'MEDIUM'
  if (score <= 85) return 'HIGH'
  return 'CRITICAL'
}
