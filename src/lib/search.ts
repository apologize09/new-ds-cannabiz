export const normalizeSearchText = (value: string | number | null | undefined) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[–—×*]/g, ' ')
    .replace(/([0-9])\s*ml\b/g, '$1 ml $1ml')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const aliasMap: Record<string, string[]> = {
  disposable: ['disposable', 'all in one', 'aio', 'ready to use', 'vape hardware'],
  aio: ['aio', 'all in one', 'disposable'],
  vape: ['vape', 'vaporizer', 'hardware'],
  vaporizer: ['vaporizer', 'vape', 'hardware'],
  '510': ['510', 'cart', 'cartridge', 'battery', 'thread', 'threaded'],
  cart: ['cart', 'cartridge', '510', 'battery'],
  cartridge: ['cartridge', 'cart', '510', 'threaded'],
  battery: ['battery', '510', 'cart'],
  pod: ['pod', 'pod system', 'magnetic pod', 'magnetic'],
  magnetic: ['magnetic', 'pod', 'pod system'],
  dab: ['dab', 'wax', 'concentrate', 'extract', 'extracts', 'rosin'],
  wax: ['wax', 'dab', 'concentrate', 'extract'],
  concentrate: ['concentrate', 'dab', 'wax', 'extract'],
  packaging: ['packaging', 'package', 'box', 'merchandise', 'custom'],
  merch: ['merch', 'merchandise', 'apparel', 'custom'],
  merchandise: ['merchandise', 'merch', 'apparel', 'custom'],
  preheat: ['preheat', 'heat', 'warmup'],
  screen: ['screen', 'display', 'digital display'],
  display: ['display', 'screen', 'digital display'],
  adjustable: ['adjustable', 'variable', 'voltage adjustable', 'variable voltage'],
  variable: ['variable', 'adjustable', 'variable voltage'],
  fixed: ['fixed', 'non adjustable'],
  button: ['button', 'push button'],
  mic: ['mic', 'draw', 'draw activated', 'auto draw'],
  draw: ['draw', 'mic', 'draw activated'],
  typec: ['type c', 'usb c', 'charging'],
  ceramic: ['ceramic', 'cottonless ceramic', 'full ceramic'],
  rosin: ['rosin', 'live rosin', 'extract', 'extracts'],
  resin: ['resin', 'live resin', 'extract', 'extracts'],
  distillate: ['distillate', 'oil'],
  viscosity: ['viscosity', 'high viscosity', 'thick oil'],
  dual: ['dual', 'dual chamber', 'dual coil'],
  multi: ['multi', 'multi chamber', 'flavor switching'],
}

const expandQueryTokens = (queryTokens: string[]) => {
  const expanded = new Set(queryTokens)
  for (const token of queryTokens) {
    aliasMap[token]?.forEach(alias => normalizeSearchText(alias).split(' ').forEach(part => expanded.add(part)))
  }
  return [...expanded].filter(Boolean)
}

const levenshtein = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 2) return 99
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  const curr = new Array(b.length + 1)
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev.splice(0, prev.length, ...curr)
  }
  return prev[b.length]
}

export function fuzzyScore(query: string, fields: Array<string | number | null | undefined>) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return 1

  const haystack = normalizeSearchText(fields.filter(Boolean).join(' '))
  if (!haystack) return 0
  if (haystack.includes(normalizedQuery)) return 100

  const queryTokens = expandQueryTokens(normalizedQuery.split(' ').filter(Boolean))
  const fieldTokens = haystack.split(' ').filter(Boolean)
  let score = 0

  for (const token of queryTokens) {
    if (fieldTokens.includes(token)) score += 24
    else if (fieldTokens.some((candidate) => candidate.includes(token) || token.includes(candidate))) score += 14
    else if (token.length > 3 && fieldTokens.some((candidate) => levenshtein(token, candidate) <= 1)) score += 8
  }

  return score / Math.max(1, queryTokens.length)
}

type ProductSearchLike = {
  id: string
  category: string
  shape?: string
  dimensions?: string
  weight?: string
  tankVolume?: string
  activation?: string
  voltage?: string
  preheat?: string
  batteryCapacity?: string
  charging?: string
  display?: string
  compatibleOil?: string
  stock?: string
  priceLevel?: string
  tags?: string[]
}

