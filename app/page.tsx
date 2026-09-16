'use client'

import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return <main className="landing-page">
    <nav className="landing-nav"><Link href="/" className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>LossLab</span></Link><div className="landing-links"><Link href="/app">Product</Link><Link href="/methodology">Methodology</Link><Link href="/use-cases">Use Cases</Link><Link href="/data">Data</Link><Link href="/about">About</Link></div><div className="landing-actions"><Link href="/login">Sign In</Link><Link href="/login?next=%2Fapp" className="landing-cta">Get Started <ArrowRight /></Link></div></nav>
    <section className="landing-hero"><div className="hero-overlay" /><div className="landing-copy"><span className="hero-eyebrow"><i /> CATASTROPHE RISK ANALYTICS</span><h1>See the losses<br />before they happen.</h1><p>LossLab transforms historical catastrophe data into probabilistic risk intelligence — modelling frequency, severity, exposure and tail losses across scenarios.</p><div className="hero-actions"><Link href="/app" className="hero-primary">Explore Risk <ChevronRight /></Link><Link href="/methodology" className="hero-secondary">View Methodology <ChevronRight /></Link></div></div><div className="hero-metrics"><strong><b>$2.84B</b><span>Expected Annual Loss</span></strong><strong><b>$18.7B</b><span>99% VaR</span></strong><strong><b>$27.3B</b><span>99% TVaR</span></strong><strong><b>7.4</b><span>Annual Event Frequency</span></strong><strong><b>4.8%</b><span>Exceedance Probability</span></strong></div></section>
  </main>
}
