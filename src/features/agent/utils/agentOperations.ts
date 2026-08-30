import type { Incident } from '../../../types/domain'
import type { AgentDiagnosis, AgentEvent } from '../types/agent.types'
import type { AgentIncidentStateMap } from '../types/agent-operations.types'
import { getIncidentAnalysisStatus } from './incidentAnalysisStatus.ts'

export function mergeIncidentOperations(previous: AgentIncidentStateMap, incidents: Incident[]): AgentIncidentStateMap {
  const next = { ...previous }
  for (const incident of incidents) {
    const existing = previous[incident.id]
    next[incident.id] = {
      incidentId: incident.id,
      analysisStatus: existing?.diagnosis ? 'COMPLETED' : (incident.analysisStatus || incident.diagnosisAvailable !== undefined) ? getIncidentAnalysisStatus(incident) : existing?.analysisStatus ?? 'PENDING',
      diagnosis: existing?.diagnosis,
      events: existing?.events ?? [],
      lastEventAt: existing?.lastEventAt,
      connectionState: existing?.connectionState,
    }
  }
  return next
}

export function mergeSelectedAgentState(previous: AgentIncidentStateMap, incidentId: string, status: AgentIncidentStateMap[string]['analysisStatus'], events: AgentEvent[], connectionState: string, diagnosis: AgentDiagnosis | null): AgentIncidentStateMap {
  const diagnosisId = diagnosis?.incidentId
  const targetId = diagnosisId ?? incidentId
  const existing = previous[targetId]
  return {
    ...previous,
    [targetId]: {
      incidentId: targetId,
      analysisStatus: diagnosis ? 'COMPLETED' : status,
      diagnosis: diagnosis ?? existing?.diagnosis,
      events: [...events],
      lastEventAt: events.at(-1)?.timestamp ?? existing?.lastEventAt,
      connectionState,
    },
  }
}

export function summarizeOperationStatuses(statuses: AgentIncidentStateMap[string]['analysisStatus'][]) {
  return {
    diagnosing: statuses.filter((status) => status === 'RUNNING').length,
    queued: statuses.filter((status) => status === 'QUEUED').length,
    pending: statuses.filter((status) => status === 'PENDING').length,
    reportsReady: statuses.filter((status) => status === 'COMPLETED').length,
    failed: statuses.filter((status) => status === 'FAILED').length,
  }
}
