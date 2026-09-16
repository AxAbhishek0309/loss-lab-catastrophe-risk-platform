'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useOverview } from '@/lib/api/hooks'
import { getModelConfig, subscribeModelConfig, ModelConfig } from '@/lib/model-config'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  Globe2,
  Grid2X2,
  Home,
  Info,
  Layers,
  LineChart,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// --- Simulated Loss Distribution Data ---
const lossData = [
  { loss: 0, density: 0.012 }, { loss: 2, density: 0.036 }, { loss: 4, density: 0.061 },
  { loss: 6, density: 0.074 }, { loss: 8, density: 0.068 }, { loss: 10, density: 0.052 },
  { loss: 12, density: 0.04 }, { loss: 15, density: 0.027 }, { loss: 18.7, density: 0.019 },
  { loss: 22, density: 0.012 }, { loss: 27.3, density: 0.008 }, { loss: 32, density: 0.004 },
  { loss: 40, density: 0.002 }, { loss: 50, density: 0.001 },
]

// Exceedance Probability (EP / 1-CDF) curve
const epData = [
  { loss: 0, ep: 1.000, rp: '1-yr' },
  { loss: 2, ep: 0.640, rp: '1.6-yr' },
  { loss: 4, ep: 0.385, rp: '2.6-yr' },
  { loss: 6, ep: 0.220, rp: '4.5-yr' },
  { loss: 8, ep: 0.125, rp: '8-yr' },
  { loss: 10, ep: 0.072, rp: '14-yr' },
  { loss: 12, ep: 0.042, rp: '24-yr' },
  { loss: 15, ep: 0.021, rp: '48-yr' },
  { loss: 18.7, ep: 0.010, rp: '100-yr (VaR)' },
  { loss: 22, ep: 0.005, rp: '200-yr' },
  { loss: 27.3, ep: 0.002, rp: '500-yr (TVaR)' },
  { loss: 35, ep: 0.001, rp: '1,000-yr' },
  { loss: 50, ep: 0.0002, rp: '5,000-yr' },
]

// Historical Frequency Data by Peril
const frequencyByPeril: Record<string, { year: string; value: number }[]> = {
  All: [
    { year: '2010', value: 5 }, { year: '2011', value: 8 }, { year: '2012', value: 6 }, { year: '2013', value: 9 },
    { year: '2014', value: 9 }, { year: '2015', value: 13 }, { year: '2016', value: 10 }, { year: '2017', value: 16 },
    { year: '2018', value: 15 }, { year: '2019', value: 21 }, { year: '2020', value: 17 }, { year: '2021', value: 13 },
    { year: '2022', value: 17 }, { year: '2023', value: 19 }, { year: '2024', value: 13 }, { year: '2025', value: 18 }, { year: '2026', value: 18 },
  ],
  Flood: [
    { year: '2010', value: 2 }, { year: '2011', value: 3 }, { year: '2012', value: 2 }, { year: '2013', value: 4 },
    { year: '2014', value: 3 }, { year: '2015', value: 5 }, { year: '2016', value: 4 }, { year: '2017', value: 6 },
    { year: '2018', value: 5 }, { year: '2019', value: 8 }, { year: '2020', value: 6 }, { year: '2021', value: 5 },
    { year: '2022', value: 7 }, { year: '2023', value: 7 }, { year: '2024', value: 5 }, { year: '2025', value: 6 }, { year: '2026', value: 6 },
  ],
  Cyclone: [
    { year: '2010', value: 1 }, { year: '2011', value: 2 }, { year: '2012', value: 1 }, { year: '2013', value: 2 },
    { year: '2014', value: 2 }, { year: '2015', value: 3 }, { year: '2016', value: 2 }, { year: '2017', value: 5 },
    { year: '2018', value: 4 }, { year: '2019', value: 5 }, { year: '2020', value: 4 }, { year: '2021', value: 3 },
    { year: '2022', value: 4 }, { year: '2023', value: 5 }, { year: '2024', value: 3 }, { year: '2025', value: 4 }, { year: '2026', value: 4 },
  ],
  Earthquake: [
    { year: '2010', value: 1 }, { year: '2011', value: 2 }, { year: '2012', value: 1 }, { year: '2013', value: 1 },
    { year: '2014', value: 2 }, { year: '2015', value: 2 }, { year: '2016', value: 2 }, { year: '2017', value: 2 },
    { year: '2018', value: 3 }, { year: '2019', value: 3 }, { year: '2020', value: 2 }, { year: '2021', value: 2 },
    { year: '2022', value: 3 }, { year: '2023', value: 4 }, { year: '2024', value: 2 }, { year: '2025', value: 3 }, { year: '2026', value: 3 },
  ],
  Wildfire: [
    { year: '2010', value: 1 }, { year: '2011', value: 1 }, { year: '2012', value: 1 }, { year: '2013', value: 1 },
    { year: '2014', value: 1 }, { year: '2015', value: 2 }, { year: '2016', value: 1 }, { year: '2017', value: 2 },
    { year: '2018', value: 2 }, { year: '2019', value: 3 }, { year: '2020', value: 3 }, { year: '2021', value: 2 },
    { year: '2022', value: 2 }, { year: '2023', value: 2 }, { year: '2024', value: 2 }, { year: '2025', value: 3 }, { year: '2026', value: 3 },
  ],
  Storm: [
    { year: '2010', value: 0 }, { year: '2011', value: 0 }, { year: '2012', value: 1 }, { year: '2013', value: 1 },
    { year: '2014', value: 1 }, { year: '2015', value: 1 }, { year: '2016', value: 1 }, { year: '2017', value: 1 },
    { year: '2018', value: 1 }, { year: '2019', value: 2 }, { year: '2020', value: 2 }, { year: '2021', value: 1 },
    { year: '2022', value: 1 }, { year: '2023', value: 1 }, { year: '2024', value: 1 }, { year: '2025', value: 2 }, { year: '2026', value: 2 },
  ],
}

