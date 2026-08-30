import { useEffect, useState } from 'react'

const STORAGE_KEY = 'nextwave-sidebar-collapsed'
const MOBILE_QUERY = '(max-width: 760px)'

function initialCollapsed() {
  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const handleChange = () => { setIsMobile(query.matches); setMobileOpen(false) }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, String(collapsed)) }, [collapsed])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  return {
    collapsed,
    isMobile,
    mobileOpen,
    toggle: () => isMobile ? setMobileOpen((open) => !open) : setCollapsed((value) => !value),
    closeMobile: () => setMobileOpen(false),
    openMobile: () => setMobileOpen(true),
  }
}
