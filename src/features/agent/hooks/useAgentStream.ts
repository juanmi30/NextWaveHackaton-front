import { useCallback, useEffect, useRef, useState } from 'react'
import { MockAgentEventSource } from '../services/mockAgentStream'
import type { AgentEventSource } from '../services/agentEventSource'
import { approvalDropColombia } from '../scenarios/approvalDropColombia'
import type { AgentEvent } from '../types/agent.types'
import type { AgentPhase } from '../types/agent.types'
import type { DemoStatus } from '../types/demo.types'

export type AgentStreamState = {
  events: AgentEvent[]
  latestEvent: AgentEvent | null
  isRunning: boolean
  currentPhase: AgentPhase | null
  demoStatus: DemoStatus
  scenarioId: string
  startDemo: () => void
  resetDemo: () => void
  pauseDemo: () => void
  resumeDemo: () => void
}

export function useAgentStream(): AgentStreamState {
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [demoStatus, setDemoStatus] = useState<DemoStatus>('IDLE')
  const sourceRef = useRef<AgentEventSource | null>(null)
  if (!sourceRef.current) sourceRef.current = new MockAgentEventSource()
  useEffect(() => () => sourceRef.current?.dispose(), [])

  const startDemo = useCallback(() => {
    if (demoStatus === 'RUNNING') return
    setEvents([])
    setDemoStatus('RUNNING')
    sourceRef.current?.start((event) => setEvents((current) => [...current, event]), () => setDemoStatus('COMPLETED'))
  }, [demoStatus])
  const resetDemo = useCallback(() => { sourceRef.current?.reset(); setEvents([]); setDemoStatus('IDLE') }, [])
  const pauseDemo = useCallback(() => { if (demoStatus === 'RUNNING') { sourceRef.current?.pause?.(); setDemoStatus('PAUSED') } }, [demoStatus])
  const resumeDemo = useCallback(() => { if (demoStatus === 'PAUSED') { sourceRef.current?.resume?.(); setDemoStatus('RUNNING') } }, [demoStatus])
  const latestEvent = events.at(-1) ?? null
  return {
    events,
    latestEvent,
    isRunning: demoStatus === 'RUNNING',
    currentPhase: latestEvent?.phase ?? null,
    demoStatus,
    scenarioId: approvalDropColombia.id,
    startDemo,
    resetDemo,
    pauseDemo,
    resumeDemo,
  }
}
