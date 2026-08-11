import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  SearchOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
} from "@ant-design/icons";
import BrandMark from "../components/ui/BrandMark";
import { products as fallbackProducts } from "../data/products";
import { useCatalog } from "../hooks/useCatalog";
import { fuzzyScore, productSearchScore } from "../lib/search";
import { merchandiseTemplates, packagingTemplates, type ProductCustomTemplate } from "../data/productCustomTemplates";
import type { Product } from "../data/products";
import {
  Globe2,
  Link2,
  ShoppingCart,
  ShieldCheck,
  Package,
} from "lucide-react";

const stats = [
  { value: "50+", label: "Verified Factories" },
  { value: "500+", label: "SKU Options" },
  { value: "30+", label: "States Served" },
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
    featured: true,
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
    name: "Pink Gelato",
    src: "/brand-logos/pink-gelato.svg",
    width: 97,
    height: 57,
  },
  {
    name: "Partner brand",
    src: "/brand-logos/brand-mark-02.svg",
    width: 237,
    height: 38,
  },
  { name: "Kadobar", src: "/brand-logos/kadobar.svg", width: 230, height: 43 },
  {
    name: "Flum Mello",
    src: "/brand-logos/flum-mello.svg",
    width: 93,
    height: 44,
  },
  {
    name: "Partner brand",
    src: "/brand-logos/brand-mark-05.svg",
    width: 75,
    height: 51,
  },
  {
    name: "Partner brand",
    src: "/brand-logos/brand-logo-06.svg",
    width: 166,
    height: 32,
  },
];

