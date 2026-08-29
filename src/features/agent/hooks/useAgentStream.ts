import { useEffect, useState } from 'react'
import { subscribeToMockAgentStream } from '../services/mockAgentStream'
import type { AgentEvent } from '../types/agent.types'
export function useAgentStream() {
  const [events, setEvents] = useState<AgentEvent[]>([])
  useEffect(() => subscribeToMockAgentStream((event) => setEvents((current) => [...current, event])), [])
  const latestEvent = events.at(-1) ?? null
  return { events, latestEvent, isRunning: latestEvent?.phase !== 'VERIFY' || latestEvent.status !== 'success' }
}
