import type { RouteHealth } from '../types/route-health.types'

export function RouteHealthLive({ route }: { route: RouteHealth | null }) {
  if (!route) return <article className="panel route-health-live"><div className="empty-state">Waiting for an observed route…</div></article>
  const country = new Intl.DisplayNames(['en'], { type: 'region' }).of(route.country) ?? route.country
  return <article className="panel route-health-live">
    <div className="panel-header"><div><p className="eyebrow">Route health</p><h3>{route.provider}</h3><p>{route.paymentMethod} · {country} · {route.issuer}</p></div><span className="watching-label">Agent watching</span></div>
    <div className="route-live-metrics">
      <div><span>Current approval</span><strong>{route.currentApproval}%</strong></div><div><span>24h baseline</span><strong>{route.baselineApproval}%</strong></div><div><span>Deviation</span><strong className={route.deviation < -3 ? 'negative-value' : ''}>{route.deviation}%</strong></div>
      <div><span>Transactions</span><strong>{route.transactionCount}</strong></div><div><span>Risk score</span><strong>{route.riskScore} / 100</strong></div><div><span>Risk</span><strong>{route.riskLevel}</strong></div>
    </div>
    <div className="approval-bars">
      <div><span>Current</span><div><i style={{ width: `${route.currentApproval}%` }} /></div><strong>{route.currentApproval}%</strong></div>
      <div><span>Baseline</span><div><i style={{ width: `${route.baselineApproval}%` }} /></div><strong>{route.baselineApproval}%</strong></div>
    </div>
  </article>
}
