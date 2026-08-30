import type { AgentDiagnosis, AgentEvent } from './agent.types'
import type { IncidentAnalysisStatus } from '../utils/incidentAnalysisStatus'

export type AgentIncidentState = {
  incidentId: string
  analysisStatus: IncidentAnalysisStatus
  diagnosis?: AgentDiagnosis
  events: AgentEvent[]
  lastEventAt?: string
  connectionState?: string
}

export type AgentIncidentStateMap = Record<string, AgentIncidentState>
