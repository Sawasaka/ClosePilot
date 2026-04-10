'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Search, Plus,
  ArrowUpDown, ChevronUp, ChevronDown, User,
} from 'lucide-react'
import type { Rank, ApproachStatus, CallList, CallListItem } from '@/types/crm'
import { STATUS_STYLES, RANK_CONFIG } from '@/types/crm'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LISTS: Record<string, CallList> = {
  'list-1': {
    id: 'list-1', name: '今週のコール対象', description: '今週中にコールすべきターゲット',
    ownerName: '田中太郎', contactCount: 12, completedCount: 5, appointmentCount: 2,
    color: '#0071E3', createdAt: '2026-03-24', updatedAt: '2026-03-26',
  },
  'list-2': {
    id: 'list-2', name: '再フォローリスト', description: '不在/不通で再コールが必要',
    ownerName: '田中太郎', contactCount: 8, completedCount: 1, appointmentCount: 0,
    color: '#FF9F0A', createdAt: '2026-03-20', updatedAt: '2026-03-25',
  },
  'list-3': {
    id: 'list-3', name: 'セミナー参加者リスト', description: '3/15セミナー参加者へのフォローアップ',
    ownerName: '鈴木花子', contactCount: 20, completedCount: 14, appointmentCount: 5,
    color: '#34C759', createdAt: '2026-03-16', updatedAt: '2026-03-22',
  },
  'list-4': {
    id: 'list-4', name: 'Aランク未着手', description: 'Aランクでまだ未アプローチの企業',
    ownerName: '田中太郎', contactCount: 6, completedCount: 0, appointmentCount: 0,
    color: '#FF3B30', createdAt: '2026-03-18', updatedAt: '2026-03-26',
  },
}

