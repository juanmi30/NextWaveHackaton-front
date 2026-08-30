import { useEffect, useState } from 'react'

export type ThemePreference = 'dark' | 'light'
const STORAGE_KEY = 'nextwave-theme'

function initialTheme(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemePreference>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')
  return { theme, toggleTheme }
}
