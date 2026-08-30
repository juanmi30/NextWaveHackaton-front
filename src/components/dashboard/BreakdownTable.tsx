import type { AnalyticsBreakdownRow } from '../../types/domain'

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const points = (value: number) => `${(value * 100).toFixed(1)} pp`
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const dimensionsLabel = (dimensions: Record<string, string>) => Object.entries(dimensions).map(([key, value]) => `${key}=${value}`).join(' · ') || 'N/A'

export function BreakdownTable({ rows }: { rows: AnalyticsBreakdownRow[] }) {
  if (rows.length === 0) return <div className="empty-state">No breakdown rows available.</div>
  return <div className="table-wrap"><table className="watchlist-table"><thead><tr><th>Payment route</th><th>Attempts</th><th>Approval</th><th title="Expected approval performance from the baseline window.">Baseline</th><th title="Difference from expected baseline.">Δ</th><th>Volume</th><th>Status</th></tr></thead><tbody>
    {rows.map((row, index) => { const negative = row.hasBaseline && row.drop < 0; const critical = row.hasBaseline && row.drop <= -0.15; return <tr className={critical ? 'route-critical' : negative ? 'route-degraded' : ''} key={`${dimensionsLabel(row.dimensions)}-${index}`}><td><strong>{dimensionsLabel(row.dimensions)}</strong></td><td>{row.attempts.toLocaleString()}</td><td className={negative ? 'negative-value' : ''}>{percent(row.approvalRate)}</td><td>{row.hasBaseline ? percent(row.baselineRate) : 'No baseline'}</td><td className={negative ? 'negative-value' : ''}>{row.hasBaseline ? points(row.drop) : 'N/A'}</td><td>{money(row.volumeUsdCents)}</td><td><span className={`pill ${critical ? 'risk-critical' : negative ? 'risk-high' : 'risk-low'}`}>{critical ? 'CRITICAL' : negative ? 'DEGRADED' : 'HEALTHY'}</span></td></tr> })}
  </tbody></table></div>
}
