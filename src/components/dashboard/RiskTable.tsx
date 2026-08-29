import type { RiskItem } from '../../types/domain'

const percent = (value: number) => `${(value * 100).toFixed(1)}%`
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

export function RiskTable({ risks }: { risks: RiskItem[] }) {
  if (risks.length === 0) {
    return <div className="empty-state">No risky routes found with the current window.</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Route / entity</th>
            <th>Risk</th>
            <th>Approval now</th>
            <th>Baseline</th>
            <th>Drop</th>
            <th>Est. loss</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk.key}>
              <td>
                <strong>{risk.label}</strong>
                <span className="cell-subtitle">{risk.recommendation}</span>
              </td>
              <td><span className={`pill risk-${risk.riskLevel.toLowerCase()}`}>{risk.riskLevel}</span></td>
              <td>{percent(risk.current.approvalRate)}</td>
              <td>{percent(risk.baseline.approvalRate)}</td>
              <td>{percent(risk.approvalDrop)}</td>
              <td>{money(risk.estimatedLossCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
