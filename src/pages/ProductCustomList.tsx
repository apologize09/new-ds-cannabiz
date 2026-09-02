import { Link, useSearchParams } from 'react-router-dom'
import { SearchOutlined, ToolOutlined } from '@ant-design/icons'
import { getProductCustomTemplates, type ProductCustomKind } from '../data/productCustomTemplates'
import { fuzzyScore } from '../lib/search'

export default function ProductCustomList({ kind }: { kind: ProductCustomKind }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const type = searchParams.get('type') ?? ''
  const templates = getProductCustomTemplates(kind)
  const title = kind === 'packaging' ? 'Packaging 3D Custom' : 'Merchandise 3D Custom'
  const basePath = kind === 'packaging' ? '/product-custom/packaging' : '/product-custom/merchandise'

  const scored = templates
    .map((template) => ({
      template,
      score: fuzzyScore(query, [template.name, template.pacdoraKeyword, template.pacdoraMockupId, template.keywords.join(' '), type]),
    }))
    .filter(({ score }) => !query.trim() || score > 0)
    .sort((a, b) => b.score - a.score)
  const items = scored.map(({ template }) => template)

  const updateQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-8 text-foreground sm:px-8">
      <div className="ds-container">
        <nav className="flex gap-2 font-['IBM_Plex_Sans'] text-sm leading-5 text-[#626269]">
          <span>Home</span><span>/</span><span className="text-foreground">Products Custom</span>
        </nav>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-['Unbounded'] text-[clamp(2rem,10vw,32px)] font-medium leading-tight tracking-[-0.64px] text-foreground">{title}</h1>
          </div>
          <div className="relative w-full lg:w-[360px]">
            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder={kind === 'packaging' ? 'Search pouch, box, dieline…' : 'Search hoodie, cap, tote…'}
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 font-['Sora'] text-sm text-foreground outline-none placeholder:text-muted focus:border-[#26f6c8]/60"
            />
          </div>
        </div>

        <div className="mb-7 mt-10 flex items-center justify-between">
          <p className="pl-1 font-['Sora'] text-sm font-semibold text-muted">{items.length} Mockups</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-['Sora'] text-lg font-semibold text-foreground">Nothing Found</p>
            <p className="mt-2 font-['IBM_Plex_Sans'] text-sm text-muted">Try pouch, box, hoodie, tote, cap, or another product keyword.</p>
          </div>
        ) : (
          <div className="ds-grid">
            {items.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                to={`${basePath}/${item.id}/edit${query ? `?q=${encodeURIComponent(query)}` : ''}`}
                className="group min-h-[390px] overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-300 ease-out hover:border-[rgba(38,246,200,0.4)] sm:h-[449px]"
              >
                <div className="relative m-[14px] flex h-[270px] items-center justify-center overflow-hidden bg-[#27272a] p-1 sm:h-[330px]">
                  <img src={`/figma-local/${item.image}`} alt={item.name} className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
                  <span className="pointer-events-none absolute flex translate-y-1 scale-95 items-center gap-2 rounded-lg bg-[#26f6c8] px-5 py-2 font-['Sora'] text-sm font-semibold text-black opacity-0 shadow-[0_8px_24px_rgba(38,246,200,0.25)] transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                    <ToolOutlined />
                    Custom
                  </span>
                </div>
                <div className="px-4 pt-[5px]">
                  <h2 className="font-['Sora'] text-sm font-semibold leading-[22px] text-foreground">{item.name}</h2>
                  <div className="mt-[6px] flex gap-[7px]">{item.swatches.map((swatch) => <span key={swatch} className="h-[21px] w-[21px] overflow-hidden rounded-full"><img src={`/figma-local/${swatch}`} alt="" className="h-full w-full object-cover" /></span>)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
