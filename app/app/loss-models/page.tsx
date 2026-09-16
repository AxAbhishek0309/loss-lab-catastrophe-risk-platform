'use client'

import React, { useState, useMemo } from 'react'
import { CheckCircle2, ChevronRight, LineChart, Sparkles, Sliders } from 'lucide-react'
import {
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis } from '@/components/workspace-kpis'

export default function LossModelsPage() {
  const [selectedDistribution, setSelectedDistribution] = useState('Generalized Pareto (GPD)')
  const [thresholdU, setThresholdU] = useState(500)
  const [showGPD, setShowGPD] = useState(true)
  const [showLognormal, setShowLognormal] = useState(true)
  const [showWeibull, setShowWeibull] = useState(true)
  const [showGamma, setShowGamma] = useState(false)

  const kpis = [
    { label: 'Calibrated Distributions', value: '5 Parametric', change: 'MLE / L-moments' },
    { label: 'Best Fit Model', value: 'Pareto (GPD)', change: 'AIC: 14,281.4' },
    { label: 'Kolmogorov-Smirnov p-value', value: '0.842', change: 'Fail to Reject H0' },
    { label: 'Tail Index (ξ)', value: '0.418', change: 'Heavy Tailed' },
  ]

  // Live mathematical density curves calculated across loss points ($0B to $35B)
  const densityCurves = useMemo(() => {
    const points = []
    const uB = thresholdU / 1000.0 // threshold in billions

    for (let loss = 0.5; loss <= 35.0; loss += 1.5) {
      // 1. GPD density: f(x) = (1/sigma) * (1 + xi*(x-u)/sigma)^(-(1/xi + 1)) for x >= u
      let gpdDensity = 0.0
      if (loss >= uB) {
        const xi = 0.38
        const sigma = 1.2
        const z = 1.0 + (xi * (loss - uB)) / sigma
        if (z > 0) {
          gpdDensity = parseFloat(((1.0 / sigma) * Math.pow(z, -(1.0 / xi + 1.0)) * 0.45).toFixed(4))
        }
      }

      // 2. Lognormal density: mu = 1.4, sigma = 0.85
      const mu = 1.4
      const sig = 0.85
      const lnDensity = parseFloat(
        ((1.0 / (loss * sig * Math.sqrt(2 * Math.PI))) *
          Math.exp(-Math.pow(Math.log(loss) - mu, 2) / (2 * sig * sig))).toFixed(4)
      )

      // 3. Weibull density: k = 0.95, lam = 4.2
      const k = 0.95
      const lam = 4.2
      const wbDensity = parseFloat(
        ((k / lam) * Math.pow(loss / lam, k - 1) * Math.exp(-Math.pow(loss / lam, k))).toFixed(4)
      )

      // 4. Gamma density: alpha = 1.8, beta = 0.4
      const alpha = 1.8
      const beta = 0.4
      const gmDensity = parseFloat(
        ((Math.pow(beta, alpha) / 1.0) * Math.pow(loss, alpha - 1) * Math.exp(-beta * loss) * 0.5).toFixed(4)
      )

      points.push({
        loss: loss.toFixed(1),
        gpd: gpdDensity,
        lognormal: lnDensity,
        weibull: wbDensity,
        gamma: gmDensity,
      })
    }
    return points
  }, [thresholdU])

  const models = [
    { name: 'Generalized Pareto (GPD)', type: 'Extreme Value / Tail', aic: '14,281.4', bic: '14,297.2', ksStat: '0.024', status: 'Optimal', params: `ξ = 0.418, σ = $1.2B, u = $${thresholdU}M` },
    { name: 'Lognormal', type: 'Right-skewed Continuous', aic: '14,312.9', bic: '14,323.5', ksStat: '0.038', status: 'Candidate', params: 'μ = 1.40, σ = 0.85' },
    { name: 'Weibull', type: 'Survival / Heavy Tail', aic: '14,365.1', bic: '14,375.7', ksStat: '0.051', status: 'Acceptable', params: 'k = 0.95, λ = $4.2B' },
    { name: 'Gamma', type: 'Compound Exponential', aic: '14,482.0', bic: '14,492.6', ksStat: '0.074', status: 'Underestimating Tail', params: 'α = 1.80, β = 0.40' },
    { name: 'Generalized Extreme Value (GEV)', type: 'Block Maxima', aic: '14,298.7', bic: '14,314.5', ksStat: '0.031', status: 'Candidate', params: 'ξ = 0.38, μ = $2.4B, σ = $3.8B' },
  ]

  return (
    <RouteShell
      title="Loss Models"
      subtitle="Statistical parametric distributions calibrated to quantify catastrophe loss severity and extreme tail behavior."
      eyebrow="RISK OVERVIEW / STATISTICAL LOSS MODELS"
    >
      <WorkspaceKpis items={kpis} />

      <section className="route-grid">
        <article className="route-panel route-chart">
          <div className="route-panel-head">
            <div>
              <h2>Parametric Severity Distribution Density Functions</h2>
              <p>Compare how each probability density function models catastrophe loss frequency across loss scales.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px', fontSize: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#66adff', cursor: 'pointer' }}>
              <input type="checkbox" checked={showGPD} onChange={(e) => setShowGPD(e.target.checked)} style={{ accentColor: '#66adff' }} />
              Generalized Pareto (GPD)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#43dfb1', cursor: 'pointer' }}>
              <input type="checkbox" checked={showLognormal} onChange={(e) => setShowLognormal(e.target.checked)} style={{ accentColor: '#43dfb1' }} />
              Lognormal Fit
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f0a261', cursor: 'pointer' }}>
              <input type="checkbox" checked={showWeibull} onChange={(e) => setShowWeibull(e.target.checked)} style={{ accentColor: '#f0a261' }} />
              Weibull Fit
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', cursor: 'pointer' }}>
              <input type="checkbox" checked={showGamma} onChange={(e) => setShowGamma(e.target.checked)} style={{ accentColor: '#c084fc' }} />
              Gamma Fit
            </label>
          </div>

          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8fa4ba', marginBottom: '4px' }}>
              <span>Peak-Over-Threshold (POT) Cutoff ($M): <strong>${thresholdU}M</strong></span>
              <span style={{ color: '#66adff' }}>Live tail recalculation active</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={thresholdU}
              onChange={(e) => setThresholdU(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#66adff', cursor: 'pointer' }}
            />
          </div>

          <div style={{ width: '100%', height: '270px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLine data={densityCurves} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#1b2e46" strokeDasharray="3 3" />
                <XAxis
                  dataKey="loss"
                  stroke="#8fa4ba"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Event Loss (USD Billions)', position: 'insideBottom', offset: -4, fill: '#8fa4ba', fontSize: 11 }}
                />
                <YAxis
                  stroke="#8fa4ba"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Probability Density f(x)', angle: -90, position: 'insideLeft', offset: 12, fill: '#8fa4ba', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ background: '#0a1626', border: '1px solid #213d5f', borderRadius: 8, color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [val, name.toUpperCase()]}
                  labelFormatter={(lbl) => `$${lbl}B Loss`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                {showGPD && <Line type="monotone" dataKey="gpd" name="Generalized Pareto (GPD)" stroke="#66adff" strokeWidth={2.5} dot={false} />}
                {showLognormal && <Line type="monotone" dataKey="lognormal" name="Lognormal" stroke="#43dfb1" strokeWidth={2} dot={false} />}
                {showWeibull && <Line type="monotone" dataKey="weibull" name="Weibull" stroke="#f0a261" strokeWidth={2} dot={false} strokeDasharray="4 4" />}
                {showGamma && <Line type="monotone" dataKey="gamma" name="Gamma" stroke="#c084fc" strokeWidth={2} dot={false} strokeDasharray="2 2" />}
              </RechartsLine>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="route-panel insight-panel">
          <span className="eyebrow">STATISTICAL DIAGNOSTIC</span>
          <h2>Pareto tail index ξ &gt; 0 confirms heavy-tailed loss regime.</h2>
          <p>
            Standard exponential and Gaussian models severely underestimate the 1-in-100 year event loss. Peak-Over-Threshold (POT) Generalized Pareto provides minimum AIC.
          </p>
          <div style={{ marginTop: '16px', padding: '12px', background: '#091829', borderRadius: '8px', border: '1px solid #1a3554', fontSize: '12px', color: '#9bb0c7' }}>
            <strong style={{ color: '#43dfb1', display: 'block', marginBottom: '4px' }}>Calibrated GPD Tail Formula:</strong>
            <code>F(x) = 1 - (1 + 0.38*(x - {thresholdU/1000}B) / 1.2B)^(-2.63)</code>
          </div>
        </article>
      </section>

      <section className="route-panel data-panel">
        <div className="route-panel-head">
          <div>
            <h2>Model Comparison & Information Criteria</h2>
            <p>Rankings evaluated on Akaike Information Criterion (AIC) and Bayesian Information Criterion (BIC).</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Distribution Family</th>
              <th>Classification</th>
              <th>AIC</th>
              <th>BIC</th>
              <th>KS Stat (D)</th>
              <th>Calibrated Parameters</th>
              <th>Model State</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr
                key={m.name}
                onClick={() => setSelectedDistribution(m.name)}
                style={{ cursor: 'pointer', background: selectedDistribution === m.name ? 'rgba(77, 145, 223, 0.08)' : 'transparent' }}
              >
                <td><strong>{m.name}</strong></td>
                <td>{m.type}</td>
                <td><code>{m.aic}</code></td>
                <td><code>{m.bic}</code></td>
                <td><code>{m.ksStat}</code></td>
                <td><small style={{ color: '#a2b8cf' }}>{m.params}</small></td>
                <td>
                  <span className={`risk-pill ${m.status === 'Optimal' ? 'low' : m.status === 'Candidate' ? 'medium' : 'high'}`}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </RouteShell>
  )
}
