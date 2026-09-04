import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../data/products'

type SpecMap = Record<string, unknown>
const pick = (specs: SpecMap, prefix: string, fallback = '') => String(Object.entries(specs).find(([key]) => key.startsWith(prefix))?.[1] ?? fallback)
const canonicalSku = (sku: string) => sku === 'DS-C-334' ? 'DS-C-312' : sku
const normalizeTag = (tag: string) => (tag === 'big volumn' ? 'big volume' : tag)

let catalogCache: { products: Product[] } | null = null
let catalogPromise: Promise<Product[]> | null = null

async function fetchCatalog(fallback: Product[]): Promise<Product[]> {
  const fallbackById = new Map(fallback.map(product => [product.id, product]))
  const { data, error } = await supabase.from('products').select('id,sku,specifications,stock_status,created_at,categories(name),product_images(url,is_primary,sort_order),product_tags(tag)').eq('active', true)
  if (error || !data?.length) return fallback

  const remoteProducts = data.map(row => {
    const specs = (row.specifications ?? {}) as SpecMap
    const images = (row.product_images ?? [])
      .sort((a,b) => Number(b.is_primary)-Number(a.is_primary) || a.sort_order-b.sort_order)
      .map(item => item.url)
    const id = canonicalSku(row.sku)
    const fallbackProduct = fallbackById.get(id)
    return {
      dbId: row.id,
      id,
      category: row.categories?.name ?? pick(specs, 'Category'),
      shape: pick(specs, 'Shape'),
      dimensions: pick(specs, 'Dimension'),
      weight: pick(specs, 'Weight'),
      tankVolume: pick(specs, 'Tank Volumn'),
      activation: pick(specs, 'Activation'),
      voltage: pick(specs, 'Voltage Output'),
      preheat: pick(specs, 'Preheat'),
      batteryCapacity: pick(specs, 'Battery Capacity'),
      charging: pick(specs, 'Charging'),
      display: pick(specs, 'Digital Display'),
      compatibleOil: pick(specs, 'Compatible Oil Type'),
      stock: String(row.stock_status ?? '').toUpperCase(),
      priceLevel: pick(specs, 'Price Level'),
      moq: pick(specs, 'MOQ', 'Contact for MOQ'),
      tags: (row.product_tags ?? []).map(item => normalizeTag(item.tag)),
      images: images.length ? images : [`/catalog/${id}.png`],
      featured: fallbackProduct?.featured ?? false,
      popularity: fallbackProduct?.popularity,
      createdAt: row.created_at ?? fallbackProduct?.createdAt,
    } satisfies Product
  })
  const uniqueRemote = [...new Map(remoteProducts.map(product => [product.id, product])).values()]
  const remoteIds = new Set(uniqueRemote.map(product => product.id))
  return [...uniqueRemote, ...fallback.filter(product => !remoteIds.has(product.id)).map(product => ({
    ...product,
    tags: product.tags.map(normalizeTag),
  }))]
}

export function useCatalog(fallback: Product[]) {
  const [products, setProducts] = useState<Product[]>(() => catalogCache?.products ?? fallback)
  const [loading, setLoading] = useState(() => !catalogCache)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (catalogCache) {
        setProducts(catalogCache.products)
        setLoading(false)
        return
      }

      if (!catalogPromise) {
        catalogPromise = fetchCatalog(fallback)
      }

      try {
        const next = await catalogPromise
        catalogCache = { products: next }
        if (!cancelled) {
          setProducts(next)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setProducts(fallback)
          setLoading(false)
        }
      } finally {
        if (catalogCache) catalogPromise = null
      }
    })()

    return () => { cancelled = true }
  }, [fallback])

  return { products, loading }
}
