import type { PreventiveWatch } from '../types/preventive-watch.types'

const rate = (value: number) => `${(Math.abs(value) <= 1 ? value * 100 : value).toFixed(1)}%`
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)

export function PreventiveWatchList({ watches, selectedWatchId, onSelect }: { watches: PreventiveWatch[]; selectedWatchId?: string | null; onSelect: (watch: PreventiveWatch) => void }) {
  if (watches.length === 0) return null
  return <section className="panel preventive-watches"><div className="panel-header"><div><p className="eyebrow">Early warning</p><h3>Preventive investigation</h3><p>Predictive signals only. These are not confirmed incidents and no root cause is claimed.</p></div><span className="pill risk-high">{watches.length} WATCH</span></div><div className="preventive-watch-list">{watches.map((watch) => <article className={selectedWatchId === watch.id ? 'selected' : ''} key={watch.id}><button type="button" onClick={() => onSelect(watch)} aria-pressed={selectedWatchId === watch.id}>
    <div className="preventive-watch-heading"><div><span>Predictive watch{selectedWatchId === watch.id ? ' · Selected' : ''}</span><strong>{Object.values(watch.dimensions).join(' · ') || 'Payment route under observation'}</strong></div><div><b>{watch.riskLevel} predictive risk</b><span>● PRE-INVESTIGATING</span></div></div>
    <p>{watch.statement ?? 'An early signal is being observed while the system gathers more evidence.'}</p>
    <div className="preventive-watch-metrics">{watch.observedApproval !== undefined ? <span>Observed <strong>{rate(watch.observedApproval)}</strong></span> : null}{watch.baselineApproval !== undefined ? <span>Expected <strong>{rate(watch.baselineApproval)}</strong></span> : null}{watch.drift !== undefined ? <span>Recent drift <strong>{watch.drift.toFixed(1)} pp</strong></span> : null}{watch.attempts !== undefined ? <span>Attempts <strong>{watch.attempts.toLocaleString()}</strong></span> : null}{watch.riskScore !== undefined ? <span>Risk score <strong>{watch.riskScore.toFixed(2)}</strong></span> : null}{watch.potentialImpactCents !== undefined ? <span>Potential payment volume at risk <strong>{money(watch.potentialImpactCents)}/min</strong></span> : null}</div>
    <small>Not yet confirmed · Detection must confirm an anomaly before incident diagnosis.</small>
  </button></article>)}</div></section>
}
