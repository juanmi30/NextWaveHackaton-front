import type { Incident } from '../../../types/domain'

export type IncidentAnalysisStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export function getIncidentAnalysisStatus(incident: Incident): IncidentAnalysisStatus {
  if (incident.analysisStatus) return incident.analysisStatus
  return incident.diagnosisAvailable ? 'COMPLETED' : 'PENDING'
}
