import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  SearchOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { products as fallbackProducts } from "../data/products";
import { useCatalog } from "../hooks/useCatalog";
import { fuzzyScore, productSearchScore } from "../lib/search";
import { merchandiseTemplates, packagingTemplates, type ProductCustomTemplate } from "../data/productCustomTemplates";
import type { Product } from "../data/products";
const stats = [
  { value: "50+", label: "Verified Factories" },
  { value: "500+", label: "SKU Options" },
  { value: "30+", label: "States Served" },
];

const aboutNetworkStats = [
  { value: "2017", label: "Founded" },
  { value: "50+", label: "Factory Partners" },
  { value: "20+", label: "Countries" },
  { value: "100+", label: "Brands Served" },
];

const categories = [
  {
    name: "All-in-One Disposable",
    desc: "Complete ready-to-use vaporizer solutions",
    img: "/figma/home/263-2133.png",
    href: "/hardware-gallery?cat=all-in-one",
  },
  {
    name: "510 Cart & Battery",
    desc: "Universal threaded cartridges and batteries",
    img: "/figma/home/263-2134.png",
    href: "/hardware-gallery?cat=510",
  },
  {
    name: "Pod System",
    desc: "Magnetic pod-based vaporizer systems",
    img: "/figma/home/263-1497.png",
    href: "/hardware-gallery?cat=pod",
  },
  {
    name: "Dab Hardware",
    desc: "Complete ready-to-use vaporizer solutions",
    img: "/figma/home/263-2135.png",
    href: "/hardware-gallery?cat=dab",
  },
  {
    name: "Packaging/Merchandise",
    desc: "Child resistant and eco-friendly solutions",
    img: "/figma/home/263-2136.png",
    href: "/hardware-gallery?cat=packaging",
  },
];

const features = [
  {
    title: "3D Packaging Customization",
    desc: "Design your packaging online with real-time 3D preview. Choose colors, materials, and finishes before production.",
    image: "/figma/home/263-2003.png",
    imageSide: "right",
    light: true,
    href: "/product-custom/packaging",
  },
  {
    title: "AI-Powered Sourcing",
    desc: "Our AI matches your requirements with the best products, optimizing for quality, price, and lead time.",
    image: "/figma/home/263-1873.png",
    imageSide: "right",
    light: false,
    href: "/hardware-gallery",
  },
  {
    title: "Smart Analytics",
    desc: "AI search, compare products, and get market insights all from your personalized dashboard.",
    image: "/figma/home/263-1440.png",
    imageSide: "left",
    light: false,
    href: "/dashboard",
  },
  {
    title: "Global Supply Chain",
    desc: "Access 50+ verified Chinese manufacturers with direct factory pricing and transparent quality certifications.",
    image: "/figma/home/263-2002.png",
    imageSide: "right",
    light: true,
    href: "/hardware-gallery",
  },
];

const manufacturingPoints = [
  "ISO 9001 & GMP Certified Factories",
  "100% Pre-shipment Quality Inspection",
  "Heavy Metal & Residual Solvent Testing",
  "Child-Resistant Packaging Compliance",
  "CNAS & CMA Third Party Certifications",
  "Full Traceability & Batch Records",
];

const partnerLogos = [
  {
    name: "Gelato",
    src: "/brand-logos/pink-gelato.svg",
    width: 97,
    height: 57,
  },
  {
    name: "BLINKERS",
    src: "/brand-logos/brand-mark-02.svg",
    width: 237,
    height: 38,
  },
  { name: "KADOBAR", src: "/brand-logos/kadobar.svg", width: 230, height: 43 },
  {
    name: "FLUM",
    src: "/brand-logos/flum-mello.svg",
    width: 93,
    height: 44,
  },
  {
    name: "Petro",
    src: "/brand-logos/petro.svg",
    width: 75,
    height: 51,
  },
  {
    name: "PRYZM",
    src: "/brand-logos/brand-logo-06.svg",
    width: 166,
    height: 32,
  },
];

const aiMatchingStats = [
  { v: "< 30s", l: "Match Time" },
  { v: "95%", l: "Accuracy Rate" },
  { v: "3-5", l: "Options Per Query" },
  { v: "24/7", l: "Always Available" },
] as const;

