import type { ReactNode } from 'react'
import { HealthBadge } from '../../HealthBadge'

export type PageKey = 'overview' | 'incidents' | 'transactions'

type Props = {
  page: PageKey
  onNavigate: (page: PageKey) => void
  children: ReactNode
}

const links: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: 'overview', label: 'Overview', icon: '◫' },
  { key: 'incidents', label: 'Incidents', icon: '⚠' },
  { key: 'transactions', label: 'Transactions', icon: '↔' },
]

export function DashboardLayout({ page, onNavigate, children }: Props) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
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

        <div className="sidebar-footer">
          <HealthBadge />
          <small>React + NestJS + PostgreSQL</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
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
