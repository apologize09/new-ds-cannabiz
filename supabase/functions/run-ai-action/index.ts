import { admin, json, options, requireUser } from '../_shared/backend.ts'
export default { async fetch(req: Request) { const preflight = options(req); if (preflight) return preflight
  try { const { user, client } = await requireUser(req); const db = admin(); const body = await req.json(); const { data: cost } = await db.from('ai_action_costs').select('credit_cost,estimated_provider_cost_cents,minimum_margin_bps').eq('action', body.action).single(); if (!cost) return json({ error: 'Unsupported AI action' }, 400)
    const { data: priceFloor } = await db.rpc('minimum_paid_credit_price_cents')
    if (cost.estimated_provider_cost_cents == null || priceFloor == null) return json({ error: 'This AI action is not enabled for paid use yet' }, 503)
    const revenueCents = Number(priceFloor) * cost.credit_cost
    const marginBps = Math.floor(((revenueCents - cost.estimated_provider_cost_cents) / revenueCents) * 10000)
    if (marginBps < cost.minimum_margin_bps) return json({ error: 'This AI action is temporarily unavailable' }, 503)
    const { data: job, error } = await client.from('ai_jobs').insert({ user_id: user.id, project_id: body.projectId ?? null, action: body.action, credit_cost: cost.credit_cost, input_asset_id: body.inputAssetId ?? null, status: 'queued' }).select('id').single(); if (error) throw error
    const { error: debitError } = await db.rpc('apply_credit_change_once', { target_user: user.id, change_type: 'spend', credit_amount: -cost.credit_cost, ref_type: 'ai_job', ref_id: job.id, note: `Spend for ${body.action}`, operation_key: `ai:${job.id}:spend` }); if (debitError) { await client.from('ai_jobs').update({ status: 'failed', failure_reason: 'Insufficient credits' }).eq('id', job.id); return json({ error: 'Insufficient credits', jobId: job.id }, 402) }
    if (!Deno.env.get('AI_PROVIDER_API_KEY')) { await db.rpc('apply_credit_change_once', { target_user: user.id, change_type: 'refund', credit_amount: cost.credit_cost, ref_type: 'ai_job', ref_id: job.id, note: 'Provider unavailable refund', operation_key: `ai:${job.id}:refund` }); await client.from('ai_jobs').update({ status: 'failed', failure_reason: 'AI provider is not configured' }).eq('id', job.id); return json({ error: 'AI provider is not configured', jobId: job.id }, 503) }
    return json({ jobId: job.id, status: 'queued' }, 202)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI action failed'
    return json({ error: message }, message === 'Unauthorized' ? 401 : 500)
  }
} }
