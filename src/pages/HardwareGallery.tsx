import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, SortAscendingOutlined, ShareAltOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons'
import { Checkbox, Dropdown } from 'antd'
import ProductCard from '../components/ui/ProductCard'
import ProductDetailModal from '../components/ui/ProductDetailModal'
import { products as fallbackProducts, categories, volumeOptions, shapeOptions, featureOptions, stockOptions } from '../data/products'
import type { Product } from '../data/products'
import { useCatalog } from '../hooks/useCatalog'
import { productSearchScore } from '../lib/search'

const sortOptions = ['Default', 'Name A-Z', 'Name Z-A', 'Battery (High)', 'Battery (Low)']
const PAGE_SIZE = 9

const normalize = (value: string | undefined | null) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const parseVolumes = (value: string | undefined | null) => {
  const matches = String(value ?? '').match(/\d+(?:\.\d+)?/g)
  return matches?.map(Number).filter(Number.isFinite) ?? []
}

const stockMatches = (productStock: string, selected: string) => {
  const stock = normalize(productStock)
  const wanted = normalize(selected)
  if (wanted === 'us') return stock === 'us' || stock.includes('us-stock')
  if (wanted === 'cn') return stock === 'cn' || stock.includes('china') || stock.includes('cn-stock')
  if (wanted === 'no') return stock === 'no' || stock.includes('no-stock') || stock.includes('none') || stock.includes('out-of-stock')
  return stock === wanted
}

const hasDigitalDisplay = (display: string, tags: string[]) => {
  const normalizedDisplay = normalize(display)
  const normalizedTags = tags.map(normalize)
  return normalizedDisplay !== '' && normalizedDisplay !== 'no-screen'
    || normalizedTags.some(tag => tag.includes('digital-display') || tag.includes('screen'))
}

const hasAdjustableVoltage = (voltage: string, tags: string[]) => {
  const normalizedVoltage = normalize(voltage)
  const normalizedTags = tags.map(normalize)
  return normalizedVoltage.includes('adjustable')
    || normalizedVoltage.includes('variable')
    || normalizedTags.some(tag => tag.includes('voltage-adjust') || tag.includes('variable-voltage'))
}

const volumeMatches = (tankVolume: string, range: string) => {
  const volumes = parseVolumes(tankVolume)
  return volumes.some(volume =>
    range === '0.5–1.0 mL' ? volume >= .5 && volume <= 1 :
    range === '1.2–3.0 mL' ? volume >= 1.2 && volume <= 3 :
    volume > 3
  )
}

const featureMatches = (product: Product, feature: string) => {
  const tags = product.tags ?? []
  if (feature === 'Preheat') return normalize(product.preheat) === 'y' || tags.map(normalize).some(tag => tag.includes('preheat'))
  if (feature === 'Digital Display') return hasDigitalDisplay(product.display, tags)
  if (feature === 'Adjustable Voltage') return hasAdjustableVoltage(product.voltage, tags)
  return false
}

const categoryParamMap: Record<string, string> = {
  all: 'ALL',
  'all-in-one': 'All-in-One Disposable',
  disposable: 'All-in-One Disposable',
  aio: 'All-in-One Disposable',
  '510': '510 Cart & Battery',
  cart: '510 Cart & Battery',
  cartridge: '510 Cart & Battery',
  battery: '510 Cart & Battery',
  pod: 'Pod System',
  'pod-system': 'Pod System',
  dab: 'Dab Hardware',
  wax: 'Dab Hardware',
  concentrate: 'Dab Hardware',
  packaging: 'Packaging/Merchandise',
  merchandise: 'Packaging/Merchandise',
}

