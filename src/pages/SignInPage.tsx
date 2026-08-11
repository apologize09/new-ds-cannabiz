import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import BrandMark from '../components/ui/BrandMark'
import { useAuth } from '../providers/AuthProvider'

type Mode = 'sign-in' | 'sign-up' | 'reset' | 'update-password'

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = new URLSearchParams(location.search).get('returnTo')
  const fromState = (location.state as { from?: string } | null)?.from
  const from = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : fromState ?? '/dashboard'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('mode') === 'update-password') setMode('update-password')
    else if (params.get('mode') === 'sign-up') setMode('sign-up')
  }, [location.search])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      if (mode === 'sign-in') { await signIn(email, password); navigate(from) }
      if (mode === 'sign-up') {
        const signedIn = await signUp(email, password, name)
        if (signedIn) navigate(from)
        else setMessage('Check your email to verify your account.')
      }
      if (mode === 'reset') { await resetPassword(email); setMessage('Password reset instructions sent.') }
      if (mode === 'update-password') { await updatePassword(password); setMessage('Password updated. Redirecting…'); setTimeout(() => navigate('/dashboard'), 500) }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Authentication failed') }
    finally { setBusy(false) }
  }

  async function continueWithGoogle() {
    setBusy(true); setMessage('')
    try { await signInWithGoogle() }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Google sign-in failed') }
    finally { setBusy(false) }
  }

  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#090909] px-5 py-10">
    <div className="absolute bottom-0 left-1/2 h-72 w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
    <form onSubmit={submit} className="relative w-full max-w-[440px] rounded-3xl border border-border bg-card p-8 shadow-2xl sm:p-10">
      <Link to="/" className="mb-9 flex items-center justify-center gap-2"><BrandMark/><span className="font-['Sora'] text-xl font-semibold">DS Cannabiz</span></Link>
      <h1 className="text-center font-['Inter'] text-2xl font-semibold">{mode === 'sign-in' ? 'Sign in' : mode === 'sign-up' ? 'Create an account' : mode === 'update-password' ? 'Update password' : 'Reset password'}</h1>
      {mode !== 'reset' && <p className="mt-2 text-center text-sm text-muted">{mode === 'sign-in' ? 'New here?' : 'Already registered?'} <button type="button" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} className="text-primary">{mode === 'sign-in' ? 'Create an account' : 'Sign in'}</button></p>}
      {mode === 'sign-up' && <><label className="mt-7 block font-mono text-xs uppercase tracking-[.2em] text-muted">Name</label><input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-border bg-[#171717] px-4 outline-none focus:border-primary" /></>}
      {mode !== 'update-password' && <><label className="mt-7 block font-mono text-xs uppercase tracking-[.2em] text-muted">Email</label>
      <div className="relative mt-2"><MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"/><input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-[#171717] pl-11 pr-4 outline-none focus:border-primary"/></div></>}
      {mode !== 'reset' && <><div className="mt-6 flex justify-between font-mono text-xs uppercase tracking-[.2em] text-muted"><label>{mode === 'update-password' ? 'New password' : 'Password'}</label>{mode === 'sign-in' && <button type="button" onClick={() => setMode('reset')} className="font-['Inter'] normal-case tracking-normal">Forgot Password?</button>}</div><div className="relative mt-2"><LockOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"/><input required minLength={8} type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={e=>setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-[#171717] pl-11 pr-4 outline-none focus:border-primary"/></div></>}
      {message && <p className="mt-4 text-center text-sm text-primary" role="status">{message}</p>}
      <button disabled={busy} type="submit" className="mt-6 h-12 w-full rounded-full bg-primary font-semibold text-black disabled:opacity-50">{busy ? 'Please wait…' : mode === 'sign-in' ? 'Login' : mode === 'sign-up' ? 'Create account' : mode === 'update-password' ? 'Update password' : 'Send reset link'}</button>
      {(mode === 'sign-in' || mode === 'sign-up') && <>
        <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border"/><span>or</span><span className="h-px flex-1 bg-border"/></div>
        <button disabled={busy} type="button" onClick={continueWithGoogle} className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-bg font-semibold text-text transition-colors hover:border-primary disabled:opacity-50">
          <span aria-hidden="true" className="font-bold">G</span> Continue with Google
        </button>
      </>}
      {mode === 'reset' && <button type="button" onClick={() => setMode('sign-in')} className="mt-4 w-full text-sm text-muted">Back to sign in</button>}
      <p className="mt-6 text-center text-xs text-muted">By continuing, you agree to the <Link to="/terms" className="text-gray-300">Terms of Service</Link> and <Link to="/privacy" className="text-gray-300">Privacy Policy</Link>.</p>
    </form>
  </main>
}
