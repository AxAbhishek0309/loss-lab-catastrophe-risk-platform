'use client'

import React, { useState, useMemo } from 'react'
import { ChevronRight, Globe2, ShieldAlert } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis } from '@/components/workspace-kpis'

export default function ExposurePage() {
  const [assetClass, setAssetClass] = useState('All Classes')

  const kpis = [
    { label: 'Total Insurable Exposure', value: '$1.42T', change: '+12.6%' },
    { label: 'Commercial & Industrial', value: '$724B', change: '+14.1%' },
    { label: 'Residential Density', value: '$498B', change: '+9.4%' },
    { label: 'Critical Infrastructure', value: '$198B', change: '+16.8%' },
  ]

  const rawZoneData = [
    { zone: 'US Gulf Coast', concrete: 120, steel: 95, masonry: 75, wood: 50 },
    { zone: 'California Faults', concrete: 90, steel: 110, masonry: 30, wood: 50 },
    { zone: 'Japan Kanto', concrete: 115, steel: 80, masonry: 15, wood: 30 },
    { zone: 'Northern Europe', concrete: 70, steel: 65, masonry: 40, wood: 15 },
    { zone: 'SE Asian Deltas', concrete: 45, steel: 35, masonry: 50, wood: 15 },
    { zone: 'E. Mediterranean', concrete: 40, steel: 25, masonry: 35, wood: 10 },
  ]

  const chartData = useMemo(() => {
    return rawZoneData.map((d) => {
      let val = d.concrete + d.steel + d.masonry + d.wood
      if (assetClass === 'Reinforced Concrete') val = d.concrete
      if (assetClass === 'Steel Frame') val = d.steel
      if (assetClass === 'Masonry / Unreinforced') val = d.masonry
      if (assetClass === 'Light Wood Frame') val = d.wood

      return {
        zone: d.zone,
        tiv: val,
        aal: parseFloat((val * 0.0035).toFixed(2)),
      }
    })
  }, [assetClass])

  const exposureZones = [
    { zone: 'US Gulf & Atlantic Coast', peril: 'Hurricane / Surge', tiv: '$340B', vulnerability: 'High', aalRatio: '0.42%' },
    { zone: 'California Fault Systems', peril: 'Earthquake / Wildfire', tiv: '$280B', vulnerability: 'High', aalRatio: '0.38%' },
    { zone: 'Japan Kanto & Tokai Plains', peril: 'Earthquake / Tsunami', tiv: '$240B', vulnerability: 'Medium', aalRatio: '0.29%' },
    { zone: 'Northern European River Basins', peril: 'Riverine Flood', tiv: '$190B', vulnerability: 'Medium', aalRatio: '0.21%' },
    { zone: 'Southeast Asian Deltas', peril: 'Tropical Storm / Monsoon', tiv: '$145B', vulnerability: 'Very High', aalRatio: '0.64%' },
    { zone: 'Eastern Mediterranean Basin', peril: 'Seismic', tiv: '$110B', vulnerability: 'High', aalRatio: '0.45%' },
  ]

  return (
    <RouteShell
      title="Exposure Intelligence"
      subtitle="Understand where economic exposure is concentrated and how catastrophe risk propagates across portfolios."
      eyebrow="RISK OVERVIEW / EXPOSURE INTELLIGENCE"
    >
      <WorkspaceKpis items={kpis} />

      <section className="route-grid">
        <article className="route-panel route-chart">
          <div className="route-panel-head">
            <div>
              <h2>Total Insured Value (TIV) by Region & Construction Class</h2>
              <p>Filter by construction category to inspect vulnerability and capital distribution.</p>
            </div>
            <select
              className="select-button"
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value)}
              style={{ background: '#122338', color: '#c3d5eb', border: '1px solid #233b58', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
            >
              <option>All Classes</option>
              <option>Reinforced Concrete</option>
              <option>Steel Frame</option>
              <option>Masonry / Unreinforced</option>
              <option>Light Wood Frame</option>
            </select>
          </div>

          <div style={{ width: '100%', height: '260px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#1b2e46" strokeDasharray="3 3" />
                <XAxis dataKey="zone" stroke="#8fa4ba" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8fa4ba" tick={{ fontSize: 11 }} label={{ value: 'TIV (USD $B)', angle: -90, position: 'insideLeft', offset: 12, fill: '#8fa4ba', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0a1626', border: '1px solid #213d5f', borderRadius: 8, color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`$${val}B`, name === 'tiv' ? 'Insured Value' : 'Expected Annual Loss']}
                />
                <Bar dataKey="tiv" name="Insured Value" fill="#4d91df" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="route-panel insight-panel">
          <span className="eyebrow">PORTFOLIO EXPOSURE</span>
          <h2>High vulnerability assets drive 64% of expected annual loss.</h2>
          <p>
            Masonry structures in seismic zones and pre-2000 residential builds in storm surge bands account for the predominant share of tail loss variance.
          </p>
          <div style={{ marginTop: '20px', padding: '12px', background: '#091829', borderRadius: '8px', border: '1px solid #1a3554', fontSize: '12px', color: '#9bb0c7' }}>
            <span style={{ color: '#43dfb1', display: 'block', marginBottom: '4px' }}>Active Selection:</span>
            <strong>{assetClass}</strong>
          </div>
        </article>
      </section>

      <section className="route-panel data-panel">
        <div className="route-panel-head">
          <div>
            <h2>High-Exposure Zones</h2>
            <p>Geographic portfolio concentrations sorted by Total Insured Value.</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Zone / Region</th>
              <th>Dominant Perils</th>
              <th>Total Insured Value (TIV)</th>
              <th>Vulnerability Rating</th>
              <th>AAL / TIV Ratio</th>
            </tr>
          </thead>
          <tbody>
            {exposureZones.map((z) => (
              <tr key={z.zone}>
                <td><strong>{z.zone}</strong></td>
                <td>{z.peril}</td>
                <td><strong>{z.tiv}</strong></td>
                <td>
                  <span className={`risk-pill ${z.vulnerability.toLowerCase().replace(' ', '-')}`}>
                    {z.vulnerability}
                  </span>
                </td>
                <td><code>{z.aalRatio}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </RouteShell>
  )
}
