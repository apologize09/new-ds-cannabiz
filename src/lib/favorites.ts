import { supabase } from './supabase'

type FavoritesCache = {
  userId: string
  ids: Set<string>
  promise?: Promise<Set<string>>
}

let cache: FavoritesCache | null = null

export async function loadFavoriteIds(userId: string): Promise<Set<string>> {
  if (cache?.userId === userId && !cache.promise) return cache.ids
  if (cache?.userId === userId && cache.promise) return cache.promise

  const promise = supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
    .then(({ data, error }) => {
      const ids = new Set((data ?? []).map((row) => row.product_id))
      if (!error) cache = { userId, ids }
      else if (cache?.userId === userId) cache = { userId, ids: cache.ids }
      return ids
    })

  cache = { userId, ids: cache?.userId === userId ? cache.ids : new Set(), promise }
  const ids = await promise
  if (cache?.userId === userId) cache = { userId, ids }
  return ids
}

export function isFavoriteCached(userId: string, productId: string): boolean | null {
  if (cache?.userId !== userId || cache.promise) return null
  return cache.ids.has(productId)
}

export function setFavoriteCached(userId: string, productId: string, liked: boolean) {
  if (cache?.userId !== userId) {
    cache = { userId, ids: new Set() }
  }
  if (liked) cache.ids.add(productId)
  else cache.ids.delete(productId)
}

export function clearFavoritesCache() {
  cache = null
}
