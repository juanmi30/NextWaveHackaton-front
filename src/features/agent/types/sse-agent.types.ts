import type { AgentDiagnosis } from './agent.types'
export type BackendAgentPhase = 'OBSERVE' | 'INVESTIGATE' | 'DIAGNOSE' | 'RECOMMEND' | 'REPORT'
export type BackendAgentStreamEvent =
  | { type: 'run_started'; incidentId: string; timestamp: string }
  | { type: 'phase_changed'; phase: BackendAgentPhase; timestamp: string }
  | { type: 'tool_started'; toolName: string; timestamp: string }
  | { type: 'tool_completed'; toolName: string; timestamp: string }
  | { type: 'diagnosis'; diagnosis: AgentDiagnosis; timestamp: string }
  | { type: 'run_completed'; incidentId: string; timestamp: string }
  | { type: 'error'; message: string; timestamp: string }
