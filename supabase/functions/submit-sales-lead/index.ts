import { admin, json, options } from '../_shared/backend.ts'

const STAFF_RECIPIENTS = ['Maggie', 'Jessica'] as const

export default { async fetch(req: Request) { const preflight = options(req); if (preflight) return preflight
  try { const body = await req.json(); if (!body.name || !body.email || !body.message || body.consent !== true) return json({ error: 'Name, email, message, and consent are required' }, 400)
    const client = admin()
    const lead = { name: String(body.name).slice(0,120), email: String(body.email).toLowerCase().slice(0,254), company: body.company?.slice(0,160), phone: body.phone?.slice(0,40), message: String(body.message).slice(0,5000), consent: true }
    const { data, error } = await client.from('sales_leads').insert(lead).select('id').single()
    if (error) throw error

    const { error: notificationError } = await client.from('staff_notifications').insert(
      STAFF_RECIPIENTS.map(recipient_name => ({ recipient_name, lead_id: data.id }))
    )
    if (notificationError) throw notificationError

    const webhookUrl = Deno.env.get('STAFF_NOTIFICATION_WEBHOOK_URL')
    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'sales_lead.created', recipients: STAFF_RECIPIENTS, lead_id: data.id, lead }),
        })
        if (!response.ok) throw new Error(`Notification provider returned ${response.status}`)
        await client.from('staff_notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('lead_id', data.id)
      } catch (notificationProviderError) {
        console.error('Staff notification delivery failed', notificationProviderError)
        await client.from('staff_notifications').update({ status: 'failed' }).eq('lead_id', data.id)
      }
    }

    return json({ id: data.id, notified: STAFF_RECIPIENTS }, 201)
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Submission failed' }, 400) }
} }
