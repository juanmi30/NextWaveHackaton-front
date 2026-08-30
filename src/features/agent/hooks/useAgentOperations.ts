import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Incident } from '../../../types/domain'
import type { AgentStreamState } from './useAgentStream'
import type { AgentIncidentStateMap } from '../types/agent-operations.types'
import { mergeIncidentOperations, mergeSelectedAgentState } from '../utils/agentOperations'
import { getAgentDiagnosis, type AgentAnalysisReadStatus } from '../services/agentApi'

const streamStatus = (state: AgentStreamState): 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' => state.diagnosis || state.connectionState === 'READY' ? 'COMPLETED' : state.connectionState === 'ERROR' ? 'FAILED' : state.connectionState === 'WAITING' || state.connectionState === 'IDLE' ? 'PENDING' : 'RUNNING'
const readStatus = (status: AgentAnalysisReadStatus) => status === 'NOT_STARTED' ? 'PENDING' : status

export function useAgentOperations(incidents: Incident[], stream: AgentStreamState) {
  const [states, setStates] = useState<AgentIncidentStateMap>({})
  const loadingStatuses = useRef(false)
  const { connectionState, diagnosis, events, incidentId } = stream
  const analysisStatus = streamStatus(stream)

  useEffect(() => {
    const timer = window.setTimeout(() => setStates((previous) => mergeIncidentOperations(previous, incidents)), 0)
    return () => window.clearTimeout(timer)
  }, [incidents])

  const refreshStatuses = useCallback(async () => {
    if (incidents.length === 0 || loadingStatuses.current) return
    loadingStatuses.current = true
    try {
      const results = await Promise.allSettled(incidents.map((incident) => getAgentDiagnosis(incident.id)))
      setStates((previous) => {
        const next = { ...previous }
        results.forEach((result) => {
          if (result.status !== 'fulfilled') return
          const response = result.value
          const existing = next[response.incidentId]
          next[response.incidentId] = {
            incidentId: response.incidentId,
            analysisStatus: response.diagnosis ? 'COMPLETED' : readStatus(response.status),
            diagnosis: response.diagnosis ?? existing?.diagnosis,
            events: existing?.events ?? [],
            lastEventAt: response.completedAt ?? response.startedAt ?? existing?.lastEventAt,
            connectionState: existing?.connectionState,
          }
        })
        return next
      })
    } finally { loadingStatuses.current = false }
  }, [incidents])

  useEffect(() => {
    const initial = window.setTimeout(() => void refreshStatuses(), 0)
    const timer = window.setInterval(() => void refreshStatuses(), 2_500)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [refreshStatuses])

  useEffect(() => {
    if (!incidentId) return
    const timer = window.setTimeout(() => setStates((previous) => mergeSelectedAgentState(previous, incidentId, analysisStatus, events, connectionState, diagnosis)), 0)
    return () => window.clearTimeout(timer)
  }, [analysisStatus, connectionState, diagnosis, events, incidentId])

  return useMemo(() => {
    if (!incidentId || connectionState === 'IDLE' || connectionState === 'WAITING') return states
    const selectedDiagnosis = diagnosis?.incidentId === incidentId ? diagnosis : null
    return mergeSelectedAgentState(states, incidentId, analysisStatus, events, connectionState, selectedDiagnosis)
  }, [analysisStatus, connectionState, diagnosis, events, incidentId, states])
}
