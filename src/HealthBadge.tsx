import { useEffect, useState } from 'react'
import { getHealth } from './lib/api'
import type { Health } from './types/domain'

export function HealthBadge({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<Health | 'loading' | 'error'>('loading')

  useEffect(() => {
    let active = true
    let loading = false
    const refresh = async () => {
      if (loading) return
      loading = true
      try { const health = await getHealth(); if (active) setState(health) }
      catch { if (active) setState('error') }
      finally { loading = false }
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  if (state === 'loading') return <span className={`health-badge neutral ${compact ? 'compact' : ''}`} title="Checking API connection" aria-label="Checking API connection"><i aria-hidden="true" /><span className="health-text">API…</span></span>
  if (state === 'error') return <span className={`health-badge danger ${compact ? 'compact' : ''}`} title="API disconnected" aria-label="API disconnected"><i aria-hidden="true" /><span className="health-text">API offline</span></span>

  const healthy = state.status === 'ok' && state.db === 'up'
  return (
    <span className={`health-badge ${healthy ? 'success' : 'warning'} ${compact ? 'compact' : ''}`} title={healthy ? 'API connected' : `API ${state.status} · DB ${state.db}`} aria-label={healthy ? 'API connected' : `API ${state.status}, database ${state.db}`}>
      <i aria-hidden="true" /><span className="health-text">{healthy ? 'API connected' : `API ${state.status} · DB ${state.db}`}</span>
    </span>
  )
}
