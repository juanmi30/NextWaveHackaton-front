import { useAgentStreamContext } from '../../agent/context/AgentStreamContext'
import { useRouteHealth } from '../hooks/useRouteHealth'

export function RiskEvolution() {
  const { events } = useAgentStreamContext()
  const { watchedRoute } = useRouteHealth()
  const points = events.flatMap((event) => {
    const approval = event.metrics?.currentApproval
    const baseline = event.metrics?.baselineApproval
    return typeof approval === 'number' && typeof baseline === 'number' ? [{ phase: event.phase, approval, baseline }] : []
  })
  const baseline = points.at(-1)?.baseline ?? watchedRoute?.baselineApproval ?? 0
  const x = (index: number) => points.length < 2 ? 300 : 48 + index * (520 / (points.length - 1))
  const y = (value: number) => 184 - (value - 55) * (140 / 45)
  const polyline = points.map((point, index) => `${x(index)},${y(point.approval)}`).join(' ')

  return <article className="panel risk-evolution">
    <div className="panel-header"><div><h3>Risk evolution</h3><p>Approval rate across agent events</p></div></div>
    <div className="risk-chart-wrap"><svg viewBox="0 0 600 230" role="img" aria-label="Approval rate evolution compared with baseline">
      {[60, 70, 80, 90].map((value) => <g key={value}><line x1="42" x2="574" y1={y(value)} y2={y(value)} className="chart-grid" /><text x="8" y={y(value) + 4}>{value}%</text></g>)}
      <line x1="42" x2="574" y1={y(baseline)} y2={y(baseline)} className="chart-baseline" /><text x="470" y={y(baseline) - 7} className="baseline-label">Baseline {baseline}%</text>
      {points.length > 1 ? <polyline points={polyline} className="chart-line" /> : null}
      {points.map((point, index) => <g key={`${point.phase}-${index}`}><circle cx={x(index)} cy={y(point.approval)} r="5" className="chart-point" /><text x={x(index)} y="215" textAnchor="middle">{point.phase}</text><text x={x(index)} y={y(point.approval) - 10} textAnchor="middle" className="point-label">{point.approval}%</text></g>)}
    </svg>{points.length === 0 ? <span className="chart-empty">Waiting for approval data…</span> : null}</div>
  </article>
}
