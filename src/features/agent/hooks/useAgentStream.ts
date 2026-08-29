import { useEffect, useState } from 'react'
import { subscribeToMockAgentStream } from '../services/mockAgentStream'
import type { AgentEvent } from '../types/agent.types'
import type { AgentPhase } from '../types/agent.types'

export type AgentStreamState = {
  events: AgentEvent[]
  latestEvent: AgentEvent | null
  isRunning: boolean
  currentPhase: AgentPhase | null
}

export function useAgentStream(): AgentStreamState {
  const [events, setEvents] = useState<AgentEvent[]>([])
  useEffect(() => subscribeToMockAgentStream((event) => setEvents((current) => [...current, event])), [])
  const latestEvent = events.at(-1) ?? null
  return {
    events,
    latestEvent,
    isRunning: latestEvent?.phase !== 'VERIFY' || latestEvent.status !== 'success',
    currentPhase: latestEvent?.phase ?? null,
  }
}
