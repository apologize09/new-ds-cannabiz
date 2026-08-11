import { createClient } from 'npm:@supabase/supabase-js@2.110.6'

export const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('SITE_URL') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
export const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
export async function requireUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('Unauthorized')
  const client = admin()
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) throw new Error('Unauthorized')
  return { user: data.user, client }
}
export const options = (req: Request) => req.method === 'OPTIONS' ? new Response('ok', { headers: cors }) : null
