'use client'

import React, { useState, useMemo } from 'react'
import { ChevronRight, Play, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react'
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

export default function ScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState('1906 San Francisco Replay')
  const [warmingFactor, setWarmingFactor] = useState('+1.5°C Warming')
  const [frequencyDelta, setFrequencyDelta] = useState(15)
  const [severityDelta, setSeverityDelta] = useState(22)

  // Live dynamic calculations as user drags sliders
  const baseAAL = 2.84
  const baseVaR99 = 18.72

  const freqMult = 1.0 + frequencyDelta / 100.0
  const sevMult = 1.0 + severityDelta / 100.0

  const stressedAAL = parseFloat((baseAAL * freqMult * sevMult).toFixed(2))
  // Heavy tail non-linear expansion
  const stressedVaR99 = parseFloat((baseVaR99 * freqMult * Math.pow(sevMult, 1.35)).toFixed(2))
  const aalDeltaPct = parseFloat((((stressedAAL - baseAAL) / baseAAL) * 100).toFixed(1))
  const varDeltaPct = parseFloat((((stressedVaR99 - baseVaR99) / baseVaR99) * 100).toFixed(1))

  const kpis = [
    { label: 'Baseline 100-Yr VaR', value: `$${baseVaR99}B`, change: 'Standard Climate' },
    { label: 'Stressed 100-Yr VaR', value: `$${stressedVaR99}B`, change: `+${varDeltaPct}% Under Stress` },
    { label: 'Baseline AAL', value: `$${baseAAL}B`, change: 'Historical Mean' },
    { label: 'Stressed AAL', value: `$${stressedAAL}B`, change: `+${aalDeltaPct}% Under Stress` },
  ]

  // Live return period stress data that shifts dynamically with slider movement
  const returnPeriodComparison = useMemo(() => {
    const baseTiers = [
      { period: '10-Yr', base: 5.40 },
      { period: '25-Yr', base: 9.80 },
      { period: '50-Yr', base: 14.10 },
      { period: '100-Yr', base: 18.72 },
      { period: '250-Yr', base: 34.80 },
    ]

    return baseTiers.map((t) => ({
      period: t.period,
      baseline: t.base,
      stressed: parseFloat((t.base * freqMult * Math.pow(sevMult, 1.25)).toFixed(2)),
    }))
  }, [freqMult, sevMult])

  const scenarios = [
    { name: '1906 San Francisco Earthquake Replay', description: 'Replays the 1906 magnitude 7.9 earthquake against present-day Bay Area asset density and replacement costs.', impactAAL: '+142%', capitalAtRisk: '$84.5B', peril: 'Earthquake', fDelta: 25, sDelta: 35 },
    { name: '2005 Hurricane Katrina Track Shift', description: 'Simulates Katrina landfall 30 miles east directly impacting high-density industrial and port corridors with 28ft surge.', impactAAL: '+88%', capitalAtRisk: '$62.1B', peril: 'Cyclone / Surge', fDelta: 18, sDelta: 28 },
    { name: 'Cascadia Megathrust Subduction (Mw 9.0)', description: 'Simulates a rupture along the 1,000 km Cascadia fault with 4-minute shaking and secondary tsunami inundation.', impactAAL: '+310%', capitalAtRisk: '$124.0B', peril: 'Earthquake / Tsunami', fDelta: 40, sDelta: 50 },
    { name: 'Pan-European 500-Year Riverine Flood', description: 'Compound atmospheric river sequence across Rhine, Danube, and Elbe basins over a 3-week continuous precipitation event.', impactAAL: '+65%', capitalAtRisk: '$41.8B', peril: 'Flood', fDelta: 12, sDelta: 20 },
  ]

  const handleApplyPreset = (scen: typeof scenarios[number]) => {
    setSelectedScenario(scen.name)
    setFrequencyDelta(scen.fDelta)
    setSeverityDelta(scen.sDelta)
  }

  return (
    <RouteShell
      title="Scenario Analysis"
      subtitle="Stress test catastrophe portfolios against extreme synthetic scenarios, historical replay events, and climate projections."
      eyebrow="RISK OVERVIEW / SCENARIO ANALYSIS"
    >
      <WorkspaceKpis items={kpis} />

      <section className="route-grid">
        <article className="route-panel route-chart">
          <div className="route-panel-head">
            <div>
              <h2>Live Stress Testing Distribution (Baseline vs. Stressed)</h2>
              <p>Drag the sliders below to see live loss escalation across return periods.</p>
            </div>
            <select
              className="select-button"
              value={warmingFactor}
              onChange={(e) => setWarmingFactor(e.target.value)}
              style={{ background: '#122338', color: '#c3d5eb', border: '1px solid #233b58', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
            >
              <option>+1.0°C Warming (Near Term)</option>
              <option>+1.5°C Warming</option>
              <option>+2.0°C Warming (RCP 4.5)</option>
              <option>+3.0°C Warming (RCP 8.5 Severe)</option>
            </select>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#8fa4ba' }}>Frequency Shift (Tropical Cyclone & Severe Storms)</span>
                <strong style={{ color: '#74b4ff' }}>+{frequencyDelta}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={frequencyDelta}
                onChange={(e) => setFrequencyDelta(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4d91df', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#8fa4ba' }}>Severity Shift (Wind Velocity & Peak Rainfall)</span>
                <strong style={{ color: '#43dfb1' }}>+{severityDelta}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={severityDelta}
                onChange={(e) => setSeverityDelta(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#43dfb1', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ width: '100%', height: '250px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnPeriodComparison} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#1b2e46" strokeDasharray="3 3" />
                <XAxis dataKey="period" stroke="#8fa4ba" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8fa4ba" tick={{ fontSize: 11 }} label={{ value: 'Loss (USD $B)', angle: -90, position: 'insideLeft', offset: 12, fill: '#8fa4ba', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0a1626', border: '1px solid #213d5f', borderRadius: 8, color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`$${val}B`, name === 'baseline' ? 'Baseline Loss' : 'Stressed Scenario Loss']}
                  labelFormatter={(lbl) => `${lbl} Return Period`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="baseline" name="Baseline Loss" fill="#2d649f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stressed" name="Stressed Scenario Loss" fill="#f48280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="route-panel insight-panel">
          <span className="eyebrow">LIVE STRESS OUTCOME</span>
          <h2>A {severityDelta}% severity shift expands 100-Yr VaR by {varDeltaPct}%.</h2>
          <p>
            Due to heavy-tailed power law distributions, incremental hazard intensifications create non-linear loss compounding in the extreme tails.
          </p>

          <div style={{ marginTop: '20px', padding: '14px', background: '#091829', borderRadius: '8px', border: '1px solid #1a3554' }}>
            <div style={{ fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>Projected Capital Deficit:</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#f48280' }}>
              +${(stressedVaR99 - baseVaR99).toFixed(2)}B
            </div>
            <small style={{ color: '#8fa4ba', fontSize: '11px', display: 'block', marginTop: '4px' }}>
              Required Solvency II capital addition for 1-in-100 year event.
            </small>
          </div>
        </article>
      </section>

      <section className="route-panel data-panel">
        <div className="route-panel-head">
          <div>
            <h2>Standard Historical Replay & Catastrophic Scenarios</h2>
            <p>Click any scenario below to automatically apply calibrated parameters to the live chart.</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Scenario Name</th>
              <th>Peril Type</th>
              <th>Description</th>
              <th>AAL Impact</th>
              <th>Capital at Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr
                key={s.name}
                onClick={() => handleApplyPreset(s)}
                style={{ cursor: 'pointer', background: selectedScenario === s.name ? 'rgba(77, 145, 223, 0.1)' : 'transparent' }}
              >
                <td><strong>{s.name}</strong></td>
                <td>{s.peril}</td>
                <td style={{ maxWidth: '380px', fontSize: '12px', color: '#9bb0c7' }}>{s.description}</td>
                <td><strong style={{ color: '#f48280' }}>{s.impactAAL}</strong></td>
                <td><strong style={{ color: '#68adff' }}>{s.capitalAtRisk}</strong></td>
                <td>
                  <button
                    className="select-button"
                    onClick={(e) => { e.stopPropagation(); handleApplyPreset(s) }}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Load Scenario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </RouteShell>
  )
}
