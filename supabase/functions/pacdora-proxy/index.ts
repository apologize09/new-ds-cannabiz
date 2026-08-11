import { cors, json, options, requireUser } from '../_shared/backend.ts'

type PacdoraProxyBody = {
  action?: string
  method?: string
  path?: string
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean | null | undefined>
}

const PACDORA_API_BASE = 'https://api.pacdora.com/open/v1'

const allowedActions: Record<string, { method: 'GET' | 'POST'; path: string; authRequired: boolean }> = {
  hello: { method: 'GET', path: '/hello', authRequired: false },
  modelSearch: { method: 'POST', path: '/models/search', authRequired: true },
  templateSearch: { method: 'POST', path: '/templates/search', authRequired: true },
}

function env(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function withQuery(path: string, query?: PacdoraProxyBody['query']) {
  const url = new URL(`${PACDORA_API_BASE}${path}`)
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value))
  })
  return url.toString()
}

Deno.serve(async (req) => {
  const preflight = options(req)
  if (preflight) return preflight
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const payload = (await req.json().catch(() => ({}))) as PacdoraProxyBody
    const action = payload.action || 'hello'
    const config = allowedActions[action]
    if (!config) return json({ error: 'Unsupported Pacdora action' }, 400)
    if (config.authRequired) await requireUser(req)

    const response = await fetch(withQuery(config.path, payload.query), {
      method: config.method,
      headers: {
        'content-type': 'application/json',
        'x-pacdora-appid': env('PACDORA_APP_ID'),
        'x-pacdora-appkey': env('PACDORA_APP_KEY'),
        'x-trace-id': crypto.randomUUID(),
      },
      body: config.method === 'POST' ? JSON.stringify(payload.body ?? {}) : undefined,
    })

    const data = await response.json().catch(() => null)
    if (data?.data?.app_key) data.data.app_key = 'redacted'
    return json({
      ok: response.ok && data?.code === 200,
      pacdora: data,
      traceId: response.headers.get('x-trace-id'),
    }, response.ok ? 200 : response.status)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Pacdora proxy failed' }, 500)
  }
})
