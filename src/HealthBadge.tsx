import { useEffect, useState } from 'react'
import { getHealth } from './lib/api'
import type { Health } from './types/domain'

export function HealthBadge() {
  const [state, setState] = useState<Health | 'loading' | 'error'>('loading')

  useEffect(() => {
    getHealth().then(setState).catch(() => setState('error'))
  }, [])

  if (state === 'loading') return <span className="health-badge neutral">API…</span>
  if (state === 'error') return <span className="health-badge danger">API offline</span>

  const healthy = state.status === 'ok' && state.db === 'up'
  return (
    <span className={`health-badge ${healthy ? 'success' : 'warning'}`} title={`DB: ${state.db}`}>
      {healthy ? 'API connected' : `API ${state.status} · DB ${state.db}`}
    </span>
  )
}
