import type { AnalyticsSummary, Incident } from '../../types/domain'
import type { LiveStatus } from '../../features/live/types'
import { LiveIndicator } from './LiveIndicator'

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
export function PaymentHealthTape({ summary, incidents, liveStatus }: { summary: AnalyticsSummary | null; incidents: Incident[]; liveStatus: LiveStatus | null }) {
  const loss = incidents.reduce((total, incident) => total + incident.lossPerMinuteCents, 0)
  const degraded = (summary?.incidents.open ?? 0) > 0 || summary?.state !== 'NORMAL'
  return <div className="payment-health-tape" aria-label="Live payment health">
    <div><span>Approval</span><strong>{summary ? `${(summary.approvalRate * 100).toFixed(1)}%` : '—'}</strong></div>
    <div><span>Volume</span><strong>{summary?.transactions.toLocaleString() ?? '—'} attempts</strong></div>
    <div><span>Open</span><strong>{summary?.incidents.open ?? '—'} incidents</strong></div>
    <div><span>Loss</span><strong className={loss > 0 ? 'negative-value' : ''}>{money(loss)}/min</strong></div>
    <div><span>Detector</span><strong>Run #{liveStatus?.detection.runs ?? '—'}</strong></div>
    <div><span>Traffic</span><LiveIndicator state={liveStatus?.state === 'RUNNING' ? degraded ? 'DEGRADED' : 'LIVE' : 'OFFLINE'} /></div>
    <div><span>Prediction</span><strong>{liveStatus?.prediction.lastWatchRiskCount ?? '—'} WATCH</strong></div>
  </div>
}
