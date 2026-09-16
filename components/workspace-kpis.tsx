'use client'

import React, { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export interface KpiItem {
  label: string
  value: string
  change: string
  negative?: boolean
  description?: string
}

interface WorkspaceKpisProps {
  items: KpiItem[]
  selectedIndex?: number
  onSelect?: (index: number, item: KpiItem) => void
}

function MiniSparkline({ color = '#74b4ff' }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 30" className="route-kpi-spark" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points="0,25 12,19 22,22 34,13 44,15 56,7 68,11 80,2 90,8 100,0 100,30 0,30"
        fill={`url(#spark-grad-${color.replace('#', '')})`}
      />
      <polyline
        points="0,25 12,19 22,22 34,13 44,15 56,7 68,11 80,2 90,8 100,0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function WorkspaceKpis({ items, selectedIndex: propSelectedIndex, onSelect }: WorkspaceKpisProps) {
  const [internalSelected, setInternalSelected] = useState<number>(0)
  const activeIndex = propSelectedIndex !== undefined ? propSelectedIndex : internalSelected

  const handleCardClick = (index: number, item: KpiItem) => {
    setInternalSelected(index)
    if (onSelect) {
      onSelect(index, item)
    }
  }

  return (
    <div className="route-kpis">
      {items.map((item, index) => {
        const isSelected = activeIndex === index
        const isNegative = item.negative ?? item.change.startsWith('-')
        const accentColor = isNegative ? '#f47e7c' : isSelected ? '#5ea5f9' : '#4be0bd'

        return (
          <article
            className={`route-kpi ${isSelected ? 'route-kpi-active' : ''}`}
            key={item.label}
            onClick={() => handleCardClick(index, item)}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
          >
            <span className="route-kpi-label">{item.label}</span>
            <strong className="route-kpi-value">{item.value}</strong>
            <div className="route-kpi-footer">
              <small className={isNegative ? 'negative' : 'positive'}>
                {isNegative ? <TrendingDown size={14} /> : <TrendingUp size={14} />} {item.change}
              </small>
              <span className="route-kpi-interactive-hint">Click to filter</span>
            </div>
            <MiniSparkline color={accentColor} />
          </article>
        )
      })}
    </div>
  )
}
