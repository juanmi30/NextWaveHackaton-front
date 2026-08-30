import { api } from '../../lib/api'
import type { AddLiveDegradationInput, LiveDegradation, LiveStatus } from './types'

export const getLiveStatus = () => api<LiveStatus>('/api/live/status')
export const startLiveMonitor = () => api<LiveStatus>('/api/live/start', { method: 'POST', body: JSON.stringify({ autoSeed: true }) })
export const stopLiveMonitor = () => api<LiveStatus>('/api/live/stop', { method: 'POST' })
export const addLiveDegradation = (input: AddLiveDegradationInput) => api<LiveDegradation>('/api/live/degradations', { method: 'POST', body: JSON.stringify(input) })
export const getLiveDegradations = () => api<LiveDegradation[]>('/api/live/degradations')
export const removeLiveDegradation = (id: string) => api<void>(`/api/live/degradations/${encodeURIComponent(id)}`, { method: 'DELETE' })
