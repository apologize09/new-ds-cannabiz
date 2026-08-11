import { useRef, useState } from 'react'
import { CloseOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export default function UploadImagePage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const submit = (file?: File) => {
    if (!file) return
    navigate('/search-results?mode=image')
  }

  return (
    <main className="relative flex min-h-[720px] items-center justify-center overflow-hidden bg-[#050807] px-5 py-20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(ellipse_at_bottom,#18d9bc_0%,rgba(2,91,78,.58)_28%,transparent_72%)] opacity-80 blur-2xl" />
      <section className="relative z-10 w-full max-w-[610px] rounded-[22px] border border-[rgba(38,246,200,.65)] bg-[#202020] p-8 sm:p-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="font-['Sora'] text-[28px] font-medium text-white">Search By Image</h1>
          <button onClick={() => navigate(-1)} aria-label="Close"><CloseOutlined className="text-2xl text-white" /></button>
        </header>
        <div
          onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); submit(event.dataTransfer.files[0]) }}
          className={`flex h-[338px] flex-col items-center justify-center rounded-xl border border-dashed bg-[#050505] transition-colors ${dragging ? 'border-[#26f6c8]' : 'border-[#202020]'}`}
        >
          <PictureOutlined className="mb-7 text-[48px] text-white" />
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(event) => submit(event.target.files?.[0])} />
          <button onClick={() => inputRef.current?.click()} className="flex items-center gap-2 rounded-lg bg-[#26d6c3] px-7 py-3 font-['Sora'] text-base font-semibold text-black"><UploadOutlined />Upload</button>
          <p className="mt-4 font-['Sora'] text-base text-[#8d8d91]">Or drag and drop image here</p>
          <p className="mt-20 font-['Sora'] text-sm text-[#626269]">JPG, PNG, WebP, SVG (Max 20 MB)</p>
        </div>
      </section>
    </main>
  )
}
