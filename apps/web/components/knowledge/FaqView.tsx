'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Search,
  RefreshCw,
  Database,
  ExternalLink,
  HelpCircle,
  TrendingUp,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsInput } from '@/components/obsidian'
import { MOCK_FAQS, MOCK_FAQ_SYNC, formatRelative } from '@/app/(app)/knowledge/_lib/mock'

export function FaqView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(MOCK_FAQS[0]?.id ?? null)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const categories = useMemo(() => {
    const s = new Set<string>()
    MOCK_FAQS.forEach((f) => s.add(f.category))
    return Array.from(s)
  }, [])

  const filtered = useMemo(() => {
    let list = MOCK_FAQS
    if (category !== 'all') list = list.filter((f) => f.category === category)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q),
      )
    }
    return list.slice().sort((a, b) => b.hits - a.hits)
  }, [query, category])

  function triggerSync() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setToast(`${MOCK_FAQ_SYNC.drivePath} を更新しました`)
      setTimeout(() => setToast(null), 2400)
    }, 1100)
  }

  return (
    <>
      {/* 同期状態 */}
      <ObsCard depth="high" padding="lg" radius="xl" className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <p
            className="text-[12px] leading-relaxed max-w-xl"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            FAQ はチケットから自動蓄積されます。Drive 上の{' '}
            <span className="font-mono font-medium" style={{ color: 'var(--color-obs-text)' }}>
              BGM-FAQ.md
            </span>{' '}
            と双方向同期しています。
          </p>
          <ObsButton variant="ghost" size="sm" onClick={triggerSync} disabled={syncing}>
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              {syncing ? '同期中...' : '今すぐ同期'}
            </span>
          </ObsButton>
        </div>
        <div className="grid grid-cols-4 gap-6">
          <SyncStat label="保存先" value={MOCK_FAQ_SYNC.drivePath} icon={Database} mono />
          <SyncStat label="件数" value={`${MOCK_FAQ_SYNC.entryCount}件`} />
          <SyncStat label="ファイルサイズ" value={MOCK_FAQ_SYNC.fileSize} />
          <SyncStat
            label="最終同期"
            value={formatRelative(MOCK_FAQ_SYNC.lastSyncedAt)}
            sub={MOCK_FAQ_SYNC.lastSyncedAt.slice(0, 16).replace('T', ' ')}
          />
        </div>
      </ObsCard>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          />
          <ObsInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="質問・回答・カテゴリで検索..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryChip label="全て" active={category === 'all'} onClick={() => setCategory('all')} />
          {categories.map((c) => (
            <CategoryChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
      </div>

      <div className="mb-3 text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
        <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
          {filtered.length}
        </span>
        件
      </div>

      <ObsCard depth="low" padding="none" radius="xl">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              条件に合う FAQ がありません
            </p>
          </div>
        ) : (
          filtered.map((f, i) => {
            const open = openId === f.id
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.02 }}
              >
                <button
                  onClick={() => setOpenId(open ? null : f.id)}
                  className="w-full flex items-start gap-3 px-6 py-4 text-left transition-colors duration-150"
                  style={{
                    backgroundColor: open ? 'var(--color-obs-surface-high)' : 'transparent',
                  }}
                  onMouseOver={(e) => {
                    if (!open) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                  }}
                  onMouseOut={(e) => {
                    if (!open) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <HelpCircle
                    size={14}
                    strokeWidth={2.2}
                    style={{ color: 'var(--color-obs-primary)', marginTop: 3 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {f.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10.5px] font-medium"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-highest)',
                          color: 'var(--color-obs-text-muted)',
                        }}
                      >
                        {f.category}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[10.5px] tabular-nums"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        <TrendingUp size={9} />
                        {f.hits} 回参照
                      </span>
                      <span
                        className="text-[10.5px] tabular-nums"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        更新 {formatRelative(f.lastUpdated)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className="transition-transform shrink-0"
                    style={{
                      color: open ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      marginTop: 3,
                    }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                      style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                    >
                      <div className="px-6 py-4 pl-[44px]">
                        <p
                          className="text-[13.5px] leading-relaxed"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {f.answer}
                        </p>
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <Link
                            href={`/knowledge/${f.sourceTicketId}`}
                            className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
                            style={{ color: 'var(--color-obs-primary)' }}
                          >
                            <ExternalLink size={11} />
                            由来チケット #{f.sourceTicketNumber}
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </ObsCard>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-[var(--radius-obs-md)] z-50 text-[12.5px] font-medium"
            style={{
              backgroundColor: 'var(--color-obs-surface-highest)',
              color: 'var(--color-obs-text)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
            }}
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw size={12} style={{ color: 'var(--color-obs-primary)' }} />
              {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function SyncStat({
  label,
  value,
  sub,
  icon: Icon,
  mono,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ElementType
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {Icon && <Icon size={11} />}
        {label}
      </span>
      <span
        className={`text-[13.5px] font-medium truncate ${mono ? 'font-mono' : 'tabular-nums'}`}
        style={{ color: 'var(--color-obs-text)' }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10.5px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
      style={{
        backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
        color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
      }}
    >
      {label}
    </button>
  )
}
