import type { ImgHTMLAttributes } from 'react'
import { useDsWordmarkSrc } from '../../hooks/useThemeMode'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

export default function DsCannabizWordmark({ className, width = 146, height = 26, ...props }: Props) {
  const src = useDsWordmarkSrc()

  return (
    <img
      src={src}
      alt="DS Cannabiz"
      width={width}
      height={height}
      className={className ?? 'dsc-brand-switcher-wordmark'}
      draggable={false}
      {...props}
    />
  )
}
