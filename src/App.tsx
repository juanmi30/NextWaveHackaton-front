import { useCallback, useEffect, useState } from 'react'
import './App.css'
import './styles/terminal.css'
import './styles/animations.css'
import { DashboardLayout, type PageKey } from './components/layout/DashboardLayout'
import { IncidentsPage } from './pages/IncidentsPage'
import { OverviewPage } from './pages/OverviewPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { AgentLivePage } from './features/agent/pages/AgentLivePage'
import { AgentStreamProvider } from './features/agent/context/AgentStreamContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useLatestOpenIncident } from './features/incidents/useLatestOpenIncident'
import { compareIncidentPriority } from './features/incidents/incidentPriority'
import { dataSources } from './config/dataSources'
import { MLMetricsPage } from './features/ml/MLMetricsPage'

const pageFromHash = (): PageKey => {
  const hash = window.location.hash.replace('#/', '').split('?')[0]
  if (hash === 'incidents' || hash === 'transactions' || hash === 'agent-live' || hash === 'ml-metrics') return hash
  return 'overview'
}
const incidentIdFromHash = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('incidentId')

function App() {
  const [page, setPage] = useState<PageKey>(pageFromHash)
  const [incidentId, setIncidentId] = useState<string | null>(incidentIdFromHash)
  const openIncidents = useLatestOpenIncident(page === 'agent-live' && dataSources.agent === 'sse')

  useEffect(() => {
    const handleHashChange = () => { setPage(pageFromHash()); setIncidentId(incidentIdFromHash()) }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((nextPage: PageKey) => {
    const hash = nextPage === 'overview' ? '#/' : `#/${nextPage}`
    if (window.location.hash !== hash) window.location.hash = hash
    setPage(nextPage)
  }, [])

  useKeyboardShortcuts({ navigate })

  const selectIncident = useCallback((id: string) => {
    window.location.hash = `#/agent-live?incidentId=${encodeURIComponent(id)}`
  }, [])

  useEffect(() => {
    if (page !== 'agent-live' || incidentId || !openIncidents.latest) return
    selectIncident(openIncidents.latest.id)
  }, [incidentId, openIncidents.latest, page, selectIncident])

  const selectedOpenIncident = openIncidents.incidents.find((incident) => incident.id === incidentId)
  const priorityIncident = selectedOpenIncident && openIncidents.latest && openIncidents.latest.id !== selectedOpenIncident.id && compareIncidentPriority(openIncidents.latest, selectedOpenIncident) < 0
    ? openIncidents.latest
    : null

  let content = <OverviewPage />
  if (page === 'incidents') content = <IncidentsPage />
  if (page === 'transactions') content = <TransactionsPage />
  if (page === 'agent-live') content = <AgentLivePage openIncidents={openIncidents.incidents} openIncidentsLoaded={openIncidents.loaded} priorityIncident={priorityIncident} onSwitchIncident={selectIncident} />
  if (page === 'ml-metrics') content = <MLMetricsPage />

  return <AgentStreamProvider incidentId={incidentId}><DashboardLayout page={page} onNavigate={navigate}>{content}</DashboardLayout></AgentStreamProvider>
}

export default App
