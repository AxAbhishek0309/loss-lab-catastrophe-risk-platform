'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Database,
  FileText,
  Globe2,
  Grid2X2,
  Home,
  LineChart,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from 'lucide-react'

export const APP_NAV_ITEMS = [
  { label: 'Overview', href: '/app', icon: Grid2X2 },
  { label: 'Risk Explorer', href: '/app/risk-explorer', icon: ShieldAlert },
  { label: 'Catastrophe Events', href: '/app/events', icon: AlertTriangle },
  { label: 'Exposure', href: '/app/exposure', icon: Globe2 },
  { label: 'Loss Models', href: '/app/loss-models', icon: LineChart },
  { label: 'Monte Carlo', href: '/app/monte-carlo', icon: Activity },
  { label: 'Scenarios', href: '/app/scenarios', icon: SlidersHorizontal },
  { label: 'Reports', href: '/app/reports', icon: FileText },
  { label: 'Data', href: '/app/data', icon: Database, isBreak: true },
  { label: 'Model Configuration', href: '/app/model-configuration', icon: Settings },
  { label: 'Settings', href: '/app/settings', icon: Settings },
] as const

interface RouteShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  eyebrow?: string
  actions?: React.ReactNode
}

export function RouteShell({ title, subtitle, eyebrow, children, actions }: RouteShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="product-shell">
      <aside className={`sidebar route-sidebar ${open ? 'open' : ''}`}>
        <button className="route-close" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
        <Link href="/app" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>LossLab</span>
        </Link>
        <nav aria-label="Application navigation">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''} ${'isBreak' in item && item.isBreak ? 'nav-break' : ''}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="profile">
          <div className="avatar">AT</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>Abhishek Tiwari</strong>
            <small>Risk Analyst</small>
          </div>
          <Link href="/" className="logout-button" title="Sign Out & Return to Hero Section" aria-label="Sign out">
            <LogOut size={16} />
          </Link>
        </div>
      </aside>

      {open && <button className="route-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}

      <main className="route-main">
        <header className="route-topbar">
          <button className="route-menu" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div>
            <span>{eyebrow || `RISK OVERVIEW / ${title.toUpperCase()}`}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="route-actions">
            {actions}
            <Link href="/" className="exit-hero-pill" title="Return to Hero Section">
              <Home size={13} /> Hero Section
            </Link>
            <div className="search">
              <span>⌕</span>
              <input
                aria-label="Search"
                placeholder="Search events, models..."
                style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%', fontSize: '12px' }}
              />
            </div>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <Link href="/" className="top-avatar" title="Sign Out to Hero Section">
              AT
            </Link>
          </div>
        </header>

        <div className="route-content">
          {children}
        </div>
      </main>
    </div>
  )
}
