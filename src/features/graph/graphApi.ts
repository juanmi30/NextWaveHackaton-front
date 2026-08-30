import { api } from '../../lib/api'
import type { IncidentExplorerGraph } from './types'

export const getIncidentExplorerGraph = (
  incidentId: string,
) =>
  api<IncidentExplorerGraph>(
    `/api/incidents/${encodeURIComponent(incidentId)}/graph/explorer`,
  )