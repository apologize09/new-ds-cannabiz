import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Row = Record<string, unknown>
const sections = [
  'products',
  'templates',
  'plans',
  'profiles',
  'user_roles',
  'subscriptions',
  'sales_leads',
  'staff_notifications',
  'quote_requests',
  'page_views',
] as const

export default function AdminPage() {
  const [section, setSection] = useState<typeof sections[number]>('products')
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    setError('')
    ;(supabase as any).from(section).select('*').limit(100).then(({ data, error: queryError }: { data: Row[] | null; error: { message?: string } | null }) => {
      setRows(data ?? [])
      setError(queryError?.message ?? '')
    })
  }, [section])
  return <main className="ds-container min-h-screen py-10">
    <h1 className="text-3xl font-semibold">Admin</h1>
    <div className="mt-6 flex flex-wrap gap-2">{sections.map(item => <button key={item} onClick={() => setSection(item)} className={`rounded-lg px-4 py-2 text-sm ${section===item?'bg-primary text-black':'bg-card text-muted'}`}>{item.replace(/_/g,' ')}</button>)}</div>
    <div className="mt-6 overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-xs"><thead className="bg-card"><tr>{Object.keys(rows[0] ?? {}).slice(0,8).map(key=><th key={key} className="p-3 text-muted">{key}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={String(row.id ?? index)} className="border-t border-border">{Object.values(row).slice(0,8).map((value,i)=><td key={i} className="max-w-56 truncate p-3">{typeof value==='object'?JSON.stringify(value):String(value ?? '')}</td>)}</tr>)}</tbody></table>{error?<p className="p-8 text-center text-red-400">{error}</p>:!rows.length&&<p className="p-8 text-center text-muted">No records</p>}</div>
  </main>
}
