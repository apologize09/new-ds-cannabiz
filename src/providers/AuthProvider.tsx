import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Role = Database['public']['Enums']['app_role']
type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: Role | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>
  signInWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const loadIdentity = useCallback(async (userId?: string) => {
    if (!userId) { setProfile(null); setRole(null); return }
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).order('role', { ascending: false }).limit(1).maybeSingle(),
    ])
    setProfile(profileData)
    setRole(roleData?.role ?? 'customer')
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadIdentity(data.session?.user.id)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setTimeout(() => void loadIdentity(next?.user.id), 0)
    })
    return () => listener.subscription.unsubscribe()
  }, [loadIdentity])

  const value = useMemo<AuthContextValue>(() => ({
    session, user: session?.user ?? null, profile, role, loading,
    signIn: async (email, password) => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error },
    signUp: async (email, password, displayName) => { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: displayName }, emailRedirectTo: `${location.origin}/dashboard` } }); if (error) throw error; return Boolean(data.session) },
    signInWithGoogle: async () => { const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/dashboard` } }); if (error) throw error },
    resetPassword: async (email) => { const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/sign-in?mode=update-password` }); if (error) throw error },
    updatePassword: async (password) => { const { error } = await supabase.auth.updateUser({ password }); if (error) throw error },
    signOut: async () => { const { error } = await supabase.auth.signOut(); if (error) throw error },
    refreshProfile: async () => loadIdentity(session?.user.id),
  }), [session, profile, role, loading, loadIdentity])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
