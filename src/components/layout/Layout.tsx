import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import TalkToSales from '../ui/TalkToSales'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import ScrollMotion from '../motion/ScrollMotion'

export default function Layout() {
  const { pathname } = useLocation()
  const reducedMotion = useReducedMotion()
  const standalone =
    pathname.startsWith('/dashboard') ||
    pathname === '/plans' ||
    pathname === '/personal-center' ||
    pathname === '/compare' ||
    pathname === '/hardware-gallery/compare' ||
    /^\/product-custom\/(packaging|merchandise)\/[^/]+\/(edit|models|layout|background|video|ai)$/.test(pathname)
  return (
    <div className="dsc-app-shell min-h-screen flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={pathname} className="flex-1"
          initial={reducedMotion ? false : { opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -4, filter: 'blur(2px)' }}
          transition={{ type: 'spring', duration: reducedMotion ? 0 : 0.34, bounce: 0 }}>
          <ScrollMotion><Outlet /></ScrollMotion>
        </motion.main>
      </AnimatePresence>
      {!standalone && <Footer />}
      <TalkToSales />
    </div>
  )
}
