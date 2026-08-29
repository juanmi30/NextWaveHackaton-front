import assert from 'node:assert/strict'
import test from 'node:test'
import type { AgentDiagnosis, AgentEvent, AgentToolActivity } from '../types/agent.types.ts'

class FakeEventSource {
  static instances: FakeEventSource[] = []
  onmessage: ((event: MessageEvent<string>) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  closed = false
  readonly url: string
  constructor(url: string) { this.url = url; FakeEventSource.instances.push(this) }
  close() { this.closed = true }
  emitMessage(type: string, payload: Record<string, unknown>) { this.onmessage?.(new MessageEvent('message', { data: JSON.stringify({ type, ...payload }) })) }
}

globalThis.EventSource = FakeEventSource as unknown as typeof EventSource
const { SseAgentEventSource, parseAgentStreamEvent } = await import('./sseAgentEventSource.ts')
const diagnosis: AgentDiagnosis = { incidentId: 'inc-1', evidenceStatus: 'INSUFFICIENT', affectedScope: { provider: 'dLocal' }, rootCause: null, impact: { expectedApprovalRate: null, observedApprovalRate: null, lossPerMinuteCents: null, startedAt: null }, evidence: [], recurrence: 'Unknown', recommendation: { action: 'Review route', requiresHumanApproval: true }, summaries: { operations: 'Investigate', executive: 'Approval declined' } }

test('parses public events and maps lifecycle, tools, diagnosis, and completion', () => {
  FakeEventSource.instances = []
  const events: AgentEvent[] = []; const tools: AgentToolActivity[] = []; let storedDiagnosis: AgentDiagnosis | null = null; let completed = false
  const source = new SseAgentEventSource('inc-1', { onDiagnosis: (value) => { storedDiagnosis = value }, onToolActivity: (value) => tools.push(value), onFailure: assert.fail }, 'http://api')
  source.start((event) => events.push(event), () => { completed = true })
  const transport = FakeEventSource.instances[0]
  transport.emitMessage('run_started', { incidentId: 'inc-1', timestamp: '2026-01-01T00:00:00Z' })
  transport.emitMessage('phase_changed', { phase: 'INVESTIGATE', timestamp: '2026-01-01T00:00:01Z' })
  transport.emitMessage('tool_started', { toolName: 'get_incident', timestamp: '2026-01-01T00:00:02Z' })
  transport.emitMessage('tool_completed', { toolName: 'get_incident', timestamp: '2026-01-01T00:00:03Z' })
  transport.emitMessage('diagnosis', { diagnosis, timestamp: '2026-01-01T00:00:04Z' })
  transport.emitMessage('run_completed', { incidentId: 'inc-1', timestamp: '2026-01-01T00:00:05Z' })
  assert.equal(parseAgentStreamEvent('{"type":"run_started","incidentId":"inc-1","timestamp":"now"}').type, 'run_started')
  assert.equal(events[0]?.phase, 'OBSERVE'); assert.equal(events[1]?.phase, 'INVESTIGATE'); assert.equal('addEventListener' in transport, false); assert.equal(tools.length, 2); assert.deepEqual(storedDiagnosis, diagnosis); assert.equal(completed, true); assert.equal(transport.closed, true)
  assert.equal(diagnosis.evidenceStatus === 'INSUFFICIENT' && diagnosis.rootCause === null, true)
})

test('error, cleanup, and a new start close active connections', () => {
  FakeEventSource.instances = []
  const failures: string[] = []
  const source = new SseAgentEventSource('inc-2', { onDiagnosis: () => {}, onToolActivity: () => {}, onFailure: (message) => failures.push(message) }, 'http://api')
  source.start(() => {}); const first = FakeEventSource.instances[0]
  source.start(() => {}); assert.equal(first.closed, true)
  const second = FakeEventSource.instances[1]; second.emitMessage('error', { message: 'failed', timestamp: 'now' }); assert.equal(second.closed, true); assert.deepEqual(failures, ['failed'])
  source.start(() => {}); const third = FakeEventSource.instances[2]; source.dispose(); assert.equal(third.closed, true)
})