// Severity Data: Interquartile vs Tail Max
const severityData = [
  { type: 'Flood', med: 900, q3: 2200, max: 8000 },
  { type: 'Earthquake', med: 1900, q3: 4300, max: 18000 },
  { type: 'Cyclone', med: 1400, q3: 2800, max: 9500 },
  { type: 'Wildfire', med: 700, q3: 1700, max: 7000 },
  { type: 'Drought', med: 800, q3: 1800, max: 11000 },
  { type: 'Storm', med: 1100, q3: 2600, max: 9000 },
]

// Peril Mix Donut Data
const mixData = [
  { name: 'Flood', value: 28, loss: '$397.6B', color: '#6ea8ff' },
  { name: 'Earthquake', value: 22, loss: '$312.4B', color: '#4d7fca' },
  { name: 'Cyclone', value: 18, loss: '$255.6B', color: '#55c6bd' },
  { name: 'Storm', value: 14, loss: '$198.8B', color: '#f0a261' },
  { name: 'Wildfire', value: 10, loss: '$142.0B', color: '#db746f' },
  { name: 'Drought', value: 8, loss: '$113.6B', color: '#f2c06b' },
]

// Regional Analytics Data
const regionsData = {
  all: { name: 'Global', events: '50,022', exposure: '$1.42T', aal: '$2.84B', topPeril: 'Cyclone & Flood', riskTier: 'High' },
  na: { name: 'North America', events: '14,810', exposure: '$482B', aal: '$940M', topPeril: 'Hurricane & Wildfire', riskTier: 'Very High' },
  apac: { name: 'Asia-Pacific', events: '21,340', exposure: '$596B', aal: '$1,180M', topPeril: 'Typhoon & Quake', riskTier: 'Critical' },
  eu: { name: 'Europe', events: '8,420', exposure: '$214B', aal: '$430M', topPeril: 'Windstorm & Flood', riskTier: 'Moderate' },
  latam: { name: 'Latin America', events: '5,452', exposure: '$88B', aal: '$195M', topPeril: 'Subduction Quake', riskTier: 'High' },
}

// 2 New Actuarial Graphs Datasets:
// 1. Regional Exposure vs Modelled AAL
const regionalExposureAAL = [
  { region: 'North America', tiv: 482, aal: 940, lossCost: '19.5 bps' },
  { region: 'Asia-Pacific', tiv: 596, aal: 1180, lossCost: '19.8 bps' },
  { region: 'Europe', tiv: 214, aal: 430, lossCost: '20.1 bps' },
  { region: 'Latin America', tiv: 88, aal: 195, lossCost: '22.2 bps' },
  { region: 'Mid-East & Africa', tiv: 42, aal: 95, lossCost: '22.6 bps' },
]

// 2. 15-Year Historical Cat Loss Volatility vs 5-Year Climate Baseline
const historicalLossVolatility = [
  { year: '2010', loss: 8.4, baseline: 7.8, tailRisk: 25 },
  { year: '2011', loss: 24.2, baseline: 11.2, tailRisk: 25 }, // Tohoku & Christchurch
  { year: '2012', loss: 14.1, baseline: 11.8, tailRisk: 25 }, // Sandy
  { year: '2013', loss: 9.6, baseline: 12.1, tailRisk: 25 },  // Haiyan
  { year: '2014', loss: 8.9, baseline: 13.0, tailRisk: 25 },
  { year: '2015', loss: 11.4, baseline: 11.6, tailRisk: 25 },
  { year: '2016', loss: 15.8, baseline: 12.0, tailRisk: 25 },
  { year: '2017', loss: 26.8, baseline: 14.5, tailRisk: 25 }, // Harvey/Irma/Maria
  { year: '2018', loss: 18.2, baseline: 16.2, tailRisk: 25 }, // Camp Fire
  { year: '2019', loss: 14.7, baseline: 17.4, tailRisk: 25 }, // Hagibis
  { year: '2020', loss: 19.3, baseline: 19.0, tailRisk: 25 }, // Record Gulf hurricanes
  { year: '2021', loss: 21.5, baseline: 20.1, tailRisk: 25 }, // Ida & Bernd
  { year: '2022', loss: 20.8, baseline: 21.1, tailRisk: 25 }, // Ian
  { year: '2023', loss: 23.4, baseline: 21.9, tailRisk: 25 }, // Turkiye & Otis
  { year: '2024', loss: 18.6, baseline: 20.7, tailRisk: 25 },
  { year: '2025', loss: 21.2, baseline: 21.0, tailRisk: 25 },
  { year: '2026', loss: 22.4, baseline: 21.3, tailRisk: 25 },
]

const events = [
  ['Typhoon Saola', 'Cyclone', 'Philippines', 'Aug 30, 2023', 'Cat 4', '$12.6B', '3.4M', 'High'],
  ['Turkiye-Syria Earthquake', 'Earthquake', 'Turkey', 'Feb 6, 2023', '7.8', '$34.2B', '15.8M', 'Very High'],
  ['Hurricane Otis', 'Cyclone', 'Mexico', 'Oct 25, 2023', 'Cat 5', '$16.8B', '0.8M', 'High'],
  ['Eastern US Floods', 'Flood', 'United States', 'Jul 9, 2023', '—', '$8.4B', '2.1M', 'Medium'],
  ['Canada Wildfires', 'Wildfire', 'Canada', 'Jun 1, 2023', '—', '$9.1B', '1.3M', 'Medium'],
]

