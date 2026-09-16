'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function PublicNav() {
  const pathname = usePathname()

  const links = [
    { href: '/app', label: 'Product' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/use-cases', label: 'Use Cases' },
    { href: '/data', label: 'Data' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="landing-nav public-nav-fixed">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>LossLab</span>
      </Link>

      <div className="landing-links">
        {links.map((l) => {
          const isActive = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: isActive ? '#ffffff' : '#9bb2cc',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13.5px',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                borderBottom: isActive ? '2px solid #5ea5f9' : '2px solid transparent',
                paddingBottom: '2px',
              }}
            >
              {l.label}
            </Link>
          )
        })}
      </div>

      <div className="landing-actions">
        <Link
          href="/login"
          style={{ color: '#c5d9ed', fontSize: '13.5px', textDecoration: 'none', fontWeight: 500 }}
        >
          Sign In
        </Link>
        <Link href="/app" className="landing-cta" style={{ textDecoration: 'none' }}>
          Open platform <ArrowRight size={15} />
        </Link>
      </div>
    </nav>
  )
}
