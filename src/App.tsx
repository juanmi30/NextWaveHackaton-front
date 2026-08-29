import { useEffect, useState } from 'react'
import './App.css'
import { DashboardLayout, type PageKey } from './components/layout/DashboardLayout'
import { IncidentsPage } from './pages/IncidentsPage'
import { OverviewPage } from './pages/OverviewPage'
import { TransactionsPage } from './pages/TransactionsPage'

const pageFromHash = (): PageKey => {
  const hash = window.location.hash.replace('#/', '')
  if (hash === 'incidents' || hash === 'transactions') return hash
  return 'overview'
}

function App() {
  const [page, setPage] = useState<PageKey>(pageFromHash)

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash())
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

  return (
    <DashboardLayout page={page} onNavigate={navigate}>
      {content}
    </DashboardLayout>
  )
}

export default App
