import { useEffect, useState } from 'react'
import { getHealth, type Health } from './lib/api'

export function HealthBadge() {
  const [state, setState] = useState<Health | 'loading' | 'error'>('loading')

  useEffect(() => {
    getHealth().then(setState).catch(() => setState('error'))
  }, [])

  if (state === 'loading') return <p>Conectando con la API…</p>
  if (state === 'error') return <p>API inalcanzable</p>
  return <p>API: {state.status} · BD: {state.db}</p>
}