import type { LiveStatus } from './types'

const duration = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
export function LiveControlTower({ status, busy, onStart, onStop }: { status: LiveStatus | null; busy: boolean; onStart: () => Promise<void>; onStop: () => Promise<void> }) {
  const running = status?.state === 'RUNNING'
  return <article className="panel live-control-tower">
    <div className="live-control-heading"><div><p className="eyebrow">Live monitor</p><h3>{status?.state ?? 'NOT READY'} {running ? <i /> : null}</h3></div>{running ? <button className="button ghost" type="button" disabled={busy} onClick={() => void onStop()}>Stop live monitor</button> : <button className="button primary" type="button" disabled={busy} onClick={() => void onStart()}>Start live monitor</button>}</div>
    <div className="live-monitor-stats"><div><span>Transactions</span><strong>{status?.generator.generatedTransactions.toLocaleString() ?? '—'}</strong><small>generated</small></div><div><span>Detection runs</span><strong>{status?.detection.runs ?? '—'}</strong><small>{status?.detection.skippedDetectionRuns ?? 0} skipped</small></div><div><span>Last result</span><strong>{status?.detection.lastOutcome ?? '—'}</strong></div><div><span>Open from run</span><strong>{status?.detection.latestIncidentCount ?? '—'}</strong></div><div><span>Prediction</span><strong>{status ? `${status.prediction.lastWatchRiskCount} WATCH · ${status.prediction.lastElevatedRiskCount} HIGH` : '—'}</strong><small>Early warning</small></div><div><span>Uptime</span><strong>{status ? duration(status.uptimeSeconds) : '—'}</strong></div></div>
  </article>
}
