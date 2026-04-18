'use client'

import React from 'react'
import { STATUS_GAME_STYLES } from '@/types/crm'
import type { ApproachStatus } from '@/types/crm'

// ─── StatusGameBadge: FF風のステータスバッジ ──────────────────────────────────

export function StatusGameBadge({
  status,
  size = 'md',
}: {
  status: ApproachStatus
  size?: 'sm' | 'md'
}) {
  const s = STATUS_GAME_STYLES[status]
  const padding = size === 'sm' ? 'px-2 py-[2px]' : 'px-2.5 py-[3px]'
  const fontSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  const dotSize = size === 'sm' ? 5 : 6

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap ${padding} ${fontSize}`}
      style={{
        background: s.gradient,
        boxShadow: s.glow,
        color: s.color,
        border: `1px solid ${s.borderColor}`,
        textShadow: s.textShadow,
        letterSpacing: '0.01em',
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: dotSize,
          height: dotSize,
          background: s.dotColor,
          boxShadow: `0 0 4px ${s.dotColor}cc`,
        }}
      />
      {status}
    </span>
  )
}

// ─── GameBadge: 汎用FF風バッジ（任意の色で使える） ───────────────────────────

interface GameBadgeProps {
  label: string
  gradient: string
  glow: string
  color: string
  borderColor?: string
  textShadow?: string
  dotColor?: string
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

export function GameBadge({
  label,
  gradient,
  glow,
  color,
  borderColor = 'rgba(255,255,255,0.3)',
  textShadow = '0 1px 2px rgba(0,0,0,0.4)',
  dotColor,
  size = 'md',
  icon,
}: GameBadgeProps) {
  const padding = size === 'sm' ? 'px-2 py-[2px]' : 'px-2.5 py-[3px]'
  const fontSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  const dotSize = size === 'sm' ? 5 : 6

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap ${padding} ${fontSize}`}
      style={{
        background: gradient,
        boxShadow: glow,
        color,
        border: `1px solid ${borderColor}`,
        textShadow,
        letterSpacing: '0.01em',
      }}
    >
      {icon}
      {dotColor && (
        <span
          className="rounded-full shrink-0"
          style={{
            width: dotSize,
            height: dotSize,
            background: dotColor,
            boxShadow: `0 0 4px ${dotColor}cc`,
          }}
        />
      )}
      {label}
    </span>
  )
}
