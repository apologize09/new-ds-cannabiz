import { json, options, requireUser } from '../_shared/backend.ts'
export default { async fetch(req: Request) { const preflight = options(req); if (preflight) return preflight
  try { const { user, client } = await requireUser(req); const body = await req.json(); const { data, error } = await client.from('quote_requests').insert({ user_id: user.id, project_id: body.projectId ?? null, product_id: body.productId ?? null, quantity: body.quantity ?? null, details: body.details ?? {} }).select('id').single(); if (error) throw error; return json({ id: data.id }, 201)
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Quote submission failed' }, 401) }
} }
