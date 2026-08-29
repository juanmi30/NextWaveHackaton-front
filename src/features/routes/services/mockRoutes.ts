import type { RouteHealth } from '../types/route-health.types'
import { calculateRiskScore, riskLevelFromScore } from '../utils/risk'

type BaseRoute = Pick<RouteHealth, 'id' | 'provider' | 'paymentMethod' | 'country' | 'issuer' | 'currentApproval' | 'baselineApproval' | 'transactionCount'>

const createRoute = (route: BaseRoute): RouteHealth => {
  const deviation = route.currentApproval - route.baselineApproval
  const riskScore = calculateRiskScore(route.currentApproval, route.baselineApproval)
  return { ...route, deviation, riskScore, riskLevel: riskLevelFromScore(riskScore), status: 'healthy', updatedAt: new Date(0).toISOString() }
}

export const mockRoutes: readonly RouteHealth[] = [
  createRoute({ id: 'stripe-card-mx-bbva', provider: 'Stripe', paymentMethod: 'CARD', country: 'MX', issuer: 'BBVA', currentApproval: 94, baselineApproval: 95, transactionCount: 284 }),
  createRoute({ id: 'mercadopago-card-ar-santander', provider: 'MercadoPago', paymentMethod: 'CARD', country: 'AR', issuer: 'Santander', currentApproval: 88, baselineApproval: 91, transactionCount: 196 }),
  createRoute({ id: 'adyen-card-br-itau', provider: 'Adyen', paymentMethod: 'CARD', country: 'BR', issuer: 'Itaú', currentApproval: 91, baselineApproval: 92, transactionCount: 231 }),
  createRoute({ id: 'dlocal-card-co-bancolombia', provider: 'dLocal', paymentMethod: 'CARD', country: 'CO', issuer: 'Bancolombia', currentApproval: 82, baselineApproval: 83, transactionCount: 35 }),
]
