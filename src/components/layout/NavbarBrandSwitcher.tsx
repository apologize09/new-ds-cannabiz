import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropdown } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { motion, useReducedMotion } from 'framer-motion'
import DsCannabizWordmark from '../ui/DsCannabizWordmark'
import './NavbarBrandSwitcher.css'

const DAWSEN_ICON = '/brand-logos/dawsen-icon.svg'

export default function NavbarBrandSwitcher() {
  const [open, setOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  const panel = (
    <div className="dsc-brand-switcher-panel" role="menu" aria-label="Switch brand">
      <Link
        to="/"
        role="menuitem"
        aria-current="page"
        className="dsc-brand-switcher-item dsc-brand-switcher-item--active"
        onClick={() => setOpen(false)}
      >
        <DsCannabizWordmark />
      </Link>
      <a
        href="https://dawsenai.com"
        role="menuitem"
        className="dsc-brand-switcher-item dsc-brand-switcher-item--dawsen"
        onClick={() => setOpen(false)}
      >
        <img
          src={DAWSEN_ICON}
          alt=""
          width={24}
          height={24}
          className="dsc-brand-switcher-dawsen-icon"
          draggable={false}
        />
        <span className="dsc-brand-switcher-dawsen-label">Dawsen</span>
      </a>
    </div>
  )

  return (
    <motion.div
      data-nav-enter
      className="shrink-0"
      whileHover={reducedMotion ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={['click']}
        placement="bottomLeft"
        overlayClassName="dsc-brand-switcher-overlay"
        menu={{ items: [] }}
        dropdownRender={() => panel}
      >
        <button
          type="button"
          aria-label="Switch brand"
          aria-expanded={open}
          className="dsc-brand-switcher-trigger"
        >
          <DsCannabizWordmark />
          <SwapOutlined className="dsc-brand-switcher-trigger-icon" aria-hidden="true" />
        </button>
      </Dropdown>
    </motion.div>
  )
}
