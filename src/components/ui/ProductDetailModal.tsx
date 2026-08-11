import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons'
import type { Product } from '../../data/products'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'

interface Props {
  product: Product | null
  onClose: () => void
}

const TAG_COLORS: Record<string, string> = {
  'screen/digital display': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'preheat': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'voltage adjustable': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'postless': 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'special shape': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'multiple activation': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'high viscosity': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'full ceramic': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'window custom': 'bg-green-500/15 text-green-400 border-green-500/20',
  'big volumn': 'bg-red-500/15 text-red-400 border-red-500/20',
}

const specs = [
  { key: 'category', label: 'Product Type' },
  { key: 'shape', label: 'Housing Material' },
  { key: 'dimensions', label: 'Dimensions' },
  { key: 'weight', label: 'Net Weight' },
  { key: 'tankVolume', label: 'Oil Chamber Capacity' },
  { key: 'activation', label: 'Operation Mode' },
  { key: 'voltage', label: 'Output Voltage' },
  { key: 'preheat', label: 'Preheat Function' },
  { key: 'batteryCapacity', label: 'Battery Capacity' },
  { key: 'compatibleOil', label: 'Compatible Material' },
  { key: 'moq', label: 'MOQ' },
  { key: 'stock', label: 'Generic Stock' },
] as const

const showDashboardToast = () => {
  const avatar = document.querySelector('[data-dashboard-avatar]') as HTMLElement | null
  const toast = document.createElement('div')
  toast.textContent = 'Added to My Dashboard'
  toast.style.cssText = 'position:fixed;right:24px;top:88px;z-index:9999;background:#26f6c8;color:#000;padding:10px 14px;border-radius:12px;font:600 13px Sora,system-ui;box-shadow:0 12px 30px rgba(0,0,0,.28);opacity:0;transform:translateY(-8px);transition:opacity .18s ease,transform .18s ease'
  document.body.appendChild(toast)
  avatar?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' })
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  })
  window.setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-8px)'
    window.setTimeout(() => toast.remove(), 220)
  }, 4000)
}

const animateFavorite = (source?: HTMLImageElement | null) => {
  const avatar = document.querySelector('[data-dashboard-avatar]') as HTMLElement | null
  if (!source || !avatar) { showDashboardToast(); return }
  const from = source.getBoundingClientRect()
  const to = avatar.getBoundingClientRect()
  const clone = source.cloneNode(true) as HTMLImageElement
  clone.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;object-fit:contain;z-index:9998;pointer-events:none;border-radius:16px;`
  document.body.appendChild(clone)
  clone.animate([
    { transform: 'translate3d(0,0,0) scale(1)', opacity: .9 },
    { transform: `translate3d(${to.left + to.width / 2 - from.left - from.width / 2}px,${to.top + to.height / 2 - from.top - from.height / 2}px,0) scale(.12)`, opacity: .2 },
  ], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' }).finished.finally(() => clone.remove())
  avatar.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' })
  showDashboardToast()
}

const openSalesRequest = (product: Product, requestType: 'quote' | 'sample') => {
  const message = requestType === 'quote'
    ? `I would like a quote for ${product.id}.`
    : `I would like to order a sample of ${product.id}.`
  window.dispatchEvent(new CustomEvent('open-sales-chat', {
    detail: { message, productId: product.id, requestType },
  }))
}

export default function ProductDetailModal({ product, onClose }: Props) {
  const [imgIdx, setImgIdx] = useState(0)
  const [liked, setLiked] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!product || !user || !product.dbId) { setLiked(false); return }
    supabase.from('favorites').select('product_id').eq('user_id', user.id).eq('product_id', product.dbId).maybeSingle().then(({ data }) => setLiked(Boolean(data)))
  }, [product, user])

  if (!product) return null

  const prevImg = () => setImgIdx((i) => (i - 1 + product.images.length) % product.images.length)
  const nextImg = () => setImgIdx((i) => (i + 1) % product.images.length)
  const toggleFavorite = async (source?: HTMLImageElement | null) => {
    if (!user) { location.assign('/sign-in'); return }
    if (!product.dbId) return
    if (liked) await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product.dbId)
    else await supabase.from('favorites').insert({ user_id: user.id, product_id: product.dbId })
    setLiked(!liked)
    if (!liked) animateFavorite(source)
  }

  return createPortal((
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        role="dialog"
        data-product-detail-dialog
        aria-modal="true"
        aria-label={`${product.id} product details`}
        className="relative z-10 w-full max-w-[1470px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2A2A2A] bg-[#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        >
          <CloseOutlined className="text-sm" />
        </button>

        <div className="grid gap-0 md:grid-cols-[1.2fr_.9fr]">
          {/* Left — Image gallery */}
          <div className="space-y-5 p-9">
            {/* Main image */}
            <div className="group relative aspect-square overflow-hidden rounded-xl bg-[#242427]">
              <img
                data-modal-product-image
                key={imgIdx}
                src={product.images[imgIdx]}
                alt={`${product.id} view ${imgIdx + 1}`}
                className="w-full h-full object-contain p-6"
              onError={(e) => {
                  const image = e.currentTarget as HTMLImageElement
                  const catalogFallback = `/catalog/${product.id}.png`
                  if (!image.src.endsWith(catalogFallback)) {
                    image.src = catalogFallback
                    return
                  }
                  image.style.display = 'none'
              }}
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <LeftOutlined className="text-xs" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <RightOutlined className="text-xs" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === imgIdx ? 'border-primary' : 'border-transparent'
                    } bg-[#0D0D0D]`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="space-y-6 p-9">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted uppercase tracking-widest">{product.category}</span>
                <div className="flex items-center gap-1.5">
                  {product.stock === 'US' && (
                    <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium">
                      US Stock
                    </span>
                  )}
                  <span className="text-[10px] text-muted">{product.priceLevel}</span>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white">{product.id}</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/hardware-gallery/${product.id}`)}
                  className="flex items-center gap-1.5 text-[10px] text-muted hover:text-white transition-colors"
                >
                  <ShareAltOutlined /> Share
                </button>
                <button data-favorite-product onClick={(event) => void toggleFavorite(event.currentTarget.closest('[role="dialog"]')?.querySelector('[data-modal-product-image]') as HTMLImageElement | null)} className="flex items-center gap-1.5 text-[10px] text-muted hover:text-white transition-colors">
                  {liked ? <HeartFilled className="text-primary" /> : <HeartOutlined />} Favorite
                </button>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 text-[10px] rounded-lg border font-medium ${TAG_COLORS[tag] ?? 'bg-white/10 text-white/60 border-white/10'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button data-request-quote type="button" onClick={() => openSalesRequest(product, 'quote')} className="btn-primary h-12">▣ &nbsp; Request Quote</button>
              <button data-order-sample type="button" onClick={() => openSalesRequest(product, 'sample')} className="h-12 rounded-md bg-white font-semibold text-black">Order Sample</button>
            </div>

            {/* Specs */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Specifications</h3>
              <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
                {specs.map(({ key, label }, i) => {
                  const val = product[key as keyof Product]
                  if (!val || val === 'N/A') return null
                  return (
                    <div
                      key={key}
                      className={`grid grid-cols-2 text-xs ${i % 2 === 0 ? 'bg-[#0D0D0D]' : 'bg-[#111]'}`}
                    >
                      <span className="px-3 py-2 text-muted font-medium">{label}</span>
                      <span className="px-3 py-2 text-white">{String(val)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  ), document.body)
}
