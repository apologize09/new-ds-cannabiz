import { useEffect, useRef, useState } from 'react'
import {
  UploadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  PlusOutlined,
  MinusOutlined,
  RobotOutlined,
  AppstoreOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  LayoutOutlined,
  EditOutlined,
  BgColorsOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { Slider } from 'antd'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { supabase } from '../lib/supabase'
import PacdoraDesignModule from '../components/ui/PacdoraDesignModule'
import { findProductCustomTemplate } from '../data/productCustomTemplates'
import { callPacdora } from '../lib/pacdora'

type SideTab = 'edit' | 'models' | 'layout' | 'background' | 'video' | 'ai'

const sideTabs: { key: SideTab; icon: React.ReactNode; label: string }[] = [
  { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
  { key: 'models', icon: <AppstoreOutlined />, label: 'Models' },
  { key: 'layout', icon: <LayoutOutlined />, label: 'Layout' },
  { key: 'background', icon: <BgColorsOutlined />, label: 'Background' },
  { key: 'video', icon: <VideoCameraOutlined />, label: 'Video' },
  { key: 'ai', icon: <RobotOutlined />, label: 'AI Design' },
]

export default function Packaging3DCustom({ initialTab = 'edit' }: { initialTab?: SideTab }) {
  const [activeTab, setActiveTab] = useState<SideTab>(initialTab)
  const [zoom, setZoom] = useState(50)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [watermark, setWatermark] = useState(true)
  const [viewMode, setViewMode] = useState<'single' | 'split' | 'grid'>('single')
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isSpinning, setIsSpinning] = useState(false)
  const [isViewportDragging, setIsViewportDragging] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState('Saved')
  const [isUploadDragging, setIsUploadDragging] = useState(false)
  const [isPanelDragging, setIsPanelDragging] = useState(false)
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const localPreviewRef = useRef<string | null>(null)
  const panelDragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 })
  const viewportDragRef = useRef({ startX: 0, startY: 0, rotationX: 0, rotationY: 0 })
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const template = findProductCustomTemplate('packaging', id)
  const pacdoraQuery = searchParams.get('q') ?? ''

  useEffect(() => {
    if (!user || !id?.match(/^[0-9a-f-]{36}$/i)) return
    supabase.from('projects').select('id,configuration').eq('id', id).eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) { setProjectId(data.id); const config = data.configuration as { zoom?: number; watermark?: boolean }; if (config.zoom != null) setZoom(config.zoom); if (config.watermark != null) setWatermark(config.watermark) }
    })
  }, [id, user])

  async function ensureProject() {
    if (projectId) return projectId
    if (!user) throw new Error('Sign in required')
    const { data, error } = await supabase.from('projects').insert({ user_id: user.id, kind: 'packaging', name: 'Center seal pouch mockup', configuration: { zoom, watermark } }).select('id').single()
    if (error) throw error; setProjectId(data.id); return data.id
  }

  useEffect(() => {
    if (!projectId || !user) return
    setSaveState('Saving…')
    const timer = window.setTimeout(async () => { const { error } = await supabase.from('projects').update({ configuration: { zoom, watermark, activeTab } }).eq('id', projectId).eq('user_id', user.id); setSaveState(error ? 'Save failed' : 'Saved') }, 600)
    return () => clearTimeout(timer)
  }, [zoom, watermark, activeTab, projectId, user])

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isPanelDragging) return

    const onMove = (event: PointerEvent) => {
      setPanelOffset({
        x: panelDragRef.current.offsetX + event.clientX - panelDragRef.current.startX,
        y: panelDragRef.current.offsetY + event.clientY - panelDragRef.current.startY,
      })
    }
    const onUp = () => setIsPanelDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isPanelDragging])

  useEffect(() => {
    if (!isViewportDragging) return

    const onMove = (event: PointerEvent) => {
      setRotation({
        x: Math.max(-24, Math.min(24, viewportDragRef.current.rotationX - (event.clientY - viewportDragRef.current.startY) * 0.18)),
        y: viewportDragRef.current.rotationY + (event.clientX - viewportDragRef.current.startX) * 0.28,
      })
      setSaveState('Rotating preview')
    }
    const onUp = () => setIsViewportDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [isViewportDragging])

  useEffect(() => {
    if (!isSpinning) return
    const timer = window.setInterval(() => setRotation((current) => ({ ...current, y: current.y + 4 })), 32)
    return () => window.clearInterval(timer)
  }, [isSpinning])

  const beginPanelDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (window.innerWidth < 1024) return
    const target = event.target as HTMLElement
    if (target.closest('button, input, label, textarea, a, [data-no-panel-drag="true"]')) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    panelDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: panelOffset.x,
      offsetY: panelOffset.y,
    }
    setIsPanelDragging(true)
  }

  const beginViewportDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    event.preventDefault()
    viewportDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      rotationX: rotation.x,
      rotationY: rotation.y,
    }
    setIsSpinning(false)
    setIsViewportDragging(true)
  }

  const rotateCamera = (action: 'top' | 'spin' | 'left' | 'right') => {
    if (action === 'top') setRotation({ x: 18, y: 0 })
    if (action === 'spin') setIsSpinning((current) => !current)
    if (action === 'left') setRotation((current) => ({ ...current, y: current.y - 45 }))
    if (action === 'right') setRotation((current) => ({ ...current, y: current.y + 45 }))
    setSaveState(action === 'spin' ? 'Spin toggled' : 'Camera moved')
  }

  const previewFile = (file: File) => {
    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
    const url = URL.createObjectURL(file)
    localPreviewRef.current = url
    setUploadedImage(url)
  }

  const handleSelectedFile = async (file?: File) => {
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      setSaveState('File too large')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSaveState('Use JPG, PNG, or WebP')
      return
    }

    previewFile(file)

    if (!user) {
      setSaveState('Local preview')
      return
    }

    setSaveState('Uploading…')
    try {
      const project = await ensureProject()
      const path = `${user.id}/${project}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error } = await supabase.storage.from('user-uploads').upload(path, file, { contentType: file.type })
      if (error) throw error
      await supabase.from('project_assets').insert({ project_id: project, user_id: user.id, bucket: 'user-uploads', path, kind: 'artwork', mime_type: file.type, size_bytes: file.size })
      const { data } = await supabase.storage.from('user-uploads').createSignedUrl(path, 3600)
      if (data?.signedUrl) setUploadedImage(data.signedUrl)
      setSaveState('Saved')
    } catch {
      setSaveState('Local preview')
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleSelectedFile(e.target.files?.[0])
    e.target.value = ''
  }

  const downloadUrl = async (url: string, filename: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')
    const objectUrl = URL.createObjectURL(await response.blob())
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  const exportPreview = async () => {
    setSaveState('Preparing export…')
    try {
      await downloadUrl(uploadedImage || '/figma-local/packaging-pouch-object.png', `ds-packaging-${id || 'mockup'}.png`)
      setSaveState('Export downloaded')
    } catch { setSaveState('Export failed') }
  }

  const downloadDieline = async () => {
    setSaveState('Preparing dieline…')
    try {
      const result = await callPacdora('renderDieline', { modelId: template.pacdoraMockupId })
      const serialized = JSON.stringify(result)
      const url = serialized.match(/https?:\\?\/\\?\/[^"\\]+/i)?.[0]?.replace(/\\\//g, '/')
      if (!url) throw new Error('No dieline returned')
      await downloadUrl(url, `ds-packaging-${id || 'mockup'}-dieline.pdf`)
      setSaveState('Dieline downloaded')
    } catch { setSaveState('Dieline unavailable') }
  }

  return (
    <div className="flex min-h-[calc(100svh-59px)] flex-col lg:h-[calc(100svh-59px)] lg:overflow-hidden">
      {/* Page header */}
      <div className="shrink-0 border-b border-border">
        <div className="ds-container flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4">
          <div>
            <nav className="text-xs text-muted mb-1">
              <Link to="/">Home</Link> / <Link to="/product-custom/packaging">Products Custom</Link>
            </nav>
            <h1 className="text-xl font-bold text-text">Packaging 3D Custom</h1>
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <span className="text-xs text-muted">{saveState}</span>
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
                setSaveState('Link copied')
              }}
              className="w-8 h-8 border border-border rounded-lg flex items-center justify-center text-muted hover:text-text hover:border-primary/50 transition-colors"
            >
              <ShareAltOutlined />
            </button>
            <button onClick={exportPreview} className="btn-primary flex items-center gap-2">
              <DownloadOutlined />
              Super export
            </button>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-visible bg-[#ececec] lg:flex-row lg:overflow-hidden">
        {/* Left sidebar */}
        <aside
          data-editor-panel
          onPointerDown={beginPanelDrag}
          onDragStart={(event) => event.preventDefault()}
          style={{ transform: `translate3d(${panelOffset.x}px, ${panelOffset.y}px, 0)` }}
          className={`z-10 flex w-full shrink-0 select-none flex-col border-b border-border bg-card lg:absolute lg:left-[calc(50%-576px)] lg:top-8 lg:w-auto lg:flex-row lg:rounded-2xl lg:border lg:border-border ${isPanelDragging ? 'lg:cursor-grabbing' : 'lg:cursor-grab'}`}
        >
          {/* Icon nav */}
          <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-border px-3 py-2 lg:w-16 lg:flex-col lg:items-center lg:border-b-0 lg:border-r lg:px-0 lg:py-3">
            {sideTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors text-xs ${
                  activeTab === tab.key
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted hover:text-text hover:bg-text/5'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="text-[9px] leading-none">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="max-h-[46svh] w-full space-y-4 overflow-y-auto p-4 lg:max-h-none lg:w-[320px]">
            <div
              data-editor-panel-handle
              className="hidden items-center justify-center gap-2 rounded-lg border border-border bg-text/[0.03] px-3 py-2 text-muted lg:flex"
              aria-label="Drag panel"
              title="Drag panel"
            >
              <span className="text-lg leading-none">⋮⋮</span>
              <span className="font-['IBM_Plex_Sans'] text-[10px] uppercase tracking-[.18em]">Drag panel</span>
            </div>
            {activeTab === 'edit' && (
              <>
                <h3 className="text-text font-semibold text-sm">Upload Images</h3>

                <div
                  role="button"
                  tabIndex={0}
                  data-no-panel-drag="true"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    setIsUploadDragging(true)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsUploadDragging(true)
                  }}
                  onDragLeave={() => setIsUploadDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setIsUploadDragging(false)
                    void handleSelectedFile(event.dataTransfer.files?.[0])
                  }}
                  className={`block rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors group focus:outline-none focus:border-primary/60 ${
                    isUploadDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="w-full h-24 object-contain rounded mb-2" />
                  ) : (
                    <div className="space-y-2">
                      <PictureOutlined className="text-2xl text-muted group-hover:text-primary transition-colors" />
                      <p className="text-muted text-xs">Drop image here</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-2 text-primary text-xs font-medium">
                    <UploadOutlined /> Upload
                  </div>
                </div>

                <button onClick={() => setActiveTab('ai')} className="w-full text-xs text-primary text-left hover:underline">
                  No design yet? Create with AI →
                </button>
                <button onClick={downloadDieline} className="w-full text-xs text-muted text-left hover:text-text">
                  Or download dieline (AI, PDF) →
                </button>

                <div className="border-t border-border pt-3 space-y-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Material</label>
                    <button onClick={() => setSaveState('Material selected')} className="w-full flex items-center justify-between bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-primary/50 transition-colors">
                      White paperboard <span className="text-muted text-xs">›</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Custom size</label>
                    <button onClick={() => setSaveState('Size selected')} className="w-full flex items-center justify-between bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-primary/50 transition-colors">
                      <span className="text-xs">2.3622 × 1.1717 × 4.7244 in</span> <span className="text-muted">›</span>
                    </button>
                  </div>
                  <button onClick={() => setSaveState('AI match queued')} className="w-full flex items-center justify-between bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-primary/50 transition-colors">
                    Find similar with AI <RobotOutlined className="text-primary" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-muted text-xs">
                  <InfoCircleOutlined className="text-[10px]" />
                  <span>Model ID: 1000523</span>
                </div>
              </>
            )}

            {activeTab === 'models' && (
              <>
                <h3 className="text-text font-semibold text-sm">Model Library</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Bag', 'Box', 'Bottle', 'Tube', 'Pouch', 'Can'].map((model) => (
                    <button
                      key={model}
                      className="aspect-square bg-bg border border-border rounded-xl flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:text-primary transition-colors text-muted text-xs"
                    >
                      <span className="text-2xl">📦</span>
                      <span>{model}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'layout' && (
              <>
                <h3 className="text-text font-semibold text-sm">Layout</h3>
                <p className="text-muted text-xs">Arrange the faces and panels of your packaging.</p>
                <div className="space-y-2">
                  {['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'].map((face) => (
                    <div key={face} className="flex items-center justify-between p-2.5 bg-bg border border-border rounded-lg">
                      <span className="text-sm text-gray-300">{face}</span>
                      <button className="text-xs text-primary hover:underline">Edit</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'background' && (
              <>
                <h3 className="text-text font-semibold text-sm">Background</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['White', 'Black', 'Gray', 'Studio', 'Gradient', 'Custom'].map((bg) => (
                    <button
                      key={bg}
                      className="aspect-square rounded-lg border border-border hover:border-primary/50 transition-colors flex items-center justify-center text-xs text-muted hover:text-text"
                      style={{ background: bg === 'White' ? '#fff' : bg === 'Black' ? '#000' : bg === 'Gray' ? '#555' : bg === 'Gradient' ? 'linear-gradient(135deg,#1a1a2e,#16213e)' : '#111' }}
                    >
                      {bg === 'White' || bg === 'Black' || bg === 'Gray' || bg === 'Gradient' ? '' : bg}
                    </button>
                  ))}
                </div>
                <button className="w-full btn-primary text-xs flex items-center justify-center gap-2">
                  <RobotOutlined /> AI Background
                </button>
              </>
            )}

            {activeTab === 'video' && (
              <>
                <h3 className="text-text font-semibold text-sm">Video Export</h3>
                <p className="text-muted text-xs leading-relaxed">Export a 360° rotation video of your product for marketing use.</p>
                <div className="space-y-2">
                  {['360° Rotation', 'Spin + Zoom', 'Unboxing'].map((anim) => (
                    <button key={anim} className="w-full flex items-center gap-3 p-3 bg-bg border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <VideoCameraOutlined className="text-muted" />
                      <span className="text-sm text-gray-300">{anim}</span>
                    </button>
                  ))}
                </div>
                <button className="w-full btn-primary text-xs">Export MP4</button>
              </>
            )}

            {activeTab === 'ai' && (
              <>
                <h3 className="text-text font-semibold text-sm">AI Design</h3>
                <p className="text-muted text-xs leading-relaxed">Describe your brand and let AI generate packaging artwork for you.</p>
                <textarea
                  rows={3}
                  placeholder="No design yet? Create with AI"
                  className="w-full bg-bg border border-border text-text text-xs px-3 py-2.5 rounded-xl placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                />
                <button className="w-full btn-primary text-xs flex items-center justify-center gap-2">
                  <RobotOutlined /> Generate Design
                </button>
                <p className="text-muted text-[10px]">Costs 10 credits per generation</p>
              </>
            )}
          </div>
        </aside>

        {/* 3D Viewport */}
        <div
          data-editor-viewport
          onPointerDown={beginViewportDrag}
            className={`relative flex min-h-[48svh] flex-1 items-center justify-center overflow-hidden bg-[#F0F0F0] lg:min-h-0 ${isViewportDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${viewMode === 'grid' ? 'opacity-80' : 'opacity-100'}`}
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255,255,255,.72), rgba(232,232,232,.95) 38%, #d9d9d9 100%)',
            }}
          />
          <img
            data-editor-object
            src="/figma-local/packaging-pouch-object.png"
            alt="Packaging 3D mockup"
            draggable={false}
            className="relative z-10 max-h-[min(48svh,620px)] max-w-[min(72vw,520px)] object-contain transition-transform duration-300 lg:max-h-[min(68svh,620px)] lg:max-w-[min(48vw,520px)]"
            style={{ transform: `perspective(1100px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${0.72 + zoom / 260})` }}
          />
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Applied design"
              draggable={false}
              className="pointer-events-none absolute z-20 max-h-[180px] max-w-[160px] object-contain opacity-90 mix-blend-multiply transition-transform duration-300"
              style={{ transform: `perspective(1100px) translateY(42px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${0.55 + zoom / 420})` }}
            />
          )}
          {!watermark && <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-[#333] shadow">Watermark hidden</div>}
          {viewMode === 'split' && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-primary/70 shadow-[0_0_18px_rgba(0,229,181,.7)]" />}
          {viewMode === 'grid' && <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(0,0,0,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.08)_1px,transparent_1px)] bg-[size:72px_72px]" />}

          <div className="absolute bottom-3 left-3 z-30 hidden w-[min(420px,calc(100%-1.5rem))] sm:block">
            <PacdoraDesignModule template={template} query={pacdoraQuery} compact />
          </div>

          {/* Camera controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1">
            {[
              { icon: '↑', action: 'top' as const },
              { icon: '↺', action: 'spin' as const },
              { icon: '↩', action: 'left' as const },
              { icon: '↪', action: 'right' as const },
            ].map(({ icon, action }) => (
              <button key={icon} onClick={() => rotateCamera(action)} className="w-8 h-8 bg-card/90 border border-border rounded-lg text-text text-sm flex items-center justify-center hover:border-primary/50 transition-colors">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div data-editor-toolbar className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-t border-border bg-card px-3 py-2 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0, zoom - 10))}
            className="w-7 h-7 rounded border border-border text-muted hover:text-text flex items-center justify-center transition-colors"
          >
            <MinusOutlined className="text-xs" />
          </button>
          <div className="w-32">
            <Slider
              min={0}
              max={100}
              value={zoom}
              onChange={setZoom}
              tooltip={{ formatter: (v) => `${v}%` }}
            />
          </div>
          <button
            onClick={() => setZoom(Math.min(100, zoom + 10))}
            className="w-7 h-7 rounded border border-border text-muted hover:text-text flex items-center justify-center transition-colors"
          >
            <PlusOutlined className="text-xs" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-border pl-3 sm:pl-6">
          <span className="text-muted text-xs mr-2">Open</span>
          {[
            { icon: '□', mode: 'single' as const },
            { icon: '◨', mode: 'split' as const },
            { icon: '▣', mode: 'grid' as const },
          ].map(({ icon, mode }) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode)
                setSaveState(`View: ${mode}`)
              }}
              className={`w-7 h-7 border rounded flex items-center justify-center text-xs transition-colors ${
                viewMode === mode ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted hover:text-text'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>

        <button
          onClick={() => setWatermark(!watermark)}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            watermark
              ? 'border-primary/30 text-primary bg-primary/10'
              : 'border-border text-muted hover:text-text'
          }`}
        >
          <span className={`h-3 w-3 rounded-full ${watermark ? 'bg-[#facc15]' : 'border border-text/50'}`} /> Watermark {watermark ? 'free' : 'on'}
        </button>

        <button onClick={() => { setActiveTab('ai'); setSaveState('AI credits selected') }} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary bg-primary/10">
          <span className="text-primary">✦</span> 10
        </button>
      </div>
    </div>
  )
}