const parseVolumes = (value: string | number | null | undefined) => {
  const text = String(value ?? '').toLowerCase().replace(/,/g, '.')
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*m\s*l\b/g)]
  return matches.map((match) => Number(match[1])).filter(Number.isFinite)
}

const compactSearchText = (value: string | number | null | undefined) =>
  normalizeSearchText(value).replace(/\s+/g, '')

const hasFieldToken = (product: ProductSearchLike, pattern: RegExp) =>
  pattern.test(normalizeSearchText(productSearchFields(product).join(' ')))

export const productHasPreheat = (product: ProductSearchLike) => {
  const preheat = normalizeSearchText(product.preheat)
  const tags = (product.tags ?? []).map(normalizeSearchText)
  return ['y', 'yes', 'true'].includes(preheat) || tags.some((tag) => tag.includes('preheat'))
}

export const productKeywordRange = (product: ProductSearchLike) => {
  const volumes = parseVolumes(product.tankVolume)
  if (volumes.some((volume) => volume >= 0.5 && volume <= 1)) return '0.5-1.0mL 0.5–1.0 mL'
  if (volumes.some((volume) => volume >= 1.2 && volume <= 3)) return '1.2-3.0mL 1.2–3.0 mL'
  if (volumes.some((volume) => volume > 3)) return '>3.0mL greater than 3ml'
  return ''
}

export const productSearchFields = (product: ProductSearchLike) => [
  ...Object.entries(product as Record<string, unknown>).flatMap(([key, value]) => {
    if (key === 'images' || key === 'dbId') return []
    if (Array.isArray(value)) return value.filter((item) => typeof item === 'string')
    if (typeof value === 'string' || typeof value === 'number') return [value]
    return []
  }),
  productKeywordRange(product),
  productHasPreheat(product) ? 'preheat warmup heat' : '',
  compactSearchText(product.category).includes('510cartandbattery') ? '510 cart cartridge thread threaded universal battery' : '',
  compactSearchText(product.category).includes('podsystem') ? 'pod magnetic pod system vape vaporizer' : '',
  compactSearchText(product.category).includes('dabhardware') ? 'dab wax concentrate extracts live rosin' : '',
  compactSearchText(product.category).includes('allinone') ? 'all in one aio disposable ready to use vape hardware' : '',
  compactSearchText(product.category).includes('packaging') ? 'packaging merchandise package box custom' : '',
]

export const parseProductSearchIntent = (query: string) => {
  const normalized = normalizeSearchText(query)
  const compact = normalized.replace(/\s+/g, '')
  const wantsScreen = {
    full: /\bfull\s*screen\b/.test(normalized),
    half: /\bhalf\s*screen\b/.test(normalized),
    small: /\bsmall\s*screen\b/.test(normalized),
    none: /\b(no|without)\s*(screen|display)\b/.test(normalized),
    any: /\b(screen|display|digital)\b/.test(normalized),
  }
  return {
    normalized,
    volumes: parseVolumes(query),
    requiresPreheat: /\b(preheat|warmup|heat)\b/.test(normalized),
    requiresNoPreheat: /\b(no|without)\s*preheat\b/.test(normalized),
    requires510: /\b(510|cartridge|cart\b|thread|threaded)\b/.test(normalized),
    requiresPod: /\b(pod|pods|pod\s*system|magnetic\s*pod)\b/.test(normalized),
    requiresDab: /\b(dab|wax|concentrate|extract|extracts|rosin)\b/.test(normalized),
    requiresDisposable: compact.includes('disposable') || compact.includes('allinone') || /\baio\b/.test(normalized),
    requiresAdjustableVoltage: /\b(adjustable|variable)\s*(voltage)?\b/.test(normalized),
    requiresFixedVoltage: /\bfixed\s*(voltage)?\b/.test(normalized),
    requiresTypeC: /\b(type\s*c|usb\s*c|typec)\b/.test(normalized),
    requiresUSStock: /\b(us|usa|united states)\s*(stock|warehouse|inventory)\b/.test(normalized),
    requiresCNStock: /\b(china|cn)\s*(stock|warehouse|inventory)\b/.test(normalized),
    wantsScreen,
  }
}

const productMatchesVolume = (product: ProductSearchLike, wantedVolume: number) => {
  const volumes = parseVolumes(product.tankVolume)
  return volumes.some((volume) => Math.abs(volume - wantedVolume) < 0.001)
}

