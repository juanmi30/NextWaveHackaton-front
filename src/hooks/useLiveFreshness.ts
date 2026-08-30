import { useEffect, useState } from 'react'

export type FreshnessState = 'LIVE' | 'STALE' | 'DISCONNECTED'

export function useLiveFreshness(lastUpdatedAt: number, expectedIntervalMs: number, disconnected = false) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const update = () => setNow(performance.timeOrigin + performance.now())
    const initial = window.setTimeout(update, 0)
    const timer = window.setInterval(update, 1000)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [])
  const ageMs = lastUpdatedAt && now !== null ? Math.max(0, now - lastUpdatedAt) : Number.POSITIVE_INFINITY
  const state: FreshnessState = disconnected || ageMs > expectedIntervalMs * 8
    ? 'DISCONNECTED'
    : ageMs > expectedIntervalMs * 2.5 ? 'STALE' : 'LIVE'
  const label = state === 'LIVE' ? `updated ${Math.max(0, ageMs / 1000).toFixed(1)}s ago` : state === 'STALE' ? `last update ${Math.round(ageMs / 1000)}s ago` : 'backend unavailable'
  return { state, ageMs, label }
}
