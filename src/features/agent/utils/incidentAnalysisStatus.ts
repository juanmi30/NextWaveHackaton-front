import type { Incident } from '../../../types/domain'

export type IncidentAnalysisStatus = 'RUNNING' | 'COMPLETED' | 'FAILED'

export function getIncidentAnalysisStatus(incident: Incident): IncidentAnalysisStatus {
  if (incident.analysisStatus) return incident.analysisStatus
  return incident.diagnoses.length > 0 ? 'COMPLETED' : 'RUNNING'
}
