'use client'

import React, { useState } from 'react'
import { Check, Key, Lock, Mail, Shield, User } from 'lucide-react'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis } from '@/components/workspace-kpis'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('ll_live_94f83a2e1d08bc740192e')
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const kpis = [
    { label: 'Analyst License Tier', value: 'Enterprise Risk', change: 'Unlimited MC' },
    { label: 'API Quota Consumption', value: '14,280 / 100k', change: '14.2% used' },
    { label: 'Two-Factor Auth (2FA)', value: 'Hardware Token', change: 'Enforced' },
    { label: 'Session Expiry', value: '8 Hours', change: 'High Security' },
  ]

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <RouteShell
      title="Settings & Credentials"
      subtitle="Manage your analyst profile, computational API access tokens, and security parameters."
      eyebrow="RISK OVERVIEW / SETTINGS"
    >
      <WorkspaceKpis items={kpis} />

      <section className="route-grid">
        <article className="route-panel route-chart">
          <div className="route-panel-head">
            <div>
              <h2>Analyst Profile & Preferences</h2>
              <p>Credentials associated with model audit logs and regulatory filings.</p>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Abhishek Tiwari"
                  style={{ width: '100%', background: '#0b1929', color: '#fff', border: '1px solid #1f3752', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                  Work Email
                </label>
                <input
                  type="email"
                  defaultValue="abhishek@losslab.internal"
                  style={{ width: '100%', background: '#0b1929', color: '#fff', border: '1px solid #1f3752', borderRadius: '6px', padding: '8px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#8fa4ba', marginBottom: '6px' }}>
                Catastrophe Risk Modeller API Key
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  value={apiKey}
                  readOnly
                  style={{ flex: 1, background: '#07121f', color: '#8fa4ba', border: '1px solid #1c324b', borderRadius: '6px', padding: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  className="select-button"
                  onClick={handleCopyKey}
                  style={{ padding: '8px 14px', fontSize: '12px' }}
                >
                  {copied ? 'Copied!' : 'Copy Key'}
                </button>
              </div>
              <small style={{ display: 'block', color: '#68829e', marginTop: '6px' }}>
                Use this token with Python/R SDKs to query simulation vectors and exceedance curves directly.
              </small>
            </div>

            <button
              type="submit"
              className="primary-action"
              style={{ alignSelf: 'flex-start', marginTop: '10px' }}
            >
              {saved ? 'Saved Successfully' : 'Update Profile'}
            </button>
          </form>
        </article>

        <article className="route-panel insight-panel">
          <span className="eyebrow">ENTERPRISE ACCESS</span>
          <h2>Institutional Security & Audit Logs</h2>
          <p>
            All changes to model parameters, threshold triggers, and simulation runs are immutably signed with your analyst key.
          </p>
          <div style={{ marginTop: '20px', padding: '12px', background: '#081423', borderRadius: '8px', border: '1px solid #1c334d', fontSize: '12px', color: '#9bb0c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#43dfb1', marginBottom: '4px' }}>
              <Shield size={14} /> SOC2 Type II Certified
            </div>
            Role: Lead Catastrophe Actuary
          </div>
        </article>
      </section>
    </RouteShell>
  )
}
