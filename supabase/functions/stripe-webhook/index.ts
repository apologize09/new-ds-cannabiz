import Stripe from 'npm:stripe@22.3.2'
import { admin, json } from '../_shared/backend.ts'

export default { async fetch(req: Request) {
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!stripeSecret || !webhookSecret) return json({ error: 'Stripe billing is not configured' }, 503)
  const stripe = new Stripe(stripeSecret)
  const signature = req.headers.get('stripe-signature')
  if (!signature) return json({ error: 'Missing Stripe signature' }, 400)
  let event: Stripe.Event
  try { event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhookSecret) }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Invalid signature' }, 400) }
  const db = admin()
  const { error: insertError } = await db.from('webhook_events').insert({ provider: 'stripe', event_id: event.id, event_type: event.type, payload: event as unknown as Record<string, unknown> })
  if (insertError?.code === '23505') {
    const { data: existing } = await db.from('webhook_events').select('processed_at').eq('provider', 'stripe').eq('event_id', event.id).single()
    if (existing?.processed_at) return json({ received: true, duplicate: true })
    await db.from('webhook_events').update({ error: null, payload: event as unknown as Record<string, unknown> }).eq('provider', 'stripe').eq('event_id', event.id)
  } else if (insertError) return json({ error: insertError.message }, 500)
  try {
    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.user_id
      const planId = subscription.metadata.plan_id
      if (userId) await db.from('subscriptions').upsert({ user_id: userId, plan_id: planId || null, stripe_customer_id: String(subscription.customer), stripe_subscription_id: subscription.id, status: subscription.status, billing_interval: subscription.items.data[0]?.price.recurring?.interval ?? null, current_period_end: new Date(subscription.items.data[0]?.current_period_end * 1000).toISOString(), cancel_at_period_end: subscription.cancel_at_period_end }, { onConflict: 'user_id' })
    }
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string' ? invoice.parent.subscription_details.subscription : invoice.parent?.subscription_details?.subscription?.id
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.user_id, planId = subscription.metadata.plan_id
        if (!userId || !planId) throw new Error('Stripe subscription is missing DS Cannabiz account metadata')
        const { data: plan, error: planError } = await db.from('plans').select('monthly_credits,annual_credits,stripe_monthly_price_id,stripe_annual_price_id').eq('id', planId).eq('active', true).single()
        if (planError || !plan) throw new Error('Purchased plan is unavailable')
        const purchasedPrice = subscription.items.data[0]?.price.id
        const interval = purchasedPrice === plan.stripe_annual_price_id ? 'year' : purchasedPrice === plan.stripe_monthly_price_id ? 'month' : null
        if (!interval) throw new Error('Stripe price does not match the configured DS Cannabiz plan')
        const credits = interval === 'year' ? plan.annual_credits : plan.monthly_credits
        if (!credits || credits < 1) throw new Error('Purchased plan has no configured credit grant')
        const { error: creditError } = await db.rpc('apply_credit_change_once', { target_user: userId, change_type: 'grant', credit_amount: credits, ref_type: 'stripe_invoice', ref_id: invoice.id, note: 'Subscription credit grant', operation_key: `stripe:invoice:${invoice.id}:grant` })
        if (creditError) throw creditError
      }
    }
    await db.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('event_id', event.id)
    return json({ received: true })
  } catch (error) {
    await db.from('webhook_events').update({ error: error instanceof Error ? error.message : 'Processing failed' }).eq('event_id', event.id)
    return json({ error: error instanceof Error ? error.message : 'Processing failed' }, 500)
  }
} }
