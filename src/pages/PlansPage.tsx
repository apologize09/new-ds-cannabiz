import { useEffect, useState } from 'react'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'

const plans = [
  { slug:'basic', name:'BASIC', monthly:0, displayPrice:'Free', credits:20, description:'Perfect for trying out the platform', cta:'Current Plan', links:null, features:['Product searching','3D custom trial','Industry insights'] },
  { slug:'brand-incubator', name:'BRAND INCUBATOR', monthly:9.99, displayPrice:'$9.99', credits:50, description:'For new brands doing essential product selection and customization', cta:'Upgrade', checkout:true, features:['Everything in BASIC','Background removal','Product comparison tool','5GB cloud space usage','Priority support'] },
  { slug:'tech-master', name:'TECH MASTER', monthly:49.99, displayPrice:'$49.99', credits:300, description:'For marketing experts who need advanced features', cta:'Upgrade', checkout:true, popular:true, features:['Everything in BRAND INCUBATOR','Product animations','Advanced AI model','50GB cloud space usage','Priority queue'] },
  { slug:'enterprise', name:'ENTERPRISE', monthly:0, displayPrice:'Custom', credits:Infinity, description:'Value-added service for offline customers who placed orders within 1 year', cta:'Talk to Sales', links:null, enterprise:true, features:['Everything in TECH MASTER','Dedicated support','Early access to features'] },
]

