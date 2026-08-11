import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App'
import './index.css'
import { AuthProvider } from './providers/AuthProvider'

function DsThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'dark' | 'light'>(() => (localStorage.getItem('ds-theme') === 'light' ? 'light' : 'dark'))

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    localStorage.setItem('ds-theme', mode)
  }, [mode])

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const next = (event as CustomEvent<'dark' | 'light'>).detail
      if (next === 'dark' || next === 'light') setMode(next)
    }
    window.addEventListener('ds-theme-change', handleThemeChange)
    return () => window.removeEventListener('ds-theme-change', handleThemeChange)
  }, [])

  const isLight = mode === 'light'

  return (
    <ConfigProvider
      theme={{
        algorithm: isLight ? theme.defaultAlgorithm : theme.darkAlgorithm,
        token: {
          colorPrimary: '#00E5B5',
          colorBgBase: isLight ? '#F4F4F2' : '#0D0D0D',
          colorTextBase: isLight ? '#111111' : '#FFFFFF',
          colorBorder: isLight ? '#D8D8D2' : '#2A2A2A',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        components: {
          Button: { colorPrimary: '#00E5B5', colorPrimaryHover: '#00C49A' },
          Input: { colorBgContainer: isLight ? '#FFFFFF' : '#1A1A1A', colorBorder: isLight ? '#D8D8D2' : '#2A2A2A' },
          Select: { colorBgContainer: isLight ? '#FFFFFF' : '#1A1A1A', colorBorder: isLight ? '#D8D8D2' : '#2A2A2A' },
          Checkbox: { colorPrimary: '#00E5B5' },
          Menu: { colorItemBg: 'transparent', colorActiveBarBorderSize: 0 },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DsThemeProvider>
      <AuthProvider><App /></AuthProvider>
    </DsThemeProvider>
  </React.StrictMode>,
)
