import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CloseOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { Check, Instagram, Linkedin, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './NavbarBrandSwitcher.css'

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

const socialLinks = [
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { Icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
]

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
    <footer className="dsc-site-footer border-t border-border bg-bg">
      <div className="dsc-footer-main ds-container px-6 py-16 sm:px-8">
        <div className="dsc-footer-grid grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2 flex flex-col items-start gap-6">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/brand-logos/ds-cannabiz-wordmark.svg"
                alt="DS Cannabiz"
                width={146}
                height={26}
                className="dsc-brand-switcher-wordmark"
                draggable={false}
              />
            </Link>
            <p className="dsc-footer-desc text-sm leading-relaxed max-w-xs">
              Your one-stop B2B platform for cannabis products on AI-powered sourcing and 3D CMF customization.
            </p>
            <div className="w-full space-y-3">
              <p className="dsc-footer-subscribe-label text-xs font-semibold uppercase tracking-widest">
                Subscribe &amp; Get News
              </p>
              <form onSubmit={subscribe} className="dsc-footer-subscribe-form flex w-full max-w-xs gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setSubscribed(false) }}
                  placeholder="Enter your email"
                  className="dsc-footer-subscribe-input flex-1 text-sm px-3 py-2 rounded-lg focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe & Get News"
                  className="dsc-footer-subscribe-submit"
                >
                  {subscribed ? (
                    <Check
                      aria-hidden="true"
                      className="dsc-footer-subscribe-submit__icon"
                      size={16}
                      stroke="#000"
                      strokeWidth={2}
                    />
                  ) : (
                    <Send
                      aria-hidden="true"
                      className="dsc-footer-subscribe-submit__icon"
                      size={16}
                      stroke="#000"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </form>
            </div>
            <div className="dsc-footer-contact">
              <div className="dsc-footer-contact__item">
                <p className="dsc-footer-contact__label">How can we help?</p>
                <p className="dsc-footer-contact__value">info@weedevice.com</p>
              </div>
              <div className="dsc-footer-contact__item">
                <p className="dsc-footer-contact__label">Contact Us</p>
                <p className="dsc-footer-contact__value">+1 (800) 123-4567</p>
              </div>
              <div className="dsc-footer-contact__item">
                <p className="dsc-footer-contact__label">HQ Location</p>
                <p className="dsc-footer-contact__value">Los Angeles, CA, United States</p>
              </div>
              <div
                className="dsc-footer-contact__tech relative"
                onMouseEnter={() => setTechOpen(true)}
                onMouseLeave={() => setTechOpen(false)}
              >
                <button
                  type="button"
                  data-tech-center-trigger
                  aria-expanded={techOpen}
                  aria-controls="tech-center-popover"
                  onClick={() => setTechOpen((open) => !open)}
                  className={`dsc-footer-tech-center-trigger${techOpen ? ' is-open' : ''}`}
                >
                  <EnvironmentOutlined aria-hidden="true" />
                  TECH CENTER NEAR ME
                </button>
                {techOpen && (
                  <div
                    id="tech-center-popover"
                    data-tech-center-popover
                    className="dsc-tech-center-popover"
                    role="dialog"
                    aria-label="New York Service Center"
                  >
                    <div className="dsc-tech-center-popover__header">
                      <h3 className="dsc-tech-center-popover__title">NEW YORK SERVICE CENTER</h3>
                      <button
                        type="button"
                        className="dsc-tech-center-popover__close"
                        aria-label="Close"
                        onClick={() => setTechOpen(false)}
                      >
                        <CloseOutlined aria-hidden="true" />
                      </button>
                    </div>
                    <div className="dsc-tech-center-popover__map">
                      <img
                        src="/figma/footer/tech-center-map.png"
                        alt=""
                        width={420}
                        height={168}
                        draggable={false}
                      />
                    </div>
                    <div className="dsc-tech-center-popover__details">
                      <div className="dsc-tech-center-popover__detail">
                        <MapPin aria-hidden="true" size={14} stroke="#22d8c2" strokeWidth={1.75} />
                        <span>Los Angeles, CA, United States</span>
                      </div>
                      <div className="dsc-tech-center-popover__detail-row">
                        <div className="dsc-tech-center-popover__detail">
                          <Phone aria-hidden="true" size={14} stroke="#22d8c2" strokeWidth={1.75} />
                          <span>+1 (800) 123-4567</span>
                        </div>
                        <div className="dsc-tech-center-popover__detail">
                          <Mail aria-hidden="true" size={14} stroke="#22d8c2" strokeWidth={1.75} />
                          <span>info@weedevice.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="dsc-footer-nav space-y-4">
              <h4 className="dsc-footer-nav-heading text-sm uppercase tracking-wide">{section}</h4>
              <ul className="dsc-footer-nav-list space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href === '#talk-to-sales' ? (
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-sales-chat'))}
                        className="dsc-footer-nav-link text-sm transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : link.href.startsWith('http') ? (
                      <a href={link.href} className="dsc-footer-nav-link text-sm transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="dsc-footer-nav-link text-sm transition-colors">
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

      <div className="dsc-footer-bottom border-t border-border">
        <div className="ds-container dsc-footer-bottom__inner flex flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row sm:px-8">
          <p className="dsc-footer-bottom-copy text-xs">© 2026 DS Cannabiz. All rights reserved.</p>
          <div className="dsc-footer-bottom-legal flex items-center gap-3">
            <Link to="/privacy" className="dsc-footer-bottom-link text-xs transition-colors">Privacy Policy</Link>
            <span className="dsc-footer-bottom-divider" aria-hidden="true">|</span>
            <Link to="/terms" className="dsc-footer-bottom-link text-xs transition-colors">Terms of Service</Link>
          </div>
          <div className="dsc-footer-bottom-actions flex items-center gap-3">
            {socialLinks.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="dsc-footer-social-btn transition-colors"
              >
                <Icon aria-hidden="true" size={14} strokeWidth={1.5} />
              </a>
            ))}
            <button type="button" className="dsc-footer-lang-btn flex items-center gap-1.5 text-xs transition-colors">
              <GlobalOutlined aria-hidden="true" />
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
