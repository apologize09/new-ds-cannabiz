const required = ['STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missing = required.filter((name) => !process.env[name])
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

const stripeKey = process.env.STRIPE_SECRET_KEY
const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const catalog = [
  {
    slug: 'brand-incubator',
    name: 'DS Cannabiz Brand Incubator',
    monthly: { amount: 999, credits: 50 },
    annual: { amount: 10070, credits: 600 },
  },
  {
    slug: 'tech-master',
    name: 'DS Cannabiz Tech Master',
    monthly: { amount: 4999, credits: 300 },
    annual: { amount: 50390, credits: 3600 },
  },
]

async function stripe(path, options = {}) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...options.headers,
    },
  })
  const body = await response.json()
  if (!response.ok || body.error) throw new Error(body.error?.message || `Stripe request failed (${response.status})`)
  return body
}

function form(values) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) params.set(key, String(value))
  return params
}

async function findOrCreateProduct(plan) {
  const query = encodeURIComponent(`metadata['ds_plan_slug']:'${plan.slug}'`)
  const result = await stripe(`/v1/products/search?query=${query}&limit=1`, { method: 'GET' })
  if (result.data?.[0]) return result.data[0]
  return stripe('/v1/products', {
    method: 'POST',
    body: form({ name: plan.name, 'metadata[ds_plan_slug]': plan.slug }),
  })
}

async function findOrCreatePrice(productId, plan, interval) {
  const lookupKey = `dscannabiz_${plan.slug.replaceAll('-', '_')}_${interval}`
  const existing = await stripe(`/v1/prices?lookup_keys[]=${lookupKey}&active=true&limit=1`, { method: 'GET' })
  if (existing.data?.[0]) return existing.data[0]
  const config = interval === 'month' ? plan.monthly : plan.annual
  return stripe('/v1/prices', {
    method: 'POST',
    body: form({
      product: productId,
      currency: 'usd',
      unit_amount: config.amount,
      'recurring[interval]': interval === 'month' ? 'month' : 'year',
      lookup_key: lookupKey,
      'metadata[ds_plan_slug]': plan.slug,
      'metadata[credits_per_period]': config.credits,
    }),
  })
}

async function updatePlan(plan, monthlyPriceId, annualPriceId) {
  const response = await fetch(`${supabaseUrl}/rest/v1/plans?slug=eq.${encodeURIComponent(plan.slug)}`, {
    method: 'PATCH',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ stripe_monthly_price_id: monthlyPriceId, stripe_annual_price_id: annualPriceId }),
  })
  if (!response.ok) throw new Error(`Supabase plan update failed for ${plan.slug}: ${await response.text()}`)
}

for (const plan of catalog) {
  const product = await findOrCreateProduct(plan)
  const monthly = await findOrCreatePrice(product.id, plan, 'month')
  const annual = await findOrCreatePrice(product.id, plan, 'year')
  await updatePlan(plan, monthly.id, annual.id)
  console.log(`${plan.name}: monthly and annual prices configured`)
}

console.log('Stripe catalog and DS Cannabiz plan price IDs are synchronized.')
