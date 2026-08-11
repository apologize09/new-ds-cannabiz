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
  EditOutlined,
  BgColorsOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { Slider } from 'antd'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import PacdoraDesignModule from '../components/ui/PacdoraDesignModule'
import { findProductCustomTemplate } from '../data/productCustomTemplates'

const merchandiseModels = [
  { name: 'Oversized Hoodie Mockup', image: '使用工具生成图片 (21) 1.png', id: 'M0042' },
  { name: 'Tote Bag Mockup', image: '新对话 (7) 1.png', id: 'M0043' },
  { name: 'Baseball Cap With Hook Mockup', image: '抠图 (5) 1.png', id: 'M0044' },
  { name: "Women's Crop Tank Top Mockup", image: '12621435 2.png', id: 'M0045' },
  { name: "Men's Round Neck T-Shirt Mockup", image: '新对话 (6) 1.png', id: 'M0046' },
  { name: 'Wristband Mockup', image: '13310424 2.png', id: 'M0047' },
]

type SideTab = 'edit' | 'models' | 'layout' | 'background' | 'video' | 'ai'

const sideTabs = [
  { key: 'edit' as SideTab, icon: <EditOutlined />, label: 'Edit' },
  { key: 'models' as SideTab, icon: <AppstoreOutlined />, label: 'Models' },
  { key: 'layout' as SideTab, icon: <AppstoreOutlined />, label: 'Layout' },
  { key: 'background' as SideTab, icon: <BgColorsOutlined />, label: 'Background' },
  { key: 'video' as SideTab, icon: <AppstoreOutlined />, label: 'Video' },
  { key: 'ai' as SideTab, icon: <RobotOutlined />, label: 'AI Design' },
]

