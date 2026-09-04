import { useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'light'

function readThemeMode(): ThemeMode {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>(() => readThemeMode())

  useEffect(() => {
    const sync = () => setMode(readThemeMode())

    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const handleThemeChange = (event: Event) => {
      const next = (event as CustomEvent<ThemeMode>).detail
      if (next === 'dark' || next === 'light') setMode(next)
    }

    window.addEventListener('ds-theme-change', handleThemeChange)
    return () => {
      observer.disconnect()
      window.removeEventListener('ds-theme-change', handleThemeChange)
    }
  }, [])

  return mode
}

export const DS_WORDMARK_DARK = '/brand-logos/ds-cannabiz-wordmark.svg'
export const DS_WORDMARK_LIGHT = '/brand-logos/ds-cannabiz-wordmark-light.svg'

export function useDsWordmarkSrc() {
  const mode = useThemeMode()
  return mode === 'light' ? DS_WORDMARK_LIGHT : DS_WORDMARK_DARK
}
