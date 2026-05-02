'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search,
  Hash,
  MessageSquare,
  MessagesSquare,
  X,
  Inbox,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { ObsCard, ObsInput } from '@/components/obsidian'
import {
  MOCK_TICKETS,
  SOURCE_LABEL,
  SOURCE_STYLE,
  STATUS_LABEL,
  STATUS_STYLE,
  formatDateTime,
  formatRelative,
} from '@/app/(app)/knowledge/_lib/mock'
import type { TicketSource, TicketStatus } from '@/app/(app)/knowledge/_lib/mock'

const SOURCE_ICON: Record<TicketSource, React.ElementType> = {
  slack: Hash,
  google_chat: MessagesSquare,
  teams: MessageSquare,
}

export function TicketsView() {
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<TicketSource[]>([])
  const [statusFilter, setStatusFilter] = useState<TicketStatus[]>([])

  const filtered = useMemo(() => {
    let list = MOCK_TICKETS
    if (sourceFilter.length > 0) list = list.filter((t) => sourceFilter.includes(t.source))
    if (statusFilter.length > 0) list = list.filter((t) => statusFilter.includes(t.status))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.question.toLowerCase().includes(q) ||
          t.reporter.toLowerCase().includes(q) ||
          t.channel.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }
    return list.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [query, sourceFilter, statusFilter])

  const total = MOCK_TICKETS.length
  const resolved = MOCK_TICKETS.filter((t) => t.status === 'resolved').length
  const unresolved = MOCK_TICKETS.filter((t) => t.status === 'unresolved').length
  const open = MOCK_TICKETS.filter((t) => t.status === 'open').length
  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0
  const decided = resolved + unresolved
  const aiAccuracy = decided > 0 ? Math.round((resolved / decided) * 100) : 0

  const hasFilter = sourceFilter.length > 0 || statusFilter.length > 0 || query.trim() !== ''

  const clearFilters = () => {
    setSourceFilter([])
    setStatusFilter([])
    setQuery('')
  }

  function toggleArr<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  }

  return (
    <>
      {/* KPI */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="累計チケット" value={total} icon={Inbox} />
        <KpiCard label="解決率" value={`${resolvedRate}%`} sub={`${resolved}/${total}`} />
        <KpiCard label="AI 正答率" value={`${aiAccuracy}%`} sub={`${resolved} / ${decided} 評価済`} icon={CheckCircle2} />
        <KpiCard
          label="未解決 / 未回答"
          value={unresolved + open}
          sub={`未解決${unresolved} / 未回答${open}`}
          icon={AlertCircle}
          tone="hot"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          />
          <ObsInput
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="件名・本文・起票者・チャンネル・カテゴリで検索..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['slack', 'google_chat', 'teams'] as TicketSource[]).map((s) => {
            const active = sourceFilter.includes(s)
            const style = SOURCE_STYLE[s]
            const Icon = SOURCE_ICON[s]
            return (
              <button
                key={s}
                onClick={() => setSourceFilter((arr) => toggleArr(arr, s))}
                className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-medium tracking-[-0.005em] transition-all duration-150"
                style={{
                  backgroundColor: active ? style.bg : 'var(--color-obs-surface-high)',
                  color: active ? style.color : 'var(--color-obs-text-muted)',
                  boxShadow: active ? `inset 0 0 0 1px ${style.color}` : 'none',
                }}
              >
                <Icon size={11} strokeWidth={2.2} />
                {SOURCE_LABEL[s]}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {(['open', 'resolved', 'unresolved', 'updated'] as TicketStatus[]).map((s) => {
            const active = statusFilter.includes(s)
            const style = STATUS_STYLE[s]
            return (
              <button
                key={s}
                onClick={() => setStatusFilter((arr) => toggleArr(arr, s))}
                className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-medium tracking-[-0.005em] transition-all duration-150"
                style={{
                  backgroundColor: active ? style.bg : 'var(--color-obs-surface-high)',
                  color: active ? style.color : 'var(--color-obs-text-muted)',
                  boxShadow: active ? `inset 0 0 0 1px ${style.color}` : 'none',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: active ? style.color : 'var(--color-obs-text-subtle)' }}
                />
                {STATUS_LABEL[s]}
              </button>
            )
          })}
        </div>

        {hasFilter && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[var(--radius-obs-md)] text-[11px] font-medium transition-colors"
            style={{ color: 'var(--color-obs-text-muted)' }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            <X size={12} />
            クリア
          </button>
        )}
      </div>

      <div className="mb-3 text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {hasFilter ? (
          <>
            <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
              {filtered.length}
            </span>
            件 <span className="opacity-60">/ 全{total}件</span>
          </>
        ) : (
          <>
            <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
              {total}
            </span>
            件を表示中
          </>
        )}
      </div>

      {/* Table */}
      <ObsCard depth="low" padding="none" radius="xl">
        <div
          className="grid grid-cols-[60px_minmax(220px,1.4fr)_minmax(140px,0.9fr)_minmax(110px,0.7fr)_120px_100px_100px] gap-3 px-6 py-4 text-[11px] font-medium tracking-[0.1em] uppercase"
          style={{
            color: 'var(--color-obs-text-subtle)',
            backgroundColor: 'var(--color-obs-surface-low)',
          }}
        >
          <span>#</span>
          <span>件名</span>
          <span>ソース</span>
          <span>起票者</span>
          <span>ステータス</span>
          <span>起票日</span>
          <span className="text-right">最終更新</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              条件に合うチケットがありません
            </p>
          </div>
        ) : (
          filtered.map((t, i) => {
            const SrcIcon = SOURCE_ICON[t.source]
            const srcStyle = SOURCE_STYLE[t.source]
            const stStyle = STATUS_STYLE[t.status]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.02 }}
                onClick={() => router.push(`/knowledge/${t.id}`)}
                onMouseEnter={() => router.prefetch(`/knowledge/${t.id}`)}
                className="grid grid-cols-[60px_minmax(220px,1.4fr)_minmax(140px,0.9fr)_minmax(110px,0.7fr)_120px_100px_100px] gap-3 px-6 py-4 items-center cursor-pointer transition-colors duration-150"
                style={{ transitionTimingFunction: 'var(--ease-liquid)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                }}
              >
                <span className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  #{t.number}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>
                    {t.title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {t.category}
                  </p>
                </div>
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap"
                    style={{
                      backgroundColor: srcStyle.bg,
                      color: srcStyle.color,
                    }}
                  >
                    <SrcIcon size={10} strokeWidth={2.2} />
                    {SOURCE_LABEL[t.source]}
                  </span>
                  <p className="text-[11px] mt-1 truncate font-mono" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {t.channel}
                  </p>
                </div>
                <span className="text-[12.5px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
                  {t.reporter}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[10.5px] font-medium tracking-[-0.005em] whitespace-nowrap w-fit"
                  style={{ backgroundColor: stStyle.bg, color: stStyle.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stStyle.color }} />
                  {STATUS_LABEL[t.status]}
                </span>
                <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {formatDateTime(t.createdAt)}
                </span>
                <span className="text-[11.5px] tabular-nums text-right" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {formatRelative(t.updatedAt)}
                </span>
              </motion.div>
            )
          })
        )}
      </ObsCard>
    </>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  sub?: string
  icon?: React.ElementType
  tone?: 'neutral' | 'hot'
}) {
  const accent = tone === 'hot' ? 'var(--color-obs-hot)' : 'var(--color-obs-text)'
  return (
    <ObsCard depth="high" padding="md" radius="lg">
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.1em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {label}
        </p>
        {Icon && <Icon size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />}
      </div>
      <p
        className="text-[26px] font-bold tracking-[-0.03em] mt-1.5 tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] mt-0.5 tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {sub}
        </p>
      )}
    </ObsCard>
  )
}
