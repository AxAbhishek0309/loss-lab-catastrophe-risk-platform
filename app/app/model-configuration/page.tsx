'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronRight, RotateCcw, Save, Sparkles, CheckCircle2 } from 'lucide-react'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis } from '@/components/workspace-kpis'
import {
  getModelConfig,
  saveModelConfig,
  resetModelConfig,
  calculateModelMetrics,
  DEFAULT_MODEL_CONFIG,
  ModelConfig,
} from '@/lib/model-config'

export default function ModelConfigurationPage() {
  const [freqModel, setFreqModel] = useState(DEFAULT_MODEL_CONFIG.freqModel)
  const [sevModel, setSevModel] = useState(DEFAULT_MODEL_CONFIG.sevModel)
  const [tailThreshold, setTailThreshold] = useState(DEFAULT_MODEL_CONFIG.tailThreshold)
  const [copulaType, setCopulaType] = useState(DEFAULT_MODEL_CONFIG.copulaType)
  const [inflationAdjust, setInflationAdjust] = useState(DEFAULT_MODEL_CONFIG.inflationAdjust)
  const [isCustom, setIsCustom] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    const config = getModelConfig()
    setFreqModel(config.freqModel)
    setSevModel(config.sevModel)
    setTailThreshold(config.tailThreshold)
    setCopulaType(config.copulaType)
    setInflationAdjust(config.inflationAdjust)
    setIsCustom(config.isCustomSession)
  }, [])

  // Calculate live metrics under active selections
  const preview = calculateModelMetrics({
    freqModel,
    sevModel,
    tailThreshold,
    copulaType,
    inflationAdjust,
  })

  const kpis = [
    { label: 'Expected Annual Loss (AAL)', value: `$${preview.aal.toFixed(2)}B`, change: 'Session Model' },
    { label: '99.0% VaR (100-Yr Tail)', value: `$${preview.var99.toFixed(2)}B`, change: `${sevModel.split(' ')[0]} Family` },
    { label: '99.0% TVaR (Shortfall)', value: `$${preview.tvar99.toFixed(2)}B`, change: `${copulaType.split(' ')[0]} Copula` },
    { label: '99.5% VaR (250-Yr Solvency)', value: `$${preview.var995.toFixed(2)}B`, change: inflationAdjust ? '2024 USD Base' : 'Nominal' },
  ]

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const saved = saveModelConfig({
      freqModel,
      sevModel,
      tailThreshold,
      copulaType,
      inflationAdjust,
    })
    setIsCustom(true)
    setStatusMessage(`Active session updated with ${sevModel.split(' ')[0]} + ${freqModel.split(' ')[0]} parameters. Applied across Monte Carlo and Risk Explorer.`)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleReset = () => {
    resetModelConfig()
    setFreqModel(DEFAULT_MODEL_CONFIG.freqModel)
    setSevModel(DEFAULT_MODEL_CONFIG.sevModel)
    setTailThreshold(DEFAULT_MODEL_CONFIG.tailThreshold)
    setCopulaType(DEFAULT_MODEL_CONFIG.copulaType)
    setInflationAdjust(DEFAULT_MODEL_CONFIG.inflationAdjust)
    setIsCustom(false)
    setStatusMessage('Restored canonical defaults (Negative Binomial + Pareto GPD, $500M cutoff, Clayton copula).')
    setTimeout(() => setStatusMessage(null), 4000)
  }

  return (
    <RouteShell
      title="Model Configuration"
      subtitle="Configure parametric distribution families, copula dependencies, and calibration cutoffs for this active session."
      eyebrow="RISK OVERVIEW / MODEL CONFIGURATION"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="select-button"
            onClick={handleReset}
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <RotateCcw size={14} /> Reset to Default
          </button>
          <button
            className="primary-action"
            onClick={() => handleSave()}
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={14} /> Apply to Session
          </button>
        </div>
      }
    >
      <WorkspaceKpis items={kpis} />

      {statusMessage && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 18px',
            borderRadius: '8px',
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(94, 165, 249, 0.4)',
            color: '#93c5fd',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#43dfb1' }} />
            {statusMessage}
          </span>
          {isCustom && (
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '3px 8px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Reset to Defaults
            </button>
          )}
        </div>
      )}

      <section className="route-grid">
        <article className="route-panel route-chart">
          <div className="route-panel-head">
            <div>
              <h2>Actuarial Distribution Settings</h2>
              <p>Select parametric families for annual event arrival frequency and compound loss severity.</p>
            </div>
            {isCustom ? (
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(67, 223, 177, 0.15)', color: '#43dfb1', border: '1px solid rgba(67, 223, 177, 0.3)' }}>
                Custom Session Active
              </span>
            ) : (
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
                Default Benchmark
              </span>
            )}
          </div>

          <form onSubmit={handleSave} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                  Arrival Frequency Distribution
                </label>
                <select
                  value={freqModel}
                  onChange={(e) => setFreqModel(e.target.value)}
                  style={{ width: '100%', background: '#0b1929', color: '#fff', border: '1px solid #1f3752', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                >
                  <option>Negative Binomial (Recommended for Cat Risk)</option>
                  <option>Poisson (Equidispersion Assumption)</option>
                  <option>Zero-Inflated Poisson</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                  Loss Severity Distribution
                </label>
                <select
                  value={sevModel}
                  onChange={(e) => setSevModel(e.target.value)}
                  style={{ width: '100%', background: '#0b1929', color: '#fff', border: '1px solid #1f3752', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                >
                  <option>Generalized Pareto (POT) — Extreme Value</option>
                  <option>Lognormal (Continuous Right-skewed)</option>
                  <option>Weibull (Heavy-tailed Survival)</option>
                  <option>Gamma (Compound Exponential)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                  Peak-Over-Threshold (POT) Cutoff (USD)
                </label>
                <input
                  type="text"
                  value={tailThreshold}
                  onChange={(e) => setTailThreshold(e.target.value)}
                  style={{ width: '100%', background: '#0b1929', color: '#fff', border: '1px solid #1f3752', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                  Multi-Peril Spatial Copula
                </label>
                <select
                  value={copulaType}
                  onChange={(e) => setCopulaType(e.target.value)}
                  style={{ width: '100%', background: '#0b1929', color: '#fff', border: '1px solid #1f3752', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                >
                  <option>Clayton (Lower Tail Dependency)</option>
                  <option>Gumbel (Upper Tail Dependency)</option>
                  <option>Gaussian Copula (Independent Tails)</option>
                  <option>t-Copula (Symmetric Tail Dependence)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input
                type="checkbox"
                id="cpi-toggle"
                checked={inflationAdjust}
                onChange={(e) => setInflationAdjust(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#4d91df' }}
              />
              <label htmlFor="cpi-toggle" style={{ fontSize: '13px', color: '#c5d7ea', cursor: 'pointer' }}>
                Enable Automatic Historical Loss Inflation Normalization (CPI-U to 2024 USD)
              </label>
            </div>
          </form>
        </article>

        <article className="route-panel insight-panel">
          <span className="eyebrow">CONFIGURATION GUIDANCE</span>
          <h2>Parametric Sensitivity & Tail Risk</h2>
          <p>
            When switching to <b>Lognormal</b> or <b>Weibull</b>, 99.0% Tail Value-at-Risk decreases because the Pareto shape parameter (ξ=0.418) exhibits power-law behavior.
          </p>
          <div style={{ marginTop: '14px', padding: '12px', background: '#0e1d2f', borderRadius: '8px', border: '1px solid #203a58', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#91a7c0' }}>Active Severity:</span>
              <strong style={{ color: '#fff' }}>{sevModel.split(' ')[0]}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#91a7c0' }}>Modelled AAL:</span>
              <strong style={{ color: '#43dfb1' }}>${preview.aal.toFixed(2)}B / yr</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#91a7c0' }}>1-in-100 Yr VaR:</span>
              <strong style={{ color: '#ffb64b' }}>${preview.var99.toFixed(2)}B</strong>
            </div>
          </div>
          <button className="primary-action" onClick={() => handleSave()} style={{ marginTop: '20px' }}>
            Apply & Save for Session <ChevronRight size={16} />
          </button>
        </article>
      </section>
    </RouteShell>
  )
}