const searchModes = [
  {
    label: "Vape Hardware Search",
    placeholder: "Search disposable vapes, cartridges, pods and dab hardware",
    route: (query: string) => `/hardware-gallery?q=${encodeURIComponent(query)}`,
  },
  {
    label: "Packaging Design",
    placeholder: "Describe your packaging design needs... e.g. 'Paper gift box for disposable vape'",
    route: (query: string) => `/product-custom/packaging?q=${encodeURIComponent(query)}`,
  },
  {
    label: "CR Packaging Search",
    placeholder: "Describe your CR packaging needs... e.g. 'Child resistant paper box for cartridge'",
    route: (query: string) => `/product-custom/packaging?q=${encodeURIComponent(query)}&type=cr`,
  },
  {
    label: "Similar Image Search",
    placeholder: "Select a file or drag and drop files here",
    route: null,
  },
  {
    label: "Merchandise Design",
    placeholder: "e.g. 'Hoodies with logo printing'",
    route: (query: string) => `/product-custom/merchandise?q=${encodeURIComponent(query)}`,
  },
] as const;

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
          <div className="dsc-hero-pill hero-enhance inline-flex items-center gap-2 bg-card border border-border text-muted text-xs px-3 py-1.5 rounded-full">
            <ThunderboltOutlined className="text-primary" /> B2B One Stop
            Purchasing Platform
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
          <div className="hero-enhance grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-16 sm:gap-y-4">
            {searchModes.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => {
                  setSearchMode(item);
                  if (item.label === "Similar Image Search") setImageSearchOpen(true);
                }}
                aria-pressed={searchMode.label === item.label}
                className={`dsc-search-mode-button rounded-full border px-3 py-2 text-[10px] transition-colors sm:py-1 ${searchMode.label === item.label ? "border-primary bg-primary text-black" : "border-primary/25 bg-black/50 text-primary"}`}
              >
                <SearchOutlined className="mr-1" />
                {item.label}
              </button>
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
                <p className="text-2xl font-bold text-white">{value}</p>
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
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              Product Library
            </p>
            <h2 className="text-3xl font-bold text-white">
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
                  data-home-category-card={cat.featured ? "featured" : "default"}
                  className={`flex min-h-[310px] flex-col overflow-hidden rounded-2xl border p-5 text-center ${cat.featured ? "border-primary/50 bg-[#102f27]" : "border-border bg-card"}`}
                >
                  <p
                    className={`text-sm font-semibold ${cat.featured ? "text-white" : "text-white"}`}
                  >
                    {cat.name}
                  </p>
                  <p className={`mx-auto mt-2 min-h-[34px] max-w-[160px] text-[10px] leading-relaxed ${cat.featured ? "text-white/75" : "text-muted"}`}>
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
                  {cat.featured && (
                    <span className="mt-2 rounded-lg bg-primary py-2 text-xs font-semibold text-black">
                      Explore Now →
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="dsc-home-capabilities section-enhance ds-section">
        <div className="ds-container">
          <div className="text-center mb-12">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
              Platform Capabilities
            </p>
            <h2 className="text-3xl font-bold text-white">
              Everything You Need in One Place
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {features.map((item) => (
              <div key={item.title}>
                <Link
                  to={item.href}
                  data-capability-card={item.light ? "mint" : "dark"}
                  className={`group grid min-h-[250px] grid-cols-1 overflow-hidden rounded-2xl border p-6 card-hover sm:min-h-[280px] sm:grid-cols-[0.9fr_1.1fr] sm:p-7 ${item.light ? "border-primary/40 bg-primary text-black" : "border-border bg-card text-white"}`}
                >
                  <div
                    className={`flex flex-col justify-start ${item.imageSide === "left" ? "order-2 sm:pl-4" : "order-1 sm:pr-4"}`}
                  >
                    <h3 className="mb-6 text-base font-bold leading-tight sm:text-lg">
                      {item.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed sm:text-sm ${item.light ? "text-black/70" : "text-primary"}`}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <div
                    className={`${item.imageSide === "left" ? "order-1" : "order-2"} flex items-center justify-center`}
                  >
                    <img
                      src={item.image}
                      alt=""
                      width="510"
                      height="510"
                      loading="eager"
                      className="max-h-[210px] w-full object-contain"
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="section-enhance ds-section">
        <div className="ds-container grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2">
          <div className="order-2 flex flex-col justify-center space-y-5 p-6 sm:p-10 md:order-2">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest">
              3D Packaging Customization
            </p>
            <h2 className="text-3xl font-bold text-white">
              Design Your Product Online
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              With our 3D packaging design tool, you can customize the colors,
              materials and patterns of any packaging in the template. You can
              preview your design effects in real time before placing an order.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/product-custom/packaging" className="btn-primary">
                Try Customization
              </Link>
              <Link to="/plans" className="btn-ghost">
                Plans
              </Link>
            </div>
          </div>
          <div className="order-1 flex min-h-[320px] flex-col items-center justify-center overflow-hidden bg-[#111] p-4 sm:min-h-[470px] sm:p-6">
            <div className="relative aspect-[1.78/1] w-full overflow-hidden rounded-2xl bg-[#eef2f1]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={packagingPreview}
                  className="absolute inset-0"
                  initial={reducedMotion ? false : { opacity: 0, x: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: -8, filter: "blur(3px)" }}
                  transition={{ type: "spring", duration: reducedMotion ? 0 : 0.42, bounce: 0 }}
                >
                  {packagingPreview === "mockup" && <img src="/figma/home/263-1878.png" alt="Packaging mockup preview" className="absolute inset-x-0 top-0 w-full max-w-none" style={{ clipPath: "inset(0 0 14% 0)" }} />}
                  {packagingPreview === "dieline" && <img src="/figma-local/截屏2026-06-29 20.19.38 1.png" alt="Packaging dieline preview" className="h-full w-full object-contain p-6 sm:p-10" />}
                  {packagingPreview === "video" && <div className="grid h-full grid-cols-2 bg-[#f5f5f5]"><img src="/figma-local/Video-3.png" alt="Packaging animation front view" className="h-full w-full object-contain p-5"/><img src="/figma-local/Video-2.png" alt="Packaging animation perspective view" className="h-full w-full object-contain p-5"/></div>}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative mt-5 grid w-full max-w-[730px] grid-cols-4 rounded-full bg-white p-1 text-sm text-[#333] sm:text-base" role="tablist" aria-label="Packaging preview">
              {(["mockup", "dieline", "video"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={packagingPreview === tab} onClick={() => setPackagingPreview(tab)} className={`relative z-10 rounded-full px-2 py-2 capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${packagingPreview === tab ? "text-black" : "text-[#333]"}`}>{packagingPreview === tab && <motion.span layoutId="packaging-preview-pill" className="absolute inset-0 -z-10 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}{tab}</button>)}
              <button type="button" onClick={() => void sharePackagingTool()} className="rounded-full px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Share</button>
            </div>
          </div>
        </div>
      </section>

      <section data-gsap-reveal className="dsc-ai-matching-section section-enhance ds-section bg-black">
        <div className="ds-container grid min-h-[680px] items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-5">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest">
              AI-Powered Matching
            </p>
            <h2 className="text-3xl font-bold text-white">
              Smart Sourcing, Zero Guesswork
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Describe what you need in plain language. Our AI analyzes your
              requirements against our database of 1,000+ products and 50+
              factories to find the perfect matches.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { v: "< 30s", l: "Match Time" },
                { v: "95%", l: "Accuracy Rate" },
                { v: "3-5", l: "Options Per Query" },
                { v: "24/7", l: "Always Available" },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="bg-card border border-border rounded-xl p-4 text-center"
                >
                  <p className="text-2xl font-bold text-white">{v}</p>
                  <p className="text-xs text-muted mt-1">{l}</p>
                </div>
              ))}
            </div>
            <Link
              to="/hardware-gallery"
              className="btn-primary inline-flex items-center gap-2"
            >
              Try AI Sourcing <ArrowRightOutlined />
            </Link>
          </div>
          <div className="flex min-h-[500px] items-center justify-center overflow-hidden">
            <img
              src="/figma/home/263-1687.png"
              alt="AI-Powered Sourcing"
              width="1702"
              height="1190"
              loading="eager"
              className="w-full object-contain"
            />
          </div>
        </div>
      </section>

      <section className="dsc-quality-section section-enhance bg-black px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid min-h-[770px] max-w-[1555px] items-center gap-8 rounded-3xl bg-card p-5 sm:p-12 md:grid-cols-2 md:gap-12">
          <div className="relative min-h-[424px] overflow-hidden rounded-xl bg-[#111]">
            <img
              src="/figma/source/e4a739bbebb6d30cd0a3a833c76af46bbd67bd0c.png"
              alt="Quality You Can Trust"
              width="1488"
              height="848"
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          </div>
          <div className="space-y-5">
            <p className="text-primary text-xs font-semibold uppercase tracking-widest">
              Verified Factories
            </p>
            <h2 className="text-3xl font-bold text-white">
              Quality You Can Trust
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Every product on DS Cannabiz comes from audited, certified
              manufacturers. We maintain rigorous quality standards from raw
              materials to final packaging.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {manufacturingPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-xs text-gray-300"
                >
                  <CheckCircleFilled className="mt-0.5 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="dsc-about-network-section section-enhance relative mx-auto min-h-[860px] w-[calc(100%-40px)] max-w-[1555px] overflow-hidden rounded-b-[44px] bg-black pt-16 text-center sm:min-h-[980px] sm:pt-20">
        <div className="relative z-10 mx-auto max-w-[1400px] space-y-7 px-5">
          <p className="text-sm text-primary sm:text-base">About DS Cannabiz</p>
          <h2 className="font-['Unbounded'] text-[30px] font-semibold leading-[1.22] text-white sm:text-[48px]">
            Bridging Cannabis Brands with China's
            <br className="hidden sm:block" /> Best Manufacturers
          </h2>
          <p className="mx-auto max-w-[900px] text-sm leading-[1.55] text-muted sm:text-base">
            DS Cannabiz is a B2B platform that connects cannabis brands
            worldwide with verified Chinese manufacturers. We leverage AI
            technology and 3D visualization tools to make your sourcing
            transparent, efficient, and customizable.
          </p>
          <p className="mx-auto max-w-[960px] text-sm leading-[1.55] text-muted sm:text-base">
            Our mission is to eliminate the friction in cross-border hardware,
            packaging & merchandise procurement — from product discovery and CMF
            customization to quality assurance and logistics. Whether you're a
            startup brand or an established distributor, DS Cannabiz provides
            the tools and networks you need to bring your products to market
            faster.
          </p>
        </div>
        <svg
          className="pointer-events-none absolute left-0 top-[330px] hidden h-[470px] w-full sm:block"
          viewBox="0 0 1555 470"
          fill="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <>
              <path
                key={`l${index}`}
                d={`M0 ${55 + index * 44} C230 ${270 + index * 14}, 470 ${325 + index * 8}, 777 300`}
                stroke="#16d9c2"
                strokeWidth="2"
                strokeOpacity={0.34 + index * 0.07}
              />
              <path
                key={`r${index}`}
                d={`M1555 ${55 + index * 44} C1325 ${270 + index * 14}, 1085 ${325 + index * 8}, 777 300`}
                stroke="#16d9c2"
                strokeWidth="2"
                strokeOpacity={0.34 + index * 0.07}
              />
            </>
          ))}
        </svg>
        <div className="absolute left-[7%] top-[430px] z-10 hidden h-20 w-20 place-items-center rounded-full bg-[#22dbc8] text-white sm:grid">
          <Globe2 size={46} />
        </div>
        <div className="absolute right-[7%] top-[430px] z-10 hidden h-20 w-20 place-items-center rounded-full bg-[#22dbc8] text-white sm:grid">
          <Link2 size={44} />
        </div>
        <div className="absolute left-[15%] top-[610px] z-10 hidden h-20 w-20 place-items-center rounded-full bg-[#22dbc8] text-3xl font-bold text-white sm:grid">
          3D
        </div>
        <div className="absolute right-[14%] top-[625px] z-10 hidden h-14 w-14 place-items-center rounded-full bg-[#22dbc8] text-white sm:grid">
          <Package size={30} />
        </div>
        <div className="absolute bottom-[150px] left-[3%] z-10 hidden h-16 w-16 place-items-center rounded-full bg-[#22dbc8] text-white sm:grid">
          <ShoppingCart size={34} />
        </div>
        <div className="absolute bottom-[200px] right-[3%] z-10 hidden h-16 w-16 place-items-center rounded-full bg-[#22dbc8] text-white sm:grid">
          <ShieldCheck size={34} />
        </div>
        <div className="absolute left-1/2 top-[565px] z-10 grid h-[130px] w-[130px] -translate-x-1/2 place-items-center rounded-[28px] bg-white sm:top-[590px]">
          <BrandMark className="h-[92px] w-[92px]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-0 h-[250px] rounded-b-[44px] bg-black" />
        <div className="absolute inset-x-0 bottom-[105px] z-10 mx-auto grid max-w-[1150px] grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {[
            { v: "2017", l: "Founded" },
            { v: "50+", l: "Factory Partners" },
            { v: "20+", l: "Countries" },
            { v: "100+", l: "Brands Served" },
          ].map(({ v, l }) => (
            <div key={l}>
              <p className="text-2xl font-bold text-white sm:text-3xl">{v}</p>
              <p className="mx-auto mt-3 w-fit rounded-full border border-primary px-3 py-1 text-xs text-primary">
                {l}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="dsc-source-section section-enhance bg-primary px-4 py-14 text-black sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[1200px] space-y-10 text-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Source Smarter?
            </h2>
            <p className="mx-auto max-w-md text-sm text-black/70">
              Join hundreds of brands who trust DS for their needs.
              <br />
              Get started with a free consultation today.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new Event("open-sales-chat"))
                }
                className="dsc-source-cta-sales rounded-lg bg-black px-7 py-3 font-semibold text-white transition-colors hover:bg-gray-900"
              >
                Talk To Sales
              </button>
              <Link
                to="/hardware-gallery"
                className="dsc-source-cta-browse rounded-lg border border-black px-7 py-3 font-semibold text-black transition-colors hover:bg-black/10"
              >
                Browse Products
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-7">
            {partnerLogos.map((logo, index) => (
              <img
                key={`${logo.src}-${index}`}
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                loading="eager"
                className="dsc-partner-logo h-auto max-h-10 max-w-[140px] object-contain opacity-100 transition-opacity duration-300 hover:opacity-100"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
