'use client'

import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  AlertTriangle,
  ChevronRight,
  Download,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis, KpiItem } from '@/components/workspace-kpis'
import {
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

const initialEvents = [
  { id: '1', name: 'Typhoon Saola', peril: 'Cyclone', country: 'Philippines', date: 'Aug 30, 2023', magnitude: 'Cat 4 (240 km/h)', economicLoss: '$12.6B', insuredLoss: '$3.8B', casualties: 28, risk: 'High' },
  { id: '2', name: 'Kahramanmaras Earthquake', peril: 'Earthquake', country: 'Turkey / Syria', date: 'Feb 6, 2023', magnitude: 'Mw 7.8', economicLoss: '$34.2B', insuredLoss: '$5.3B', casualties: 59259, risk: 'Very High' },
  { id: '3', name: 'Hurricane Otis', peril: 'Cyclone', country: 'Mexico (Acapulco)', date: 'Oct 25, 2023', magnitude: 'Cat 5 (270 km/h)', economicLoss: '$16.8B', insuredLoss: '$4.1B', casualties: 52, risk: 'High' },
  { id: '4', name: 'Vermont & Northeast Floods', peril: 'Flood', country: 'United States', date: 'Jul 9, 2023', magnitude: '500-yr crest', economicLoss: '$8.4B', insuredLoss: '$3.2B', casualties: 9, risk: 'Medium' },
  { id: '5', name: 'Nova Scotia & Quebec Wildfires', peril: 'Wildfire', country: 'Canada', date: 'Jun 1, 2023', magnitude: '18.4M hectares', economicLoss: '$9.1B', insuredLoss: '$2.9B', casualties: 8, risk: 'Medium' },
  { id: '6', name: 'Noto Peninsula Earthquake', peril: 'Earthquake', country: 'Japan', date: 'Jan 1, 2024', magnitude: 'Mw 7.5', economicLoss: '$17.5B', insuredLoss: '$6.4B', casualties: 245, risk: 'High' },
  { id: '7', name: 'Hurricane Helene', peril: 'Cyclone', country: 'United States (SE)', date: 'Sep 26, 2024', magnitude: 'Cat 4 (225 km/h)', economicLoss: '$38.5B', insuredLoss: '$11.2B', casualties: 230, risk: 'Very High' },
  { id: '8', name: 'Rio Grande do Sul Inundation', peril: 'Flood', country: 'Brazil', date: 'May 3, 2024', magnitude: '100-yr rain', economicLoss: '$14.2B', insuredLoss: '$2.1B', casualties: 181, risk: 'High' },
  { id: '9', name: 'Great Tohoku Earthquake & Tsunami', peril: 'Earthquake', country: 'Japan', date: 'Mar 11, 2011', magnitude: 'Mw 9.1', economicLoss: '$210.0B', insuredLoss: '$35.0B', casualties: 19759, risk: 'Very High' },
  { id: '10', name: 'Hurricane Ian', peril: 'Cyclone', country: 'United States (FL)', date: 'Sep 28, 2022', magnitude: 'Cat 4 (240 km/h)', economicLoss: '$112.0B', insuredLoss: '$65.0B', casualties: 150, risk: 'Very High' },
]

// Peril distribution stats from the 50k CSV
const perilDistribution = [
  { peril: 'Flood', count: 14200, loss: 397.6, color: '#6ea8ff' },
  { peril: 'Earthquake', count: 11100, loss: 312.4, color: '#4d7fca' },
  { peril: 'Cyclone', count: 9150, loss: 255.6, color: '#55c6bd' },
  { peril: 'Storm', count: 7120, loss: 198.8, color: '#f0a261' },
  { peril: 'Wildfire', count: 5080, loss: 142.0, color: '#db746f' },
  { peril: 'Drought', count: 3372, loss: 113.6, color: '#f2c06b' },
]

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [perilFilter, setPerilFilter] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState<typeof initialEvents[number] | null>(null)
  const [chartMetric, setChartMetric] = useState<'count' | 'loss'>('count')
  const [activeKpiIndex, setActiveKpiIndex] = useState(0)

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.country.toLowerCase().includes(search.toLowerCase())
      const matchPeril = perilFilter === 'All' || e.peril === perilFilter
      return matchSearch && matchPeril
    })
  }, [search, perilFilter])

  const kpis: KpiItem[] = [
    { label: 'Catalogued Events', value: '50,022', change: '+50k CSV', description: 'Total stochastic and observational events in local DuckDB' },
    { label: 'Total Modeled Losses', value: '$1.42T', change: '+8.4%', description: 'Worldwide aggregate portfolio loss potential across all return periods' },
    { label: 'Insured Share Ratio', value: '38.4%', change: '+2.3%', description: 'Global ratio of insured losses to total economic devastation' },
    { label: 'Avg Event Severity', value: '$412M', change: '+5.1%', description: 'Mean modeled economic loss per catastrophe occurrence' },
  ]

  return (
    <RouteShell
      title="Catastrophe Events"
      subtitle="50,022 historical & synthetic catastrophe events powering LossLab's probabilistic risk intelligence."
      eyebrow="RISK OVERVIEW / CATASTROPHE EVENTS"
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <a
            href="/catastrophe_events.csv"
            download="catastrophe_events.csv"
            className="select-button small"
            style={{ textDecoration: 'none', color: '#55c6bd', border: '1px solid #234559' }}
          >
            <Download size={13} /> Download 50k CSV
          </a>
        </div>
      }
    >
      <WorkspaceKpis
        items={kpis}
        selectedIndex={activeKpiIndex}
        onSelect={(index) => setActiveKpiIndex(index)}
      />

      {/* Interactive Peril Distribution Chart */}
      <section className="route-panel route-chart" style={{ marginTop: '16px', padding: '18px 20px' }}>
        <div className="route-panel-head">
          <div>
            <h2>50,022-Event Dataset Composition by Peril</h2>
            <p>Distribution of event frequency and aggregate economic losses across the catalog.</p>
          </div>
          <div className="chart-controls">
            <button
              className={`chart-toggle-btn ${chartMetric === 'count' ? 'active' : ''}`}
              onClick={() => setChartMetric('count')}
            >
              Event Count
            </button>
            <button
              className={`chart-toggle-btn ${chartMetric === 'loss' ? 'active' : ''}`}
              onClick={() => setChartMetric('loss')}
            >
              Economic Loss ($B)
            </button>
          </div>
        </div>

        <div style={{ height: '170px', marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perilDistribution} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid stroke="#1c334d" strokeDasharray="2 3" />
              <XAxis dataKey="peril" stroke="#91a7c0" tick={{ fontSize: 10 }} />
              <YAxis
                stroke="#91a7c0"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => (chartMetric === 'count' ? `${(v / 1000).toFixed(0)}k` : `$${v}B`)}
              />
              <Tooltip
                contentStyle={{ background: '#0e1d2e', border: '1px solid #305175', borderRadius: 8, fontSize: 11 }}
                formatter={(v: any) => [
                  chartMetric === 'count' ? `${Number(v).toLocaleString()} Events` : `$${v}B Total Loss`,
                  chartMetric === 'count' ? 'Catalog Count' : 'Modeled Loss',
                ]}
              />
              <Bar dataKey={chartMetric} radius={[4, 4, 0, 0]} barSize={28}>
                {perilDistribution.map((entry) => (
                  <Cell key={entry.peril} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Historical Catastrophe Catalog Table */}
      <section className="route-panel data-panel" style={{ marginTop: '16px' }}>
        <div className="route-panel-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2>Historical Catastrophe Catalog (Filtered Sample)</h2>
            <p>Direct observations from USGS Earthquake API and NOAA Storm Events database.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0b1b2d', border: '1px solid #20364f', borderRadius: '6px', padding: '4px 10px', gap: '6px' }}>
              <Search size={14} color="#7590ac" />
              <input
                type="text"
                placeholder="Search event, country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', width: '160px' }}
              />
            </div>
            <select
              className="select-button"
              value={perilFilter}
              onChange={(e) => setPerilFilter(e.target.value)}
              style={{ background: '#122338', color: '#c3d5eb', border: '1px solid #233b58', borderRadius: '6px', padding: '6px 10px', fontSize: '12px' }}
            >
              <option value="All">All Perils</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Flood">Flood</option>
              <option value="Wildfire">Wildfire</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Peril Type</th>
                <th>Location</th>
                <th>Date</th>
                <th>Magnitude</th>
                <th>Economic Loss</th>
                <th>Insured Loss</th>
                <th>Casualties</th>
                <th>Modelled Risk</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><strong>{e.name}</strong></td>
                  <td>{e.peril}</td>
                  <td>{e.country}</td>
                  <td>{e.date}</td>
                  <td>{e.magnitude}</td>
                  <td><strong>{e.economicLoss}</strong></td>
                  <td>{e.insuredLoss}</td>
                  <td>{e.casualties.toLocaleString()}</td>
                  <td>
                    <span className={`risk-pill ${e.risk.toLowerCase().replace(' ', '-')}`}>
                      {e.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Event Details Modal Drawer */}
      {typeof document !== 'undefined' && selectedEvent &&
        createPortal(
          <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
            <aside className="event-drawer" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setSelectedEvent(null)} aria-label="Close drawer">
                <X size={18} />
              </button>
              <span className="eyebrow">EVENT SUMMARY</span>
              <h2>{selectedEvent.name}</h2>
              <p className="drawer-location">{selectedEvent.country} · {selectedEvent.date}</p>

              <div className="drawer-stat-grid">
                <div>
                  <span>Peril</span>
                  <strong>{selectedEvent.peril}</strong>
                </div>
                <div>
                  <span>Magnitude</span>
                  <strong>{selectedEvent.magnitude}</strong>
                </div>
                <div>
                  <span>Economic Loss</span>
                  <strong>{selectedEvent.economicLoss}</strong>
                </div>
                <div>
                  <span>Insured Loss</span>
                  <strong>{selectedEvent.insuredLoss}</strong>
                </div>
              </div>

              <div className="drawer-note">
                <Sparkles size={18} />
                <p>
                  Modeled risk is <b>{selectedEvent.risk.toLowerCase()}</b> based on regional asset density, construction vulnerability, and return period exceedance.
                </p>
              </div>

              <button className="primary-action" onClick={() => setSelectedEvent(null)}>
                Back to Catalog <ChevronRight size={16} />
              </button>
            </aside>
          </div>,
          document.body
        )}
    </RouteShell>
  )
}