const MOCK_ITEMS: Record<string, CallListItem[]> = {
  'list-1': [
    { id: 'li-1', listId: 'list-1', contactId: '1', contactName: '田中 誠', contactTitle: '営業部長', companyId: '1', companyName: '株式会社テクノリード', rank: 'A', status: 'アポ獲得', callAttempts: 3, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', priority: 1 },
    { id: 'li-2', listId: 'list-1', contactId: '2', contactName: '山本 佳子', contactTitle: 'マネージャー', companyId: '2', companyName: '合同会社フューチャー', rank: 'A', status: '接続済み', callAttempts: 5, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22', priority: 2 },
    { id: 'li-3', listId: 'list-1', contactId: '3', contactName: '佐々木 拓也', contactTitle: '代表取締役', companyId: '3', companyName: '株式会社イノベーション', rank: 'A', status: 'Next Action', callAttempts: 2, lastCallAt: '2026-03-18', nextActionAt: '2026-03-25', priority: 3 },
    { id: 'li-4', listId: 'list-1', contactId: '4', contactName: '中村 理恵', contactTitle: '購買担当', companyId: '4', companyName: '株式会社グロース', rank: 'B', status: '不在', callAttempts: 4, lastCallAt: '2026-03-15', nextActionAt: null, priority: 4 },
    { id: 'li-5', listId: 'list-1', contactId: '5', contactName: '小林 健太', contactTitle: '部長', companyId: '5', companyName: '有限会社サクセス', rank: 'B', status: '不通', callAttempts: 6, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', priority: 5 },
    { id: 'li-6', listId: 'list-1', contactId: '6', contactName: '鈴木 美香', contactTitle: '課長', companyId: '6', companyName: '株式会社ネクスト', rank: 'C', status: '未着手', callAttempts: 0, lastCallAt: null, nextActionAt: null, priority: 6 },
    { id: 'li-7', listId: 'list-1', contactId: '7', contactName: '加藤 雄介', contactTitle: '取締役', companyId: '7', companyName: '合同会社ビジョン', rank: 'C', status: '未着手', callAttempts: 0, lastCallAt: null, nextActionAt: null, priority: 7 },
    { id: 'li-8', listId: 'list-1', contactId: '8', contactName: '吉田 千春', contactTitle: '部長', companyId: '8', companyName: '株式会社スタート', rank: 'C', status: 'コール不可', callAttempts: 8, lastCallAt: '2026-03-01', nextActionAt: null, priority: 8 },
  ],
  'list-2': [
    { id: 'li-9', listId: 'list-2', contactId: '4', contactName: '中村 理恵', contactTitle: '購買担当', companyId: '4', companyName: '株式会社グロース', rank: 'B', status: '不在', callAttempts: 4, lastCallAt: '2026-03-15', nextActionAt: null, priority: 1 },
    { id: 'li-10', listId: 'list-2', contactId: '5', contactName: '小林 健太', contactTitle: '部長', companyId: '5', companyName: '有限会社サクセス', rank: 'B', status: '不通', callAttempts: 6, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', priority: 2 },
  ],
  'list-3': [
    { id: 'li-11', listId: 'list-3', contactId: '1', contactName: '田中 誠', contactTitle: '営業部長', companyId: '1', companyName: '株式会社テクノリード', rank: 'A', status: 'アポ獲得', callAttempts: 3, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', priority: 1 },
  ],
  'list-4': [
    { id: 'li-12', listId: 'list-4', contactId: '6', contactName: '鈴木 美香', contactTitle: '課長', companyId: '6', companyName: '株式会社ネクスト', rank: 'A', status: '未着手', callAttempts: 0, lastCallAt: null, nextActionAt: null, priority: 1 },
    { id: 'li-13', listId: 'list-4', contactId: '7', contactName: '加藤 雄介', contactTitle: '取締役', companyId: '7', companyName: '合同会社ビジョン', rank: 'A', status: '未着手', callAttempts: 0, lastCallAt: null, nextActionAt: null, priority: 2 },
    { id: 'li-14', listId: 'list-4', contactId: '9', contactName: '高橋 健一', contactTitle: 'CTO', companyId: '9', companyName: '株式会社デジタルフォース', rank: 'A', status: '未着手', callAttempts: 0, lastCallAt: null, nextActionAt: null, priority: 3 },
  ],
}

// ─── Filter / Sort types ─────────────────────────────────────────────────────

type FilterKey = 'all' | '未着手' | '接続済み' | 'アポ獲得' | '不通' | '不在' | 'Next Action'
type SortKey = 'priority' | 'name' | 'rank'
type SortDir = 'asc' | 'desc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: '未着手', label: '未着手' },
  { key: '接続済み', label: '接続済み' },
  { key: 'アポ獲得', label: 'アポ獲得' },
  { key: '不通', label: '不通' },
  { key: '不在', label: '不在' },
  { key: 'Next Action', label: 'Next Action' },
]

const STATUS_ORDER: Record<ApproachStatus, number> = {
  '未着手': 0, '不通': 1, '不在': 2, '接続済み': 3,
  'コール不可': 4, 'アポ獲得': 5, 'Next Action': 6,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null) {
  if (!d) return '—'
  const date = new Date(d)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApproachStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-[5px] h-[5px] rounded-full ${s.dot}`} />
      {status}
    </span>
  )
}

// ─── RankBadge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: Rank }) {
  const cfg = RANK_CONFIG[rank]
  return (
    <span
      className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] text-[11px] font-bold"
      style={{ background: cfg.gradient, color: cfg.color, boxShadow: cfg.glow }}
    >
      {rank}
    </span>
  )
}

// ─── Next Action ────────────────────────────────────────────────────────────

type NextActionValue = 'メールアプローチ' | 'コール' | '連絡待ち' | null
const ALL_NEXT_ACTIONS: NextActionValue[] = ['メールアプローチ', 'コール', '連絡待ち']

const NEXT_ACTION_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'メールアプローチ': { bg: 'bg-[rgba(94,92,230,0.1)]',  text: 'text-[#4B48CC]', dot: 'bg-[#5E5CE6]' },
  'コール':          { bg: 'bg-[rgba(0,113,227,0.1)]',   text: 'text-[#0060C7]', dot: 'bg-[#0071E3]' },
  '連絡待ち':        { bg: 'bg-[rgba(255,159,10,0.1)]',  text: 'text-[#C07000]', dot: 'bg-[#FF9F0A]' },
}

function NextActionSelect({ value, onChange }: { value: NextActionValue; onChange: (v: NextActionValue) => void }) {
  const [open, setOpen] = useState(false)

  // 未設定の場合
  if (!value) {
    return (
      <div className="relative">
        <button
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(0,0,0,0.05)] text-[#AEAEB2] hover:text-[#6E6E73] transition-colors"
        >
          <span className="w-[5px] h-[5px] rounded-full bg-[#AEAEB2]" />
          未設定
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={e => { e.stopPropagation(); setOpen(false) }} />
            <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-[8px] py-1 min-w-[140px]"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}>
              {ALL_NEXT_ACTIONS.map(a => {
                const s = NEXT_ACTION_STYLES[a!]
                return (
                  <button key={a} onClick={e => { e.stopPropagation(); onChange(a); setOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(0,0,0,0.03)] transition-colors ${s.text}`}>
                    <span className={`w-[5px] h-[5px] rounded-full ${s.dot} shrink-0`} />
                    {a}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // 設定済みの場合 — StatusBadgeと同じUI
  const style = NEXT_ACTION_STYLES[value]
  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${style.bg} ${style.text} hover:opacity-80 transition-opacity`}
      >
        <span className={`w-[5px] h-[5px] rounded-full ${style.dot}`} />
        {value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={e => { e.stopPropagation(); setOpen(false) }} />
          <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-[8px] py-1 min-w-[140px]"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}>
            {ALL_NEXT_ACTIONS.map(a => {
              const s = NEXT_ACTION_STYLES[a!]
              const selected = a === value
              return (
                <button key={a} onClick={e => { e.stopPropagation(); onChange(a); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors ${selected ? `${s.bg} ${s.text} font-medium` : `hover:bg-[rgba(0,0,0,0.03)] ${s.text}`}`}>
                  <span className={`w-[5px] h-[5px] rounded-full ${s.dot} shrink-0`} />
                  {a}
                </button>
              )
            })}
            <div className="mx-2 my-0.5 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
            <button onClick={e => { e.stopPropagation(); onChange(null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left text-[#AEAEB2] hover:bg-[rgba(0,0,0,0.03)] transition-colors">
              <span className="w-[5px] h-[5px] rounded-full bg-[#AEAEB2] shrink-0" />
              クリア
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── SortHeader ──────────────────────────────────────────────────────────────

function SortHeader({
  label, sortKey, currentSort, currentDir, onSort,
}: {
  label: string; sortKey: SortKey; currentSort: SortKey; currentDir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = currentSort === sortKey
  return (
    <button
      className="flex items-center gap-1 text-[11px] uppercase tracking-[0.04em] font-medium"
      style={{ color: active ? '#1D1D1F' : '#AEAEB2' }}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active ? (currentDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : <ArrowUpDown size={10} />}
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const list = MOCK_LISTS[id]
  const [items, setItems] = useState(MOCK_ITEMS[id] || [])
  type ItemNextAction = Record<string, NextActionValue>
  const [nextActions, setNextActions] = useState<ItemNextAction>({})

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [filterNextAction, setFilterNextAction] = useState<NextActionValue | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let result = [...items]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.contactName.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q)
      )
    }
    if (filter !== 'all') result = result.filter(i => i.status === filter)
    if (filterNextAction !== 'all') {
      if (filterNextAction === null) {
        result = result.filter(i => !nextActions[i.id])
      } else {
        result = result.filter(i => nextActions[i.id] === filterNextAction)
      }
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'priority': cmp = a.priority - b.priority; break
        case 'name': cmp = a.contactName.localeCompare(b.contactName); break
        case 'rank': cmp = a.rank.localeCompare(b.rank); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [items, search, filter, filterNextAction, nextActions, sortKey, sortDir])

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-[14px] text-[#AEAEB2]">リストが見つかりません</p>
      </div>
    )
  }

  const appointmentCount = items.filter(i => i.status === 'アポ獲得').length

  return (
    <>
      {/* Back + Title */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={() => router.push('/lists')}
          className="flex items-center gap-1 text-[13px] text-[#8E8E93] hover:text-[#1D1D1F] transition-colors mb-2"
        >
          <ChevronLeft size={14} />
          リスト一覧
        </button>
        <div className="flex items-center gap-3">
          <div className="w-[12px] h-[12px] rounded-full shrink-0" style={{ background: list.color }} />
          <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
            {list.name}
          </h1>
        </div>
        {list.description && (
          <p className="text-[13px] text-[#8E8E93] mt-0.5 ml-[24px]">{list.description}</p>
        )}
      </motion.div>

      {/* KPI */}
      <motion.div
        className="flex items-center gap-6 mb-5 ml-[24px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-[#8E8E93]">合計</span>
          <span className="font-semibold text-[#1D1D1F]">{items.length}件</span>
        </div>
        <div className="w-px h-4" style={{ background: 'rgba(0,0,0,0.08)' }} />
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-[#8E8E93]">アポ獲得</span>
          <span className="font-semibold text-[#FF9F0A]">{appointmentCount}件</span>
        </div>
      </motion.div>

      {/* Filter + Actions */}
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col gap-2">
          {/* ステータス */}
          <div className="flex items-center gap-1.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
                style={{
                  background: filter === f.key ? '#1D1D1F' : 'rgba(0,0,0,0.04)',
                  color: filter === f.key ? '#FFFFFF' : '#6E6E73',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Next Action */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#AEAEB2] font-medium uppercase tracking-[0.04em] mr-1">Next Action</span>
            {ALL_NEXT_ACTIONS.map(a => {
              const active = filterNextAction === a
              return (
                <button
                  key={a}
                  onClick={() => setFilterNextAction(prev => prev === a ? 'all' : a)}
                  className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
                  style={{
                    background: active ? '#1D1D1F' : 'rgba(0,0,0,0.04)',
                    color: active ? '#FFFFFF' : '#6E6E73',
                  }}
                >
                  {a}
                </button>
              )
            })}
            <button
              onClick={() => setFilterNextAction(prev => prev === null ? 'all' : null)}
              className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
              style={{
                background: filterNextAction === null ? '#1D1D1F' : 'rgba(0,0,0,0.04)',
                color: filterNextAction === null ? '#FFFFFF' : '#6E6E73',
              }}
            >
              未設定
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#AEAEB2' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="検索..."
              className="h-[28px] w-[160px] pl-7 pr-3 text-[12px] rounded-[6px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid transparent' }}
            />
          </div>
          <button
            className="h-[28px] px-3 flex items-center gap-1 text-[12px] font-medium rounded-[6px] transition-all"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#6E6E73' }}
          >
            <Plus size={12} />
            追加
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-[12px] overflow-hidden"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div
          className="grid items-center px-4 py-2.5"
          style={{
            gridTemplateColumns: '32px 1fr 1fr 60px 120px 120px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.04em]">#</span>
          <SortHeader label="名前" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
          <span className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.04em]">企業</span>
          <SortHeader label="ランク" sortKey="rank" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
          <span className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.04em]">ステータス</span>
          <span className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.04em]">Next Action</span>
        </div>

        {/* Rows */}
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            className="grid items-center px-4 py-2.5 cursor-pointer"
            style={{
              gridTemplateColumns: '32px 1fr 1fr 60px 120px 120px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
            }}
            whileHover={{ background: 'rgba(0,0,0,0.02)' }}
            transition={{ duration: 0.1 }}
            onClick={() => router.push(`/contacts/${item.contactId}`)}
          >
            <span className="text-[12px] text-[#AEAEB2]">{item.priority}</span>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <User size={13} style={{ color: '#8E8E93' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#1D1D1F] truncate">{item.contactName}</p>
                <p className="text-[11px] text-[#8E8E93] truncate">{item.contactTitle}</p>
              </div>
            </div>
            <p className="text-[12px] text-[#6E6E73] truncate">{item.companyName}</p>
            <RankBadge rank={item.rank} />
            <StatusBadge status={item.status} />
            <NextActionSelect
              value={nextActions[item.id] ?? null}
              onChange={val => setNextActions(prev => ({ ...prev, [item.id]: val }))}
            />
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[13px] text-[#AEAEB2]">該当するコンタクトがありません</p>
          </div>
        )}
      </motion.div>
    </>
  )
}