export default function PlansPage() {
  const [annual, setAnnual] = useState(false)
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutNotice, setCheckoutNotice] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (checkout === 'cancelled') {
      setCheckoutNotice('Checkout was cancelled. No charge was made.')
      return
    }
    if (checkout !== 'success' || !user) return
    setCheckoutNotice('Payment received. Your subscription and credits are being confirmed…')
    let cancelled = false
    let attempts = 0
    const poll = async () => {
      attempts += 1
      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle()
      if (cancelled) return
      if (data) {
        window.dispatchEvent(new Event('ds-credit-change'))
        setCheckoutNotice('Your plan is active and your credits have been added.')
        setSearchParams({}, { replace: true })
        return
      }
      if (attempts < 10) window.setTimeout(poll, 1500)
      else setCheckoutNotice('Payment was received. Credit confirmation is still processing; your balance will update automatically.')
    }
    void poll()
    return () => { cancelled = true }
  }, [searchParams, setSearchParams, user])

  async function choosePlan(plan: typeof plans[number]) {
    const { cta } = plan
    if (cta === 'Talk to Sales') { window.dispatchEvent(new Event('open-sales-chat')); return }
    if (!('checkout' in plan) || !plan.checkout) return
    if (!user) {
      navigate(`/sign-in?mode=sign-up&returnTo=${encodeURIComponent('/plans')}`)
      return
    }
    setCheckoutSlug(plan.slug)
    setCheckoutError('')
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { planSlug: plan.slug, interval: annual ? 'year' : 'month' },
    })
    setCheckoutSlug(null)
    if (error || !data?.url) {
      setCheckoutError(data?.error || error?.message || 'Checkout is temporarily unavailable. Please try again.')
      return
    }
    location.assign(data.url)
  }
  return <main className="dsc-plans-page min-h-[calc(100vh-64px)] bg-[var(--page-bg)] pb-20">
    <section className="dsc-plans-hero mx-auto max-w-[1536px] px-5 pb-10 pt-12 text-center sm:px-8 sm:pb-14 sm:pt-24">
      <h1 className="text-[clamp(2.5rem,12vw,4rem)] font-bold leading-[1.05] text-[var(--heading-color)]">Choose Your Plan</h1>
      <p className="font-serif text-[clamp(2.4rem,11vw,4rem)] italic leading-none text-primary">usage-based, not seat-based.</p>
      <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[var(--body-muted)]">You buy credits, a credit is one generation.<br/>Pick a plan or pay as you go- all plans include to our core features.</p>
      <button onClick={()=>setAnnual(!annual)} className="dsc-pricing-toggle mx-auto mt-8 flex rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-1 text-sm"><span className={`dsc-pricing-toggle-option rounded-lg px-5 py-2.5 ${!annual?'bg-white text-black':'text-[var(--body-muted)]'}`}>Monthly</span><span className={`dsc-pricing-toggle-option rounded-lg px-5 py-2.5 ${annual?'bg-white text-black':'text-[var(--body-muted)]'}`}>Annual · save 16%</span></button>
    </section>
    <section className="border-t border-[var(--card-border)] px-5 pt-5 sm:px-8"><div className="mx-auto grid max-w-[1220px] gap-4 md:grid-cols-2 xl:grid-cols-4">
      {plans.map(plan=>{ const price = annual && plan.monthly > 0 ? `$${(plan.monthly * 12 * .84).toFixed(2)}` : plan.displayPrice; const credits = plan.credits === Infinity ? 'Unlimited' : annual ? plan.credits * 12 : plan.credits; return <article key={plan.name} data-plan-card={plan.enterprise?'enterprise':plan.popular?'popular':'standard'} className={`flex min-h-[520px] flex-col rounded-2xl border p-7 ${plan.popular?'border-primary bg-gradient-to-b from-primary/25 via-[var(--card-bg)] to-[var(--card-bg)] shadow-[0_0_35px_rgba(38,246,200,.12)]':plan.enterprise?'border-[#4a3a00] bg-[#1c1806]':'border-[var(--card-border)] bg-[var(--card-bg)]'}`}>
        <div className="flex h-12 items-center gap-2"><p className="whitespace-nowrap font-mono text-[clamp(1.2rem,1.35vw,1.45rem)] font-black tracking-[.1em] text-[var(--heading-color)]">{plan.name}</p>{plan.popular&&<span className="whitespace-nowrap rounded-full border border-primary px-2 py-0.5 text-[10px] text-primary">● most popular</span>}</div>
        <div className="mt-3 flex h-16 items-end"><strong className="text-5xl font-black leading-none text-[var(--heading-color)]">{price}</strong><span className="mb-1 text-sm text-[var(--body-muted)]">{plan.monthly > 0 ? annual?'/yr':'/mo':''}</span></div>
        <p className={`mt-2 h-6 whitespace-nowrap font-mono text-xs ${plan.enterprise?'text-yellow-400':'text-primary'}`}>{credits} credits / {annual?'year':'month'}</p>
        <p className="mt-6 text-sm leading-relaxed text-[var(--body-color)]" style={{ height: 84 }}>{plan.description}</p>
        <button disabled={checkoutSlug === plan.slug} onClick={()=>void choosePlan(plan)} className={`h-11 w-full rounded-lg border text-sm font-semibold disabled:cursor-wait disabled:opacity-60 ${plan.popular?'border-primary bg-primary text-black':plan.enterprise?'border-[#4a3a00] text-yellow-400':'border-[var(--card-border)] text-[var(--body-color)]'}`}>{checkoutSlug === plan.slug ? 'Opening checkout…' : plan.cta}</button>
        <ul className="mt-8 space-y-3 border-t border-dashed border-[var(--card-border)] pt-5">{plan.features.map(f=><li key={f} className="flex min-h-[24px] items-start gap-3 text-sm leading-6 text-[var(--body-color)]"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.enterprise?'bg-yellow-500/20 text-yellow-400':'bg-primary/15 text-primary'}`}><CheckOutlined className="text-[10px]"/></span><span>{f}</span></li>)}</ul>
      </article>})}
    </div></section>
    {checkoutError && <p className="mx-auto mt-6 max-w-xl px-5 text-center text-sm text-red-500" role="alert">{checkoutError}</p>}
    {checkoutNotice && <p className="mx-auto mt-6 max-w-xl px-5 text-center text-sm text-[var(--body-color)]" role="status">{checkoutNotice}</p>}
    <p className="mt-12 text-center text-sm text-muted">All plans include a 30-day money-back guarantee. <button onClick={()=>window.dispatchEvent(new Event('open-sales-chat'))} className="text-primary">Contact us</button> for enterprise pricing.</p>
  </main>
}
