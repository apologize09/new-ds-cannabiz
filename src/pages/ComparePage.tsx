import { Link, useSearchParams } from 'react-router-dom'
import { products } from '../data/products'

const defaultIds = ['DS-C-335', 'DS-C-312', 'DS-C-332', 'DS-C-331']
const rows = [
  ['Product Type', 'category'],
  ['Dimensions', 'dimensions'],
  ['Net Weight', 'weight'],
  ['Housing Material', 'shape'],
  ['Oil Chamber Capacity', 'tankVolume'],
  ['Center Post Design', 'display'],
  ['Operation Mode', 'activation'],
  ['Preheat Function', 'preheat'],
  ['Battery Capacity', 'batteryCapacity'],
  ['Output Voltage', 'voltage'],
  ['Compatible Material', 'compatibleOil'],
  ['Generic Stock', 'stock'],
] as const

export default function ComparePage() {
  const [params] = useSearchParams()
  const requested = params.get('ids')?.split(',').filter(Boolean) || defaultIds
  const selected = requested.map(id => products.find(product => product.id === id)).filter(Boolean).slice(0, 4) as typeof products

  return (
    <div className="relative min-h-[1750px] bg-[#080808] pt-24 sm:pt-[320px]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[#202020] sm:h-[320px]" />
      <section className="relative mx-auto w-[calc(100%-32px)] max-w-[1215px] rounded-2xl border border-[#303034] bg-[#17171a] p-5 sm:p-12">
        <header className="mb-8 flex flex-wrap items-center gap-4 sm:gap-10">
          <h1 className="font-['Sora'] text-2xl font-semibold">Product Comparison</h1>
          <p className="text-sm text-muted">Selected <span className="text-primary">{selected.length}</span> / 5</p>
          <Link to="/hardware-gallery" aria-label="Close comparison" className="ml-auto text-3xl text-white/80">×</Link>
        </header>
        <div className="hidden overflow-hidden rounded-xl bg-[#242427] px-10 py-6 md:block">
          <div className="grid min-w-[940px] grid-cols-[170px_repeat(5,1fr)] items-end gap-5 border-b border-white/10 pb-4">
            <p className="pb-16 text-sm text-muted">Parameter</p>
            {selected.map(product => (
              <article key={product.id} className="rounded-lg bg-[#18181b] p-3">
                <img src={product.images[0]} alt={product.id} className="h-24 w-full rounded-md object-cover" />
                <h2 className="mt-2 text-base font-semibold">{product.id}</h2>
                <button className="mt-1 rounded bg-[#2b2b2f] px-3 py-1 text-xs text-muted">× &nbsp; Remove</button>
              </article>
            ))}
            <Link to="/hardware-gallery" className="grid h-[174px] place-items-center rounded-lg bg-[#18181b] text-center text-muted"><span className="text-3xl">＋<small className="mt-2 block text-xs">Add product</small></span></Link>
          </div>
          <div className="min-w-[940px]">
            {rows.map(([label, key]) => (
              <div key={key} className="grid min-h-[66px] grid-cols-[170px_repeat(5,1fr)] items-center gap-5 border-b border-white/10 py-3 text-center text-sm">
                <p className="text-left text-muted">{label}</p>
                {selected.map(product => <p key={product.id} className="text-white/75">{String(product[key] || '--')}</p>)}
                <p className="text-muted">--</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:hidden">
          {selected.map(product => (
            <article key={product.id} className="overflow-hidden rounded-xl bg-[#242427] p-4">
              <img src={product.images[0]} alt={product.id} className="h-44 w-full rounded-lg object-cover" />
              <h2 className="mt-3 font-['Sora'] text-lg font-semibold">{product.id}</h2>
              <dl className="mt-4 divide-y divide-white/10">
                {rows.map(([label, key]) => <div key={key} className="grid grid-cols-2 gap-4 py-3 text-xs"><dt className="text-muted">{label}</dt><dd className="text-right text-white/75">{String(product[key] || '--')}</dd></div>)}
              </dl>
            </article>
          ))}
          <Link to="/hardware-gallery" className="grid min-h-24 place-items-center rounded-xl bg-[#242427] text-muted">＋ Add product</Link>
        </div>
      </section>
    </div>
  )
}