const productMatchesCategoryIntent = (product: ProductSearchLike, intent: ReturnType<typeof parseProductSearchIntent>) => {
  const category = compactSearchText(product.category)
  const fields = normalizeSearchText(productSearchFields(product).join(' '))
  if (intent.requires510 && !(category.includes('510cartandbattery') || /\b(510|cart|cartridge|thread|threaded)\b/.test(fields))) return false
  if (intent.requiresPod && !(category.includes('podsystem') || /\bpod\b/.test(fields))) return false
  if (intent.requiresDab && !(category.includes('dabhardware') || /\b(dab|wax|concentrate|rosin)\b/.test(fields))) return false
  if (intent.requiresDisposable && !(category.includes('allinone') || /\b(disposable|aio)\b/.test(fields))) return false
  return true
}

export const productMatchesSearchIntent = (query: string, product: ProductSearchLike) => {
  const intent = parseProductSearchIntent(query)
  if (!intent.normalized) return true
  if (intent.requiresPreheat && !productHasPreheat(product)) return false
  if (intent.requiresNoPreheat && productHasPreheat(product)) return false
  if (intent.volumes.length && !intent.volumes.every((volume) => productMatchesVolume(product, volume))) return false
  if (intent.requiresAdjustableVoltage && !/\b(adjustable|variable)\b/.test(normalizeSearchText(`${product.voltage} ${(product.tags ?? []).join(' ')}`))) return false
  if (intent.requiresFixedVoltage && !/\bfixed\b/.test(normalizeSearchText(product.voltage))) return false
  if (intent.requiresTypeC && !/\b(type\s*c|typec|usb\s*c)\b/.test(normalizeSearchText(`${product.charging} ${(product.tags ?? []).join(' ')}`))) return false
  if (intent.requiresUSStock && !/\b(us|usa|us stock)\b/.test(normalizeSearchText(product.stock))) return false
  if (intent.requiresCNStock && !/\b(cn|china|cn stock)\b/.test(normalizeSearchText(product.stock))) return false
  if (intent.wantsScreen.full && !/\bfull screen\b/.test(normalizeSearchText(product.display))) return false
  if (intent.wantsScreen.half && !/\bhalf screen\b/.test(normalizeSearchText(product.display))) return false
  if (intent.wantsScreen.small && !/\bsmall screen\b/.test(normalizeSearchText(product.display))) return false
  if (intent.wantsScreen.none && !/\b(no screen|no display)\b/.test(normalizeSearchText(product.display))) return false
  if (intent.wantsScreen.any && !intent.wantsScreen.full && !intent.wantsScreen.half && !intent.wantsScreen.small && !intent.wantsScreen.none && !hasFieldToken(product, /\b(screen|display|digital)\b/)) return false
  return productMatchesCategoryIntent(product, intent)
}

export const productSearchScore = (query: string, product: ProductSearchLike) => {
  const intent = parseProductSearchIntent(query)
  if (!intent.normalized) return 1
  if (!productMatchesSearchIntent(query, product)) return 0

  let score = fuzzyScore(query, productSearchFields(product))
  if (intent.requiresPreheat && productHasPreheat(product)) score += 60
  if (intent.requiresNoPreheat && !productHasPreheat(product)) score += 60
  if (intent.volumes.length) score += 60 * intent.volumes.length
  if (intent.requires510 || intent.requiresPod || intent.requiresDab || intent.requiresDisposable) score += 35
  if (intent.requiresAdjustableVoltage || intent.requiresFixedVoltage) score += 35
  if (intent.requiresTypeC) score += 25
  if (intent.requiresUSStock || intent.requiresCNStock) score += 25
  if (Object.values(intent.wantsScreen).some(Boolean)) score += 35
  const normalized = intent.normalized
  const category = compactSearchText(product.category)
  if (/\b(disposable|aio|all\s*in\s*one)\b/.test(normalized) && category.includes('allinone')) score += 50
  if (/\b(510|cart|cartridge|thread|threaded)\b/.test(normalized) && category.includes('510cartandbattery')) score += 50
  if (/\b(pod|pods|magnetic)\b/.test(normalized) && category.includes('podsystem')) score += 50
  if (/\b(dab|wax|concentrate|rosin)\b/.test(normalized) && category.includes('dabhardware')) score += 50
  return score
}
