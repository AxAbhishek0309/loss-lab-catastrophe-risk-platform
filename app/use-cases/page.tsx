import Link from 'next/link'
import { ChevronRight, ArrowRight, ShieldCheck, DollarSign, Building, AlertTriangle, Compass, FileCheck } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'

export default function UseCasesPage() {
  const items = [
    {
      title: 'Insurance Underwriting & Portfolio Pricing',
      desc: 'Price commercial property and municipal portfolios with actuarially sound pure premiums grounded in empirical damage curves rather than static loss tables.',
      tag: 'Underwriting',
      href: '/app/exposure',
      num: '01',
      icon: DollarSign,
    },
    {
      title: 'Reinsurance Treaty Structuring',
      desc: 'Model attachment points, exhaustion limits, and reinsurance premium rates for Excess of Loss (XOL) and Catastrophe Aggregate layers across 100-year and 250-year return periods.',
      tag: 'Reinsurance',
      href: '/app/monte-carlo',
      num: '02',
      icon: ShieldCheck,
    },
    {
      title: 'Solvency II Capital Adequacy & ORSA',
      desc: 'Calculate 99.5% 1-year Value-at-Risk and Tail Value-at-Risk (TVaR) schedules for regulatory compliance, internal capital assessments (ORSA), and credit rating defense.',
      tag: 'Capital & ORSA',
      href: '/app/reports',
      num: '03',
      icon: FileCheck,
    },
    {
      title: 'Extreme Climate & Historical Replay Scenarios',
      desc: 'Stress test portfolio solvency against historical megathrusts (1906 San Francisco replay, 2005 Katrina track shift) or forward-looking +2.0°C global warming severity escalations.',
      tag: 'Stress Testing',
      href: '/app/scenarios',
      num: '04',
      icon: AlertTriangle,
    },
    {
      title: 'Geospatial Hazard & Asset Clustering',
      desc: 'Inspect spatial density of multi-peril exposure within 150 km of subduction zones and Atlantic/Pacific cyclone landfall tracks across 128 global regions.',
      tag: 'GIS Analytics',
      href: '/app/risk-explorer',
      num: '05',
      icon: Compass,
    },
    {
      title: 'Infrastructure Resilience & Business Interruption',
      desc: 'Model vulnerability curves, replacement values, and expected downtime for ports, energy terminals, and public utilities under compound multi-peril disasters.',
      tag: 'Infrastructure',
      href: '/app/events',
      num: '06',
      icon: Building,
    },
  ]

  return (
    <main className="public-page">
      <PublicNav />
      <section className="public-content">
        <span className="eyebrow" style={{ color: '#5ea5f9', fontWeight: 600, letterSpacing: '1.5px', fontSize: '12px' }}>
          LOSS LAB / USE CASES & APPLICATIONS
        </span>
        <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 400, letterSpacing: '-2.5px', margin: '18px 0', lineHeight: 1.05 }}>
          Risk intelligence for consequential capital decisions.
        </h1>
        <p className="public-intro" style={{ maxWidth: '680px' }}>
          From primary underwriters pricing catastrophic treaties to Chief Risk Officers establishing capital reserves, LossLab provides defensible, empirical risk quantification.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
          <Link href="/app" className="primary-action">
            Open Risk Workspace <ArrowRight size={15} />
          </Link>
          <Link href="/app/risk-explorer" className="select-button" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none' }}>
            Explore Global Hazard Surface
          </Link>
        </div>

        <div className="public-grid">
          {items.map((item) => {
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
                  Launch {item.tag} in app <ChevronRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
