import Stripe from 'npm:stripe@22.3.2'
import { json, options, requireUser } from '../_shared/backend.ts'
export default { async fetch(req: Request) {
  const preflight = options(req); if (preflight) return preflight
  try { const { user, client } = await requireUser(req); const { data } = await client.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()
    if (!data?.stripe_customer_id) return json({ error: 'No billing account found' }, 404)
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!); const session = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${Deno.env.get('SITE_URL')}/plans` }); return json({ url: session.url })
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Portal failed' }, 401) }
} }
