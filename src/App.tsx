import { useEffect, useState } from 'react'
import './App.css'
import { DashboardLayout, type PageKey } from './components/layout/DashboardLayout'
import { IncidentsPage } from './pages/IncidentsPage'
import { OverviewPage } from './pages/OverviewPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { AgentLivePage } from './features/agent/pages/AgentLivePage'
import { AgentStreamProvider } from './features/agent/context/AgentStreamContext'

const pageFromHash = (): PageKey => {
  const hash = window.location.hash.replace('#/', '').split('?')[0]
  if (hash === 'incidents' || hash === 'transactions' || hash === 'agent-live') return hash
  return 'overview'
}
const incidentIdFromHash = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('incidentId')

function App() {
  const [page, setPage] = useState<PageKey>(pageFromHash)
  const [incidentId, setIncidentId] = useState<string | null>(incidentIdFromHash)

  useEffect(() => {
    const handleHashChange = () => { setPage(pageFromHash()); setIncidentId(incidentIdFromHash()) }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (nextPage: PageKey) => {
    const hash = nextPage === 'overview' ? '#/' : `#/${nextPage}`
    if (window.location.hash !== hash) window.location.hash = hash
    setPage(nextPage)
  }

  let content = <OverviewPage />
  if (page === 'incidents') content = <IncidentsPage />
  if (page === 'transactions') content = <TransactionsPage />
  if (page === 'agent-live') content = <AgentLivePage />

  return <AgentStreamProvider incidentId={incidentId}><DashboardLayout page={page} onNavigate={navigate}>{content}</DashboardLayout></AgentStreamProvider>
}

export default App
