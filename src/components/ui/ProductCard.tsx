import { useEffect, useState } from 'react'
import { HeartOutlined, HeartFilled, PlusOutlined } from '@ant-design/icons'
import type { Product } from '../../data/products'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'

interface Props {
  product: Product
  onCompare?: (id: string) => void
  compareSelected?: boolean
  onClick?: () => void
}

const TAG_COLORS: Record<string, string> = {
  'screen/digital display': 'bg-blue-500/15 text-blue-400',
  'preheat': 'bg-orange-500/15 text-orange-400',
  'voltage adjustable': 'bg-purple-500/15 text-purple-400',
  'postless': 'bg-teal-500/15 text-teal-400',
  'special shape': 'bg-pink-500/15 text-pink-400',
  'multiple activation': 'bg-yellow-500/15 text-yellow-400',
  'full screen': 'bg-blue-500/15 text-blue-400',
  'draw-activated': 'bg-green-500/15 text-green-400',
  'high viscosity': 'bg-amber-500/15 text-amber-400',
  'full ceramic': 'bg-cyan-500/15 text-cyan-400',
}

const showDashboardToast = () => {
  const toast = document.createElement('div')
  toast.textContent = 'Added to My Dashboard'
  toast.style.cssText = 'position:fixed;right:24px;top:88px;z-index:9999;background:#26f6c8;color:#000;padding:10px 14px;border-radius:12px;font:600 13px Sora,system-ui;box-shadow:0 12px 30px rgba(0,0,0,.28);opacity:0;transform:translateY(-8px);transition:opacity .18s ease,transform .18s ease'
  document.body.appendChild(toast)
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
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
    { transform: `translate3d(${to.left + to.width / 2 - from.left - from.width / 2}px,${to.top + to.height / 2 - from.top - from.height / 2}px,0) scale(.12)`, opacity: 0 },
  ], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' }).finished.finally(() => clone.remove())
  avatar.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' })
  showDashboardToast()
}

export default function ProductCard({ product, onCompare, compareSelected, onClick }: Props) {
  const [liked, setLiked] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const { user } = useAuth()
  useEffect(() => {
    if (!user || !product.dbId) { setLiked(false); return }
    supabase.from('favorites').select('product_id').eq('user_id', user.id).eq('product_id', product.dbId).maybeSingle().then(({ data }) => setLiked(Boolean(data)))
  }, [user, product.dbId])

  async function toggleFavorite(source?: HTMLImageElement | null) {
    if (!user) { location.assign('/sign-in'); return }
    if (!product.dbId) return
    if (liked) await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product.dbId)
    else await supabase.from('favorites').insert({ user_id: user.id, product_id: product.dbId })
    setLiked(!liked)
    if (!liked) animateFavorite(source)
  }

  return (
    <div
      data-product-card={product.id}
      className="product-card group cursor-pointer overflow-hidden rounded-xl border border-border bg-card card-hover"
      onClick={onClick}
    >
      <div className="product-card-media relative aspect-square overflow-hidden">
        <img
          data-product-image
          src={product.images[imgIdx]}
          alt={product.id}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
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
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {product.images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-primary' : 'bg-white/30'}`}
              />
            ))}
          </div>
        )}

        <button
          aria-label={`Add ${product.id} to favorites`}
          data-favorite-product={product.id}
          onClick={(e) => { e.stopPropagation(); void toggleFavorite(e.currentTarget.parentElement?.querySelector('[data-product-image]') as HTMLImageElement | null) }}
          className="absolute top-3 right-3 text-lg transition-colors"
        >
          {liked
            ? <HeartFilled className="text-primary" />
            : <HeartOutlined className="product-card-icon-muted" />}
        </button>

        {onCompare && (
          <button
            aria-label={`Add ${product.id} to compare`}
            data-compare-product={product.id}
            onClick={(e) => { e.stopPropagation(); onCompare(product.id) }}
            className={`absolute top-3 left-3 w-6 h-6 rounded border flex items-center justify-center transition-colors ${
              compareSelected
                ? 'border-primary bg-primary text-black'
                : 'product-card-compare-idle hover:border-primary'
            }`}
          >
            <PlusOutlined className="text-xs" />
          </button>
        )}
      </div>

      <div className="min-h-[162px] space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="product-card-category truncate text-[10px] uppercase tracking-[1px]">{product.category.split(' ').slice(0,3).join(' ')}</p>
            <h3 className="product-card-title mt-1 truncate font-['Sora'] text-base font-semibold">{product.id}</h3>
          </div>
          {product.stock === 'US' && (
            <span className="text-[8px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap">
              US Stock
            </span>
          )}
        </div>

        <div className="flex flex-nowrap items-center gap-1.5">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={`product-card-tag shrink-0 whitespace-nowrap rounded px-2 py-1 text-[10px] font-medium leading-none ${TAG_COLORS[tag] ?? ''}`}
            >
              {tag}
            </span>
          ))}
          {product.tags.length > 2 && (
            <span className="product-card-tag shrink-0 whitespace-nowrap rounded px-2 py-1 text-[10px] font-medium leading-none">
              +{product.tags.length - 2}
            </span>
          )}
        </div>

        <div className="product-card-spec grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] leading-4">
          <span className="truncate">🔋 {product.batteryCapacity}</span>
          <span className="truncate">💧 {product.tankVolume}</span>
          <span className="truncate">⚡ {product.voltage}</span>
          <span className="truncate">📱 {product.display}</span>
        </div>
      </div>
    </div>
  )
}
