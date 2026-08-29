import { useMemo } from 'react'
import { useAgentStreamContext } from '../../agent/context/AgentStreamContext'
import { mockRoutes } from '../services/mockRoutes'
import type { RouteHealth, RouteRiskLevel } from '../types/route-health.types'
import { calculateRiskScore, riskLevelFromScore } from '../utils/risk'
import { approvalDropColombia } from '../../agent/scenarios/approvalDropColombia'

const routeMatches = (health: RouteHealth, provider: string, paymentMethod: string, country: string, issuer?: string) =>
  health.provider === provider && health.paymentMethod === paymentMethod && health.country === country && health.issuer === issuer

export function useRouteHealth() {
  const { events } = useAgentStreamContext()
  return useMemo(() => {
    const activeEvent = [...events].reverse().find((event) => event.route)
    const activeRoute = activeEvent?.route
    const latestMetrics = activeRoute ? [...events].reverse().find((event) => event.metrics && event.route?.provider === activeRoute.provider && event.route.paymentMethod === activeRoute.paymentMethod && event.route.country === activeRoute.country && event.route.issuer === activeRoute.issuer)?.metrics : undefined
    const latestDecision = activeRoute ? [...events].reverse().find((event) => event.decision && event.route?.provider === activeRoute.provider && event.route.paymentMethod === activeRoute.paymentMethod && event.route.country === activeRoute.country && event.route.issuer === activeRoute.issuer)?.decision : undefined

    const routes = mockRoutes.map((base): RouteHealth => {
      if (!activeRoute || !routeMatches(base, activeRoute.provider, activeRoute.paymentMethod, activeRoute.country, activeRoute.issuer)) return { ...base }
      const currentApproval = latestMetrics?.currentApproval ?? base.currentApproval
      const baselineApproval = latestMetrics?.baselineApproval ?? base.baselineApproval
      const deviation = latestMetrics?.deviation ?? currentApproval - baselineApproval
      const riskScore = calculateRiskScore(currentApproval, baselineApproval)
      const calculatedLevel = riskLevelFromScore(riskScore)
      const riskLevel = (latestDecision?.riskLevel as RouteRiskLevel | undefined) ?? calculatedLevel
      const status = riskLevel === 'CRITICAL' ? 'critical' : riskLevel === 'LOW' ? 'healthy' : 'degraded'
      return { ...base, currentApproval, baselineApproval, deviation, transactionCount: latestMetrics?.transactionCount ?? base.transactionCount, riskScore, riskLevel, status, updatedAt: activeEvent.timestamp }
    })
    const watchedRoute = activeRoute ? routes.find((route) => routeMatches(route, activeRoute.provider, activeRoute.paymentMethod, activeRoute.country, activeRoute.issuer)) ?? null : routes.find((route) => route.id === approvalDropColombia.initialRoute.id) ?? null
    return { routes, watchedRoute, watchedRouteId: activeRoute ? watchedRoute?.id ?? null : null }
  }, [events])
}
