import { useMemo, useState } from 'react'
import type { Incident } from '../../../types/domain'
import { dataSources } from '../../../config/dataSources'
import { RootCauseExplorer } from '../../graph/RootCauseExplorer'
import { useLiveMonitor } from '../../live/useLiveMonitor'
import { RouteHealthLive } from '../../routes/components/RouteHealthLive'
import { RiskEvolution } from '../../routes/components/RiskEvolution'
import { useRouteHealth } from '../../routes/hooks/useRouteHealth'
import { RoutingCandidateTable } from '../../routing/components/RoutingCandidateTable'
import { RoutingDecisionFlow } from '../../routing/components/RoutingDecisionFlow'
import { RoutingRecommendation } from '../../routing/components/RoutingRecommendation'
import { useRoutingRecommendation } from '../../routing/hooks/useRoutingRecommendation'
import { AgentLiveErrorBoundary } from '../components/AgentLiveErrorBoundary'
import { AgentOperationsQueue } from '../components/AgentOperationsQueue'
import { AgentStatus, type WatchtowerState } from '../components/AgentStatus'
import { AgentTimeline, type AgentActivityItem } from '../components/AgentTimeline'
import { CurrentDecision } from '../components/CurrentDecision'
import { DemoControls } from '../components/DemoControls'
import { PreventiveWatchDetail } from '../components/PreventiveWatchDetail'
import { PreventiveWatchList } from '../components/PreventiveWatchList'
import { useAgentStreamContext } from '../context/AgentStreamContext'
import { useAgentOperations } from '../hooks/useAgentOperations'
import type { PreventiveWatch } from '../types/preventive-watch.types'
import type { SelectedAgentRecord } from '../types/selected-agent-record.types'
import { normalizePredictiveRisks } from '../utils/preventiveWatch'

const incidentActivity = (id: string, status?: string): AgentActivityItem[] => [{ id: `${id}-confirmed`, label: 'INCIDENT', title: 'Incident confirmed', detail: 'Detection confirmed this payment degradation as an incident.', tone: 'success' }, { id: `${id}-${status ?? 'pending'}`, label: 'AGENT', title: status === 'COMPLETED' ? 'Diagnosis report ready' : status === 'RUNNING' ? 'Diagnosis in progress' : status === 'QUEUED' ? 'Analysis queued' : status === 'FAILED' ? 'Analysis failed' : 'Awaiting scheduler admission', detail: status === 'COMPLETED' ? 'The generated diagnosis is available for review.' : status === 'RUNNING' ? 'The agent is gathering evidence and building the diagnosis.' : status === 'QUEUED' ? 'The incident is waiting for available analysis capacity.' : status === 'FAILED' ? 'The analysis ended unexpectedly. Manual retry is available.' : 'The Watchtower has discovered the incident and is reconciling its analysis state.', tone: status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'error' : status === 'QUEUED' ? 'warning' : 'running' }]
const watchActivity = (watch: PreventiveWatch): AgentActivityItem[] => [{ id: `${watch.id}-signal`, label: 'WATCH', title: 'Predictive signal detected', detail: 'A predictive risk signal was returned for this payment scope.', tone: 'warning' }, ...(watch.riskScore === undefined ? [] : [{ id: `${watch.id}-score`, label: 'RISK', title: 'Risk score available', detail: `Current predictive score: ${watch.riskScore.toFixed(2)}.`, tone: 'warning' as const }]), { id: `${watch.id}-investigating`, label: 'WATCH', title: 'Preventive investigation active', detail: 'The Watchtower is gathering evidence and awaiting Detection confirmation.', tone: 'running' }]

type Props = { openIncidents?: Incident[]; openIncidentsLoaded?: boolean; priorityIncident?: Incident | null; onSwitchIncident?: (id: string) => void }

