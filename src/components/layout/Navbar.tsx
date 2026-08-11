import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
import {
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
  SwapOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import BrandMark from '../ui/BrandMark'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'
import { motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const navLinks = [
  {
    label: 'Hardware Gallery',
    href: '/hardware-gallery',
    children: [
      { label: 'All-in-One Disposable', href: '/hardware-gallery?cat=all-in-one' },
      { label: '510 Cart & Battery', href: '/hardware-gallery?cat=510' },
      { label: 'Pod System', href: '/hardware-gallery?cat=pod' },
      { label: 'Dab Hardware', href: '/hardware-gallery?cat=dab' },
    ],
  },
  {
    label: 'Product Custom',
    href: '/product-custom/packaging',
    children: [
      { label: 'Packaging 3D Custom', href: '/product-custom/packaging' },
      { label: 'Merchandise 3D Custom', href: '/product-custom/merchandise' },
    ],
  },
  { label: 'Plans', href: '/plans' },
  { label: 'About Us', href: '/about' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const [credits, setCredits] = useState(0)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('ds-theme') === 'light' ? 'light' : 'dark'))
  const navRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.utils.toArray<HTMLElement>('[data-hot-badge]').forEach((badge) => {
      gsap.timeline({ repeat: -1, repeatDelay: 2.8, delay: 0.7 })
        .to(badge, { scale: 1.12, rotate: -3, filter: 'brightness(1.25) drop-shadow(0 0 7px rgba(38,246,200,.7))', duration: 0.16, ease: 'power2.out' })
        .to(badge, { scale: 1.04, rotate: 2, duration: 0.12, ease: 'power2.inOut' })
        .to(badge, { scale: 1, rotate: 0, filter: 'brightness(1) drop-shadow(0 0 0 rgba(38,246,200,0))', duration: 0.24, ease: 'power3.out' })
    })
  }, { scope: navRef, dependencies: [reducedMotion], revertOnUpdate: true })

  useEffect(() => {
    if (!user) { setCredits(0); return }
    let active = true
    const refreshCredits = () => {
      void supabase.from('credit_accounts').select('balance').eq('user_id', user.id).maybeSingle().then(({ data }) => {
        if (active) setCredits(data?.balance ?? 0)
      })
    }
    refreshCredits()
    const channel = supabase
      .channel(`credit-balance:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credit_accounts', filter: `user_id=eq.${user.id}` }, refreshCredits)
      .subscribe()
    const onCreditChange = () => refreshCredits()
    window.addEventListener('ds-credit-change', onCreditChange)
    return () => {
      active = false
      window.removeEventListener('ds-credit-change', onCreditChange)
      void supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ds-theme', theme)
    window.dispatchEvent(new CustomEvent('ds-theme-change', { detail: theme }))
  }, [theme])

  const isActive = (href: string) => location.pathname.startsWith(href.split('?')[0])

  return (
    <nav ref={navRef} data-site-navbar className="sticky top-0 z-50 bg-[#090909]/95 backdrop-blur-sm">
      <div className="ds-container relative flex h-[58px] items-center justify-between gap-2 sm:gap-8">
        <motion.div data-nav-enter className="shrink-0" whileHover={reducedMotion ? undefined : { y: -1 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}>
        <Dropdown
          overlayClassName="dsc-nav-dropdown"
          menu={{
            items: [
              { key: 'ds', label: <Link to="/">DS Cannabiz</Link> },
              { key: 'dawsen', label: <a href="https://dawsenai.com">Dawsen AI</a> },
            ],
            style: { background: theme === 'light' ? '#ffffff' : '#1A1A1A', border: `1px solid ${theme === 'light' ? '#d8d8d2' : '#2A2A2A'}`, color: theme === 'light' ? '#111111' : '#ffffff' },
          }}
          trigger={['click']}
        >
          <button aria-label="Switch brand" className="flex min-w-0 items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <span className="dsc-nav-text truncate font-['Sora'] text-base font-semibold tracking-tight sm:text-lg">DS Cannabiz</span>
            <SwapOutlined className="text-[11px] text-muted" />
          </button>
        </Dropdown>
        </motion.div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <motion.div data-nav-enter key={link.label} whileHover={reducedMotion ? undefined : { y: -1 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={{ type: 'spring', stiffness: 450, damping: 30 }}>
              <Dropdown
                overlayClassName="dsc-nav-dropdown"
                menu={{
                  items: link.children.map((c) => ({
                    key: c.href,
                    label: <Link to={c.href} className="text-sm">{c.label}</Link>,
                  })),
                  style: { background: theme === 'light' ? '#ffffff' : '#1A1A1A', border: `1px solid ${theme === 'light' ? '#d8d8d2' : '#2A2A2A'}`, color: theme === 'light' ? '#111111' : '#ffffff' },
                }}
                trigger={['hover']}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive(link.href) ? 'text-primary' : 'dsc-nav-link'
                  }`}
                >
                  {link.label}
                  <DownOutlined className="text-[10px]" />
                </Link>
              </Dropdown>
              </motion.div>
            ) : (
              <motion.div data-nav-enter key={link.label} whileHover={reducedMotion ? undefined : { y: -1 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={{ type: 'spring', stiffness: 450, damping: 30 }}>
              <Link
                to={link.href}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive(link.href) ? 'text-primary' : 'dsc-nav-link'
                }`}
              >
                {link.label}
              </Link>
              </motion.div>
            ),
          )}
          <a data-nav-enter href="https://printing.dscannabiz.com" className="dsc-nav-link flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors">
            Printing
            <motion.span data-hot-badge whileHover={reducedMotion ? undefined : { scale: 1.12, rotate: -2 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }} className="inline-block origin-center rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-black">HOT</motion.span>
          </a>
        </div>

        <div data-nav-enter className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="dsc-nav-control grid h-8 w-8 place-items-center rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
          >
            {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          </button>
          {user ? (
            <>
              <button
                onClick={() => navigate('/plans')}
                aria-label="Manage credits and billing"
                className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg text-sm hover:border-primary/50 transition-colors"
              >
                <span className="text-primary font-semibold">+</span>
                <span className="dsc-nav-text">{credits} credits</span>
              </button>

              <Dropdown
                overlayClassName="dsc-nav-dropdown"
                menu={{
                  items: [
                    { key: 'dashboard', label: <Link to="/dashboard">Dashboard</Link> },
                    { key: 'personal', label: <Link to="/personal-center">Personal Center</Link> },
                    { key: 'logout', label: <button onClick={() => void signOut()}>Sign out</button> },
                  ],
                  style: { background: theme === 'light' ? '#ffffff' : '#1A1A1A', border: `1px solid ${theme === 'light' ? '#d8d8d2' : '#2A2A2A'}`, color: theme === 'light' ? '#111111' : '#ffffff' },
                }}
                trigger={['click']}
              >
                <button data-dashboard-avatar className="h-8 w-8 overflow-hidden rounded-full border border-primary/40">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt={profile.display_name ?? 'Account'} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center bg-primary text-xs font-bold text-black">{(profile?.display_name ?? user?.email ?? '?')[0].toUpperCase()}</span>}
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="dsc-nav-link rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-primary/50">Sign in</Link>
              <Link to="/sign-in?mode=sign-up" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-primary-dark">Create account</Link>
            </>
          )}
        </div>

        <button className="dsc-nav-control grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-card md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation menu">
          {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100svh-58px)] overflow-y-auto border-t border-border bg-card px-5 py-4 md:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="dsc-nav-control mb-3 flex h-11 w-full items-center justify-between rounded-lg border border-border px-3 text-sm"
          >
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          </button>
          {navLinks.map((link) => (
            <div key={link.label} className="border-t border-border/70 py-2 first:border-t-0">
              <Link
                to={link.href}
                className="dsc-nav-link block py-2 text-base font-medium hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="pl-4 space-y-1">
                  {link.children.map((c) => (
                    <Link
                      key={c.href}
                      to={c.href}
                      className="dsc-nav-muted block py-2 text-sm hover:text-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="https://printing.dscannabiz.com" className="dsc-nav-link flex items-center gap-2 border-t border-border/70 py-3 text-base font-medium" onClick={() => setMobileOpen(false)}>
            <span>Printing</span>
            <motion.span data-hot-badge className="inline-block origin-center rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-black">HOT</motion.span>
          </a>
          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Link to="/sign-in" className="dsc-nav-link rounded-lg border border-border px-3 py-2 text-center text-sm" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link to="/sign-in?mode=sign-up" className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-black" onClick={() => setMobileOpen(false)}>Create account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
