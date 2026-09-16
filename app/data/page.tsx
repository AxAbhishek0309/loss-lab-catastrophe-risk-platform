import Link from 'next/link'
import { ChevronRight, ArrowRight, Download, Database, CheckCircle2, Shield, Layers, HardDrive } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'

export default function DataPage() {
  const items = [
    {
      title: '50,022 Catalogued Catastrophe Events',
      desc: 'Normalized multi-decade observation record covering Earthquakes (USGS Mw ≥ 5.0), Tropical Cyclones (NOAA Saffir-Simpson 1-5), Severe Floods, and Wildfires with verified damage footprints.',
      tag: '50,022 Rows',
      href: '/app/events',
      num: '01',
      icon: Database,
    },
    {
      title: 'CPI Inflation-Adjusted Loss Normalization',
      desc: 'All economic damages and insured losses are benchmarked to 2024 constant USD via monthly Bureau of Labor Statistics (CPI-U) deflator indices, preventing historical distortion.',
      tag: '2024 USD Base',
      href: '/app/data',
      num: '02',
      icon: CheckCircle2,
    },
    {
      title: 'High-Resolution Geospatial Hazard Surfaces',
      desc: 'Spatial coverage spanning 128 countries, Ring of Fire subduction zones, Atlantic basin cyclone trajectories, and major European river floodplains.',
      tag: '128 Regions',
      href: '/app/risk-explorer',
      num: '03',
      icon: Layers,
    },
    {
      title: '$1.42 Trillion Modeled Insurable Exposure',
      desc: 'Commercial, industrial, residential, and infrastructure asset distributions classified into Reinforced Concrete, Steel Frame, Masonry, and Light Wood categories.',
      tag: '$1.42T TIV',
      href: '/app/exposure',
      num: '04',
      icon: Shield,
    },
    {
      title: 'In-Memory DuckDB 1.1 Columnar Store',
      desc: 'Sub-millisecond analytical aggregations, vector math execution, and zero-dependency embedded SQL querying directly from raw CSV structures.',
      tag: 'DuckDB OLAP',
      href: '/app/data',
      num: '05',
      icon: HardDrive,
    },
    {
      title: 'Exportable Audit-Ready Dossiers & Datasets',
      desc: 'Full CSV datasets, Solvency II capital schedules, exceedance probability tables, and executive loss dossiers exportable on demand for rating agency filings.',
      tag: 'Export Ready',
      href: '/app/reports',
      num: '06',
      icon: Download,
    },
  ]

  return (
    <main className="public-page">
      <PublicNav />
      <section className="public-content">
        <span className="eyebrow" style={{ color: '#5ea5f9', fontWeight: 600, letterSpacing: '1.5px', fontSize: '12px' }}>
          LOSS LAB / DATA INTELLIGENCE & LINEAGE
        </span>
        <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 400, letterSpacing: '-2.5px', margin: '18px 0', lineHeight: 1.05 }}>
          A foundation built on verified catastrophe evidence.
        </h1>
        <p className="public-intro" style={{ maxWidth: '680px' }}>
          LossLab is powered by a master dataset of 50,022 historical catastrophe observations and synthetic stochastic events. Every loss datum maintains complete government lineage and CPI-adjusted valuation.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
          <a
            href="/catastrophe_events.csv"
            download="catastrophe_events_50k.csv"
            className="primary-action"
          >
            <Download size={15} /> Download 50,000-Row CSV (Full Dataset)
          </a>
          <Link href="/app/events" className="select-button" style={{ padding: '10px 18px', fontSize: '13px', textDecoration: 'none' }}>
            Filter & Search Events in App
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
                  Explore in workspace <ChevronRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
