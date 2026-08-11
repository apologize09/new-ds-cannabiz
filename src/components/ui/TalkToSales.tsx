import { useEffect, useState } from 'react'
import { MessageOutlined, CloseOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'

export default function TalkToSales() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [waitState, setWaitState] = useState<'idle' | 'waiting' | 'fallback'>('idle')
  const [message, setMessage] = useState('')
  useEffect(() => {
    const show = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail
      setMessage(detail?.message ?? '')
      setSent(false)
      setError('')
      setOpen(true)
    }
    window.addEventListener('open-sales-chat', show)
    return () => window.removeEventListener('open-sales-chat', show)
  }, [])
  useEffect(() => {
    if (!open || sent) { setWaitState('idle'); return }
    setWaitState('waiting')
    const timer = window.setTimeout(() => setWaitState('fallback'), 60000)
    return () => window.clearTimeout(timer)
  }, [open, sent])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const { error: invokeError } = await supabase.functions.invoke('submit-sales-lead', { body: { name: form.get('name'), email: form.get('email'), company: form.get('company'), phone: form.get('phone'), message: form.get('message'), consent: form.get('consent') === 'on', notify_staff: ['Maggie', 'Jessica'] } })
    if (invokeError) setError(invokeError.message); else setSent(true)
    setBusy(false)
  }
  return <>
    <button aria-label="Open Talk to Sales" onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2"><span className="hidden rounded-xl bg-white px-4 py-3 text-sm text-[#333] shadow-lg sm:block">Talk to Sales 👋</span><span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-xl text-black shadow-lg"><MessageOutlined /></span></button>
    {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-4" onMouseDown={e => e.target === e.currentTarget && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Talk to Sales" data-sales-chat className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Talk to Sales</h2><button onClick={() => setOpen(false)} aria-label="Close"><CloseOutlined /></button></div>
      {sent ? <p className="py-12 text-center text-primary">Thank you. Our team will be in touch.</p> : <>
      {waitState === 'waiting' && <p className="mt-4 rounded-xl border border-border bg-bg px-4 py-3 text-xs text-muted">We’re connecting you with your sales representative. Wait a moment please.</p>}
      {waitState === 'fallback' && <p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs leading-5 text-primary">Our representatives are busy now. Please leave your information for our representatives to reach out later. You can also call +1 (800) 123-4567.</p>}
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input required name="name" placeholder="Name" className="h-11 rounded-lg border border-border bg-bg px-3 outline-none focus:border-primary"/><input required type="email" name="email" placeholder="Email" className="h-11 rounded-lg border border-border bg-bg px-3 outline-none focus:border-primary"/><input name="company" placeholder="Company" className="h-11 rounded-lg border border-border bg-bg px-3 outline-none focus:border-primary"/><input name="phone" placeholder="Phone" className="h-11 rounded-lg border border-border bg-bg px-3 outline-none focus:border-primary"/><textarea required name="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="How can we help?" rows={4} className="rounded-lg border border-border bg-bg p-3 outline-none focus:border-primary sm:col-span-2"/><label className="flex gap-2 text-xs text-muted sm:col-span-2"><input required type="checkbox" name="consent"/>I agree to be contacted about my request.</label>{error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}<button disabled={busy} className="h-11 rounded-lg bg-primary font-semibold text-black disabled:opacity-50 sm:col-span-2">{busy ? 'Sending…' : 'Submit'}</button>
      </form></>}</div>
    </div>}
  </>
}
