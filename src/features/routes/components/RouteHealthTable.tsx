import type { RouteHealth } from '../types/route-health.types'

export function RouteHealthTable({ routes, watchedRouteId }: { routes: RouteHealth[]; watchedRouteId: string | null }) {
  return <div className="table-wrap"><table className="route-health-table">
    <thead><tr><th>Route</th><th>Approval</th><th>Baseline</th><th>Deviation</th><th>Transactions</th><th>Risk</th><th>Status</th></tr></thead>
    <tbody>{routes.map((route) => <tr key={route.id} className={route.id === watchedRouteId ? 'route-watched' : ''}>
      <td><strong>{route.provider} / {route.paymentMethod} / {route.country}</strong><span className="cell-subtitle">{route.issuer ?? 'All issuers'} {route.id === watchedRouteId ? <em className="watching-label">Agent watching</em> : null}</span></td>
      <td>{route.currentApproval}%</td><td>{route.baselineApproval}%</td><td className={route.deviation < -3 ? 'negative-value' : ''}>{route.deviation}%</td><td>{route.transactionCount}</td>
      <td><span className={`pill risk-${route.riskLevel.toLowerCase()}`}>{route.riskLevel}</span></td><td><span className={`route-status ${route.status}`}>{route.status}</span></td>
    </tr>)}</tbody>
  </table></div>
}
