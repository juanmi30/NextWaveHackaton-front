import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MockAgentEventSource } from '../services/mockAgentStream'
import type { AgentEventSource } from '../services/agentEventSource'
import { approvalDropColombia } from '../scenarios/approvalDropColombia'
import { SseAgentEventSource } from '../services/sseAgentEventSource'
import { dataSources } from '../../../config/dataSources'
import type { AgentDiagnosis, AgentEvent, AgentToolActivity } from '../types/agent.types'
import type { AgentPhase } from '../types/agent.types'
import type { DemoStatus } from '../types/demo.types'

export type AgentStreamState = {
  events: AgentEvent[]
  latestEvent: AgentEvent | null
  isRunning: boolean
  currentPhase: AgentPhase | null
  demoStatus: DemoStatus
  scenarioId: string
  incidentId: string | null
  diagnosis: AgentDiagnosis | null
  toolActivities: AgentToolActivity[]
  error: string | null
  isSse: boolean
  startDemo: () => void
  resetDemo: () => void
  pauseDemo: () => void
  resumeDemo: () => void
}

export function useAgentStream(incidentId: string | null): AgentStreamState {
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [demoStatus, setDemoStatus] = useState<DemoStatus>('IDLE')
  const [diagnosis, setDiagnosis] = useState<AgentDiagnosis | null>(null)
  const [toolActivities, setToolActivities] = useState<AgentToolActivity[]>([])
  const [error, setError] = useState<string | null>(null)
  const automaticallyStartedIncident = useRef<string | null>(null)
  const isSse = dataSources.agent === 'sse'
  const source = useMemo<AgentEventSource>(() => isSse && incidentId ? new SseAgentEventSource(incidentId, {
    onDiagnosis: setDiagnosis,
    onToolActivity: (activity) => setToolActivities((current) => activity.status === 'completed' && current.some((item) => item.toolName === activity.toolName && item.status === 'running') ? current.map((item) => item.toolName === activity.toolName && item.status === 'running' ? { ...item, status: 'completed', completedAt: activity.completedAt } : item) : [...current, activity]),
    onFailure: (message) => { setError(message); setDemoStatus('ERROR') },
  }) : new MockAgentEventSource(), [incidentId, isSse])
  useEffect(() => () => source.dispose(), [source])
  useEffect(() => { setEvents([]); setDiagnosis(null); setToolActivities([]); setError(null); setDemoStatus('IDLE') }, [source])

  const startDemo = useCallback(() => {
    if (demoStatus === 'RUNNING') return
    if (isSse && !incidentId) { setError('Select an incident before starting live analysis.'); setDemoStatus('ERROR'); return }
    setEvents([])
    setDiagnosis(null); setToolActivities([]); setError(null)
    setDemoStatus('RUNNING')
    source.start((event) => setEvents((current) => [...current, event]), () => setDemoStatus('COMPLETED'))
  }, [demoStatus, incidentId, isSse, source])
  useEffect(() => {
    if (!isSse || !incidentId || automaticallyStartedIncident.current === incidentId) return
    automaticallyStartedIncident.current = incidentId
    const timer = window.setTimeout(startDemo, 0)
    return () => window.clearTimeout(timer)
  }, [incidentId, isSse, startDemo])
  const resetDemo = useCallback(() => { source.reset(); setEvents([]); setDiagnosis(null); setToolActivities([]); setError(null); setDemoStatus('IDLE') }, [source])
  const pauseDemo = useCallback(() => { if (!isSse && demoStatus === 'RUNNING') { source.pause?.(); setDemoStatus('PAUSED') } }, [demoStatus, isSse, source])
  const resumeDemo = useCallback(() => { if (!isSse && demoStatus === 'PAUSED') { source.resume?.(); setDemoStatus('RUNNING') } }, [demoStatus, isSse, source])
  const latestEvent = events.at(-1) ?? null
  return {
    events,
    latestEvent,
    isRunning: demoStatus === 'RUNNING',
    currentPhase: latestEvent?.phase ?? null,
    demoStatus,
    scenarioId: approvalDropColombia.id,
    incidentId, diagnosis, toolActivities, error, isSse,
    startDemo,
    resetDemo,
    pauseDemo,
    resumeDemo,
  }
}
