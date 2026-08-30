export type LiveIndicatorState = 'LIVE' | 'ANALYZING' | 'DEGRADED' | 'STALE' | 'OFFLINE'

export function LiveIndicator({ state, detail }: { state: LiveIndicatorState; detail?: string }) {
  return <span className={`live-indicator live-indicator-${state.toLowerCase()}`} title={detail}><i aria-hidden="true" /><strong>{state}</strong>{detail ? <small>· {detail}</small> : null}</span>
}
