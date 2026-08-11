import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LinkedinOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons'
import BrandMark from '../ui/BrandMark'
import { supabase } from '../../lib/supabase'

const footerLinks = {
  'Product Library': [
    { label: 'All-in-One Disposable', href: '/hardware-gallery?cat=all-in-one' },
    { label: '510 Cart & Battery', href: '/hardware-gallery?cat=510' },
    { label: 'Pod System', href: '/hardware-gallery?cat=pod' },
    { label: 'Dab Hardware', href: '/hardware-gallery?cat=dab' },
    { label: 'Packaging', href: '/product-custom/packaging' },
    { label: 'Merchandise', href: '/product-custom/merchandise' },
  ],
  'Product Custom': [
    { label: 'Packaging 3D Custom', href: '/product-custom/packaging' },
    { label: 'Merchandise 3D Custom', href: '/product-custom/merchandise' },
  ],
  Explore: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/about#blog' },
    { label: 'FAQs', href: '/about#faqs' },
    { label: 'Talk to Sales', href: '#talk-to-sales' },
    { label: 'Printing', href: 'https://printing.dscannabiz.com' },
  ],
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [techOpen, setTechOpen] = useState(false)

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    const { error } = await supabase.rpc('subscribe_newsletter', { address: email, has_consent: true })
    if (!error) { setSubscribed(true); setEmail('') }
  }

  return (
    <footer className="dsc-site-footer border-t border-border bg-bg mt-20">
      <div className="dsc-footer-main ds-container px-6 py-16 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 flex flex-col items-start gap-6">
            <Link to="/" className="flex items-center gap-2">
              <BrandMark className="h-7 w-7" />
              <span className="font-bold text-text">DS Cannabiz</span>
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Your one-stop B2B platform for cannabis products on AI-powered sourcing and 3D CMF customization.
            </p>
            <div className="w-full space-y-3">
              <p className="text-xs font-semibold text-text uppercase tracking-widest">Subscribe & Get News</p>
              <form onSubmit={subscribe} className="flex w-full max-w-xs gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setSubscribed(false) }}
                  placeholder="Enter your email"
                  className="flex-1 bg-card border border-border text-sm text-text px-3 py-2 rounded-lg placeholder:text-muted focus:outline-none focus:border-primary/50"
                />
                <button type="submit" aria-label="Subscribe & Get News" className="bg-primary px-4 py-2 rounded-lg text-sm font-medium !text-black hover:bg-primary-dark transition-colors">
                  <span className="!text-black" aria-hidden="true">{subscribed ? '✓' : '→'}</span>
                </button>
              </form>
            </div>
            <div className="space-y-3 text-sm text-muted">
              <p className="flex items-center gap-2"><MailOutlined /> info@weedevice.com</p>
              <p className="flex items-center gap-2"><PhoneOutlined /> +1 (800) 123-4567</p>
              <p className="flex items-center gap-2"><EnvironmentOutlined /> Los Angeles, CA, United States</p>
              <div className="relative">
                <button
                  type="button"
                  data-tech-center-trigger
                  aria-expanded={techOpen}
                  aria-controls="tech-center-popover"
                  onMouseEnter={() => setTechOpen(true)}
                  onMouseLeave={() => setTechOpen(false)}
                  onFocus={() => setTechOpen(true)}
                  onBlur={() => setTechOpen(false)}
                  onClick={() => setTechOpen((open) => !open)}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text hover:text-primary"
                >
                  <EnvironmentOutlined /> TECH CENTER NEAR ME
                </button>
                {techOpen && (
                  <div id="tech-center-popover" data-tech-center-popover className="dsc-tech-center-popover absolute bottom-full left-0 z-20 mb-3 w-64 rounded-xl border border-border bg-card p-4 text-left text-xs leading-5 text-muted shadow-2xl">
                    <p className="dsc-tech-center-popover-title font-semibold text-text">DS Cannabiz Tech Center</p>
                    <p className="mt-1">Los Angeles, CA, United States</p>
                    <p>info@weedevice.com</p>
                    <p>+1 (800) 123-4567</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <h4 className="text-text font-semibold text-sm uppercase tracking-wide">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href === '#talk-to-sales' ? (
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-sales-chat'))}
                        className="text-muted text-sm hover:text-text transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith('http') ? (
                      <a href={link.href} className="text-muted text-sm hover:text-white transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-muted text-sm hover:text-text transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="ds-container flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <p className="text-muted text-xs">© 2026 DS Cannabiz. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-muted text-xs hover:text-text">Privacy Policy</Link>
            <Link to="/terms" className="text-muted text-xs hover:text-text">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-3">
            {[LinkedinOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined].map((Icon, i) => (
              <button key={i} className="text-muted hover:text-white text-base transition-colors">
                <Icon />
              </button>
            ))}
            <button className="flex items-center gap-1 text-muted text-xs hover:text-white">
              <GlobalOutlined /> English
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
