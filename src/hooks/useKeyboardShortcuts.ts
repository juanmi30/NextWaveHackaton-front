import { useEffect } from 'react'

type ShortcutOptions = { navigate: (page: 'overview' | 'incidents' | 'transactions' | 'agent-live') => void; refresh?: () => void }

export function useKeyboardShortcuts({ navigate, refresh }: ShortcutOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      const pages = { '1': 'overview', '2': 'incidents', '3': 'transactions', '4': 'agent-live' } as const
      if (event.key in pages) navigate(pages[event.key as keyof typeof pages])
      if (event.key.toLowerCase() === 'r' && refresh) refresh()
      if (event.key === '/') { event.preventDefault(); document.querySelector<HTMLElement>('input[type="search"], input:not([type])')?.focus() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, refresh])
}
