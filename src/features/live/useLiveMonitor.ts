import { useCallback, useEffect, useRef, useState } from 'react'
import { getLiveDegradations, getLiveStatus, startLiveMonitor, stopLiveMonitor } from './liveApi'
import type { LiveDegradation, LiveStatus } from './types'

export function useLiveMonitor(enabled: boolean, intervalMs = 2500) {
  const [status, setStatus] = useState<LiveStatus | null>(null)
  const [degradations, setDegradations] = useState<LiveDegradation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(0)
  const pollingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!enabled || pollingRef.current) return
    pollingRef.current = true
    try {
      const [nextStatus, nextDegradations] = await Promise.all([getLiveStatus(), getLiveDegradations()])
      setStatus(nextStatus); setDegradations(nextDegradations); setRefreshedAt(Date.now()); setError(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Live monitor unavailable') }
    finally { pollingRef.current = false }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const initialTimer = window.setTimeout(() => void refresh(), 0)
    const timer = window.setInterval(() => void refresh(), intervalMs)
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer) }
  }, [enabled, intervalMs, refresh])

  const start = async () => { setBusy(true); try { await startLiveMonitor(); await refresh(); setError(null) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to start live monitor') } finally { setBusy(false) } }
  const stop = async () => { setBusy(true); try { await stopLiveMonitor(); await refresh(); setError(null) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to stop live monitor') } finally { setBusy(false) } }
  return { status, degradations, error, busy, refreshedAt, refresh, start, stop }
}
