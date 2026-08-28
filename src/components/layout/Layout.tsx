import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import TalkToSales from '../ui/TalkToSales'
import ScrollMotion from '../motion/ScrollMotion'

export default function Layout() {
  const { pathname } = useLocation()
  const standalone =
    pathname.startsWith('/dashboard') ||
    pathname === '/plans' ||
    pathname === '/personal-center' ||
    pathname === '/compare' ||
    pathname === '/hardware-gallery/compare' ||
    /^\/product-custom\/(packaging|merchandise)\/[^/]+\/(edit|models|layout|background|video|ai)$/.test(pathname)

  useLayoutEffect(() => {
    const html = document.documentElement
    const previousBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previousBehavior
  }, [pathname])

  return (
    <div className="dsc-app-shell min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ScrollMotion>
          <Outlet />
        </ScrollMotion>
      </main>
      {!standalone && <Footer />}
      <TalkToSales />
    </div>
  )
}
