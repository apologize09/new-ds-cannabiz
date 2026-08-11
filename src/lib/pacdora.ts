import type { ProductCustomTemplate } from '../data/productCustomTemplates'

declare global {
  interface Window {
    Pacdora?: {
      init?: (options: Record<string, unknown>) => Promise<unknown> | unknown
      createScene?: (options: Record<string, unknown>) => Promise<unknown> | unknown
      openAdvancedEditor?: (
        saveCallback: (data: unknown) => void,
        cancelCallback: (data?: unknown) => void,
        options: Record<string, unknown>,
        designType?: string,
      ) => Promise<unknown> | unknown
      addDesign?: (path: string, side?: 'outside' | 'inside', options?: Record<string, unknown>) => Promise<unknown> | unknown
      setPackageColor?: (side: 'outside' | 'inside', color: string) => Promise<unknown> | unknown
      set3DBackground?: (pacdoraId: string, type: string, options: Record<string, unknown>) => Promise<unknown> | unknown
      renderDieline?: (options?: Record<string, unknown>) => Promise<unknown> | unknown
      getBoxInfo?: () => Promise<unknown> | unknown
      priceReady?: () => Promise<unknown> | unknown
      getQuantityData?: () => unknown
      getAdvancedData?: () => unknown
      $on?: (eventName: string, callback: (data: unknown) => unknown) => void
    }
  }
}

let sdkPromise: Promise<boolean> | null = null

export function getPacdoraAppId() {
  return (import.meta.env.VITE_PACDORA_APP_ID as string | undefined) || ''
}

export function getPacdoraAppKey() {
  return ''
}

export function getPacdoraUserId() {
  return (import.meta.env.VITE_PACDORA_USER_ID as string | undefined) || 'dscannabiz-demo-user'
}

export function loadPacdoraSdk() {
  const appId = getPacdoraAppId()
  if (!appId) return Promise.resolve(false)
  const sdkUrl =
    (import.meta.env.VITE_PACDORA_SDK_URL as string | undefined) ||
    `https://api.pacdora.com/sdk/Pacdora.js?app_id=${encodeURIComponent(appId)}`
  if (window.Pacdora) return Promise.resolve(true)
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script')
    script.src = sdkUrl
    script.async = true
    script.onload = () => resolve(Boolean(window.Pacdora))
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return sdkPromise
}

export async function initPacdora() {
  const hasSdk = await loadPacdoraSdk()
  if (!hasSdk || !window.Pacdora) return false
  const appId = getPacdoraAppId()
  if (!appId) return false

  await window.Pacdora.init?.({
    userId: getPacdoraUserId(),
    appId,
    isDelay: true,
    quotation: true,
    theme: '#00F0A0',
  })

  return true
}

export function bindPacdoraEvents(callback: (eventName: string, data: unknown) => void) {
  const events = ['advancedProject:change', 'price:update', 'design:save', 'design:cancel', 'design:opened']
  events.forEach((eventName) => {
    window.Pacdora?.$on?.(eventName, (data) => callback(eventName, data))
  })
}

export async function mountPacdoraModule(container: HTMLElement, template: ProductCustomTemplate, query?: string) {
  const ready = await initPacdora()
  if (!ready || !window.Pacdora) return false

  const options = {
    container,
    modelId: template.pacdoraMockupId,
    templateId: template.pacdoraMockupId,
    keyword: query?.trim() || template.pacdoraKeyword,
    doneBtn: 'Save',
    isShowLoading: true,
    isCreatePreview: true,
    packagingColors: ['#00F0A0', '#101010', '#FFFFFF', '#7A5CFF'],
  }

  if (!window.Pacdora.createScene) return false
  await window.Pacdora.createScene(options)
  return true
}

export async function callPacdora(action: string, payload: Record<string, unknown> = {}) {
  const ready = await initPacdora()
  if (!ready || !window.Pacdora) {
    throw new Error('3D workspace is not configured for this build.')
  }

  if (action === 'createScene') {
    return window.Pacdora.createScene?.({
      doneBtn: 'Save',
      modelId: payload.modelId,
      templateId: payload.templateId || payload.modelId,
      isShowLoading: true,
      isCreatePreview: true,
      packagingColors: payload.packagingColors || ['#00F0A0', '#101010', '#FFFFFF', '#7A5CFF'],
    })
  }

  if (action === 'openAdvancedEditor') {
    return window.Pacdora.openAdvancedEditor?.(
      payload.saveCallback as (data: unknown) => void || (() => undefined),
      payload.cancelCallback as (data?: unknown) => void || (() => undefined),
      {
        saveScreenshot: true,
        showClose: true,
        userCollect: false,
        screenshotWidth: 800,
      },
      'design',
    )
  }

  if (action === 'addDesign') {
    const path = String(payload.path || '')
    if (!path) throw new Error('Upload an artwork file or paste an image URL first.')
    return window.Pacdora.addDesign?.(path, 'outside', {
      x: 0,
      y: 0,
      width: 320,
      height: 320,
      fixRatio: true,
    })
  }

  if (action === 'setPackageColor') {
    return window.Pacdora.setPackageColor?.('outside', String(payload.color || '#00F0A0'))
  }

  if (action === 'set3DBackground') {
    return window.Pacdora.set3DBackground?.('d3', 'color', { color: String(payload.color || '#101010') })
  }

  const api = window.Pacdora as unknown as Record<string, unknown>
  const method = api[action]
  if (typeof method !== 'function') throw new Error('This design action is not available.')
  return (method as (payload?: Record<string, unknown>) => Promise<unknown> | unknown)(payload)
}
