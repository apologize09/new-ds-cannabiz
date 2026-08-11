import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../data/products'

type SpecMap = Record<string, unknown>
const pick = (specs: SpecMap, prefix: string, fallback = '') => String(Object.entries(specs).find(([key]) => key.startsWith(prefix))?.[1] ?? fallback)
const canonicalSku = (sku: string) => sku === 'DS-C-334' ? 'DS-C-312' : sku

export function useCatalog(fallback: Product[]) {
  const [products, setProducts] = useState<Product[]>(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => { void (async () => {
    const { data, error } = await supabase.from('products').select('id,sku,specifications,stock_status,categories(name),product_images(url,is_primary,sort_order),product_tags(tag)').eq('active', true)
    if (!error && data?.length) {
      const remoteProducts = data.map(row => {
      const specs = (row.specifications ?? {}) as SpecMap
      const images = (row.product_images ?? [])
        .sort((a,b) => Number(b.is_primary)-Number(a.is_primary) || a.sort_order-b.sort_order)
        .map(item => item.url)
      const id = canonicalSku(row.sku)
      return { dbId: row.id, id, category: row.categories?.name ?? pick(specs, 'Category'), shape: pick(specs, 'Shape'), dimensions: pick(specs, 'Dimension'), weight: pick(specs, 'Weight'), tankVolume: pick(specs, 'Tank Volumn'), activation: pick(specs, 'Activation'), voltage: pick(specs, 'Voltage Output'), preheat: pick(specs, 'Preheat'), batteryCapacity: pick(specs, 'Battery Capacity'), charging: pick(specs, 'Charging'), display: pick(specs, 'Digital Display'), compatibleOil: pick(specs, 'Compatible Oil Type'), stock: String(row.stock_status ?? '').toUpperCase(), priceLevel: pick(specs, 'Price Level'), moq: pick(specs, 'MOQ', 'Contact for MOQ'), tags: (row.product_tags ?? []).map(item => item.tag), images: images.length ? images : [`/catalog/${id}.png`] }
    })
      const uniqueRemote = [...new Map(remoteProducts.map(product => [product.id, product])).values()]
      const remoteIds = new Set(uniqueRemote.map(product => product.id))
      setProducts([...uniqueRemote, ...fallback.filter(product => !remoteIds.has(product.id))])
    }
    setLoading(false)
  })() }, [fallback])
  return { products, loading }
}
