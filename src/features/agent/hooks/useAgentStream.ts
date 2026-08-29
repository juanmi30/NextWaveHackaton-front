import { useCallback, useEffect, useRef, useState } from 'react'
import { AGENT_EVENT_INTERVAL_MS, AGENT_SCENARIO_ID, mockAgentEvents } from '../services/mockAgentStream'
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
  const timerRef = useRef<number | null>(null)
  const runIdRef = useRef('')

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    if (demoStatus !== 'RUNNING') return
    const index = events.length
    if (index >= mockAgentEvents.length) {
      setDemoStatus('COMPLETED')
      return
    }
    timerRef.current = window.setTimeout(() => {
      const template = mockAgentEvents[index]
      setEvents((current) => [...current, { ...template, id: `${runIdRef.current}-${index + 1}`, runId: runIdRef.current, timestamp: new Date().toISOString() }])
      timerRef.current = null
    }, AGENT_EVENT_INTERVAL_MS)
    return clearTimer
  }, [clearTimer, demoStatus, events.length])

  const startDemo = useCallback(() => {
    if (demoStatus === 'RUNNING') return
    clearTimer()
    runIdRef.current = `${AGENT_SCENARIO_ID}-${Date.now()}`
    setEvents([])
    setDemoStatus('RUNNING')
  }, [clearTimer, demoStatus])
  const resetDemo = useCallback(() => { clearTimer(); setEvents([]); setDemoStatus('IDLE') }, [clearTimer])
  const pauseDemo = useCallback(() => { if (demoStatus === 'RUNNING') { clearTimer(); setDemoStatus('PAUSED') } }, [clearTimer, demoStatus])
  const resumeDemo = useCallback(() => { if (demoStatus === 'PAUSED') setDemoStatus('RUNNING') }, [demoStatus])
  const latestEvent = events.at(-1) ?? null
  return {
    events,
    latestEvent,
    isRunning: demoStatus === 'RUNNING',
    currentPhase: latestEvent?.phase ?? null,
    demoStatus,
    scenarioId: AGENT_SCENARIO_ID,
    startDemo,
    resetDemo,
    pauseDemo,
    resumeDemo,
  }
}
