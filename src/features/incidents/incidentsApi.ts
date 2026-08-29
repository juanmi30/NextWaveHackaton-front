import { api, withQuery } from '../../lib/api'
import type { Incident, IncidentStatus } from '../../types/domain'

export const getIncidents = (status?: IncidentStatus, limit = 50) =>
  api<Incident[]>(withQuery('/api/incidents', { status, limit }))

export const acknowledgeIncident = (id: string) =>
  api<Incident>(`/api/incidents/${id}/acknowledge`, { method: 'PATCH' })

export const resolveIncident = (id: string) =>
  api<Incident>(`/api/incidents/${id}/resolve`, { method: 'PATCH' })
