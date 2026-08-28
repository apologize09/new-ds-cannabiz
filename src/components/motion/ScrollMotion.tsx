import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ScrollMotion({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.utils.toArray<HTMLElement>('.section-enhance, [data-gsap-reveal]', scope.current).forEach((section) => {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.92) return
      ScrollTrigger.create({
        trigger: section,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.fromTo(section, { autoAlpha: 0, y: 24, filter: 'blur(4px)' }, {
          autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out',
          immediateRender: false,
          clearProps: 'transform,filter,opacity,visibility',
        }),
      })
    })
  }, { scope, dependencies: [pathname], revertOnUpdate: true })

  return <div ref={scope}>{children}</div>
}
