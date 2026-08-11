import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { ApiOutlined, BgColorsOutlined, DownloadOutlined, PictureOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ProductCustomTemplate } from '../../data/productCustomTemplates'
import { bindPacdoraEvents, callPacdora, mountPacdoraModule } from '../../lib/pacdora'

export default function PacdoraDesignModule({
  template,
  query,
  compact = false,
}: {
  template: ProductCustomTemplate
  query?: string
  compact?: boolean
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const fileUrlRef = useRef<string>('')
  const [status, setStatus] = useState<'loading' | 'sdk' | 'needs-config' | 'error'>('loading')
  const [message, setMessage] = useState('Initializing 3D design workspace…')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    void (async () => {
      if (!hostRef.current) return
      hostRef.current.innerHTML = ''
      const mounted = await mountPacdoraModule(hostRef.current, template, query).catch(() => false)
      if (!cancelled) {
        setStatus(mounted ? 'sdk' : 'needs-config')
        setMessage(mounted ? '3D workspace is ready.' : '3D workspace is not available right now.')
      }
    })()
    return () => {
      cancelled = true
      if (hostRef.current) hostRef.current.innerHTML = ''
    }
  }, [template, query])

  useEffect(() => {
    bindPacdoraEvents(() => {
      setStatus('sdk')
      setMessage('Design workspace updated.')
    })
  }, [])

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current)
    fileUrlRef.current = URL.createObjectURL(file)
    setImageUrl(fileUrlRef.current)
    setMessage('Artwork selected. Click “Apply artwork” to place it on the model.')
  }

  const runAction = async (action: string) => {
    try {
      setMessage('Working…')
      await callPacdora(action, {
        container: hostRef.current,
        modelId: template.pacdoraMockupId,
        templateId: template.pacdoraMockupId,
        keyword: query?.trim() || template.pacdoraKeyword,
        path: imageUrl,
        color: '#00F0A0',
        saveCallback: () => setMessage('Design saved.'),
        cancelCallback: () => setMessage('Design editor closed.'),
      })
      setStatus('sdk')
      setMessage('Done.')
    } catch (error) {
      setStatus('needs-config')
      setMessage('This design action is not available right now.')
    }
  }

  return (
    <section className={`relative overflow-hidden rounded-2xl border border-[#26f6c8]/25 bg-[#101010] ${compact ? 'min-h-[280px]' : 'min-h-[520px]'}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-['IBM_Plex_Sans'] text-[10px] uppercase tracking-[.18em] text-[#26f6c8]">3D customization</p>
          <h2 className="font-['Sora'] text-sm font-semibold text-white">{template.name}</h2>
        </div>
        <button type="button" onClick={() => void runAction('openAdvancedEditor')} className="inline-flex items-center gap-2 rounded-lg bg-[#26f6c8] px-3 py-2 font-['Sora'] text-xs font-semibold text-black hover:bg-[#32ffd2]">
          Design online <ApiOutlined />
        </button>
      </div>

      <div
        ref={hostRef}
        data-pacdora-ui="3d"
        data-pacdora-id="d3"
        data-init-rotation="true"
        data-light-intensity="2"
        data-pacdora-skin="dscannabiz"
        data-pacdora-mockup-id={template.pacdoraMockupId}
        data-pacdora-keyword={query?.trim() || template.pacdoraKeyword}
        className="absolute inset-x-0 bottom-0 top-[57px]"
      />

      {status !== 'sdk' && (
        <div className="absolute inset-x-0 bottom-0 top-[57px] flex flex-col items-center justify-center gap-4 bg-[#151515] p-6 text-center">
          <img src={`/figma-local/${template.image}`} alt={template.name} className="max-h-48 w-full object-contain" />
          <div className="max-w-md">
            <p className="font-['Sora'] text-sm font-semibold text-white">
              {status === 'loading' ? 'Loading 3D workspace…' : '3D workspace'}
            </p>
            <p className="mt-2 font-['IBM_Plex_Sans'] text-xs leading-5 text-white/55">
              {message}
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-['Sora'] text-sm font-semibold text-white/75 hover:bg-white/5">
            <PictureOutlined /> Select artwork
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleFile} className="hidden" />
          </label>
          <input
            value={imageUrl.startsWith('blob:') ? '' : imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Or paste image URL"
            className="w-full max-w-md rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#26f6c8]/70"
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => void runAction('createScene')} className="inline-flex items-center gap-2 rounded-xl border border-[#26f6c8]/40 px-4 py-2 font-['Sora'] text-sm font-semibold text-[#26f6c8] hover:bg-[#26f6c8]/10"><ReloadOutlined /> Start 3D scene</button>
            <button type="button" onClick={() => void runAction('addDesign')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-['Sora'] text-sm font-semibold text-white/75 hover:bg-white/5"><PictureOutlined /> Apply artwork</button>
            <button type="button" onClick={() => void runAction('renderDieline')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-['Sora'] text-sm font-semibold text-white/75 hover:bg-white/5"><DownloadOutlined /> Dieline</button>
            <button type="button" onClick={() => void runAction('setPackageColor')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-['Sora'] text-sm font-semibold text-white/75 hover:bg-white/5"><BgColorsOutlined /> Set color</button>
            <button type="button" onClick={() => void runAction('openAdvancedEditor')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-['Sora'] text-sm font-semibold text-white/75 hover:bg-white/5"><ApiOutlined /> Open editor</button>
          </div>
        </div>
      )}
      <div data-pacdora-ui="dieline" data-pacdora-id="dieline" className="hidden" />
    </section>
  )
}
