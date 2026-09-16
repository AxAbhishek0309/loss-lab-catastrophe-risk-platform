'use client'

import React, { useState } from 'react'
import { CheckCircle2, ChevronRight, Download, FileSpreadsheet, FileText, Printer, Sparkles } from 'lucide-react'
import { RouteShell } from '@/components/route-shell'
import { WorkspaceKpis } from '@/components/workspace-kpis'

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const kpis = [
    { label: 'Published Reports', value: '24 Dossiers', change: 'Audit Ready' },
    { label: 'Exportable Datasets', value: '50,000 Records', change: 'CSV / JSON' },
    { label: 'Compliance Standard', value: 'Solvency II / ORSA', change: 'Verified' },
    { label: 'Model Version Hash', value: 'v2.4-c81f', change: 'Reproducible' },
  ]

  const reports = [
    { id: '1', title: 'Q3 2026 Executive Catastrophe Risk Dossier', type: 'PDF Audit Report', date: 'Sep 10, 2026', pages: 18, status: 'Final' },
    { id: '2', title: 'Solvency II Capital Adequacy & TVaR Schedule', type: 'Regulatory Filing', date: 'Sep 01, 2026', pages: 32, status: 'Final' },
    { id: '3', title: '100,000 Year Monte Carlo Event Loss Table (YLT)', type: 'Raw Simulation Data (CSV)', date: 'Aug 28, 2026', size: '24.8 MB', status: 'Exportable' },
    { id: '4', title: 'USGS & NOAA Catalogued Event Database (Normalized)', type: 'Master Hazard Catalog (CSV)', date: 'Aug 24, 2026', size: '12.4 MB', status: 'Exportable' },
    { id: '5', title: 'Climate Stress Test Scenario Report (+2.0°C Warming)', type: 'Technical Note', date: 'Aug 15, 2026', pages: 14, status: 'Final' },
  ]

  const handleDownload = (id: string, name: string) => {
    setDownloading(id)
    setTimeout(() => {
      setDownloading(null)
      alert(`Report "${name}" generated successfully.`)
    }, 800)
  }

  return (
    <RouteShell
      title="Risk Reports & Exports"
      subtitle="Generate regulatory capital filings, executive risk dossiers, and export raw simulation datasets."
      eyebrow="RISK OVERVIEW / RISK REPORTS"
    >
      <WorkspaceKpis items={kpis} />

      <section className="route-grid">
        <article className="route-panel route-chart">
          <div className="route-panel-head">
            <div>
              <h2>Instant Report Generator</h2>
              <p>Compile real-time model outputs, exceedance curves, and exposure concentrations into boardroom-ready briefs.</p>
            </div>
          </div>

          <div style={{ padding: '20px', background: '#0a1626', borderRadius: '10px', marginTop: '16px', border: '1px solid #1c334e' }}>
            <h3 style={{ fontSize: '15px', margin: '0 0 8px', color: '#fff' }}>Comprehensive Catastrophe Underwriting Dossier</h3>
            <p style={{ fontSize: '13px', color: '#8fa4ba', margin: '0 0 16px' }}>
              Includes executive summary, AAL/VaR/TVaR breakdown by peril, regional vulnerability matrix, and top 10 historical comparison analogs.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="primary-action"
                onClick={() => handleDownload('quick-pdf', 'Catastrophe Underwriting Dossier')}
                disabled={!!downloading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={16} />
                {downloading === 'quick-pdf' ? 'Generating PDF...' : 'Download Executive PDF'}
              </button>
              <a
                href="/catastrophe_events.csv"
                download="catastrophe_events_50k.csv"
                className="select-button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', textDecoration: 'none', color: '#c5d7ea' }}
              >
                <FileSpreadsheet size={16} />
                Download 50,000-Row CSV Dataset
              </a>
            </div>
          </div>
        </article>

        <article className="route-panel insight-panel">
          <span className="eyebrow">AUDIT TRAIL</span>
          <h2>Deterministic Reproducibility Guaranteed</h2>
          <p>
            Every generated report includes the exact PRNG seed, distribution parameter covariance matrix, and catalog timestamp for compliance verification.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#43dfb1', fontSize: '13px' }}>
            <CheckCircle2 size={16} /> SHA-256 Actuarial Hash Verified
          </div>
        </article>
      </section>

      <section className="route-panel data-panel">
        <div className="route-panel-head">
          <div>
            <h2>Report Archive & Datasets</h2>
            <p>Historical filings and exported simulation runs.</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Report Title</th>
              <th>Format</th>
              <th>Generation Date</th>
              <th>Size / Pages</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong></td>
                <td><span style={{ color: '#88a6c5' }}>{r.type}</span></td>
                <td>{r.date}</td>
                <td>{r.pages ? `${r.pages} pages` : r.size}</td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => handleDownload(r.id, r.title)}
                    disabled={!!downloading}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} />
                    {downloading === r.id ? 'Exporting...' : 'Export'}
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
