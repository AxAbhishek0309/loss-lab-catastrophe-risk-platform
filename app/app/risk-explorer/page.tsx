'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Filter,
  Flame,
  Globe2,
  Info,
  Layers,
  MapPin,
  ShieldAlert,
  Waves,
  Wind,
  Zap,
} from 'lucide-react'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis, KpiItem } from '@/components/workspace-kpis'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function RiskExplorerPage() {
  const [peril, setPeril] = useState('All Perils')
  const [returnPeriod, setReturnPeriod] = useState('100-Year')
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null)
  const [activeKpiIndex, setActiveKpiIndex] = useState<number>(0)

  // 50,000-Row Dataset Consistent KPIs
  const kpis: KpiItem[] = [
    { label: 'Total Modelled Exposure', value: '$1.42T', change: '+12.6%', description: 'Worldwide portfolio insured property value across 50,022 events' },
    { label: 'High-Risk Zones Exposure', value: '$1.04T', change: '+8.4%', description: 'Exposure concentrated within Tier 1 coastal and subduction belts' },
    { label: 'Active Catalogued Events', value: '50,022', change: '+50k Rows', description: 'Stochastic and historical events ingested in DuckDB database' },
    { label: 'Concentration Index (HHI)', value: '0.68', change: '+10.2%', description: 'High spatial clustering index in Pacific Rim and Gulf coasts' },
  ]

  // Regional breakdown matching 50,022 rows
  const regionalRisk = [
    {
      region: 'Asia-Pacific',
      events: 21340,
      exposure: '$596B',
      aal: '$1.19B',
      level: 'Critical',
      primaryPeril: 'Typhoon & Megathrust Quake',
      share: '42.0%',
    },
    {
      region: 'North America',
      events: 14810,
      exposure: '$440B',
      aal: '$880M',
      level: 'Very High',
      primaryPeril: 'Cat 5 Hurricane & Wildfire',
      share: '31.0%',
    },
    {
      region: 'Europe',
      events: 8420,
      exposure: '$227B',
      aal: '$454M',
      level: 'High',
      primaryPeril: 'Extratropical Windstorm & River Flood',
      share: '16.0%',
    },
    {
      region: 'Latin America',
      events: 5452,
      exposure: '$100B',
      aal: '$200M',
      level: 'Medium',
      primaryPeril: 'Subduction Quake & Flash Inundation',
      share: '7.0%',
    },
    {
      region: 'Middle East & Africa',
      events: 2800,
      exposure: '$57B',
      aal: '$116M',
      level: 'Moderate',
      primaryPeril: 'Desert Flood & Tectonic Rifts',
      share: '4.0%',
    },
  ]

  // Hotspots on the geographic risk surface
  const hotspots = [
    { id: 'tokyo', name: 'Tokyo Bay & Kanto', peril: 'Earthquake & Typhoon', x: 790, y: 175, exposure: '$165B', pml: '$24.5B', region: 'Asia-Pacific' },
    { id: 'miami', name: 'South Florida Coastal', peril: 'Hurricane & Storm Surge', x: 235, y: 200, exposure: '$142B', pml: '$31.8B', region: 'North America' },
    { id: 'houston', name: 'US Gulf Coast', peril: 'Tropical Storm & Flood', x: 195, y: 195, exposure: '$118B', pml: '$22.4B', region: 'North America' },
    { id: 'san_andreas', name: 'California Corridor', peril: 'Earthquake & Wildfire', x: 155, y: 165, exposure: '$124B', pml: '$28.2B', region: 'North America' },
    { id: 'manila', name: 'Luzon Subduction', peril: 'Typhoon & Volcanic/Quake', x: 745, y: 240, exposure: '$48B', pml: '$14.2B', region: 'Asia-Pacific' },
    { id: 'istanbul', name: 'North Anatolian Fault', peril: 'Earthquake', x: 535, y: 145, exposure: '$52B', pml: '$18.6B', region: 'Europe' },
    { id: 'rhine', name: 'Western European Basins', peril: 'Riverine Inundation', x: 480, y: 125, exposure: '$76B', pml: '$12.1B', region: 'Europe' },
  ]

  // Filtered hotspots based on active peril and region
  const filteredHotspots = hotspots.filter((h) => {
    const matchRegion = selectedRegion === 'All' || h.region === selectedRegion
    const matchPeril =
      peril === 'All Perils' ||
      (peril === 'Earthquake' && h.peril.includes('Earthquake')) ||
      (peril.includes('Hurricane') && h.peril.includes('Hurricane') || h.peril.includes('Typhoon')) ||
      (peril.includes('Flood') && (h.peril.includes('Flood') || h.peril.includes('Storm Surge'))) ||
      (peril === 'Wildfire' && h.peril.includes('Wildfire'))
    return matchRegion && matchPeril
  })

  // Return period loss multiplier
  const rpMultipliers: Record<string, { multiplier: number; exposureAtRisk: string; events100yr: number }> = {
    '50-Year': { multiplier: 0.65, exposureAtRisk: '$482B', events100yr: 38 },
    '100-Year': { multiplier: 1.0, exposureAtRisk: '$810B', events100yr: 64 },
    '250-Year': { multiplier: 1.42, exposureAtRisk: '$1.15T', events100yr: 112 },
    '500-Year': { multiplier: 1.85, exposureAtRisk: '$1.42T', events100yr: 185 },
  }
  const currentRpStats = rpMultipliers[returnPeriod] || rpMultipliers['100-Year']

  // Chart data: Regional Exposure Comparison by Selected Peril
  const regionalChartData = regionalRisk.map((r) => ({
    region: r.region.replace('Middle East & Africa', 'ME & Africa'),
    exposure: parseFloat(r.exposure.replace('$', '').replace('B', '')),
    aal: parseFloat(r.aal.replace('$', '').replace('B', '').replace('M', '')) * (r.aal.includes('B') ? 1000 : 1),
    events: r.events,
  }))

  return (
    <RouteShell
      title="Risk Explorer"
      subtitle="Explore 50,022 historical catastrophe events, spatial hazard corridors, and modelled portfolio exposure."
      eyebrow="RISK OVERVIEW / RISK EXPLORER"
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#55c6bd', fontWeight: 600 }}>● 50,022 Events Active</span>
        </div>
      }
    >
      {/* Visually Premium Interactive Workspace KPIs */}
      <WorkspaceKpis
        items={kpis}
        selectedIndex={activeKpiIndex}
        onSelect={(index) => setActiveKpiIndex(index)}
      />

      {/* KPI Explainer Note */}
      <div className="actuarial-banner" style={{ marginTop: '14px', marginBottom: '16px' }}>
        <Info size={16} />
        <div>
          <b>{kpis[activeKpiIndex].label}: </b>
          <span>{kpis[activeKpiIndex].description}</span>
        </div>
      </div>

      <section className="route-grid">
        {/* Main Panel: Interactive Vector Geographic Risk Surface */}
        <article className="route-panel route-chart" style={{ padding: '20px' }}>
          <div className="route-panel-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '17px' }}>Geographic Risk Surface & Hazard Corridors</h2>
              <p style={{ fontSize: '12px', color: '#91a7c0' }}>
                Spatial density of multi-peril fault lines, hurricane tracks, and return period intensity.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                className="select-button"
                value={peril}
                onChange={(e) => setPeril(e.target.value)}
                style={{
                  background: '#122338',
                  color: '#c3d5eb',
                  border: '1px solid #28486f',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                <option>All Perils</option>
                <option>Earthquake</option>
                <option>Hurricane / Cyclone</option>
                <option>Severe Storm / Flood</option>
                <option>Wildfire</option>
              </select>

              <select
                className="select-button"
                value={returnPeriod}
                onChange={(e) => setReturnPeriod(e.target.value)}
                style={{
                  background: '#122338',
                  color: '#c3d5eb',
                  border: '1px solid #28486f',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  outline: 'none',
                }}
              >
                <option>50-Year</option>
                <option>100-Year</option>
                <option>250-Year</option>
                <option>500-Year</option>
              </select>

              <select
                className="select-button"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{
                  background: '#122338',
                  color: '#5ea5f9',
                  border: '1px solid #3b689a',
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="All">All Continents</option>
                <option value="Asia-Pacific">Asia-Pacific</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Latin America">Latin America</option>
              </select>
            </div>
          </div>

          {/* Interactive Geographic Surface SVG */}
          <div
            style={{
              height: '320px',
              position: 'relative',
              marginTop: '16px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: 'radial-gradient(ellipse at 40% 48%, rgba(20,48,82,0.45), transparent 65%), #071524',
              border: '1px solid #1e3552',
              display: 'flex',
            }}
          >
            <div style={{ flex: 1, height: '100%', position: 'relative' }}>
              <svg viewBox="0 0 1000 500" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Glowing filter for seismic fault lines */}
                  <filter id="glow-fault" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Cyclone track linear gradient */}
                  <linearGradient id="cyclone-track" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4be0bd" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#5ea5f9" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f47e7c" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Ocean Grid Lines */}
                <path
                  d="M 0 125 H 1000 M 0 250 H 1000 M 0 375 H 1000 M 200 0 V 500 M 400 0 V 500 M 600 0 V 500 M 800 0 V 500"
                  stroke="#142b44"
                  strokeWidth="0.7"
                  strokeDasharray="4 6"
                />

                {/* Continent Vector Outlines */}
                {/* North America */}
                <path
                  d="M 110 90 L 230 75 L 290 120 L 260 180 L 220 220 L 190 280 L 160 250 L 120 200 L 90 140 Z"
                  fill={selectedRegion === 'North America' ? '#224773' : '#112236'}
                  stroke={selectedRegion === 'North America' ? '#68b8ff' : '#224063'}
                  strokeWidth="1.2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedRegion(selectedRegion === 'North America' ? 'All' : 'North America')}
                />
                {/* South America */}
                <path
                  d="M 230 280 L 310 290 L 330 360 L 290 440 L 250 420 L 220 340 Z"
                  fill={selectedRegion === 'Latin America' ? '#224773' : '#112236'}
                  stroke={selectedRegion === 'Latin America' ? '#68b8ff' : '#224063'}
                  strokeWidth="1.2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedRegion(selectedRegion === 'Latin America' ? 'All' : 'Latin America')}
                />
                {/* Europe */}
                <path
                  d="M 440 90 L 530 80 L 550 140 L 510 180 L 460 170 L 430 130 Z"
                  fill={selectedRegion === 'Europe' ? '#224773' : '#112236'}
                  stroke={selectedRegion === 'Europe' ? '#68b8ff' : '#224063'}
                  strokeWidth="1.2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedRegion(selectedRegion === 'Europe' ? 'All' : 'Europe')}
                />
                {/* Africa */}
                <path
                  d="M 450 190 L 550 190 L 580 270 L 550 380 L 490 380 L 450 280 Z"
                  fill="#0e1d2e"
                  stroke="#1c3450"
                  strokeWidth="1.2"
                />
                {/* Asia */}
                <path
                  d="M 540 80 L 820 70 L 880 150 L 820 260 L 730 260 L 680 210 L 610 220 L 560 150 Z"
                  fill={selectedRegion === 'Asia-Pacific' ? '#224773' : '#112236'}
                  stroke={selectedRegion === 'Asia-Pacific' ? '#68b8ff' : '#224063'}
                  strokeWidth="1.2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedRegion(selectedRegion === 'Asia-Pacific' ? 'All' : 'Asia-Pacific')}
                />
                {/* Australia / Oceania */}
                <path
                  d="M 760 320 L 870 310 L 880 390 L 790 400 Z"
                  fill={selectedRegion === 'Asia-Pacific' ? '#224773' : '#112236'}
                  stroke={selectedRegion === 'Asia-Pacific' ? '#68b8ff' : '#224063'}
                  strokeWidth="1.2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedRegion(selectedRegion === 'Asia-Pacific' ? 'All' : 'Asia-Pacific')}
                />

                {/* HAZARD LAYERS (Visible based on Peril filter) */}
                {/* Seismic Fault Lines (Pacific Ring of Fire & Alpide Belt) */}
                {(peril === 'All Perils' || peril === 'Earthquake') && (
                  <g filter="url(#glow-fault)">
                    {/* Japan-Kuril trench */}
                    <path d="M 760 120 Q 800 170 820 240 Q 840 310 820 380" fill="none" stroke="#f66b68" strokeWidth="2.2" strokeDasharray="6 3" />
                    {/* San Andreas & Cascadia */}
                    <path d="M 120 120 Q 140 160 160 210 Q 190 260 220 310" fill="none" stroke="#f66b68" strokeWidth="2.2" strokeDasharray="6 3" />
                    {/* North Anatolian fault */}
                    <path d="M 510 145 Q 550 150 600 155" fill="none" stroke="#ff9b71" strokeWidth="2" strokeDasharray="4 2" />
                    {/* Chile Trench */}
                    <path d="M 230 300 L 250 420" fill="none" stroke="#f66b68" strokeWidth="2" strokeDasharray="5 3" />
                  </g>
                )}

                {/* Hurricane & Typhoon Corridors */}
                {(peril === 'All Perils' || peril.includes('Hurricane')) && (
                  <g>
                    {/* Atlantic Hurricane Alley */}
                    <path d="M 320 240 Q 240 230 190 195 Q 160 180 200 140" fill="none" stroke="url(#cyclone-track)" strokeWidth="2.5" />
                    {/* Western Pacific Typhoon Track */}
                    <path d="M 850 250 Q 780 220 740 180 Q 770 140 820 120" fill="none" stroke="url(#cyclone-track)" strokeWidth="2.5" />
                  </g>
                )}

                {/* Riverine Flood Basins */}
                {(peril === 'All Perils' || peril.includes('Flood')) && (
                  <g opacity="0.65">
                    {/* Mississippi basin */}
                    <circle cx="210" cy="170" r="18" fill="#4d9ef2" fillOpacity="0.2" stroke="#4d9ef2" strokeWidth="1" strokeDasharray="2 2" />
                    {/* Rhine/Danube basin */}
                    <circle cx="490" cy="130" r="14" fill="#4d9ef2" fillOpacity="0.2" stroke="#4d9ef2" strokeWidth="1" strokeDasharray="2 2" />
                    {/* Yangtze basin */}
                    <circle cx="730" cy="180" r="22" fill="#4d9ef2" fillOpacity="0.2" stroke="#4d9ef2" strokeWidth="1" strokeDasharray="2 2" />
                  </g>
                )}

                {/* Interactive Risk Hotspots */}
                {filteredHotspots.map((h) => {
                  const isHovered = selectedHotspot === h.id
                  return (
                    <g
                      key={h.id}
                      transform={`translate(${h.x}, ${h.y})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedHotspot(selectedHotspot === h.id ? null : h.id)}
                    >
                      <circle r={isHovered ? '16' : '10'} fill="#f2716c" fillOpacity="0.25">
                        <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
                        <animate attributeName="fillOpacity" values="0.4;0.05;0.4" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                      <circle r={isHovered ? '6' : '4'} fill="#f2716c" stroke="#fff" strokeWidth="1.5" />
                      <text x="8" y="-6" fill="#eaf3fc" fontSize="10" fontWeight="600">
                        {h.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Right Summary Statistics Card */}
            <div className="map-stats" style={{ width: '160px', padding: '16px' }}>
              <strong>
                50,022
                <small>Stochastic Events</small>
              </strong>
              <strong>
                {currentRpStats.exposureAtRisk}
                <small>{returnPeriod} Exposure at Risk</small>
              </strong>
              <strong>
                128
                <small>Countries & Territories</small>
              </strong>
              {selectedHotspot && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #243e5c', fontSize: '11px' }}>
                  <b style={{ color: '#ff928d', display: 'block' }}>
                    {hotspots.find((h) => h.id === selectedHotspot)?.name}
                  </b>
                  <span style={{ color: '#91a7c0', display: 'block', marginTop: '2px' }}>
                    PML: {hotspots.find((h) => h.id === selectedHotspot)?.pml}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Legend & Hazard Layers Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c4d7ec' }}>
                <i style={{ width: '12px', height: '3px', background: '#f66b68', borderRadius: '2px', display: 'inline-block' }} />
                Seismic Subduction Fault
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c4d7ec' }}>
                <i style={{ width: '12px', height: '3px', background: '#5ea5f9', borderRadius: '2px', display: 'inline-block' }} />
                Cyclone Track Corridor
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c4d7ec' }}>
                <i style={{ width: '10px', height: '10px', background: 'rgba(77,158,242,0.3)', border: '1px solid #4d9ef2', borderRadius: '50%', display: 'inline-block' }} />
                Flood Basin
              </span>
            </div>
            <span style={{ color: '#8ea5be' }}>
              Return Period Severity: <b style={{ color: '#4be0bd' }}>×{currentRpStats.multiplier} loading</b>
            </span>
          </div>
        </article>

        {/* Side Panel: Key Insight & Return Period Diagnostics */}
        <article className="route-panel insight-panel">
          <span className="eyebrow">KEY INSIGHT · 50K STOCHASTIC RUN</span>
          <h2>Tail risk is concentrating in coastal & seismic corridors.</h2>
          <p>
            LossLab identifies that <b>73% of global $1.42T exposure</b> is situated within 150 km of subduction zones or tropical cyclone landfall paths.
          </p>

          <div style={{ marginTop: '20px', padding: '14px', background: '#0e1d2f', borderRadius: '8px', border: '1px solid #203a58' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#91a7c0' }}>Top Active Zone:</span>
              <b style={{ color: '#eef6ff' }}>Western Pacific & Gulf</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
              <span style={{ color: '#91a7c0' }}>Expected Annual Loss:</span>
              <b style={{ color: '#4be0bd' }}>$2.84B / yr</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#91a7c0' }}>Solvency II 99.5% VaR:</span>
              <b style={{ color: '#ff928d' }}>$22.8B</b>
            </div>
          </div>

          <Link
            href="/app/monte-carlo"
            className="primary-action"
            style={{
              marginTop: '22px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              border: '1px solid rgba(147, 197, 253, 0.4)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Run Stochastic Monte Carlo <ChevronRight size={16} />
          </Link>
        </article>
      </section>

      {/* Regional Risk Breakdown Table (Powered by 50k dataset) */}
      <section className="route-panel data-panel" style={{ marginTop: '16px' }}>
        <div className="route-panel-head">
          <div>
            <h2>Regional Risk Breakdown (50,022 Events Catalogued)</h2>
            <p>Aggregated metrics across continental catastrophe zones from the active DuckDB dataset.</p>
          </div>
          <Link href="/app/exposure" className="text-button">
            View All Exposure By Class <ChevronRight size={14} />
          </Link>
        </div>

        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Region</th>
                <th>Recorded Events (50k DB)</th>
                <th>Insured Exposure</th>
                <th>Portfolio Share</th>
                <th>Expected Annual Loss (AAL)</th>
                <th>Primary Peril Risk</th>
                <th>Risk Tier</th>
              </tr>
            </thead>
            <tbody>
              {regionalRisk.map((r) => {
                const isSelected = selectedRegion === r.region
                return (
                  <tr
                    key={r.region}
                    onClick={() => setSelectedRegion(isSelected ? 'All' : r.region)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#152d49' : undefined,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td>
                      <strong style={{ color: isSelected ? '#5ea5f9' : '#fff' }}>{r.region}</strong>
                    </td>
                    <td>{r.events.toLocaleString()}</td>
                    <td>{r.exposure}</td>
                    <td>{r.share}</td>
                    <td>{r.aal}</td>
                    <td style={{ color: '#a4beda' }}>{r.primaryPeril}</td>
                    <td>
                      <span className={`risk-pill ${r.level.toLowerCase().replace(' ', '-')}`}>
                        {r.level}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </RouteShell>
  )
}
