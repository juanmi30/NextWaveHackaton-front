import type { ReactNode } from 'react'
import { HealthBadge } from '../../HealthBadge'
import { LiveClock } from '../live/LiveClock'
import { useThemePreference } from '../../hooks/useThemePreference'
import { useSidebarState } from '../../hooks/useSidebarState'

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
  const { theme, toggleTheme } = useThemePreference()
  const sidebar = useSidebarState()
  const current = links.find((link) => link.key === page)
  const navigate = (nextPage: PageKey) => { onNavigate(nextPage); sidebar.closeMobile() }
  return (
    <div className={`app-shell ${sidebar.collapsed ? 'sidebar-collapsed' : ''} ${sidebar.mobileOpen ? 'mobile-sidebar-open' : ''}`}>
      <button className="mobile-sidebar-trigger" type="button" onClick={sidebar.openMobile} aria-label="Open navigation" title="Open navigation"><span aria-hidden="true">☰</span></button>
      {sidebar.mobileOpen ? <button className="sidebar-scrim" type="button" onClick={sidebar.closeMobile} aria-label="Close navigation" /> : null}
      <aside className="app-sidebar" aria-label="Application sidebar" inert={sidebar.isMobile && !sidebar.mobileOpen ? true : undefined}>
        <div className="brand">
          <div className="brand-mark">NW</div>
          <div className="brand-copy">
            <strong>NextWave</strong>
            <span>Payment Health</span>
          </div>
          <button className="sidebar-toggle" type="button" onClick={sidebar.toggle} aria-label={sidebar.isMobile ? 'Close navigation' : sidebar.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebar.isMobile ? 'Close navigation' : sidebar.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><span aria-hidden="true">{sidebar.isMobile ? '×' : sidebar.collapsed ? '▷' : '◁'}</span></button>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {links.map((link) => (
            <button
              key={link.key}
              type="button"
              onClick={() => navigate(link.key)}
              className={`nav-item ${page === link.key ? 'active' : ''}`}
              aria-label={link.label}
              title={sidebar.collapsed && !sidebar.isMobile ? link.label : undefined}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-section-label">System</span>
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`} aria-pressed={theme === 'light'}>
            <span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
            <span className="theme-label">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <HealthBadge compact={sidebar.collapsed && !sidebar.isMobile} />
          <span className="shortcut-hint" title="1 Overview · 2 Incidents · 3 Transactions · 4 Agent Live">Shortcuts: 1–4</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="content-header">
          <div>
            <p className="eyebrow">Payment operations</p>
            <h1>{current?.label ?? 'NextWave'}</h1>
          </div>
          <LiveClock />
        </header>
        {children}
      </main>
    </div>
  )
}
