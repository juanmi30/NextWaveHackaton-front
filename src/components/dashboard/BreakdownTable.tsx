import type { AnalyticsBreakdownRow } from '../../types/domain'

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const points = (value: number) => `${(value * 100).toFixed(1)} pp`
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
const dimensionsLabel = (dimensions: Record<string, string>) => Object.entries(dimensions).map(([key, value]) => `${key}=${value}`).join(' · ') || 'N/A'

export function BreakdownTable({ rows }: { rows: AnalyticsBreakdownRow[] }) {
  if (rows.length === 0) return <div className="empty-state">No breakdown rows available.</div>
  return <div className="table-wrap"><table><thead><tr><th>Dimensions / Route</th><th>Attempts</th><th>Approval</th><th>Baseline</th><th>Drop</th><th>Volume</th></tr></thead><tbody>
    {rows.map((row, index) => <tr key={`${dimensionsLabel(row.dimensions)}-${index}`}><td><strong>{dimensionsLabel(row.dimensions)}</strong></td><td>{row.attempts}</td><td>{percent(row.approvalRate)}</td><td>{row.hasBaseline ? percent(row.baselineRate) : 'No baseline'}</td><td>{row.hasBaseline ? points(row.drop) : 'N/A'}</td><td>{money(row.volumeUsdCents)}</td></tr>)}
  </tbody></table></div>
}