export function AgentLivePage({ openIncidents = [], openIncidentsLoaded = false, priorityIncident = null, onSwitchIncident }: Props) {
  const [preferredSelection, setPreferredSelection] = useState<SelectedAgentRecord | null>(null)
  const stream = useAgentStreamContext()
  const { events, latestEvent, demoStatus, diagnosis, toolActivities, incidentId, isSse, resetDemo, connectionState } = stream
  const incidentStates = useAgentOperations(openIncidents, stream)
  const live = useLiveMonitor(isSse)
  const preventiveWatches = useMemo(() => normalizePredictiveRisks(live.status?.latestPredictiveRisks ?? []), [live.status?.latestPredictiveRisks])
  const selectedRecord = useMemo<SelectedAgentRecord | null>(() => {
    if (preferredSelection?.kind === 'incident' && openIncidents.some((item) => item.id === preferredSelection.incidentId)) return preferredSelection
    if (preferredSelection?.kind === 'watch' && preventiveWatches.some((item) => item.id === preferredSelection.watchId)) return preferredSelection
    if (incidentId && openIncidents.some((item) => item.id === incidentId)) return { kind: 'incident', incidentId }
    if (openIncidents[0]) return { kind: 'incident', incidentId: openIncidents[0].id }
    if (preventiveWatches[0]) return { kind: 'watch', watchId: preventiveWatches[0].id, scopeKey: JSON.stringify(preventiveWatches[0].dimensions) }
    return null
  }, [incidentId, openIncidents, preferredSelection, preventiveWatches])
  const selectedIncidentId = selectedRecord?.kind === 'incident' ? selectedRecord.incidentId : null
  const selectedWatch = selectedRecord?.kind === 'watch' ? preventiveWatches.find((item) => item.id === selectedRecord.watchId) ?? null : null
  const selectedIncidentState = selectedIncidentId ? incidentStates[selectedIncidentId] : null
  const selectedDiagnosis = selectedIncidentState?.diagnosis ?? (diagnosis?.incidentId === selectedIncidentId ? diagnosis : null)
  const selectedStatus = selectedIncidentState?.analysisStatus ?? null
  const selectedEvents = selectedIncidentState?.events.length ? selectedIncidentState.events : selectedIncidentId === incidentId ? events : []
  const selectedTools = selectedIncidentId === incidentId ? toolActivities : []
  const fallbackActivity = selectedWatch ? watchActivity(selectedWatch) : selectedIncidentId ? incidentActivity(selectedIncidentId, selectedStatus ?? undefined) : []
  const watchtowerState: WatchtowerState = live.error ? 'OFFLINE' : connectionState === 'RECONNECTING' ? 'RECONNECTING' : connectionState === 'ERROR' ? 'ERROR' : selectedStatus === 'COMPLETED' ? 'REPORT_READY' : selectedStatus === 'RUNNING' ? 'DIAGNOSING' : selectedWatch ? 'PRE_INVESTIGATING' : selectedIncidentId ? 'CONFIRMED' : live.status?.state === 'RUNNING' ? 'MONITORING' : 'OFFLINE'
  const selectIncident = (id: string) => { setPreferredSelection({ kind: 'incident', incidentId: id }); onSwitchIncident?.(id) }
  const selectWatch = (watch: PreventiveWatch) => setPreferredSelection({ kind: 'watch', watchId: watch.id, scopeKey: JSON.stringify(watch.dimensions) })
  const { watchedRoute } = useRouteHealth()
  const routing = useRoutingRecommendation()

  return <section className="page-content">
    <div className="page-heading"><div><p className="eyebrow">Real-time observability</p><h2>Agent Live</h2><p>Follow observable lifecycle, tool activity, diagnosis, and recommendations.</p></div><span className="data-source-label">{dataSources.agent === 'mock' ? 'DEMO / MOCK' : 'LIVE BACKEND'}</span></div>
    {priorityIncident ? <div className="notice priority-incident-notice" role="status"><div><strong>New priority incident detected</strong><span>{priorityIncident.summaryOps ?? `Incident #${priorityIncident.priorityRank ?? '—'}`}</span></div><button className="button tiny secondary" type="button" onClick={() => selectIncident(priorityIncident.id)}>Switch</button></div> : null}
    {isSse && openIncidentsLoaded && !selectedRecord ? <div className="panel agent-waiting-state"><strong>No confirmed incidents or predictive watches</strong><span>{live.status?.state === 'RUNNING' ? 'The Watchtower is continuously monitoring payment routes.' : 'The live monitor is currently offline.'}</span></div> : null}
    {isSse ? <PreventiveWatchList watches={preventiveWatches} selectedWatchId={selectedWatch?.id} onSelect={selectWatch} /> : null}
    {isSse ? <AgentOperationsQueue incidents={openIncidents} states={incidentStates} selectedIncidentId={selectedIncidentId} monitoredRoutes={live.status?.prediction.lastEvaluatedSegments ?? 0} earlyWarnings={preventiveWatches.length} onSelect={selectIncident} /> : null}

    <AgentLiveErrorBoundary onReset={resetDemo}>
      <AgentStatus latestEvent={latestEvent} demoStatus={demoStatus} connectionState={connectionState} watchtowerState={isSse ? watchtowerState : undefined} />
      <DemoControls watchtowerState={isSse ? watchtowerState : undefined} />
      {selectedIncidentId ? <RootCauseExplorer incidentId={selectedIncidentId} /> : null}
      {!isSse ? <div className="route-live-grid"><RouteHealthLive route={watchedRoute} /><RiskEvolution /></div> : null}
      <div className="agent-live-grid"><article className="panel"><div className="panel-header"><div><h3>{selectedWatch ? 'Preventive activity' : selectedIncidentId ? 'Incident activity' : 'Agent activity'}</h3><p>{selectedEvents.length} events · {selectedTools.length} tools</p></div></div><AgentTimeline events={selectedEvents} toolActivities={selectedTools} fallback={fallbackActivity} /></article><aside>{selectedWatch ? <PreventiveWatchDetail watch={selectedWatch} /> : <CurrentDecision events={selectedEvents} diagnosis={selectedDiagnosis} />}</aside></div>
      {!isSse ? <section className="routing-section"><div className="routing-section-heading"><p className="eyebrow">Payment routing decision</p><h2>Alternative route evaluation</h2></div><RoutingDecisionFlow recommendation={routing} source={watchedRoute} /><div className="routing-detail-grid"><RoutingRecommendation recommendation={routing} source={watchedRoute} /><RoutingCandidateTable candidates={routing.candidates} /></div></section> : null}
    </AgentLiveErrorBoundary>
  </section>
}
