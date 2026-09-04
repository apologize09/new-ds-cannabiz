import { useEffect, useId, useRef, useState } from 'react'
import { SortAscendingOutlined } from '@ant-design/icons'
import { gallerySortOptions, type GallerySortOption } from '../../constants/gallerySort'

type Props = {
  value: GallerySortOption
  onChange: (value: GallerySortOption) => void
}

export default function GallerySortDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Sort products"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className="dsc-gallery-control dsc-gallery-sort-trigger flex h-10 items-center gap-2 rounded-md border border-border bg-[#27272a] px-4 text-sm"
      >
        <SortAscendingOutlined />
        Sort
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sort products"
          className="dsc-gallery-sort-panel absolute left-0 top-[calc(100%+8px)] z-50"
        >
          {gallerySortOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              className={`dsc-gallery-sort-option${value === option ? ' is-active' : ''}`}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
