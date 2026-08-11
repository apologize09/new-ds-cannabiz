import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DownloadOutlined, MoreOutlined } from '@ant-design/icons'
import ProductCard from '../components/ui/ProductCard'
import { products } from '../data/products'
import { useAuth } from '../providers/AuthProvider'
import { useCatalog } from '../hooks/useCatalog'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

const tabs=[['creativities','My Creativities'],['mockups','My Mockups'],['favorites','My Favorites']] as const
type Project = Database['public']['Tables']['projects']['Row']

const projectPreview = (project: Project) => {
  const configuration = project.configuration && typeof project.configuration === 'object' && !Array.isArray(project.configuration)
    ? project.configuration as Record<string, unknown>
    : {}
  return String(configuration.preview_url ?? configuration.image_url ?? configuration.thumbnail_url ?? '')
}

export default function Dashboard(){
  const {tab='creativities'}=useParams(); const navigate=useNavigate()
  const { user, profile } = useAuth()
  const { products: catalog } = useCatalog(products)
  const [projects, setProjects] = useState<Project[]>([])
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Member Account'
  const email = user?.email || 'Signed in account'
  const planLabel = 'Current plan'

  useEffect(() => {
    if (!user) { setProjects([]); setFavoriteIds([]); setLoading(false); return }
    setLoading(true)
    void Promise.all([
      supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('favorites').select('product_id').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([projectResult, favoriteResult]) => {
      setProjects(projectResult.data ?? [])
      setFavoriteIds((favoriteResult.data ?? []).map(item => item.product_id))
      setLoading(false)
    })
  }, [user])

  const favoriteProducts = useMemo(() => {
    const ids = new Set(favoriteIds)
    return catalog.filter(product => product.dbId && ids.has(product.dbId))
  }, [catalog, favoriteIds])
  const counts={creativities:projects.length,mockups:projects.length,favorites:favoriteProducts.length} as Record<string,number>
  const empty = (label: string) => <div className="grid min-h-[320px] place-items-center rounded-2xl border border-border bg-card p-8 text-center"><div><p className="text-lg font-semibold text-white">No {label} yet</p><p className="mt-2 text-sm text-muted">Your saved work will appear here.</p></div></div>
  return <main className="min-h-[calc(100vh-64px)] bg-[#090909] px-5 py-12 sm:px-8">
    <div className="ds-container flex flex-col gap-8 lg:flex-row">
      <aside className="w-full shrink-0 space-y-5 lg:w-[280px]">
        <div className="rounded-2xl border border-border bg-card p-7">
          <div className="mb-5 flex items-center gap-4">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt={displayName} className="h-14 w-14 rounded-full object-cover"/> : <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-bold text-black">{displayName[0]?.toUpperCase()}</span>}
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{displayName}</p>
              <p className="truncate text-sm text-muted">{email}</p>
            </div>
          </div>
          <p className="text-sm text-muted">{planLabel}</p>
        </div>
        <nav className="rounded-2xl border border-border bg-card p-6">{tabs.map(([key,label])=><button key={key} onClick={()=>navigate(`/dashboard/${key}`)} className={`relative flex w-full items-center justify-between px-3 py-4 text-left text-sm ${tab===key?'text-primary':'text-gray-300'}`}>{tab===key&&<span className="absolute left-0 h-5 w-1 rounded bg-primary"/>}<span>{label}</span><span className="text-muted">({counts[key]})</span></button>)}</nav>
      </aside>
      <section className="min-w-0 flex-1"><h1 className="mb-5 text-2xl font-semibold">{tabs.find(x=>x[0]===tab)?.[1]}<small className="ml-1 text-base font-normal text-muted">({counts[tab]||0})</small></h1>
        {loading ? <div className="min-h-[320px] animate-pulse rounded-2xl border border-border bg-card"/> : null}
        {!loading&&tab==='creativities'&&(projects.length?<div className="grid gap-5 md:grid-cols-2">{projects.map(project=><article key={project.id} className="rounded-2xl border border-border bg-card p-6"><header className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[.18em] text-primary">{project.kind}</p><h2 className="mt-2 text-lg font-semibold text-white">{project.name}</h2></div><div className="flex items-center gap-4 text-muted"><DownloadOutlined/><MoreOutlined/></div></header>{projectPreview(project)?<img src={projectPreview(project)} alt={project.name} className="mt-5 aspect-square w-full rounded-xl bg-[#eef2f8] object-contain"/>:<div className="mt-5 grid aspect-square place-items-center rounded-xl border border-border text-sm text-muted">Preview unavailable</div>}</article>)}</div>:empty('creativities'))}
        {!loading&&tab==='mockups'&&(projects.length?<div className="grid gap-5 md:grid-cols-2">{projects.map(project=><article key={project.id} className="rounded-2xl border border-border bg-card p-6">{projectPreview(project)?<img src={projectPreview(project)} alt={project.name} className="aspect-square w-full rounded-xl object-contain"/>:<div className="grid aspect-square place-items-center rounded-xl border border-border text-sm text-muted">Preview unavailable</div>}<p className="mt-4 font-semibold text-white">{project.name}</p><p className="mt-1 text-xs capitalize text-muted">{project.kind} · {project.status}</p></article>)}</div>:empty('mockups'))}
        {!loading&&tab==='favorites'&&(favoriteProducts.length?<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{favoriteProducts.map(p=><ProductCard key={p.id} product={p}/>)}</div>:empty('favorites'))}
      </section>
    </div>
  </main>
}
