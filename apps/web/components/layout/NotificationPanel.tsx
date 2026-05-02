'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  X,
  CheckCheck,
  Sparkles,
  Wrench,
  Lightbulb,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import {
  KIND_META,
  formatRelative,
  type NotificationItem,
  type NotificationKind,
} from '@/lib/notifications/mock-data'

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  release:     Sparkles,
  tip:         Lightbulb,
  maintenance: Wrench,
  alert:       AlertTriangle,
}

const TONE_COLOR: Record<'primary' | 'middle' | 'low' | 'hot', string> = {
  primary: 'var(--color-obs-primary)',
  middle:  'var(--color-obs-middle)',
  low:     'var(--color-obs-low)',
  hot:     'var(--color-obs-hot)',
}

export function useUnreadCount(items: NotificationItem[]) {
  return useMemo(() => items.filter((i) => !i.read).length, [items])
}

export function NotificationPanel({
  open,
  onClose,
  items,
  onItemsChange,
}: {
  open: boolean
  onClose: () => void
  items: NotificationItem[]
  onItemsChange: (next: NotificationItem[]) => void
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  // クライアントマウント後にだけ相対時刻を計算(SSR ハイドレーション差を避ける)
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
  }, [open])

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const markAsRead = (id: string) => {
    onItemsChange(items.map((i) => (i.id === id ? { ...i, read: true } : i)))
  }
  const markAllRead = () => {
    onItemsChange(items.map((i) => ({ ...i, read: true })))
  }

  const unread = items.filter((i) => !i.read).length

  return (
    <div
      ref={wrapRef}
      role="dialog"
      aria-label="通知"
      className="fixed top-[52px] right-4 w-[380px] max-h-[560px] z-40 flex flex-col rounded-[var(--radius-obs-2xl)] overflow-hidden"
      style={{
        backgroundColor: 'var(--color-obs-surface-low)',
        border: '1px solid var(--color-obs-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(171,199,255,0.06)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-obs-border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
            お知らせ
          </div>
          {unread > 0 && (
            <span
              className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold tabular-nums leading-none"
              style={{
                backgroundColor: 'rgba(255,107,107,0.16)',
                color: 'var(--color-obs-hot)',
                boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.24)',
              }}
            >
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 h-7 px-2 rounded-[var(--radius-obs-md)] text-[11px] transition-colors duration-150"
              style={{ color: 'var(--color-obs-text-muted)' }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--color-obs-surface-high)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
              }}
              title="すべて既読にする"
            >
              <CheckCheck size={12} />
              すべて既読
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-7 h-7 rounded-[var(--radius-obs-md)] flex items-center justify-center transition-colors duration-150"
            style={{ color: 'var(--color-obs-text-muted)' }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-obs-surface-high)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto py-1">
        {items.length === 0 ? (
          <div className="px-4 py-12 text-center text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            まだお知らせはありません
          </div>
        ) : (
          items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              now={now}
              onMarkRead={() => markAsRead(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── 1 行 ────────────────────────────────────────────────────────────────────
function NotificationRow({
  item,
  now,
  onMarkRead,
}: {
  item: NotificationItem
  now: number | null
  onMarkRead: () => void
}) {
  const Icon = KIND_ICON[item.kind]
  const meta = KIND_META[item.kind]
  const tone = TONE_COLOR[meta.tone]
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        if (!item.read) onMarkRead()
      }}
      className="relative px-4 py-3 cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: hover ? 'var(--color-obs-surface-high)' : 'transparent',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${tone} 16%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tone} 28%, transparent)`,
          }}
        >
          <Icon size={14} style={{ color: tone }} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] tracking-[0.08em] uppercase font-semibold"
              style={{ color: tone }}
            >
              {meta.label}
            </span>
            <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {now ? formatRelative(item.createdAt, now) : ''}
            </span>
          </div>
          <div
            className="text-[12.5px] font-medium leading-snug mb-1"
            style={{ color: 'var(--color-obs-text)' }}
          >
            {item.title}
          </div>
          <div className="text-[11.5px] leading-snug" style={{ color: 'var(--color-obs-text-muted)' }}>
            {item.body}
          </div>

          {item.ctaHref && item.ctaLabel && (
            <Link
              href={item.ctaHref}
              className="inline-flex items-center mt-2 text-[11px] font-medium hover:underline"
              style={{ color: tone }}
              onClick={(e) => e.stopPropagation()}
            >
              {item.ctaLabel} →
            </Link>
          )}
        </div>

        {/* Unread dot */}
        {!item.read && (
          <span
            className="w-[6px] h-[6px] rounded-full mt-2 shrink-0"
            style={{ backgroundColor: 'var(--color-obs-hot)' }}
            aria-label="未読"
          />
        )}
      </div>
    </div>
  )
}
