export type RouteRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface RouteHealth {
  id: string
  provider: string
  paymentMethod: string
  country: string
  issuer?: string
  currentApproval: number
  baselineApproval: number
  deviation: number
  transactionCount: number
  riskScore: number
  riskLevel: RouteRiskLevel
  status: 'healthy' | 'degraded' | 'critical'
  updatedAt: string
}
