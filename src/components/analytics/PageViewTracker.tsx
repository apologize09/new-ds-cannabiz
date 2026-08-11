import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'

const sessionKey = 'ds-analytics-session'

function getSessionId() {
  const current = sessionStorage.getItem(sessionKey)
  if (current) return current
  const next = crypto.randomUUID()
  sessionStorage.setItem(sessionKey, next)
  return next
}

export default function PageViewTracker() {
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    if (navigator.webdriver || location.pathname === '/admin') return
    void (supabase as any).from('page_views').insert({
      user_id: user?.id ?? null,
      path: `${location.pathname}${location.search}`,
      referrer: document.referrer || null,
      session_id: getSessionId(),
    })
  }, [location.pathname, location.search, user?.id])

  return null
}
