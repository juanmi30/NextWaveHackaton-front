import { api } from '../../../lib/api'
import type { AgentDiagnosis } from '../types/agent.types'

export type AgentAnalysisReadStatus = 'NOT_STARTED' | 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
export type AgentDiagnosisResponse = {
  incidentId: string
  status: AgentAnalysisReadStatus
  diagnosis: AgentDiagnosis | null
  startedAt: string | null
  completedAt: string | null
  error: string | null
}

export const getAgentDiagnosis = (incidentId: string) => api<AgentDiagnosisResponse>(`/api/agent/incidents/${encodeURIComponent(incidentId)}/diagnosis`)
