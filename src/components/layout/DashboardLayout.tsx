import type { ReactNode } from 'react'
import { HealthBadge } from '../../HealthBadge'
import { LiveClock } from '../live/LiveClock'

export type PageKey = 'overview' | 'incidents' | 'transactions' | 'agent-live'

type Props = {
  page: PageKey
  onNavigate: (page: PageKey) => void
  children: ReactNode
}

const links: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: 'overview', label: 'Overview', icon: '◫' },
  { key: 'incidents', label: 'Incidents', icon: '⚠' },
  { key: 'transactions', label: 'Transactions', icon: '↔' },
  { key: 'agent-live', label: 'Agent Live', icon: '●' },
]

export function DashboardLayout({ page, onNavigate, children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">NW</div>
          <div>
            <strong>NextWave</strong>
            <span>Payment Health</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {links.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={() => onNavigate(link.key)}
              className={`nav-item ${page === link.key ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="header-status">
          <span className="shortcut-hint" title="Keyboard: 1 Overview · 2 Incidents · 3 Transactions · 4 Agent Live">Keys 1–4</span>
          <HealthBadge />
          <LiveClock />
        </div>
      </header>

      <main className="main-area">
        <header className="content-header">
          <div>
            <p className="eyebrow">NextWave Hackathon 2026</p>
            <h1>Payment orchestration monitor</h1>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
