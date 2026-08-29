import { approvalDropColombia } from '../scenarios/approvalDropColombia'
import type { AgentEventSource } from './agentEventSource'

export class MockAgentEventSource implements AgentEventSource {
  private timer: number | null = null
  private index = 0
  private runId = ''
  private onEvent?: Parameters<AgentEventSource['start']>[0]
  private onComplete?: Parameters<AgentEventSource['start']>[1]

  start(onEvent: Parameters<AgentEventSource['start']>[0], onComplete?: Parameters<AgentEventSource['start']>[1]) {
    this.reset(); this.onEvent = onEvent; this.onComplete = onComplete
    this.runId = `${approvalDropColombia.id}-${Date.now()}`
    this.scheduleNext()
  }
  pause() { this.clearTimer() }
  resume() { if (this.timer === null && this.index < approvalDropColombia.events.length) this.scheduleNext() }
  reset() { this.clearTimer(); this.index = 0; this.runId = ''; this.onEvent = undefined; this.onComplete = undefined }
  dispose() { this.reset() }

  private scheduleNext() {
    this.clearTimer()
    this.timer = window.setTimeout(() => {
      this.timer = null
      const template = approvalDropColombia.events[this.index]
      if (!template || !this.onEvent) return
      this.onEvent({ ...template, id: `${this.runId}-${this.index + 1}`, runId: this.runId, scenarioId: approvalDropColombia.id, timestamp: new Date().toISOString() })
      this.index += 1
      if (this.index >= approvalDropColombia.events.length) this.onComplete?.()
      else this.scheduleNext()
    }, approvalDropColombia.intervalMs)
  }
  private clearTimer() { if (this.timer !== null) window.clearTimeout(this.timer); this.timer = null }
}