export default function Merchandise3DCustom() {
  const [activeTab, setActiveTab] = useState<SideTab>('edit')
  const [zoom, setZoom] = useState(50)
  const [selectedModel, setSelectedModel] = useState('Oversized Hoodie Mockup')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [watermark, setWatermark] = useState(true)
  const [viewMode, setViewMode] = useState<'single' | 'split' | 'grid'>('single')
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isSpinning, setIsSpinning] = useState(false)
  const [isViewportDragging, setIsViewportDragging] = useState(false)
  const [isPanelDragging, setIsPanelDragging] = useState(false)
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 })
  const [saveState, setSaveState] = useState('Saved')
  const [isUploadDragging, setIsUploadDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const localPreviewRef = useRef<string | null>(null)
  const panelDragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 })
  const viewportDragRef = useRef({ startX: 0, startY: 0, rotationX: 0, rotationY: 0 })
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const template = findProductCustomTemplate('merchandise', id)
  const pacdoraQuery = searchParams.get('q') ?? ''

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
      const url = URL.createObjectURL(file)
      localPreviewRef.current = url
      setUploadedImage(url)
      setSaveState('Local preview')
    }
    e.target.value = ''
  }

  const currentModel = merchandiseModels.find((m) => m.name === selectedModel) ?? merchandiseModels[0]

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
    if (target.closest('button, input, label, textarea, a, [data-no-panel-drag="true"], .ant-slider')) return
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

  const exportPreview = () => {
    const anchor = document.createElement('a')
    anchor.href = uploadedImage || `/figma-local/${currentModel.image}`
    anchor.download = `${currentModel.id.toLowerCase()}-preview.png`
    anchor.target = '_blank'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setSaveState('Preview exported')
  }

  return (
    <div className="flex min-h-[calc(100svh-59px)] flex-col lg:h-[calc(100svh-59px)] lg:overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border">
        <div className="ds-container flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4">
          <div>
            <nav className="mb-1 flex items-center gap-1 text-xs text-muted"><Link to="/" className="hover:text-primary">Home</Link><span>/</span><Link to="/product-custom/merchandise" className="hover:text-primary">Products Custom</Link></nav>
            <h1 className="text-xl font-bold text-text">Merchandise 3D Custom</h1>
          </div>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <span className="text-xs text-muted">{saveState}</span>
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
                setSaveState('Link copied')
              }}
              className="w-8 h-8 border border-border rounded-lg flex items-center justify-center text-muted hover:text-text transition-colors"
            >
              <ShareAltOutlined />
            </button>
            <button onClick={exportPreview} className="btn-primary flex items-center gap-2">
              <DownloadOutlined /> Super export
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-visible bg-[#ececec] lg:flex-row lg:overflow-hidden">
        {/* Left sidebar */}
        <aside
          data-editor-panel
          onPointerDown={beginPanelDrag}
          onDragStart={(event) => event.preventDefault()}
          style={{ transform: `translate3d(${panelOffset.x}px, ${panelOffset.y}px, 0)` }}
          className={`z-10 flex w-full shrink-0 select-none flex-col border-b border-border bg-card lg:absolute lg:left-[calc(50%-576px)] lg:top-8 lg:w-auto lg:flex-row lg:rounded-2xl lg:border lg:border-border ${isPanelDragging ? 'lg:cursor-grabbing' : 'lg:cursor-grab'}`}
        >
          <div className="flex w-full flex-row gap-1 overflow-x-auto border-b border-border px-3 py-2 lg:w-16 lg:flex-col lg:items-center lg:border-b-0 lg:border-r lg:px-0 lg:py-3">
            {sideTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors text-xs ${
                  activeTab === tab.key ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text hover:bg-text/5'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="text-[9px] leading-none">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="max-h-[46svh] w-full space-y-4 overflow-y-auto p-4 lg:max-h-none lg:w-[320px]">
            <div data-editor-panel-handle className="hidden items-center justify-center gap-2 rounded-lg border border-border bg-text/[0.03] px-3 py-2 text-muted lg:flex" aria-label="Drag panel" title="Drag panel">
              <span className="text-lg leading-none">⋮⋮</span>
              <span className="font-['IBM_Plex_Sans'] text-[10px] uppercase tracking-[.18em]">Drag panel</span>
            </div>
            {activeTab === 'edit' && (
              <>
                <h3 className="text-text font-semibold text-sm">Upload Design</h3>
                <label
                  data-no-panel-drag="true"
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
                    const file = event.dataTransfer.files?.[0]
                    if (!file) return
                    if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current)
                    const url = URL.createObjectURL(file)
                    localPreviewRef.current = url
                    setUploadedImage(url)
                    setSaveState('Local preview')
                  }}
                  className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors group ${isUploadDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="w-full h-24 object-contain rounded mb-2" />
                  ) : (
                    <div className="space-y-2">
                      <PictureOutlined className="text-2xl text-muted group-hover:text-primary transition-colors" />
                      <p className="text-muted text-xs">Drop design here</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-2 text-primary text-xs font-medium">
                    <UploadOutlined /> Upload
                  </div>
                </label>
                <button onClick={() => setActiveTab('ai')} className="w-full text-xs text-primary text-left hover:underline">Create with AI →</button>
                <div className="border-t border-border pt-3 space-y-2">
                  <div>
                    <label className="text-xs text-muted block mb-1">Print position</label>
                    <button className="w-full flex items-center justify-between bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-primary/50 transition-colors">
                      Front center <span className="text-muted">›</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Size</label>
                    <button className="w-full flex items-center justify-between bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-primary/50 transition-colors">
                      10 × 10 cm <span className="text-muted">›</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-muted text-xs">
                  <InfoCircleOutlined className="text-[10px]" />
                  <span>Model ID: {currentModel.id}</span>
                </div>
              </>
            )}

            {activeTab === 'models' && (
              <>
                <h3 className="text-text font-semibold text-sm">Merchandise Models</h3>
                <div className="grid grid-cols-2 gap-2">
                  {merchandiseModels.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => {
                        setSelectedModel(model.name)
                        setSaveState('Model selected')
                      }}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors ${
                        selectedModel === model.name
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted hover:border-primary/50 hover:text-text'
                      }`}
                    >
                      <img src={`/figma-local/${model.image}`} alt="" className="h-16 w-16 object-contain" />
                      <span className="px-1 text-center text-[10px] leading-tight">{model.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'layout' && (
              <>
                <h3 className="text-text font-semibold text-sm">Layout</h3>
                <p className="text-muted text-xs">Place the print area on the selected merchandise mockup.</p>
                {['Front center', 'Back center', 'Left chest', 'Sleeve', 'Tag'].map((position) => (
                  <button key={position} onClick={() => setSaveState(`Position: ${position}`)} className="w-full flex items-center justify-between bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text hover:border-primary/50 transition-colors">
                    {position} <span className="text-muted">›</span>
                  </button>
                ))}
              </>
            )}

            {activeTab === 'background' && (
              <>
                <h3 className="text-text font-semibold text-sm">Background</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['White', 'Black', 'Gray', 'Studio', 'Gradient', 'Custom'].map((bg) => (
                    <button
                      key={bg}
                      className="aspect-square rounded-lg border border-border hover:border-primary/50 transition-colors"
                      style={{ background: bg === 'White' ? '#fff' : bg === 'Black' ? '#000' : bg === 'Gray' ? '#555' : bg === 'Gradient' ? 'linear-gradient(135deg,#1a1a2e,#16213e)' : '#111' }}
                    />
                  ))}
                </div>
                <button className="w-full btn-primary text-xs flex items-center justify-center gap-2">
                  <RobotOutlined /> AI Background
                </button>
              </>
            )}

            {activeTab === 'ai' && (
              <>
                <h3 className="text-text font-semibold text-sm">AI Design</h3>
                <p className="text-muted text-xs leading-relaxed">Describe your brand vision and let AI generate the artwork.</p>
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

        {/* Viewport */}
        <div
          data-editor-viewport
          onPointerDown={beginViewportDrag}
          className={`relative flex min-h-[48svh] flex-1 items-center justify-center overflow-hidden bg-[#F0F0F0] lg:min-h-0 ${isViewportDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, #e8e8e8 0%, #d0d0d0 100%)' }} />
          <img
            data-editor-object
            src={`/figma-local/${currentModel.image}`}
            alt={currentModel.name}
            draggable={false}
            className="relative z-10 max-h-[min(44svh,520px)] max-w-[min(74vw,460px)] object-contain transition-transform duration-300 drop-shadow-2xl lg:max-h-[min(60svh,520px)] lg:max-w-[min(42vw,460px)]"
            style={{ transform: `perspective(1100px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${0.75 + zoom / 250})` }}
          />
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Design"
              draggable={false}
              className="pointer-events-none absolute z-20 max-h-[130px] max-w-[130px] rounded-xl object-contain opacity-90 mix-blend-multiply transition-transform duration-300"
              style={{ transform: `perspective(1100px) translateY(-10px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${0.75 + zoom / 300})` }}
            />
          )}
          <p className="pointer-events-none absolute left-1/2 top-[calc(50%+190px)] z-20 -translate-x-1/2 text-gray-500 text-xs">{selectedModel} · Drag to rotate</p>
          {!watermark && <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold text-[#333] shadow">Watermark hidden</div>}
          {viewMode === 'split' && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px bg-primary/70 shadow-[0_0_18px_rgba(0,229,181,.7)]" />}
          {viewMode === 'grid' && <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(0,0,0,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.08)_1px,transparent_1px)] bg-[size:72px_72px]" />}

          <div className="absolute bottom-3 left-3 z-30 hidden w-[min(420px,calc(100%-1.5rem))] sm:block">
            <PacdoraDesignModule template={template} query={pacdoraQuery} compact />
          </div>

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
          <button onClick={() => setZoom(Math.max(0, zoom - 10))} className="w-7 h-7 rounded border border-border text-muted hover:text-text flex items-center justify-center transition-colors">
            <MinusOutlined className="text-xs" />
          </button>
          <div className="w-32">
            <Slider min={0} max={100} value={zoom} onChange={setZoom} />
          </div>
          <button onClick={() => setZoom(Math.min(100, zoom + 10))} className="w-7 h-7 rounded border border-border text-muted hover:text-text flex items-center justify-center transition-colors">
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
            watermark ? 'border-primary/30 text-primary bg-primary/10' : 'border-border text-muted hover:text-text'
          }`}
        >
          <span className={`h-3 w-3 rounded-full ${watermark ? 'bg-[#facc15]' : 'border border-text/50'}`} /> Watermark {watermark ? 'free' : 'on'}
        </button>

        <button onClick={() => { setActiveTab('ai'); setSaveState('AI credits selected') }} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-primary/30 text-primary bg-primary/10">
          ✦ 10
        </button>
      </div>
    </div>
  )
}
