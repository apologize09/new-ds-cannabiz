import Stripe from 'npm:stripe@22.3.2'
import { json, options, requireUser } from '../_shared/backend.ts'

export default { async fetch(req: Request) {
  const preflight = options(req); if (preflight) return preflight
  try {
    const { user, client } = await requireUser(req)
    const { planId, planSlug, interval } = await req.json()
    if (!['month', 'year'].includes(interval)) return json({ error: 'Invalid billing interval' }, 400)
    if (!planId && !planSlug) return json({ error: 'A plan is required' }, 400)
    let query = client.from('plans').select('*').eq('active', true)
    query = planId ? query.eq('id', planId) : query.eq('slug', planSlug)
    const { data: plan, error } = await query.single()
    if (error || !plan || plan.sales_assisted) return json({ error: 'Plan unavailable for checkout' }, 400)
    const price = interval === 'year' ? plan.stripe_annual_price_id : plan.stripe_monthly_price_id
    if (!price) return json({ error: 'Stripe price has not been configured' }, 503)
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
    const siteUrl = Deno.env.get('SITE_URL')
    if (!stripeSecret || !siteUrl) return json({ error: 'Stripe billing is not configured' }, 503)
    const stripe = new Stripe(stripeSecret)
    const { data: existing } = await client.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', line_items: [{ price, quantity: 1 }], customer: existing?.stripe_customer_id ?? undefined,
      customer_email: existing?.stripe_customer_id ? undefined : user.email,
      success_url: `${siteUrl}/plans?checkout=success`, cancel_url: `${siteUrl}/plans?checkout=cancelled`,
      client_reference_id: user.id, metadata: { user_id: user.id, plan_id: plan.id, interval }, subscription_data: { metadata: { user_id: user.id, plan_id: plan.id, interval } },
    })
    return json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return json({ error: message }, message === 'Unauthorized' ? 401 : 500)
  }
} }
