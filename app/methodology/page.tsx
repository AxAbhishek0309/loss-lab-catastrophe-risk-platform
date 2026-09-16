import Link from 'next/link'
import { ChevronRight, ArrowRight, Activity, BarChart2, ShieldCheck, Database, Cpu, Layers } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'

export default function MethodologyPage() {
  const steps = [
    {
      num: '01',
      title: 'Historical Data Ingestion & CPI Normalization',
      desc: 'LossLab ingests verified disaster catalogs from the USGS Earthquake Hazards API and NOAA Storm Events Database. All historical losses from 1970 through 2026 are inflation-adjusted to constant 2024 USD using monthly CPI-U indices.',
      tag: 'Data Pipeline',
      href: '/app/data',
      icon: Database,
    },
    {
      num: '02',
      title: 'Overdispersed Arrival Frequency Calibration',
      desc: 'Annual event arrival counts are calibrated using Negative Binomial and Poisson distributions. The Negative Binomial parameterization (mean λ, dispersion α) explicitly accounts for event clustering during active hurricane or seismic cycles.',
      tag: 'Frequency Model',
      href: '/app/loss-models',
      icon: BarChart2,
    },
    {
      num: '03',
      title: 'Extreme Value Theory & Tail Severity (POT)',
      desc: 'Tail losses above an analytical threshold u ($500M) are fitted using Peaks-Over-Threshold (POT) Generalized Pareto Distributions (GPD). Goodness-of-fit is verified through AIC, BIC, and Kolmogorov-Smirnov statistical tests.',
      tag: 'Severity Model',
      href: '/app/loss-models',
      icon: Activity,
    },
    {
      num: '04',
      title: 'Vectorized 100,000-Year Monte Carlo Simulation',
      desc: 'A vectorized engine generates synthetic simulation catalogs by drawing annual frequencies N ~ NegBin(r, p) and compounding individual event losses X_i ~ GPD(ξ, σ). Runs in under 350ms for 50,000 trials.',
      tag: 'Simulation Engine',
      href: '/app/monte-carlo',
      icon: Cpu,
    },
    {
      num: '05',
      title: 'Multi-Peril Copula Dependency Modeling',
      desc: 'Correlated catastrophe hazards (e.g., hurricane wind + storm surge, earthquake + secondary tsunami) are modeled via Clayton and Gumbel copulas to prevent underestimating simultaneous multi-region losses.',
      tag: 'Copula Dependencies',
      href: '/app/model-configuration',
      icon: Layers,
    },
    {
      num: '06',
      title: 'Solvency II Capital Adequacy & TVaR',
      desc: 'Computes regulatory risk capital: Expected Annual Loss (AAL), 99.0% Value-at-Risk (1-in-100 year), and 99.5% Tail Value-at-Risk (TVaR / Expected Shortfall) to fulfill Solvency II internal model standards.',
      tag: 'Capital Adequacy',
      href: '/app/reports',
      icon: ShieldCheck,
    },
  ]

  return (
    <main className="public-page">
      <PublicNav />
      <section className="public-content">
        <span className="eyebrow" style={{ color: '#5ea5f9', fontWeight: 600, letterSpacing: '1.5px', fontSize: '12px' }}>
          LOSS LAB / QUANTITATIVE METHODOLOGY
        </span>
        <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 400, letterSpacing: '-2.5px', margin: '18px 0', lineHeight: 1.05 }}>
          From empirical catastrophe data to forward-looking risk intelligence.
        </h1>
        <p className="public-intro" style={{ maxWidth: '680px' }}>
          LossLab eliminates black-box catastrophe modelling with an open, reproducible framework grounded in Extreme Value Theory, overdispersed count processes, and high-throughput Monte Carlo simulation.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
          <Link href="/app/monte-carlo" className="primary-action">
            Launch Monte Carlo Simulator <ArrowRight size={15} />
          </Link>
          <Link href="/app/loss-models" className="select-button" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none' }}>
            Inspect Calibrated Distributions
          </Link>
        </div>

        <div className="public-grid">
          {steps.map((item) => {
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
                  Open module in workspace <ChevronRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