function MiniSpark({ color = '#70adff' }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 30" className="mini-spark" aria-hidden="true">
      <polyline points="0,25 12,19 22,22 34,13 44,15 56,7 68,11 80,2 90,8 100,0" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function MetricCard({
  id,
  title,
  value,
  change,
  negative = false,
  active = false,
  onClick,
}: {
  id: string
  title: string
  value: string
  change: string
  negative?: boolean
  active?: boolean
  onClick?: () => void
}) {
  return (
    <article
      className={`metric-card ${active ? 'metric-card-active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${value}`}
    >
      <p>{title}</p>
      <div className="metric-value">{value}</div>
      <div className={negative ? 'metric-change negative' : 'metric-change'}>
        {negative ? <TrendingDown /> : <TrendingUp />}
        {change}
      </div>
      <MiniSpark color={negative ? '#f47e7c' : active ? '#5ea5f9' : '#74b4ff'} />
    </article>
  )
}

function Panel({
  title,
  subtitle,
  children,
  className = '',
  action,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Page() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[number] | null>(null)
  const [year, setYear] = useState('2026')

  // --- Interactive States ---
  const [activeKpi, setActiveKpi] = useState<'aal' | 'avg' | 'var' | 'tvar' | 'freq'>('aal')
  const [curveMode, setCurveMode] = useState<'density' | 'ep'>('density')
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'na' | 'apac' | 'eu' | 'latam'>('all')
  const [selectedPeril, setSelectedPeril] = useState<string>('All')
  const [severityScale, setSeverityScale] = useState<'log' | 'linear'>('log')
  const [severityView, setSeverityView] = useState<'q3' | 'max'>('q3')
  const [activePerilMix, setActivePerilMix] = useState<string | null>(null)

  const [sessionConfig, setSessionConfig] = useState<ModelConfig | null>(null)

  useEffect(() => {
    setSessionConfig(getModelConfig())
    return subscribeModelConfig((cfg) => {
      setSessionConfig(cfg)
    })
  }, [])

  const { data: apiData } = useOverview(year)
  const filteredEvents = useMemo(() => (year === '2026' ? events : events.slice(0, 3)), [year])

  const activeAal = sessionConfig?.isCustomSession ? sessionConfig.aal : (apiData ? apiData.expected_annual_loss : 2.84)
  const activeVar99 = sessionConfig?.isCustomSession ? sessionConfig.var99 : (apiData ? apiData.var_99 : 18.72)
  const activeTvar99 = sessionConfig?.isCustomSession ? sessionConfig.tvar99 : (apiData ? apiData.tvar_99 : 27.34)
  const activeFreq = sessionConfig?.isCustomSession ? sessionConfig.annualFrequency : (apiData ? apiData.annual_event_frequency : 7.4)

  const aalDisplay = `$${activeAal.toFixed(2)}B`
  const varDisplay = `$${activeVar99.toFixed(2)}B`
  const tvarDisplay = `$${activeTvar99.toFixed(2)}B`
  const avgDisplay = apiData ? `$${Math.round(apiData.average_event_loss * 1000)}M` : '$412M'
  const freqDisplay = `${activeFreq}`

  // Peril frequency line data
  const currentFreqData = frequencyByPeril[selectedPeril] || frequencyByPeril.All

  // KPI Explanations
  const kpiDetails = {
    aal: {
      title: 'Expected Annual Loss (AAL / Technical Pure Premium)',
      desc: `${aalDisplay} — Arithmetic mean of simulated annual aggregate losses across 50,000 catastrophe event iterations. Serves as pure loss benchmark before risk loading and expense margins.`,
    },
    avg: {
      title: 'Average Event Loss Severity',
      desc: `${avgDisplay} — Mean economic loss incurred per catastrophe event occurrence across global hydrological, meteorological, and geophysical peril vectors.`,
    },
    var: {
      title: '99% Value at Risk (1-in-100 Year Aggregate Annual Loss)',
      desc: `${varDisplay} — The loss threshold that has a 1.0% annual exceedance probability (OEP). Only 1% of simulated catastrophe years exceed this value.`,
    },
    tvar: {
      title: '99% Tail Value at Risk (TVaR / Expected Shortfall)',
      desc: `${tvarDisplay} — The expected mean annual loss conditioned on exceeding the 99% VaR threshold. Crucial actuarial metric for solvency capital (Solvency II & Swiss Solvency Test).`,
    },
    freq: {
      title: 'Annual Event Frequency (Poisson Parameter λ)',
      desc: `${freqDisplay} events/year — Annualized catastrophe event arrival rate across all monitored perils and regional exposure zones in the 50,000-event portfolio.`,
    },
  }

  const nav = [
    ['Overview', '/app', Grid2X2],
    ['Risk Explorer', '/app/risk-explorer', ShieldAlert],
    ['Catastrophe Events', '/app/events', AlertTriangle],
    ['Exposure', '/app/exposure', Globe2],
    ['Loss Models', '/app/loss-models', LineChart],
    ['Monte Carlo', '/app/monte-carlo', Activity],
    ['Scenarios', '/app/scenarios', SlidersHorizontal],
    ['Reports', '/app/reports', FileText],
    ['Data', '/app/data', Database],
    ['Model Configuration', '/app/model-configuration', Settings],
    ['Settings', '/app/settings', Settings],
  ] as const

  const activeRegionStats = regionsData[selectedRegion]

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <Link href="/" className="brand" title="Return to Hero Landing Page">
          <div className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span>LossLab</span>
        </Link>
        <nav aria-label="Primary navigation">
          {nav.map(([label, href, Icon], index) => (
            <Link
              key={label}
              href={href}
              className={`nav-item ${href === '/app' ? 'active' : ''} ${index === 8 ? 'nav-break' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon />
              {label}
            </Link>
          ))}
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
        <p className="sidebar-note">
          Quantifying uncertainty
          <br />
          before it becomes loss.
        </p>
      </aside>

      {menuOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Menu />
            </button>
            <div className="heading">
              <span>DASHBOARD</span>
              <h1>{active === 'Overview' ? 'Risk Overview' : active}</h1>
              <p>Global catastrophe exposure and modelled loss intelligence.</p>
            </div>
          </div>
          <div className="top-actions">
            <Link href="/" className="exit-hero-pill" title="Return to Landing Hero Section">
              <Home size={13} /> Hero Section
            </Link>
            <div className="search">
              <Search />
              <input aria-label="Search" placeholder="Search events, regions, models..." />
              <kbd>⌘ K</kbd>
            </div>
            <div className="year-control">
              <CalendarDays />
              <select aria-label="Select year" value={year} onChange={(event) => setYear(event.target.value)}>
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
              </select>
              <ChevronDown />
            </div>
            <div className="updated">
              <i />{' '}
              <span>
                Data updated<br />
                <strong>Sep 16, 2026</strong>
              </span>
            </div>
            <button className="icon-button" aria-label="Notifications">
              <Bell />
              <i />
            </button>
            <Link href="/" className="top-avatar" title="Sign Out to Hero Section">
              AT
            </Link>
          </div>
        </header>

        <div className="content" id="risk-overview">
          {/* Interactive KPI Cards */}
          <div className="metrics">
            <MetricCard
              id="aal"
              title="Expected Annual Loss"
              value={aalDisplay}
              change="+8.4%"
              active={activeKpi === 'aal'}
              onClick={() => setActiveKpi('aal')}
            />
            <MetricCard
              id="avg"
              title="Average Event Loss"
              value={avgDisplay}
              change="+5.1%"
              active={activeKpi === 'avg'}
              onClick={() => setActiveKpi('avg')}
            />
            <MetricCard
              id="var"
              title="99% VaR (100-Yr)"
              value={varDisplay}
              change="+12.6%"
              active={activeKpi === 'var'}
              onClick={() => setActiveKpi('var')}
            />
            <MetricCard
              id="tvar"
              title="99% TVaR (Tail Risk)"
              value={tvarDisplay}
              change="+10.2%"
              active={activeKpi === 'tvar'}
              onClick={() => setActiveKpi('tvar')}
            />
            <MetricCard
              id="freq"
              title="Annual Event Frequency"
              value={freqDisplay}
              change="-3.7%"
              negative
              active={activeKpi === 'freq'}
              onClick={() => setActiveKpi('freq')}
            />
          </div>

          {/* Actuarial Methodology Explainer Banner for Active KPI */}
          <div className="actuarial-banner">
            <Info />
            <div>
              <b>{kpiDetails[activeKpi].title}: </b>
              <span>{kpiDetails[activeKpi].desc}</span>
            </div>
          </div>

          {/* Top Grid: Loss Distribution & Vector Geospatial Risk Surface */}
          <div className="dashboard-grid top-grid">
            {/* Panel 1: Modelled Loss Distribution (Native SVG Reference Lines, No Floating Divs) */}
            <Panel
              title="Modelled Annual Loss Distribution"
              subtitle="Probability density & tail exceedance thresholds from 50,000 simulated events."
              className="distribution"
              action={
                <div className="chart-controls">
                  <button
                    className={`chart-toggle-btn ${curveMode === 'density' ? 'active' : ''}`}
                    onClick={() => setCurveMode('density')}
                  >
                    Density (PDF)
                  </button>
                  <button
                    className={`chart-toggle-btn ${curveMode === 'ep' ? 'active' : ''}`}
                    onClick={() => setCurveMode('ep')}
                  >
                    Exceedance (EP)
                  </button>
                </div>
              }
            >
              <div className="chart-legend">
                <span>
                  <i className="legend-square" /> Simulated Loss Area
                </span>
                <span>
                  <i className="legend-line" /> {curveMode === 'density' ? 'Loss Density PDF' : 'Exceedance Probability (1-CDF)'}
                </span>
              </div>

              <div className="distribution-chart">
                <ResponsiveContainer width="100%" height="100%">
                  {curveMode === 'density' ? (
                    <AreaChart data={lossData} margin={{ top: 20, right: 16, left: 6, bottom: 6 }}>
                      <CartesianGrid stroke="#1f344e" strokeDasharray="2 3" />
                      <XAxis
                        dataKey="loss"
                        stroke="#91a2bb"
                        tick={{ fontSize: 10 }}
                        label={{
                          value: 'Annual Loss (USD Billions)',
                          position: 'insideBottom',
                          offset: -2,
                          fill: '#91a2bb',
                          fontSize: 10,
                        }}
                      />
                      <YAxis
                        stroke="#91a2bb"
                        tick={{ fontSize: 10 }}
                        domain={[0, 0.08]}
                        ticks={[0, 0.02, 0.04, 0.06, 0.08]}
                      />
                      <Tooltip
                        contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8 }}
                        formatter={(val: any) => [`Density: ${Number(val).toFixed(4)}`, 'Probability']}
                        labelFormatter={(loss) => `Annual Loss: $${loss}B`}
                      />
                      <Area
                        type="monotone"
                        dataKey="density"
                        stroke="#79b7ff"
                        fill="#2c6eb7"
                        fillOpacity={0.38}
                        strokeWidth={2}
                      />

                      {/* Native Recharts SVG Reference Lines mathematically locked to coordinates with non-overlapping pill badges */}
                      <ReferenceLine
                        x={activeAal}
                        stroke="#68b8ff"
                        strokeDasharray="4 4"
                        strokeWidth={activeKpi === 'aal' ? 2.5 : 1.5}
                        label={({ viewBox }: any) => {
                          if (!viewBox) return null
                          return (
                            <g>
                              <rect
                                x={viewBox.x + 4}
                                y={viewBox.y - 18}
                                width={82}
                                height={16}
                                rx={4}
                                fill="#0a1829"
                                stroke="#68b8ff"
                                strokeWidth={1}
                              />
                              <text
                                x={viewBox.x + 45}
                                y={viewBox.y - 6}
                                fill="#7ec4ff"
                                fontSize={9.5}
                                fontWeight={600}
                                textAnchor="middle"
                              >
                                AAL {aalDisplay}
                              </text>
                            </g>
                          )
                        }}
                      />
                      <ReferenceLine
                        x={activeVar99}
                        stroke="#ffb64b"
                        strokeDasharray="4 4"
                        strokeWidth={activeKpi === 'var' ? 2.5 : 1.5}
                        label={({ viewBox }: any) => {
                          if (!viewBox) return null
                          return (
                            <g>
                              <rect
                                x={viewBox.x - 105}
                                y={viewBox.y - 18}
                                width={100}
                                height={16}
                                rx={4}
                                fill="#0a1829"
                                stroke="#ffb64b"
                                strokeWidth={1}
                              />
                              <text
                                x={viewBox.x - 55}
                                y={viewBox.y - 6}
                                fill="#ffb64b"
                                fontSize={9.5}
                                fontWeight={600}
                                textAnchor="middle"
                              >
                                99% VaR {varDisplay}
                              </text>
                            </g>
                          )
                        }}
                      />
                      <ReferenceLine
                        x={activeTvar99}
                        stroke="#f66b68"
                        strokeDasharray="4 4"
                        strokeWidth={activeKpi === 'tvar' ? 2.5 : 1.5}
                        label={({ viewBox }: any) => {
                          if (!viewBox) return null
                          return (
                            <g>
                              <rect
                                x={viewBox.x + 5}
                                y={viewBox.y - 18}
                                width={108}
                                height={16}
                                rx={4}
                                fill="#0a1829"
                                stroke="#f66b68"
                                strokeWidth={1}
                              />
                              <text
                                x={viewBox.x + 59}
                                y={viewBox.y - 6}
                                fill="#f66b68"
                                fontSize={9.5}
                                fontWeight={600}
                                textAnchor="middle"
                              >
                                99% TVaR {tvarDisplay}
                              </text>
                            </g>
                          )
                        }}
                      />
                      {activeKpi === 'avg' && (
                        <ReferenceLine
                          x={4.12}
                          stroke="#55c6bd"
                          strokeDasharray="3 3"
                          strokeWidth={2}
                          label={{
                            value: `Avg $412M`,
                            fill: '#55c6bd',
                            fontSize: 10,
                            position: 'insideTopLeft',
                          }}
                        />
                      )}
                    </AreaChart>
                  ) : (
                    <AreaChart data={epData} margin={{ top: 20, right: 16, left: 6, bottom: 6 }}>
                      <CartesianGrid stroke="#1f344e" strokeDasharray="2 3" />
                      <XAxis
                        dataKey="loss"
                        stroke="#91a2bb"
                        tick={{ fontSize: 10 }}
                        label={{
                          value: 'Loss Exceedance Threshold (USD Billions)',
                          position: 'insideBottom',
                          offset: -2,
                          fill: '#91a2bb',
                          fontSize: 10,
                        }}
                      />
                      <YAxis
                        stroke="#91a2bb"
                        tick={{ fontSize: 10 }}
                        domain={[0, 1]}
                        ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      />
                      <Tooltip
                        contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8 }}
                        formatter={(val: any, name: any, item: any) => [
                          `${(Number(val) * 100).toFixed(2)}% (${item.payload.rp})`,
                          'Exceedance Prob',
                        ]}
                        labelFormatter={(loss) => `Loss Threshold: $${loss}B`}
                      />
                      <Area
                        type="monotone"
                        dataKey="ep"
                        stroke="#4be0bd"
                        fill="#1c5e53"
                        fillOpacity={0.35}
                        strokeWidth={2}
                      />
                      <ReferenceLine
                        x={18.7}
                        stroke="#ffb64b"
                        strokeDasharray="4 4"
                        label={({ viewBox }: any) => {
                          if (!viewBox) return null
                          return (
                            <g>
                              <rect
                                x={viewBox.x - 128}
                                y={viewBox.y - 18}
                                width={122}
                                height={16}
                                rx={4}
                                fill="#0a1829"
                                stroke="#ffb64b"
                                strokeWidth={1}
                              />
                              <text
                                x={viewBox.x - 67}
                                y={viewBox.y - 6}
                                fill="#ffb64b"
                                fontSize={9.5}
                                fontWeight={600}
                                textAnchor="middle"
                              >
                                100-Yr Return ($18.7B)
                              </text>
                            </g>
                          )
                        }}
                      />
                      <ReferenceLine
                        x={27.3}
                        stroke="#f66b68"
                        strokeDasharray="4 4"
                        label={({ viewBox }: any) => {
                          if (!viewBox) return null
                          return (
                            <g>
                              <rect
                                x={viewBox.x + 5}
                                y={viewBox.y - 18}
                                width={122}
                                height={16}
                                rx={4}
                                fill="#0a1829"
                                stroke="#f66b68"
                                strokeWidth={1}
                              />
                              <text
                                x={viewBox.x + 66}
                                y={viewBox.y - 6}
                                fill="#f66b68"
                                fontSize={9.5}
                                fontWeight={600}
                                textAnchor="middle"
                              >
                                500-Yr Return ($27.3B)
                              </text>
                            </g>
                          )
                        }}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Panel 2: Global Catastrophe Risk - Authentic Geospatial Surface */}
            <Panel
              title="Global Catastrophe Risk Surface"
              subtitle="Geospatial distribution of 50,022 historical and stochastic event centroids."
              className="map-panel"
              action={
                <div className="select-button small" style={{ cursor: 'default' }}>
                  <span style={{ color: '#55c6bd', fontWeight: 600 }}>● Live 50k DB</span>
                </div>
              }
            >
              <div className="world-map">
                <div className="world-map-svg-wrap">
                  {/* Real Vector SVG Continental Map Contour */}
                  <svg
                    viewBox="0 0 1000 500"
                    className="world-map-svg"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <radialGradient id="ocean-grad" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#0c2035" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#051220" stopOpacity="0.95" />
                      </radialGradient>
                    </defs>

                    {/* Ocean base */}
                    <rect width="1000" height="500" fill="url(#ocean-grad)" />

                    {/* Lat/Lon Grid lines */}
                    <path
                      d="M 0 125 H 1000 M 0 250 H 1000 M 0 375 H 1000 M 200 0 V 500 M 400 0 V 500 M 600 0 V 500 M 800 0 V 500"
                      stroke="#142b44"
                      strokeWidth="0.8"
                      strokeDasharray="4 6"
                    />

                    {/* Authentic stylized continent vector outlines */}
                    {/* North America */}
                    <path
                      d="M 110 90 L 230 75 L 290 120 L 260 180 L 220 220 L 190 280 L 160 250 L 120 200 L 90 140 Z"
                      fill={selectedRegion === 'na' ? '#274b78' : '#14273d'}
                      stroke={selectedRegion === 'na' ? '#68b8ff' : '#27486e'}
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedRegion('na')}
                    />
                    {/* South America */}
                    <path
                      d="M 230 280 L 310 290 L 330 360 L 290 440 L 250 420 L 220 340 Z"
                      fill={selectedRegion === 'latam' ? '#274b78' : '#14273d'}
                      stroke={selectedRegion === 'latam' ? '#68b8ff' : '#27486e'}
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedRegion('latam')}
                    />
                    {/* Europe */}
                    <path
                      d="M 440 90 L 530 80 L 550 140 L 510 180 L 460 170 L 430 130 Z"
                      fill={selectedRegion === 'eu' ? '#274b78' : '#14273d'}
                      stroke={selectedRegion === 'eu' ? '#68b8ff' : '#27486e'}
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedRegion('eu')}
                    />
                    {/* Africa */}
                    <path
                      d="M 450 190 L 550 190 L 580 270 L 550 380 L 490 380 L 450 280 Z"
                      fill="#122338"
                      stroke="#223d5d"
                      strokeWidth="1.2"
                    />
                    {/* Asia */}
                    <path
                      d="M 540 80 L 820 70 L 880 150 L 820 260 L 730 260 L 680 210 L 610 220 L 560 150 Z"
                      fill={selectedRegion === 'apac' ? '#274b78' : '#14273d'}
                      stroke={selectedRegion === 'apac' ? '#68b8ff' : '#27486e'}
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedRegion('apac')}
                    />
                    {/* Australia / Oceania */}
                    <path
                      d="M 760 320 L 870 310 L 880 390 L 790 400 Z"
                      fill={selectedRegion === 'apac' ? '#274b78' : '#14273d'}
                      stroke={selectedRegion === 'apac' ? '#68b8ff' : '#27486e'}
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedRegion('apac')}
                    />

                    {/* Regional Risk Centroid Beacons */}
                    {/* North America Centroid */}
                    <g transform="translate(195, 175)" onClick={() => setSelectedRegion('na')} style={{ cursor: 'pointer' }}>
                      <circle r="14" fill="#f2716c" fillOpacity="0.2">
                        <animate attributeName="r" values="8;18;8" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="fillOpacity" values="0.35;0.05;0.35" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle r="5" fill="#f2716c" stroke="#fff" strokeWidth="1.5" />
                      <text x="10" y="4" fill="#e2edf8" fontSize="11" fontWeight="600">NA: $482B</text>
                    </g>

                    {/* Europe Centroid */}
                    <g transform="translate(480, 135)" onClick={() => setSelectedRegion('eu')} style={{ cursor: 'pointer' }}>
                      <circle r="11" fill="#71b4ff" fillOpacity="0.2">
                        <animate attributeName="r" values="7;15;7" dur="2.8s" repeatCount="indefinite" />
                      </circle>
                      <circle r="4.5" fill="#71b4ff" stroke="#fff" strokeWidth="1.5" />
                      <text x="10" y="4" fill="#e2edf8" fontSize="11" fontWeight="600">EU: $214B</text>
                    </g>

                    {/* Asia-Pacific Centroid */}
                    <g transform="translate(730, 195)" onClick={() => setSelectedRegion('apac')} style={{ cursor: 'pointer' }}>
                      <circle r="18" fill="#e84e53" fillOpacity="0.25">
                        <animate attributeName="r" values="10;22;10" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="fillOpacity" values="0.4;0.08;0.4" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                      <circle r="6" fill="#e84e53" stroke="#fff" strokeWidth="1.8" />
                      <text x="12" y="4" fill="#e2edf8" fontSize="11" fontWeight="600">APAC: $596B</text>
                    </g>

                    {/* Latin America Centroid */}
                    <g transform="translate(265, 340)" onClick={() => setSelectedRegion('latam')} style={{ cursor: 'pointer' }}>
                      <circle r="10" fill="#f2a855" fillOpacity="0.2">
                        <animate attributeName="r" values="6;14;6" dur="3.2s" repeatCount="indefinite" />
                      </circle>
                      <circle r="4" fill="#f2a855" stroke="#fff" strokeWidth="1.5" />
                      <text x="10" y="4" fill="#e2edf8" fontSize="11" fontWeight="600">LATAM: $88B</text>
                    </g>
                  </svg>
                </div>

                {/* Right Stat Summary Panel */}
                <div className="map-stats">
                  <strong>
                    {activeRegionStats.events}
                    <small>{activeRegionStats.name} Events</small>
                  </strong>
                  <strong>
                    {activeRegionStats.exposure}
                    <small>Insured Exposure</small>
                  </strong>
                  <strong>
                    {activeRegionStats.aal}
                    <small>Modelled AAL</small>
                  </strong>
                </div>
              </div>

              {/* Interactive Region Selector Filter Pills */}
              <div className="map-legend">
                <div className="map-legend-pills">
                  <button
                    className={`map-legend-pill ${selectedRegion === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedRegion('all')}
                  >
                    Global (All)
                  </button>
                  <button
                    className={`map-legend-pill ${selectedRegion === 'na' ? 'active' : ''}`}
                    onClick={() => setSelectedRegion('na')}
                  >
                    North America
                  </button>
                  <button
                    className={`map-legend-pill ${selectedRegion === 'apac' ? 'active' : ''}`}
                    onClick={() => setSelectedRegion('apac')}
                  >
                    Asia-Pacific
                  </button>
                  <button
                    className={`map-legend-pill ${selectedRegion === 'eu' ? 'active' : ''}`}
                    onClick={() => setSelectedRegion('eu')}
                  >
                    Europe
                  </button>
                  <button
                    className={`map-legend-pill ${selectedRegion === 'latam' ? 'active' : ''}`}
                    onClick={() => setSelectedRegion('latam')}
                  >
                    Latin America
                  </button>
                </div>
                <span style={{ color: '#9bb1c8' }}>
                  Risk Tier: <b style={{ color: activeRegionStats.riskTier === 'Critical' ? '#ff726d' : '#f2c06b' }}>{activeRegionStats.riskTier}</b>
                </span>
              </div>
            </Panel>
          </div>

          {/* Lower Grid: Event Frequency, Loss Severity & Catastrophe Mix */}
          <div className="dashboard-grid lower-grid">
            {/* Panel: Event Frequency with Interactive Peril Filter */}
            <Panel
              title="Event Frequency"
              subtitle={`Annual events: ${selectedPeril} (2010-2026)`}
              action={
                <select
                  aria-label="Filter peril frequency"
                  value={selectedPeril}
                  onChange={(e) => setSelectedPeril(e.target.value)}
                  className="select-button small"
                  style={{ outline: 'none', border: '1px solid #38516c', background: '#12253b', color: '#e2edf8' }}
                >
                  <option value="All">All Perils</option>
                  <option value="Cyclone">Tropical Cyclone</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Flood">River Flood</option>
                  <option value="Wildfire">Wildfire</option>
                  <option value="Storm">Convective Storm</option>
                </select>
              }
            >
              <div className="small-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={currentFreqData} margin={{ left: -22, right: 8, top: 12, bottom: 4 }}>
                    <CartesianGrid stroke="#1f344e" />
                    <XAxis dataKey="year" interval={3} stroke="#91a2bb" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#91a2bb" tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8, fontSize: 11 }}
                      formatter={(v) => [`${v} Events`, `${selectedPeril} Count`]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#73b4ff"
                      strokeWidth={2}
                      dot={{ fill: '#73b4ff', r: 2.5 }}
                      activeDot={{ r: 5, fill: '#fff' }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Panel: Loss Severity with Interactive Scale Toggle */}
            <Panel
              title="Loss Severity"
              subtitle="Distribution of event losses (USD Millions)."
              action={
                <div className="chart-controls">
                  <button
                    className={`chart-toggle-btn ${severityScale === 'log' ? 'active' : ''}`}
                    onClick={() => setSeverityScale(severityScale === 'log' ? 'linear' : 'log')}
                  >
                    {severityScale === 'log' ? 'Log Scale' : 'Linear Scale'}
                  </button>
                  <button
                    className={`chart-toggle-btn ${severityView === 'max' ? 'active' : ''}`}
                    onClick={() => setSeverityView(severityView === 'q3' ? 'max' : 'q3')}
                  >
                    {severityView === 'q3' ? 'Q3 Med' : 'Tail P99'}
                  </button>
                </div>
              }
            >
              <div className="small-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityData} margin={{ left: -16, right: 6, top: 10, bottom: 2 }}>
                    <CartesianGrid stroke="#1f344e" />
                    <XAxis dataKey="type" stroke="#91a2bb" tick={{ fontSize: 9 }} />
                    <YAxis
                      scale={severityScale === 'log' ? 'log' : 'linear'}
                      domain={severityScale === 'log' ? [10, 100000] : [0, 20000]}
                      ticks={severityScale === 'log' ? [10, 100, 1000, 10000, 100000] : [0, 5000, 10000, 15000, 20000]}
                      tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}B` : `$${v}M`)}
                      stroke="#91a2bb"
                      tick={{ fontSize: 8 }}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8, fontSize: 11 }}
                      formatter={(v) => [`$${Number(v).toLocaleString()}M`, severityView === 'q3' ? '75th Pct' : 'Max Tail']}
                    />
                    <Bar
                      dataKey={severityView}
                      fill="#5795df"
                      radius={[3, 3, 0, 0]}
                    >
                      {severityData.map((_, i) => (
                        <Cell key={i} fill={i === 1 ? '#e8726e' : '#5795df'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Panel: Catastrophe Mix (Unclipped 360° Donut with Hover Detail) */}
            <Panel title="Catastrophe Mix" subtitle="Share of total $1.42T economic losses.">
              <div className="mix-wrap">
                <div className="donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mixData}
                        dataKey="value"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={2}
                        stroke="#0b1625"
                        strokeWidth={2}
                        onMouseEnter={(_, index) => setActivePerilMix(mixData[index].name)}
                        onMouseLeave={() => setActivePerilMix(null)}
                      >
                        {mixData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            opacity={activePerilMix && activePerilMix !== entry.name ? 0.45 : 1}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center-label">
                    <strong>
                      {activePerilMix
                        ? mixData.find((m) => m.name === activePerilMix)?.loss
                        : '$1.42T'}
                    </strong>
                    <span>{activePerilMix || 'Total Losses'}</span>
                  </div>
                </div>

                <div className="mix-list">
                  {mixData.map((item) => (
                    <div
                      key={item.name}
                      className={activePerilMix === item.name ? 'active' : ''}
                      onMouseEnter={() => setActivePerilMix(item.name)}
                      onMouseLeave={() => setActivePerilMix(null)}
                    >
                      <i style={{ background: item.color }} />
                      <span>{item.name}</span>
                      <b>{item.value}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {/* NEW ACTUARIAL ANALYTICS GRID: 2 Additional Graphs */}
          <div className="analytics-grid">
            {/* Additional Graph 1: Regional Exposure vs Modelled AAL */}
            <Panel
              title="Regional Exposure vs Modelled AAL"
              subtitle="Comparison of Total Insured Value ($B TIV) and Annual Expected Loss ($M AAL) across major regions."
              action={
                <div className="chart-legend" style={{ margin: 0 }}>
                  <span>
                    <i className="legend-square" style={{ background: '#5b9ef2' }} /> Exposure ($B)
                  </span>
                  <span>
                    <i className="legend-square" style={{ background: '#f28f5b' }} /> AAL ($M)
                  </span>
                </div>
              }
            >
              <div style={{ height: 180, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalExposureAAL} margin={{ left: -10, right: 10, top: 12, bottom: 4 }}>
                    <CartesianGrid stroke="#1f344e" strokeDasharray="2 3" />
                    <XAxis dataKey="region" stroke="#91a2bb" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="left" stroke="#91a2bb" tick={{ fontSize: 9 }} tickFormatter={(v) => `$${v}B`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f28f5b" tick={{ fontSize: 9 }} tickFormatter={(v) => `$${v}M`} />
                    <Tooltip
                      contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8, fontSize: 11 }}
                      formatter={(val: any, name: any) => [
                        name === 'tiv' ? `$${val}B Exposure` : `$${val}M AAL`,
                        name === 'tiv' ? 'Total Insured Value' : 'Modelled AAL',
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="tiv" fill="#5b9ef2" radius={[3, 3, 0, 0]} barSize={22} />
                    <Bar yAxisId="right" dataKey="aal" fill="#f28f5b" radius={[3, 3, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* Additional Graph 2: 15-Year Historical Loss Volatility vs Climate Baseline */}
            <Panel
              title="15-Year Historical Cat Loss Volatility vs Climate Baseline"
              subtitle="Annual catastrophe losses ($B) with 5-year rolling climate baseline and 99% tail threshold."
              action={
                <div className="chart-legend" style={{ margin: 0 }}>
                  <span>
                    <i className="legend-square" style={{ background: '#3b78c2' }} /> Annual Loss
                  </span>
                  <span>
                    <i className="legend-line" style={{ borderTop: '2px solid #4be0bd' }} /> 5-Yr Baseline
                  </span>
                  <span>
                    <i className="legend-line" style={{ borderTop: '2px dashed #f26868' }} /> 99% Tail ($25B)
                  </span>
                </div>
              }
            >
              <div style={{ height: 180, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={historicalLossVolatility} margin={{ left: -10, right: 10, top: 12, bottom: 4 }}>
                    <CartesianGrid stroke="#1f344e" strokeDasharray="2 3" />
                    <XAxis dataKey="year" stroke="#91a2bb" interval={2} tick={{ fontSize: 9 }} />
                    <YAxis stroke="#91a2bb" tick={{ fontSize: 9 }} domain={[0, 32]} tickFormatter={(v) => `$${v}B`} />
                    <Tooltip
                      contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8, fontSize: 11 }}
                      formatter={(val: any, name: any) => [
                        `$${val}B`,
                        name === 'loss' ? 'Annual Economic Loss' : name === 'baseline' ? '5-Yr Rolling Mean' : 'Tail Threshold',
                      ]}
                    />
                    <Bar dataKey="loss" fill="#3b78c2" radius={[2, 2, 0, 0]} barSize={14} />
                    <Line type="monotone" dataKey="baseline" stroke="#4be0bd" strokeWidth={2.2} dot={false} />
                    <ReferenceLine y={25} stroke="#f26868" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Tail Exceedance', fill: '#f26868', fontSize: 9, position: 'insideTopRight' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* Bottom Grid: Recent Significant Events Table & Key Insights */}
          <div className="dashboard-grid bottom-grid">
            <Panel
              title="Recent Catastrophe Events"
              subtitle="Latest significant events from historical data."
              className="events-panel"
              action={
                <Link href="/app/events" className="text-button">
                  View All <ChevronRight />
                </Link>
              }
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {['Event', 'Type', 'Location', 'Date', 'Magnitude', 'Economic Loss', 'Affected Population', 'Modelled Risk'].map(
                        (h) => (
                          <th key={h}>{h}</th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event[0]} onClick={() => setSelectedEvent(event)}>
                        {event.map((cell, i) => (
                          <td key={`${event[0]}-${i}`}>
                            {i === 7 ? (
                              <span className={`risk-pill ${cell.toLowerCase().replace(' ', '-')}`}>
                                {cell}
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Key Insights" subtitle="Automated risk analytics summary." className="insights">
              <div className="insights-container">
                <div className="insight-row">
                  <div className="insight-icon-box" style={{ color: '#4be0bd', background: 'rgba(75, 224, 189, 0.12)' }}>
                    <TrendingUp />
                  </div>
                  <div className="insight-details">
                    <div className="insight-badge-line">
                      <span className="insight-tag tag-green">+8.4%</span>
                      <strong>Expected Annual Loss</strong>
                    </div>
                    <p>AAL increased vs. previous baseline driven by convective storm activity.</p>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon-box" style={{ color: '#6ea8ff', background: 'rgba(110, 168, 255, 0.12)' }}>
                    <ShieldAlert />
                  </div>
                  <div className="insight-details">
                    <div className="insight-badge-line">
                      <span className="insight-tag tag-blue">Flood Risk</span>
                      <strong>Largest Contributor</strong>
                    </div>
                    <p>River flood represents 28% ($397.6B) of total modelled economic exposure.</p>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon-box" style={{ color: '#55c6bd', background: 'rgba(85, 198, 189, 0.12)' }}>
                    <Globe2 />
                  </div>
                  <div className="insight-details">
                    <div className="insight-badge-line">
                      <span className="insight-tag tag-cyan">42% APAC</span>
                      <strong>Exposure Concentration</strong>
                    </div>
                    <p>Asia-Pacific accounts for $596B of global exposure with critical typhoon peril.</p>
                  </div>
                </div>

                <div className="insight-row">
                  <div className="insight-icon-box" style={{ color: '#f66b68', background: 'rgba(246, 107, 104, 0.12)' }}>
                    <BarChart3 />
                  </div>
                  <div className="insight-details">
                    <div className="insight-badge-line">
                      <span className="insight-tag tag-coral">+10.2%</span>
                      <strong>Tail Risk (99% TVaR)</strong>
                    </div>
                    <p>Tail Value at Risk expanded to $27.34B for the 1-in-100 year return period.</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </main>

      {/* Event Details Drawer Modal */}
      {typeof document !== 'undefined' && selectedEvent &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
            <aside className="event-drawer" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setSelectedEvent(null)} aria-label="Close drawer">
                <X />
              </button>
              <span className="eyebrow">CATASTROPHE EVENT</span>
              <h2>{selectedEvent[0]}</h2>
              <p className="drawer-location">
                {selectedEvent[2]} · {selectedEvent[3]}
              </p>
              <div className="drawer-stat-grid">
                <div>
                  <span>Type</span>
                  <strong>{selectedEvent[1]}</strong>
                </div>
                <div>
                  <span>Magnitude</span>
                  <strong>{selectedEvent[4]}</strong>
                </div>
                <div>
                  <span>Economic loss</span>
                  <strong>{selectedEvent[5]}</strong>
                </div>
                <div>
                  <span>Affected population</span>
                  <strong>{selectedEvent[6]}</strong>
                </div>
              </div>
              <div className="drawer-note">
                <Sparkles />
                <p>
                  Modelled risk is <b>{selectedEvent[7].toLowerCase()}</b> based on historical severity, exposure concentration,
                  and regional vulnerability.
                </p>
              </div>
              <button className="primary-action" onClick={() => setSelectedEvent(null)}>
                Back to overview <ChevronRight />
              </button>
            </aside>
          </div>,
          document.body
        )}
    </div>
  )
}
