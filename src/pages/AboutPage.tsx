import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 py-16 text-center sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[min(600px,145vw)] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px] sm:h-[300px] sm:blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">About DS Cannabiz</p>
          <h1 className="text-[clamp(2rem,9vw,2.25rem)] font-bold text-[hsl(var(--foreground))] sm:text-4xl">Bridging Cannabis Brands with China's<br className="hidden sm:block" />Best Manufacturers</h1>
          <p className="text-sm leading-relaxed text-muted">DS Cannabiz is a B2B platform that connects cannabis brands worldwide with verified Chinese manufacturers. We leverage AI technology and 3D visualization tools to make your sourcing transparent, efficient, and customizable.</p>
          <p className="text-sm leading-relaxed text-muted">Our mission is to eliminate the friction in cross-border hardware, packaging & merchandise procurement — from product discovery and CMF customization to quality assurance and logistics. Whether you're a startup brand or an established distributor, DS Cannabiz provides the tools and networks you need to bring your products to market faster.</p>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 px-6 py-12">
        <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[{v:'2017',l:'Founded'},{v:'50+',l:'Factory Partners'},{v:'20+',l:'Countries'},{v:'100+',l:'Brands Served'}].map(({v,l}) => <div key={l}><p className="text-3xl font-bold text-[hsl(var(--foreground))]">{v}</p><p className="mt-1 text-sm text-muted">{l}</p></div>)}
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-[700px] space-y-5">
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Ready to Source Smarter?</h2>
          <p className="text-sm text-muted">Join hundreds of brands who trust DS for their needs.<br />Get started with a free consultation today.</p>
          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link to="/hardware-gallery" className="btn-primary">Browse Products</Link>
            <button type="button" onClick={() => window.dispatchEvent(new Event('open-sales-chat'))} className="btn-ghost">Talk To Sales</button>
          </div>
        </div>
      </section>
    </div>
  )
}
