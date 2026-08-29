import type { AgentEvent } from '../types/agent.types'
export interface AgentEventSource {
  start(onEvent: (event: AgentEvent) => void, onComplete?: () => void): void
  pause?(): void
  resume?(): void
  reset(): void
  dispose(): void
}
