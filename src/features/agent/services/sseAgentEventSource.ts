import { API_BASE_URL } from '../../../lib/api.ts'
import type { AgentDiagnosis, AgentEvent, AgentPhase, AgentToolActivity } from '../types/agent.types'
import type { BackendAgentStreamEvent } from '../types/sse-agent.types'
import type { AgentEventSource } from './agentEventSource'

type SseCallbacks = {
  onDiagnosis: (diagnosis: AgentDiagnosis) => void
  onToolActivity: (activity: AgentToolActivity) => void
  onFailure: (message: string) => void
}

export function parseAgentStreamEvent(data: string): BackendAgentStreamEvent {
  const value: unknown = JSON.parse(data)
  if (!value || typeof value !== 'object' || !('type' in value) || typeof value.type !== 'string') throw new Error('Invalid agent SSE event')
  return value as BackendAgentStreamEvent
}

export class SseAgentEventSource implements AgentEventSource {
  private source: EventSource | null = null
  private sequence = 0
  private runId = ''
  private readonly incidentId: string
  private readonly callbacks: SseCallbacks
  private readonly baseUrl: string

  constructor(incidentId: string, callbacks: SseCallbacks, baseUrl = API_BASE_URL) { this.incidentId = incidentId; this.callbacks = callbacks; this.baseUrl = baseUrl }

  start(onEvent: (event: AgentEvent) => void, onComplete?: () => void) {
    this.reset()
    if (!this.baseUrl) { this.callbacks.onFailure('Agent analysis is currently unavailable.'); return }
    this.runId = `incident-${this.incidentId}-${Date.now()}`
    const source = new EventSource(`${this.baseUrl}/api/agent/incidents/${encodeURIComponent(this.incidentId)}/analyze/stream`)
    this.source = source

    source.onmessage = (rawEvent: MessageEvent<string>) => {
      try { this.handle(parseAgentStreamEvent(rawEvent.data), onEvent, onComplete) }
      catch { this.fail('Invalid event received from agent stream') }
    }
    source.onerror = () => this.fail('Unable to connect to agent analysis. Please retry.')
  }

  reset() { this.close(); this.sequence = 0; this.runId = '' }
  dispose() { this.reset() }

  private handle(event: BackendAgentStreamEvent, onEvent: (event: AgentEvent) => void, onComplete?: () => void) {
    if (event.type === 'phase_changed') { onEvent(this.toEvent(event.timestamp, event.phase, 'running', `Phase changed to ${event.phase}`, 'Agent lifecycle phase changed.')); return }
    if (event.type === 'tool_started') { this.callbacks.onToolActivity({ toolName: event.toolName, status: 'running', startedAt: event.timestamp }); return }
    if (event.type === 'tool_completed') { this.callbacks.onToolActivity({ toolName: event.toolName, status: 'completed', startedAt: event.timestamp, completedAt: event.timestamp }); return }
    if (event.type === 'diagnosis') { this.callbacks.onDiagnosis(event.diagnosis); onEvent(this.toEvent(event.timestamp, 'DIAGNOSE', 'success', 'Diagnosis available', 'Structured incident diagnosis received.')); return }
    if (event.type === 'run_started') { this.runId = `incident-${event.incidentId}-${event.timestamp}`; onEvent(this.toEvent(event.timestamp, 'OBSERVE', 'running', 'Agent run started', `Analyzing incident ${event.incidentId}.`)); return }
    if (event.type === 'run_completed') { onEvent(this.toEvent(event.timestamp, 'REPORT', 'success', 'Agent run completed', 'The diagnosis and recommendation are ready for review.')); this.close(); onComplete?.(); return }
    this.fail('Agent analysis failed. Please retry.')
  }

  private toEvent(timestamp: string, phase: AgentPhase, status: AgentEvent['status'], title: string, summary: string): AgentEvent {
    this.sequence += 1
    return { id: `${this.runId}-${this.sequence}`, runId: this.runId, timestamp, phase, status, title, summary }
  }
  private fail(message: string) { this.close(); this.callbacks.onFailure(message) }
  private close() { this.source?.close(); this.source = null }
}