export default function HardwareGallery() {
  const { products } = useCatalog(fallbackProducts)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { sku } = useParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([])
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedStock, setSelectedStock] = useState<string[]>([])
  const [sort, setSort] = useState('Default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    const cat = searchParams.get('cat')
    const mappedCategory = cat ? categoryParamMap[normalize(cat)] : undefined
    setSelectedCats(mappedCategory && mappedCategory !== 'ALL' ? [mappedCategory] : [])
  }, [searchParams, products])

  useEffect(() => {
    if (sku) setSelectedProduct(products.find(product => product.id === sku) || null)
  }, [sku, products])

  const toggleFilter = (val: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const clearFilters = () => {
    setSelectedCats([])
    setSelectedVolumes([])
    setSelectedShapes([])
    setSelectedFeatures([])
    setSelectedStock([])
  }

  const activeFilterCount = selectedCats.length + selectedVolumes.length + selectedShapes.length
    + selectedFeatures.length + selectedStock.length

  const shareGallery = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: 'DS Cannabiz Hardware Gallery', url }).catch(() => undefined)
      return
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined)
  }

  const availableCategories = useMemo(
    () => ['ALL', ...categories.filter(category => products.some(product => normalize(product.category) === normalize(category)))],
    [products]
  )

  const availableVolumes = useMemo(
    () => volumeOptions.filter(range => products.some(product => volumeMatches(product.tankVolume, range))),
    [products]
  )

  const availableShapes = useMemo(
    () => shapeOptions.filter(shape => products.some(product => normalize(product.shape) === normalize(shape))),
    [products]
  )

  const availableFeatures = useMemo(
    () => featureOptions.filter(feature => products.some(product => featureMatches(product, feature))),
    [products]
  )

  const availableStock = useMemo(
    () => stockOptions.filter(stock => products.some(product => stockMatches(product.stock, stock))),
    [products]
  )

  const filtered = useMemo(() => {
    let result = [...products]

    if (search) {
      result = result
        .map((product) => ({ product, score: productSearchScore(search, product) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ product }) => product)
    }
    if (selectedCats.length) result = result.filter((p) =>
      selectedCats.some(category => normalize(category) === normalize(p.category))
    )
    if (selectedVolumes.length) result = result.filter((p) => {
      return selectedVolumes.some(range => volumeMatches(p.tankVolume, range))
    })
    if (selectedShapes.length) result = result.filter((p) =>
      selectedShapes.some(shape => normalize(shape) === normalize(p.shape))
    )
    if (selectedStock.length) result = result.filter((p) =>
      selectedStock.some(stock => stockMatches(p.stock, stock))
    )
    if (selectedFeatures.length) {
      result = result.filter((p) =>
        selectedFeatures.every((f) => featureMatches(p, f))
      )
    }

    if (sort === 'Name A-Z') result.sort((a, b) => a.id.localeCompare(b.id))
    else if (sort === 'Name Z-A') result.sort((a, b) => b.id.localeCompare(a.id))
    else if (sort === 'Battery (High)') result.sort((a, b) => parseInt(b.batteryCapacity) - parseInt(a.batteryCapacity))
    else if (sort === 'Battery (Low)') result.sort((a, b) => parseInt(a.batteryCapacity) - parseInt(b.batteryCapacity))

    return result
  }, [products, search, selectedCats, selectedVolumes, selectedShapes, selectedFeatures, selectedStock, sort])

  useEffect(() => { setPage(1) }, [search, selectedCats, selectedVolumes, selectedShapes, selectedFeatures, selectedStock, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visibleProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const FilterSection = ({ title, items, selected, setSelected }: {
    title: string
    items: string[]
    selected: string[]
    setSelected: (v: string[]) => void
  }) => (
    <div className="space-y-2">
      <h4 className="dsc-gallery-filter-heading text-xs font-semibold uppercase tracking-wider">{title}</h4>
      <div className="space-y-1.5">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={item === 'ALL' ? selected.length === 0 : selected.includes(item)}
              onChange={() => item === 'ALL' ? setSelected([]) : toggleFilter(item, selected, setSelected)}
            />
            <span className="dsc-gallery-filter-label text-[10px] transition-colors">{item}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="dsc-hardware-gallery bg-[#0a0a0a] pb-20">
      <div className="mx-auto max-w-[1152px] px-5 pb-8 pt-8 sm:px-0">
      {/* Breadcrumb */}
      <nav className="dsc-gallery-breadcrumb text-xs text-muted mb-4">
        <span className="dsc-gallery-breadcrumb-link cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span className="mx-2">/</span>
        <span className="dsc-gallery-breadcrumb-current">Products</span>
      </nav>

      <h1 className="dsc-gallery-title mb-0 text-[32px] font-medium">Hardware Gallery</h1>
      </div>

      <div className="mx-auto max-w-[1152px] px-5 sm:px-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs italic text-muted">{filtered.length} products</p>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <div className="relative w-full sm:w-[400px]"><SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary"/></div>
          <button onClick={()=>compareIds.length && setCompareOpen(true)} className="btn-primary h-10 text-sm disabled:cursor-not-allowed disabled:opacity-50" disabled={!compareIds.length}>+ Compare{compareIds.length?` (${compareIds.length})`:''}</button>
          <button onClick={()=>void shareGallery()} className="dsc-gallery-control flex h-10 items-center gap-2 rounded-md border border-border bg-[#27272a] px-4 text-sm hover:border-primary/50"><ShareAltOutlined/>Share</button>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="dsc-gallery-control flex h-10 items-center gap-2 rounded-md border border-border bg-[#27272a] px-4 text-sm lg:hidden"
            aria-label="Open product filters"
          >
            <FilterOutlined /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>
          <Dropdown menu={{items:sortOptions.map(opt=>({key:opt,label:opt,onClick:()=>setSort(opt)}))}} trigger={['click']}><button className="dsc-gallery-control flex h-10 items-center gap-2 rounded-md border border-border bg-[#27272a] px-4 text-sm"><SortAscendingOutlined/>{sort==='Default'?'Sort':sort}</button></Dropdown>
          <div className="flex h-10 overflow-hidden rounded-md border border-border">
            <button onClick={()=>setViewMode('grid')} className={`w-9 transition-colors ${viewMode==='grid'?'bg-primary text-black':'dsc-gallery-control bg-[#27272a] text-muted'}`}><AppstoreOutlined/></button>
            <button onClick={()=>setViewMode('list')} className={`w-9 transition-colors ${viewMode==='list'?'bg-primary text-black':'dsc-gallery-control bg-[#27272a] text-muted'}`}><UnorderedListOutlined/></button>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        {/* Sidebar filters */}
        <aside className="hidden w-[280px] shrink-0 space-y-6 rounded-xl border border-border bg-card p-4 lg:block">
          <FilterSection title="Category" items={availableCategories} selected={selectedCats} setSelected={setSelectedCats} />
          <div className="border-t border-border" />
          <FilterSection title="Volume" items={availableVolumes} selected={selectedVolumes} setSelected={setSelectedVolumes} />
          <div className="border-t border-border" />
          <FilterSection title="Shape" items={availableShapes} selected={selectedShapes} setSelected={setSelectedShapes} />
          <div className="border-t border-border" />
          <FilterSection title="Features" items={availableFeatures} selected={selectedFeatures} setSelected={setSelectedFeatures} />
          <div className="border-t border-border" />
          <FilterSection title="Stock" items={availableStock} selected={selectedStock} setSelected={setSelectedStock} />

          {(selectedCats.length || selectedVolumes.length || selectedShapes.length || selectedFeatures.length || selectedStock.length) ? (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </aside>

        {mobileFiltersOpen ? (
          <div
            className="fixed inset-0 z-[120] flex items-end bg-black/70 backdrop-blur-sm lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setMobileFiltersOpen(false)
            }}
          >
            <section className="dsc-gallery-mobile-filters max-h-[86dvh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card px-5 pb-8 pt-4 shadow-2xl">
              <div className="sticky top-0 z-10 mb-5 flex items-center justify-between bg-card py-2">
                <div>
                  <p className="text-base font-semibold">Filters</p>
                  <p className="text-[11px] text-muted">{filtered.length} matching products</p>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="dsc-gallery-control grid h-10 w-10 place-items-center rounded-full border border-border"
                  aria-label="Close product filters"
                >
                  <CloseOutlined />
                </button>
              </div>
              <div className="space-y-6">
                <FilterSection title="Category" items={availableCategories} selected={selectedCats} setSelected={setSelectedCats} />
                <div className="border-t border-border" />
                <FilterSection title="Volume" items={availableVolumes} selected={selectedVolumes} setSelected={setSelectedVolumes} />
                <div className="border-t border-border" />
                <FilterSection title="Shape" items={availableShapes} selected={selectedShapes} setSelected={setSelectedShapes} />
                <div className="border-t border-border" />
                <FilterSection title="Features" items={availableFeatures} selected={selectedFeatures} setSelected={setSelectedFeatures} />
                <div className="border-t border-border" />
                <FilterSection title="Stock" items={availableStock} selected={selectedStock} setSelected={setSelectedStock} />
              </div>
              <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-3 bg-card pb-1 pt-4">
                <button onClick={clearFilters} className="h-11 rounded-lg border border-border text-sm font-medium">Clear all</button>
                <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary h-11 text-sm">Show {filtered.length}</button>
              </div>
            </section>
          </div>
        ) : null}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Controls are rendered above the grid to match the Figma layout. */}
          <div className="hidden">
            <div className="relative flex-1 min-w-[200px]">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-card border border-border text-white text-sm pl-9 pr-4 py-2 rounded-lg placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {compareIds.length > 0 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                Compare ({compareIds.length})
              </button>
            )}

            <Dropdown
              menu={{
                items: sortOptions.map((opt) => ({
                  key: opt,
                  label: opt,
                  onClick: () => setSort(opt),
                })),
                style: { background: '#1A1A1A', border: '1px solid #2A2A2A' },
              }}
              trigger={['click']}
            >
              <button className="flex items-center gap-2 bg-card border border-border text-sm text-white px-3 py-2 rounded-lg hover:border-primary/50 transition-colors">
                <SortAscendingOutlined />
                {sort}
              </button>
            </Dropdown>

            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}
              >
                <AppstoreOutlined />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}
              >
                <UnorderedListOutlined />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-lg font-medium text-white">Nothing Found</p>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
                  : 'space-y-3'
              }
            >
              {visibleProducts.map((product) =>
                viewMode === 'grid' ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onCompare={toggleCompare}
                    compareSelected={compareIds.includes(product.id)}
                    onClick={() => setSelectedProduct(product)}
                  />
                ) : (
                  <div
                    key={product.id}
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 card-hover cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="w-20 h-20 bg-[#111] rounded-xl shrink-0 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.id}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted uppercase tracking-wider">{product.category}</p>
                      <h3 className="text-white font-semibold text-sm mt-0.5">{product.id}</h3>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {product.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-muted shrink-0">
                      <span>🔋 {product.batteryCapacity}</span>
                      <span>💧 {product.tankVolume}</span>
                      <span>⚡ {product.voltage}</span>
                      <span>📱 {product.display}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          {filtered.length > PAGE_SIZE && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-border px-3 py-2 text-xs text-muted disabled:opacity-40">Prev</button>
              <span className="text-xs text-muted">Page {page} of {pageCount}</span>
              <button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="rounded-lg border border-border px-3 py-2 text-xs text-muted disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div></div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => { setSelectedProduct(null); if (sku) navigate('/hardware-gallery') }}
      />

      {compareOpen && (
        <div data-product-compare-dialog className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Compare selected products" onMouseDown={(event) => { if (event.target === event.currentTarget) setCompareOpen(false) }}>
          <div className="max-h-[88vh] w-full max-w-6xl overflow-auto rounded-2xl border border-[#343434] bg-[#111] p-5 shadow-2xl">
            <div className="sticky top-0 z-10 mb-5 flex items-center justify-between bg-[#111] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[.18em] text-primary">Product comparison</p>
                <h2 className="mt-1 font-['Sora'] text-2xl font-semibold text-white">Compare selected hardware</h2>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#343434] text-white hover:border-primary" onClick={() => setCompareOpen(false)} aria-label="Close comparison"><CloseOutlined /></button>
            </div>
            <div className="grid min-w-[720px] gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, compareIds.length)}, minmax(0, 1fr))` }}>
              {compareIds.map(id => products.find(product => product.id === id)).filter((product): product is Product => Boolean(product)).map(product => (
                <article key={product.id} className="overflow-hidden rounded-xl border border-[#343434] bg-[#181818]">
                  <div className="relative aspect-[4/3] bg-[#090909] p-4">
                    <img src={product.images[0]} alt={product.id} className="h-full w-full object-contain" />
                    <button type="button" className="absolute right-3 top-3 rounded-full bg-black/65 px-2 py-1 text-[10px] text-white" onClick={() => toggleCompare(product.id)}>Remove</button>
                  </div>
                  <div className="space-y-3 p-4">
                    <div><p className="text-[10px] uppercase tracking-[.14em] text-gray-400">{product.category}</p><h3 className="mt-1 text-lg font-semibold text-white">{product.id}</h3></div>
                    {[
                      ['Volume', product.tankVolume], ['Battery', product.batteryCapacity], ['Preheat', product.preheat], ['Voltage', product.voltage], ['Display', product.display], ['MOQ', product.moq || 'Contact for MOQ'], ['Stock', product.stock],
                    ].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 border-t border-white/10 pt-2 text-xs"><span className="text-gray-400">{label}</span><span className="text-right text-white">{value}</span></div>)}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => setCompareOpen(false)}>+ Add another product</button>
              <button type="button" className="rounded-lg border border-[#343434] px-4 py-2 text-sm text-white" onClick={() => setCompareIds([])}>Clear comparison</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