const packagingFeatures = [
  "Real-time 3D preview with photorealistic rendering",
  "Multiple Packaging Models Available",
  "Custom logo placement and packaging design",
  "Instant quote generation based on your configuration",
];

const searchModes = [
  {
    label: "Vape Hardware Search",
    iconColor: "cyan",
    placeholder: "Search disposable vapes, cartridges, pods and dab hardware",
    route: (query: string) => `/hardware-gallery?q=${encodeURIComponent(query)}`,
  },
  {
    label: "Packaging Design",
    iconColor: "yellow",
    placeholder: "Describe your packaging design needs... e.g. 'Paper gift box for disposable vape'",
    route: (query: string) => `/product-custom/packaging?q=${encodeURIComponent(query)}`,
  },
  {
    label: "CR Packaging Search",
    iconColor: "pink",
    placeholder: "Describe your CR packaging needs... e.g. 'Child resistant paper box for cartridge'",
    route: (query: string) => `/product-custom/packaging?q=${encodeURIComponent(query)}&type=cr`,
  },
  {
    label: "Similar Image Search",
    iconColor: "pink",
    placeholder: "Select a file or drag and drop files here",
    route: null,
  },
  {
    label: "Merchandise Design",
    iconColor: "cyan",
    placeholder: "e.g. 'Hoodies with logo printing'",
    route: (query: string) => `/product-custom/merchandise?q=${encodeURIComponent(query)}`,
  },
] as const;

const heroSearchTagRows = [
  searchModes.slice(0, 3),
  searchModes.slice(3, 5),
] as const;

const heroSearchSparkleColors = {
  cyan: "#26f6c8",
  yellow: "#f5c842",
  pink: "#ff5cb8",
} as const;

function HeroSearchSparkle({ color }: { color: keyof typeof heroSearchSparkleColors }) {
  return (
    <svg
      className="dsc-hero-search-tag__icon shrink-0"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
    >
      <path
        d="M6 1.1 6.95 4.45 10.3 5.4 6.95 6.35 6 9.7 5.05 6.35 1.7 5.4 5.05 4.45 6 1.1Z"
        fill={heroSearchSparkleColors[color]}
      />
    </svg>
  );
}

const diversifyByCategory = <T extends { category: string }>(items: T[], limit: number) => {
  const firstByCategory: T[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const categoryKey = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (seen.has(categoryKey)) continue;
    seen.add(categoryKey);
    firstByCategory.push(item);
    if (firstByCategory.length >= limit) return firstByCategory;
  }
  return [...firstByCategory, ...items.filter((item) => !firstByCategory.includes(item))].slice(0, limit);
};

