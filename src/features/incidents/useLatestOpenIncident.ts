import { useCallback, useEffect, useRef, useState } from 'react'
import type { Incident } from '../../types/domain'
import { getIncidents } from './incidentsApi'
import { compareIncidentPriority } from './incidentPriority'

function rank(incidents: Incident[]) {
  return [...incidents].sort((left, right) => {
    return compareIncidentPriority(left, right)
  })
}

export function useLatestOpenIncident(enabled: boolean, intervalMs = 2500) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!enabled || loadingRef.current) return
    loadingRef.current = true
    try { setIncidents(rank(await getIncidents('OPEN', 100))); setLoaded(true); setError(null) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load open incidents') }
    finally { loadingRef.current = false }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const initial = window.setTimeout(() => void refresh(), 0)
    const timer = window.setInterval(() => void refresh(), intervalMs)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [enabled, intervalMs, refresh])

  return { incidents, latest: incidents[0] ?? null, loaded, error, refresh }
}
