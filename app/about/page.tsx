import Link from 'next/link'
import { ChevronRight, ArrowRight, ShieldCheck, Target, Zap, Globe, Lock, Award } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'

export default function AboutPage() {
  const pillars = [
    {
      title: 'Open & Transparent Actuarial Science',
      desc: 'We reject proprietary "black box" catastrophe models. Every distribution assumption, parameter calibration, and copula coefficient is visible, verifiable, and mathematically documented.',
      tag: 'Transparency',
      num: '01',
      icon: Target,
      href: '/methodology',
    },
    {
      title: 'Specialized for Extreme Tail Phenomena',
      desc: 'Standard Gaussian assumptions severely underestimate 1-in-100 and 1-in-250 year catastrophe events. LossLab is engineered from first principles around heavy-tailed Extreme Value Theory (EVT).',
      tag: 'EVT Tail Focus',
      num: '02',
      icon: ShieldCheck,
      href: '/app/loss-models',
    },
    {
      title: 'High-Throughput Vectorized Architecture',
      desc: 'Powered by DuckDB 1.1 columnar execution and vectorized NumPy simulation pipelines capable of evaluating 100,000 synthetic catastrophe years in sub-second runtimes without heavyweight clusters.',
      tag: 'Engine Architecture',
      num: '03',
      icon: Zap,
      href: '/app/monte-carlo',
    },
    {
      title: 'Multi-Peril Geospatial Corridors',
      desc: 'Correlating simultaneous seismic subduction ruptures, tropical cyclone landfall corridors, and riverine floodplains across 128 territorial catastrophe jurisdictions.',
      tag: 'Global Hazard',
      num: '04',
      icon: Globe,
      href: '/app/risk-explorer',
    },
    {
      title: 'Solvency II & Regulatory Grade Outputs',
      desc: 'Formally generates Expected Annual Loss (AAL), 99.0% VaR, and 99.5% TVaR (Expected Shortfall) capital schedules ready for board audit and regulatory submission.',
      tag: 'Regulatory Capital',
      num: '05',
      icon: Award,
      href: '/app/reports',
    },
    {
      title: 'Forward-Looking Climate Stress Scenarios',
      desc: 'Evaluate how warming oceans (+1.5°C to +3.0°C) and frequency shifts impact extreme tail capital requirements before catastrophic climate shocks materialize.',
      tag: 'Climate Resilience',
      num: '06',
      icon: Lock,
      href: '/app/scenarios',
    },
  ]

  return (
    <main className="public-page">
      <PublicNav />
      <section className="public-content">
        <span className="eyebrow" style={{ color: '#5ea5f9', fontWeight: 600, letterSpacing: '1.5px', fontSize: '12px' }}>
          LOSS LAB / ABOUT & MISSION
        </span>
        <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 400, letterSpacing: '-2.5px', margin: '18px 0', lineHeight: 1.05 }}>
          Quantifying tail catastrophe risk before it becomes loss.
        </h1>
        <p className="public-intro" style={{ maxWidth: '680px' }}>
          LossLab was founded by catastrophe risk modelers, actuaries, and systems engineers to provide institutions with defensible, modern, probabilistic risk intelligence.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
          <Link href="/app" className="primary-action">
            Enter Risk Platform <ArrowRight size={15} />
          </Link>
          <Link href="/methodology" className="select-button" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none' }}>
            Read Mathematical Methodology
          </Link>
        </div>

        <div className="public-grid">
          {pillars.map((item) => {
            const Icon = item.icon
            return (
              <article className="public-card" key={item.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{item.num}</span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(94,165,249,0.12)', color: '#7bb5f9', border: '1px solid rgba(94,165,249,0.25)' }}>
                    {item.tag}
                  </span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
                <Link href={item.href} className="card-action">
                  Inspect {item.tag} <ChevronRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