export default function HomePage() {
  const { products } = useCatalog(fallbackProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<(typeof searchModes)[number]>(searchModes[0]);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [imageSearchPreview, setImageSearchPreview] = useState("");
  const [imageSearchFileName, setImageSearchFileName] = useState("");
  const [imageSearchError, setImageSearchError] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState<{
    hardware: Product[];
    packaging: ProductCustomTemplate[];
    merchandise: ProductCustomTemplate[];
  } | null>(null);
  const [packagingPreview, setPackagingPreview] = useState<"mockup" | "dieline" | "video">("mockup");
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const isHardwareSearch = searchMode.label === "Vape Hardware Search";
  const liveHardwareResults = isHardwareSearch && searchQuery.trim()
    ? diversifyByCategory([...products]
        .map((product) => ({ product, score: productSearchScore(searchQuery, product) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ product }) => product), 6)
    : [];
  const sharePackagingTool = async () => {
    const url = `${window.location.origin}/product-custom/packaging`;
    if (navigator.share) {
      await navigator.share({ title: "DS Cannabiz Packaging Customization", url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
  };
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (searchMode.label === "Similar Image Search") {
      setImageSearchOpen(true);
      return;
    }
    if (isHardwareSearch) return;
    if (query && searchMode.route) navigate(searchMode.route(query));
  };
  useEffect(() => () => {
    if (imageSearchPreview) URL.revokeObjectURL(imageSearchPreview);
  }, [imageSearchPreview]);
  const rankTemplates = (fileQuery: string, templates: ProductCustomTemplate[]) => {
    const ranked = templates
      .map((template) => ({
        template,
        score: fuzzyScore(fileQuery, [template.name, template.pacdoraKeyword, template.keywords.join(" ")]),
      }))
      .sort((a, b) => b.score - a.score);
    const matched = ranked.filter(({ score }) => score > 0).map(({ template }) => template);
    return (matched.length ? matched : templates).slice(0, 3);
  };
  const runImageSearch = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageSearchError("Select a JPG, PNG, WebP, or SVG image.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setImageSearchError("The selected image must be 20 MB or smaller.");
      return;
    }
    const fileQuery = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\b(image|photo|picture|mockup|product|final|copy)\b/gi, " ")
      .trim();
    const rankedHardware = products
      .map((product) => ({ product, score: productSearchScore(fileQuery, product) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
    setImageSearchPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setImageSearchFileName(file.name);
    setImageSearchError("");
    setImageSearchResults({
      hardware: diversifyByCategory(rankedHardware.length ? rankedHardware : products, 3),
      packaging: rankTemplates(fileQuery, packagingTemplates),
      merchandise: rankTemplates(fileQuery, merchandiseTemplates),
    });
    setImageSearchOpen(false);
    window.requestAnimationFrame(() => document.getElementById("visual-search-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="overflow-hidden">
      <section className="dsc-home-hero relative flex min-h-[calc(100svh-58px)] items-center justify-center overflow-hidden px-4 py-10 text-center sm:px-6 sm:py-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[260px] w-[min(1000px,160vw)] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px] sm:h-[360px] sm:blur-[120px]" />
        <div className="ds-container relative z-10 space-y-6 lg:-translate-y-[4.5vh]">
          <div className="dsc-hero-eyebrow hero-enhance">
            <span className="dsc-hero-eyebrow__decor dsc-hero-eyebrow__decor--left" aria-hidden="true">
              <span className="dsc-hero-eyebrow__line" />
              <span className="dsc-hero-eyebrow__dot" />
            </span>
            <span className="dsc-hero-eyebrow__text">B2B One Stop Purchasing Platform</span>
            <span className="dsc-hero-eyebrow__decor dsc-hero-eyebrow__decor--right" aria-hidden="true">
              <span className="dsc-hero-eyebrow__dot" />
              <span className="dsc-hero-eyebrow__line" />
            </span>
          </div>
          <h1 className="hero-enhance font-['Unbounded'] text-[clamp(2rem,12vw,3.35rem)] font-bold leading-[1.05] text-white sm:text-5xl md:text-[72px]">
            You Define a Request,
            <br />
            <span className="text-primary">AI Matches Devices</span>
          </h1>
          <p className="hero-enhance text-muted text-base leading-relaxed max-w-lg mx-auto">
            From Idea to Product — discover, customize, and order all you need
            within a few minutes.
          </p>
          <form
            onSubmit={handleSearch}
            className="hero-enhance mx-auto flex w-full max-w-[610px] flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <label htmlFor="home-search" className="sr-only">
                Vape Hardware Search
              </label>
              <input
                id="home-search"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchMode.placeholder}
                autoComplete="off"
                className="w-full bg-card border border-border text-white text-sm pl-10 pr-4 py-3 rounded-xl placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="btn-primary flex shrink-0 items-center justify-center gap-2"
            >
              Search <ArrowRightOutlined />
            </button>
          </form>
          <div className="dsc-hero-search-tags hero-enhance">
            {heroSearchTagRows.map((row, rowIndex) => (
              <div key={rowIndex} className="dsc-hero-search-tags__row">
                {row.map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      setSearchMode(item);
                      if (item.label === "Similar Image Search") setImageSearchOpen(true);
                    }}
                    aria-pressed={searchMode.label === item.label}
                    className="dsc-hero-search-tag"
                  >
                    <HeroSearchSparkle color={item.iconColor} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {isHardwareSearch && searchQuery.trim() && (
              <motion.div
                key="live-hardware-results"
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: 10 }}
                transition={{ duration: reducedMotion ? 0 : 0.22 }}
                className="dsc-live-search-results mx-auto w-full max-w-[920px] rounded-3xl border p-3 text-left shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Live hardware matches
                  </p>
                  <Link
                    to={`/hardware-gallery?q=${encodeURIComponent(searchQuery.trim())}`}
	                    className="dsc-live-search-link text-xs transition-colors"
                  >
                    View full gallery →
                  </Link>
                </div>
                {liveHardwareResults.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {liveHardwareResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/hardware-gallery/${product.id}`}
	                        className="dsc-live-search-card group overflow-hidden rounded-2xl border transition-colors hover:border-primary/60"
                      >
                        <div className="product-card-media flex h-36 items-center justify-center p-3">
                          <img
                            src={product.images[0]}
                            alt={product.id}
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                            onError={(event) => { (event.currentTarget as HTMLImageElement).style.opacity = "0.25"; }}
                          />
                        </div>
                        <div className="space-y-2 p-3">
	                          <p className="dsc-live-search-cat text-[10px] uppercase tracking-[0.18em]">
                            {product.category}
                          </p>
	                          <h3 className="dsc-live-search-id text-sm font-semibold">{product.id}</h3>
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {[
                              product.tankVolume,
                              product.preheat === "Y" ? "Preheat" : "",
                              product.display,
                            ].filter(Boolean).slice(0, 3).map((label) => (
	                              <span key={label} className="dsc-live-search-tag rounded px-2 py-1">
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
	                  <div className="dsc-live-search-empty rounded-2xl border p-6 text-center">
	                    <p className="text-sm font-semibold">No exact hardware match</p>
	                    <p className="mt-1 text-xs">
                      Try a product type, volume, or feature like “1ml preheat 510”.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="hero-enhance mx-auto grid max-w-[600px] grid-cols-3 items-start justify-center gap-3 border-t border-primary/20 pt-8 sm:gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="dsc-hero-stat-value text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {imageSearchOpen && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={() => setImageSearchOpen(false)}
        >
          <section
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] rounded-3xl border border-primary/50 bg-card p-8"
          >
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Search By Image</h2>
              <button
                onClick={() => setImageSearchOpen(false)}
                className="text-2xl text-muted"
              >
                ×
              </button>
            </header>
            <label
              className="mt-7 grid min-h-[310px] cursor-pointer place-items-center rounded-xl border border-dashed border-primary/20 bg-gradient-to-b from-primary/10 to-black p-8 text-center"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (file) runImageSearch(file);
              }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) runImageSearch(e.target.files[0]);
                }}
              />
              <div>
                <div className="text-5xl">▧</div>
                <span className="btn-primary mt-6 inline-block">↥ Upload</span>
                <p className="mt-4 text-muted">Select a file or drag and drop files here</p>
                {imageSearchError && <p className="mt-3 text-sm text-red-400">{imageSearchError}</p>}
                <p className="mt-16 text-xs text-muted">
                  JPG, PNG, WebP, SVG (Max 20 MB)
                </p>
              </div>
            </label>
          </section>
        </div>
      )}

      {imageSearchResults && (
        <section id="visual-search-results" className="dsc-image-search-results ds-section scroll-mt-20">
          <div className="ds-container">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={imageSearchPreview} alt="Uploaded visual search reference" className="h-20 w-20 rounded-xl border border-border bg-white object-contain" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Visual Search Results</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">{imageSearchFileName}</h2>
                </div>
              </div>
              <button type="button" onClick={() => setImageSearchOpen(true)} className="btn-ghost self-start sm:self-auto">Replace image</button>
            </div>
            <div className="space-y-8">
              <div>
                <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold text-white">Hardware</h3><Link to="/hardware-gallery" className="text-sm text-primary">View full gallery →</Link></div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {imageSearchResults.hardware.map((product) => (
                    <Link key={product.id} to={`/hardware-gallery/${product.id}`} className="dsc-live-search-card overflow-hidden rounded-2xl border border-border">
                      <div className="product-card-media flex h-44 items-center justify-center p-4"><img src={product.images[0]} alt={product.id} className="h-full w-full object-contain" /></div>
                      <div className="p-4"><p className="text-[10px] uppercase tracking-[0.18em] text-muted">{product.category}</p><p className="mt-1 font-semibold text-white">{product.id}</p></div>
                    </Link>
                  ))}
                </div>
              </div>
              {([
                { title: "Packaging", items: imageSearchResults.packaging, path: "/product-custom/packaging" },
                { title: "Merchandise", items: imageSearchResults.merchandise, path: "/product-custom/merchandise" },
              ] as const).map((group) => (
                <div key={group.title}>
                  <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold text-white">{group.title}</h3><Link to={group.path} className="text-sm text-primary">View all →</Link></div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {group.items.map((template) => (
                      <Link key={`${template.kind}-${template.id}`} to={`${group.path}/${template.id}/edit`} className="dsc-live-search-card overflow-hidden rounded-2xl border border-border">
                        <div className="product-card-media flex h-44 items-center justify-center p-4"><img src={`/figma-local/${template.image}`} alt={template.name} className="h-full w-full object-contain" /></div>
                        <p className="p-4 font-semibold text-white">{template.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section data-gsap-reveal className="dsc-home-product-library section-enhance ds-section">
        <div className="ds-container">
          <div className="text-center mb-10">
            <p className="dsc-home-product-library-eyebrow tracking-widest mb-2">
              Product Library
            </p>
            <h2 className="font-['Unbounded'] text-3xl font-bold text-white">
              Hardware for Every Need
            </h2>
            <p className="mt-3 text-sm text-muted">
              From disposable vapes to dab rigs, explore our comprehensive
              catalog of vaporizer hardware sourced from China's top
              manufacturers.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((cat) => (
              <div key={cat.name}>
                <Link
                  to={cat.href}
                  data-home-category-card="default"
                  className="dsc-home-category-card relative flex h-[310px] flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 text-center"
                >
                  <p className="dsc-home-category-title shrink-0 text-sm font-semibold leading-tight text-white">
                    {cat.name}
                  </p>
                  <p className="dsc-home-category-desc mx-auto mt-1 min-h-[34px] max-w-[160px] text-[10px] leading-relaxed text-muted">
                    {cat.desc}
                  </p>
                  <div className="mt-auto flex min-h-[190px] items-end justify-center overflow-hidden">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      width="300"
                      height="300"
                      loading="eager"
                      className="max-h-[180px] w-full object-contain"
                    />
                  </div>
                  <span className="dsc-home-category-cta rounded-lg text-xs font-semibold">
                    Explore More →
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="dsc-home-capabilities section-enhance ds-section">
        <div className="ds-container">
          <div className="text-center mb-12">
            <p className="dsc-home-capabilities-eyebrow tracking-widest mb-2">
              Platform Capabilities
            </p>
            <h2 className="font-['Unbounded'] text-3xl font-bold text-white">
              Everything You Need in One Place
            </h2>
            <p className="mt-3 text-sm text-muted">
            DS Cannabiz combines AI intelligence, 3D design tools, and supply chain expertise to streamline your sourcing workflow.
            </p>
          </div>
          <div className="dsc-home-capabilities-grid grid grid-cols-1 gap-5 md:grid-cols-2">
            {features.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                data-capability-card={item.light ? "mint" : "dark"}
                className={`dsc-home-capability-card dsc-home-capability-card--${item.light ? "mint" : "dark"} ${item.imageSide === "left" ? "dsc-home-capability-card--image-left" : "dsc-home-capability-card--image-right"}`}
              >
                <div className="dsc-home-capability-card__content">
                  <h3 className="dsc-home-capability-card__title">{item.title}</h3>
                  <p className="dsc-home-capability-card__desc">{item.desc}</p>
                </div>
                <div className="dsc-home-capability-card__media">
                  <img
                    src={item.image}
                    alt=""
                    width="510"
                    height="510"
                    loading="eager"
                    className="dsc-home-capability-card__image"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="dsc-home-packaging-section section-enhance ds-section">
        <div className="ds-container">
          <div className="dsc-home-packaging-panel grid overflow-hidden rounded-3xl md:grid-cols-2">
            <div className="dsc-home-packaging-preview order-1 flex min-h-[320px] flex-col items-center justify-center p-4 sm:min-h-[470px] sm:p-6">
              <div className="dsc-home-packaging-preview__frame relative aspect-[1.78/1] w-full overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={packagingPreview}
                    className="absolute inset-0"
                    initial={reducedMotion ? false : { opacity: 0, x: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: -8, filter: "blur(3px)" }}
                    transition={{ type: "spring", duration: reducedMotion ? 0 : 0.42, bounce: 0 }}
                  >
                    {packagingPreview === "mockup" && (
                      <img
                        src="/figma/home/263-1878.png"
                        alt="Packaging mockup preview"
                        className="h-full w-full object-cover object-top"
                      />
                    )}
                    {packagingPreview === "dieline" && (
                      <img
                        src="/figma-local/截屏2026-06-29 20.19.38 1.png"
                        alt="Packaging dieline preview"
                        className="h-full w-full object-contain p-6 sm:p-10"
                      />
                    )}
                    {packagingPreview === "video" && (
                      <div className="grid h-full grid-cols-2 bg-[#f5f5f5]">
                        <img src="/figma-local/Video-3.png" alt="Packaging animation front view" className="h-full w-full object-contain p-5" />
                        <img src="/figma-local/Video-2.png" alt="Packaging animation perspective view" className="h-full w-full object-contain p-5" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div
                className="dsc-home-packaging-tabs relative mt-5 grid w-full max-w-[730px] grid-cols-4 rounded-full p-1 text-sm sm:text-base"
                role="tablist"
                aria-label="Packaging preview"
              >
                {(["mockup", "dieline", "video"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={packagingPreview === tab}
                    onClick={() => setPackagingPreview(tab)}
                    className={`dsc-home-packaging-tab relative z-10 rounded-full px-2 py-2 capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${packagingPreview === tab ? "is-active" : ""}`}
                  >
                    {packagingPreview === tab && (
                      <motion.span
                        layoutId="packaging-preview-pill"
                        className="dsc-home-packaging-tab__pill absolute inset-0 -z-10 rounded-full"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      />
                    )}
                    {tab}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => void sharePackagingTool()}
                  className="dsc-home-packaging-tab rounded-full px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Share
                </button>
              </div>
            </div>
            <div className="dsc-home-packaging-content order-2 flex flex-col justify-center p-6 sm:p-10">
              <p className="dsc-home-packaging-eyebrow">3D Packaging Customization</p>
              <h2 className="dsc-home-packaging-title">Design Your Product Online</h2>
              <p className="dsc-home-packaging-desc">
                With our 3D packaging design tool, you can customize the colors,
                materials and patterns of any packaging in the template. You can
                preview your design effects in real time before placing an order.
              </p>
              <ul className="dsc-home-packaging-features">
                {packagingFeatures.map((item) => (
                  <li key={item}>
                    <CheckCircleFilled className="dsc-home-packaging-features__icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/product-custom/packaging" className="dsc-home-packaging-cta">
                Try Customization <ArrowRightOutlined />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="dsc-ai-matching-section section-enhance ds-section">
        <div className="ds-container dsc-home-ai-matching-grid">
          <div className="dsc-home-ai-matching-content">
            <p className="dsc-home-ai-matching-eyebrow">AI-Powered Matching</p>
            <h2 className="dsc-home-ai-matching-title">Smart Sourcing, Zero Guesswork</h2>
            <p className="dsc-home-ai-matching-desc">
              Describe what you need in plain language. Our AI analyzes your
              requirements against our database of 1,000+ products and 50+
              factories to find the perfect matches.
            </p>
            <div className="dsc-home-ai-matching-stats">
              {aiMatchingStats.map(({ v, l }) => (
                <div key={l} className="dsc-home-ai-matching-stat">
                  <p className="dsc-home-ai-matching-stat__value">{v}</p>
                  <p className="dsc-home-ai-matching-stat__label">{l}</p>
                </div>
              ))}
            </div>
            {/* <Link to="/hardware-gallery" className="dsc-home-ai-matching-cta">
              Try AI Sourcing <ArrowRightOutlined />
            </Link> */}
          </div>
          <div className="dsc-home-ai-matching-visual">
            <img
              src="/figma/home/263-1687.png"
              alt="AI-Powered Sourcing"
              width="1702"
              height="1190"
              loading="eager"
              className="dsc-home-ai-matching-visual__image"
            />
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="dsc-quality-section section-enhance ds-section">
        <div className="ds-container">
          <div className="dsc-home-quality-panel">
            <div className="dsc-home-quality-visual">
              <img
                src="/figma/source/e4a739bbebb6d30cd0a3a833c76af46bbd67bd0c.png"
                alt="Quality You Can Trust"
                width="1488"
                height="848"
                loading="eager"
                className="dsc-home-quality-visual__image"
              />
            </div>
            <div className="dsc-home-quality-content">
              <p className="dsc-home-quality-eyebrow">Verified Factories</p>
              <h2 className="dsc-home-quality-title">Quality You Can Trust</h2>
              <p className="dsc-home-quality-desc">
                Every product on DS Cannabiz comes from audited, certified
                manufacturers. We maintain rigorous quality standards from raw
                materials to final packaging.
              </p>
              <ul className="dsc-home-quality-features">
                {manufacturingPoints.map((point) => (
                  <li key={point}>
                    <CheckCircleFilled className="dsc-home-quality-features__icon" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="dsc-about-network-section section-enhance relative overflow-hidden rounded-b-[44px] bg-black text-center">
        <div className="dsc-about-network-section__inner">
          <header className="dsc-about-network-copy">
            <span className="dsc-about-network-eyebrow">About DS Cannabiz</span>
            <h2 className="dsc-about-network-title">
              <span className="dsc-about-network-title__line">
                Bridging Cannabis Brands with China&apos;s
              </span>
              <span className="dsc-about-network-title__line">
                Best Manufacturers
              </span>
            </h2>
            <p className="dsc-about-network-desc dsc-about-network-desc--primary">
              DS Cannabiz is a B2B platform that connects cannabis brands
              worldwide with verified Chinese manufacturers. We leverage AI
              technology and 3D visualization tools to make your sourcing
              transparent, efficient, and customizable.
            </p>
            <p className="dsc-about-network-desc dsc-about-network-desc--secondary">
              Our mission is to eliminate the friction in cross-border hardware,
              packaging & merchandise procurement — from product discovery and CMF
              customization to quality assurance and logistics. Whether you&apos;re a
              startup brand or an established distributor, DS Cannabiz provides
              the tools and networks you need to bring your products to market
              faster.
            </p>
          </header>

          <div className="dsc-about-network-stage" aria-hidden="true">
            <img
              src="/figma/home/about-network.svg"
              alt=""
              width={2213}
              height={680}
              loading="lazy"
              decoding="async"
              className="dsc-about-network-stage__svg"
            />
          </div>

          <div className="dsc-about-network-stats">
            {aboutNetworkStats.map(({ value, label }) => (
              <div key={label} className="dsc-about-network-stat">
                <p className="dsc-about-network-stat__value">{value}</p>
                <p className="dsc-about-network-stat__label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dsc-source-section section-enhance">
        <div className="dsc-source-section__inner">
          <div className="dsc-source-section__content">
            <h2 className="dsc-source-section__title">Ready to Source Smarter?</h2>
            <p className="dsc-source-section__desc">
              Join hundreds of brands who trust DS for their needs.
              <br />
              Get started with a free consultation today.
            </p>
            <div className="dsc-source-section__actions">
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("open-sales-chat"))
                }
                className="dsc-source-section__cta dsc-source-section__cta--sales"
              >
                Talk To Sales
                <ArrowRightOutlined aria-hidden="true" />
              </button>
              <Link
                to="/hardware-gallery"
                className="dsc-source-section__cta dsc-source-section__cta--browse"
              >
                Browse Products
              </Link>
            </div>
          </div>
          <div className="dsc-source-section__logos" aria-label="Partner brands">
            <div className="dsc-source-section__logos-track">
              {partnerLogos.map((logo) => (
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  loading="lazy"
                  className="dsc-source-section__logo"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
