'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Search, Plus,
  ArrowUpDown, ChevronUp, ChevronDown, User, Phone, Mail,
} from 'lucide-react'
import type { Rank, ApproachStatus, CallList, CallListItem } from '@/types/crm'
import { RANK_CONFIG } from '@/types/crm'
import { StatusGameBadge } from '@/components/ui/GameBadge'

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
    { id: 'li-1', listId: 'list-1', contactId: '1', contactName: '田中 誠', contactTitle: '営業部長', companyId: '1', companyName: '株式会社テクノリード', rank: 'A', status: 'アポ獲得', callAttempts: 3, emailsSent: 5, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', priority: 1 },
    { id: 'li-2', listId: 'list-1', contactId: '2', contactName: '山本 佳子', contactTitle: 'マネージャー', companyId: '2', companyName: '合同会社フューチャー', rank: 'A', status: '接続済み', callAttempts: 5, emailsSent: 8, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22', priority: 2 },
    { id: 'li-3', listId: 'list-1', contactId: '3', contactName: '佐々木 拓也', contactTitle: '代表取締役', companyId: '3', companyName: '株式会社イノベーション', rank: 'A', status: 'Next Action', callAttempts: 2, emailsSent: 3, lastCallAt: '2026-03-18', nextActionAt: '2026-03-25', priority: 3 },
    { id: 'li-4', listId: 'list-1', contactId: '4', contactName: '中村 理恵', contactTitle: '購買担当', companyId: '4', companyName: '株式会社グロース', rank: 'B', status: '不在', callAttempts: 4, emailsSent: 2, lastCallAt: '2026-03-15', nextActionAt: null, priority: 4 },
    { id: 'li-5', listId: 'list-1', contactId: '5', contactName: '小林 健太', contactTitle: '部長', companyId: '5', companyName: '有限会社サクセス', rank: 'B', status: '不通', callAttempts: 6, emailsSent: 1, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', priority: 5 },
    { id: 'li-6', listId: 'list-1', contactId: '6', contactName: '鈴木 美香', contactTitle: '課長', companyId: '6', companyName: '株式会社ネクスト', rank: 'C', status: '未着手', callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, priority: 6 },
    { id: 'li-7', listId: 'list-1', contactId: '7', contactName: '加藤 雄介', contactTitle: '取締役', companyId: '7', companyName: '合同会社ビジョン', rank: 'C', status: '未着手', callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, priority: 7 },
    { id: 'li-8', listId: 'list-1', contactId: '8', contactName: '吉田 千春', contactTitle: '部長', companyId: '8', companyName: '株式会社スタート', rank: 'C', status: 'コール不可', callAttempts: 8, emailsSent: 4, lastCallAt: '2026-03-01', nextActionAt: null, priority: 8 },
  ],
  'list-2': [
    { id: 'li-9', listId: 'list-2', contactId: '4', contactName: '中村 理恵', contactTitle: '購買担当', companyId: '4', companyName: '株式会社グロース', rank: 'B', status: '不在', callAttempts: 4, emailsSent: 2, lastCallAt: '2026-03-15', nextActionAt: null, priority: 1 },
    { id: 'li-10', listId: 'list-2', contactId: '5', contactName: '小林 健太', contactTitle: '部長', companyId: '5', companyName: '有限会社サクセス', rank: 'B', status: '不通', callAttempts: 6, emailsSent: 1, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', priority: 2 },
  ],
  'list-3': [
    { id: 'li-11', listId: 'list-3', contactId: '1', contactName: '田中 誠', contactTitle: '営業部長', companyId: '1', companyName: '株式会社テクノリード', rank: 'A', status: 'アポ獲得', callAttempts: 3, emailsSent: 5, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', priority: 1 },
  ],
  'list-4': [
    { id: 'li-12', listId: 'list-4', contactId: '6', contactName: '鈴木 美香', contactTitle: '課長', companyId: '6', companyName: '株式会社ネクスト', rank: 'A', status: '未着手', callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, priority: 1 },
    { id: 'li-13', listId: 'list-4', contactId: '7', contactName: '加藤 雄介', contactTitle: '取締役', companyId: '7', companyName: '合同会社ビジョン', rank: 'A', status: '未着手', callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, priority: 2 },
    { id: 'li-14', listId: 'list-4', contactId: '9', contactName: '高橋 健一', contactTitle: 'CTO', companyId: '9', companyName: '株式会社デジタルフォース', rank: 'A', status: '未着手', callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, priority: 3 },
  ],
}

// ─── Filter / Sort types ─────────────────────────────────────────────────────
// コンタクトページと連動: ステータス6種 + Next Action 5種

type FilterKey = 'all' | '未着手' | '不通' | '不在' | '接続済み' | 'コール不可' | 'アポ獲得'
type SortKey = 'priority' | 'name' | 'rank'
type SortDir = 'asc' | 'desc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: '未着手', label: '未着手' },
  { key: '不通', label: '不通' },
  { key: '不在', label: '不在' },
  { key: '接続済み', label: '接続済み' },
  { key: 'コール不可', label: 'コール不可' },
  { key: 'アポ獲得', label: 'アポ獲得' },
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

// ─── RankBadge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: Rank }) {
  const cfg = RANK_CONFIG[rank]
  return (
    <span
      className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-[6px] text-[11px] font-black"
      style={{
        background: cfg.gradient,
        color: cfg.color,
        boxShadow: `${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
        border: '1px solid rgba(255,255,255,0.25)',
        textShadow: cfg.color === '#fff' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
        letterSpacing: '0.04em',
      }}
    >
      {rank}
    </span>
  )
}

// ─── Next Action ────────────────────────────────────────────────────────────
// コンタクトページと連動: メール / コール / 商談 / 連絡待ち / フォロー

type NextActionValue = 'メール' | 'コール' | '商談' | '連絡待ち' | 'フォロー' | null
const ALL_NEXT_ACTIONS: NextActionValue[] = ['メール', 'コール', '商談', '連絡待ち', 'フォロー']

interface NextActionStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
  hoverColor: string
}

const NEXT_ACTION_GAME_STYLES: Record<string, NextActionStyle> = {
  'メール': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#E9E5FF',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(50,20,100,0.6)',
    hoverColor: '#C4B5FD',
  },
  'コール': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#E0F4FF',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(0,40,90,0.6)',
    hoverColor: '#7DD3FC',
  },
  '商談': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24',
    dotColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
    hoverColor: '#6EE7B7',
  },
  '連絡待ち': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00',
    dotColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
    hoverColor: '#FFCC66',
  },
  'フォロー': {
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#FCE7F3',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(110,15,60,0.6)',
    hoverColor: '#F9A8D4',
  },
}

const UNSET_GAME_STYLE: NextActionStyle = {
  gradient: 'linear-gradient(135deg, #4A4A52 0%, #3A3A42 100%)',
  glow: '0 0 8px rgba(174,174,178,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
  color: '#D8DCE6',
  dotColor: '#AEAEB2',
  borderColor: 'rgba(255,255,255,0.15)',
  textShadow: 'none',
  hoverColor: '#D8DCE6',
}

function NextActionSelect({ value, onChange }: { value: NextActionValue; onChange: (v: NextActionValue) => void }) {
  const [open, setOpen] = useState(false)
  const style: NextActionStyle = value ? NEXT_ACTION_GAME_STYLES[value]! : UNSET_GAME_STYLE
  const label = value ?? '未設定'

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap hover:scale-105 transition-transform"
        style={{
          background: style.gradient,
          boxShadow: style.glow,
          color: style.color,
          border: `1px solid ${style.borderColor}`,
          textShadow: style.textShadow,
          letterSpacing: '0.01em',
        }}
      >
        <span
          className="rounded-full shrink-0"
          style={{ width: 6, height: 6, background: style.dotColor, boxShadow: `0 0 4px ${style.dotColor}cc` }}
        />
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={e => { e.stopPropagation(); setOpen(false) }} />
          <div className="absolute top-full left-0 mt-1 z-40 bg-[#0c1028] rounded-[8px] py-1 min-w-[140px]"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}>
            {ALL_NEXT_ACTIONS.map(a => {
              if (!a) return null
              const s = NEXT_ACTION_GAME_STYLES[a]!
              const selected = a === value
              return (
                <button key={a} onClick={e => { e.stopPropagation(); onChange(a); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors"
                  style={{ color: s.hoverColor, fontWeight: selected ? 700 : 500 }}>
                  <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: s.dotColor, boxShadow: `0 0 4px ${s.dotColor}` }} />
                  {a}
                </button>
              )
            })}
            {value && (
              <>
                <div className="mx-2 my-0.5 h-px" style={{ background: 'rgba(34,68,170,0.15)' }} />
                <button onClick={e => { e.stopPropagation(); onChange(null); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left text-[#99AACC] hover:bg-[rgba(136,187,255,0.04)] transition-colors">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#AEAEB2] shrink-0" />
                  クリア
                </button>
              </>
            )}
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
      style={{ color: active ? '#88BBFF' : '#4466AA' }}
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
        <p className="text-[14px] text-[#99AACC]">リストが見つかりません</p>
      </div>
    )
  }

  const appointmentCount = items.filter(i => i.status === 'アポ獲得').length
  const totalCalls = items.reduce((sum, i) => sum + i.callAttempts, 0)
  const totalEmails = items.reduce((sum, i) => sum + i.emailsSent, 0)

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
          className="flex items-center gap-1 text-[13px] text-[#CCDDF0] hover:text-[#EEEEFF] transition-colors mb-2"
        >
          <ChevronLeft size={14} />
          リスト一覧
        </button>
        <div className="flex items-center gap-3">
          <div className="w-[12px] h-[12px] rounded-full shrink-0" style={{ background: list.color }} />
          <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">
            {list.name}
          </h1>
        </div>
        {list.description && (
          <p className="text-[13px] text-[#CCDDF0] mt-0.5 ml-[24px]">{list.description}</p>
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
          <span className="text-[#CCDDF0]">合計</span>
          <span className="font-semibold text-[#EEEEFF]">{items.length}件</span>
        </div>
        <div className="w-px h-4" style={{ background: 'rgba(34,68,170,0.4)' }} />
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-[#CCDDF0]">アポ獲得</span>
          <span className="font-semibold text-[#FF9F0A]">{appointmentCount}件</span>
        </div>
        <div className="w-px h-4" style={{ background: 'rgba(34,68,170,0.4)' }} />
        <div className="flex items-center gap-1.5 text-[13px]">
          <Phone size={12} className="text-[#88BBFF]" style={{ filter: 'drop-shadow(0 0 4px rgba(136,187,255,0.6))' }} />
          <span className="text-[#CCDDF0]">コール合計</span>
          <span className="font-bold text-[#FFFFFF]" style={{ textShadow: '0 0 6px rgba(136,187,255,0.5)' }}>
            {totalCalls}
          </span>
        </div>
        <div className="w-px h-4" style={{ background: 'rgba(34,68,170,0.4)' }} />
        <div className="flex items-center gap-1.5 text-[13px]">
          <Mail size={12} className="text-[#A78BFA]" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.6))' }} />
          <span className="text-[#CCDDF0]">メール合計</span>
          <span className="font-bold text-[#FFFFFF]" style={{ textShadow: '0 0 6px rgba(167,139,250,0.5)' }}>
            {totalEmails}
          </span>
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
            <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.04em] mr-1 w-[88px] shrink-0">ステータス</span>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
                style={{
                  background: filter === f.key ? '#2244AA' : 'rgba(136,187,255,0.06)', color: filter === f.key ? '#FFFFFF' : '#88BBFF',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Next Action */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.04em] mr-1 w-[88px] shrink-0">Next Action</span>
            <button
              onClick={() => setFilterNextAction('all')}
              className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
              style={{
                background: filterNextAction === 'all' ? '#2244AA' : 'rgba(136,187,255,0.06)', color: filterNextAction === 'all' ? '#FFFFFF' : '#88BBFF',
              }}
            >
              全て
            </button>
            {ALL_NEXT_ACTIONS.map(a => {
              if (!a) return null
              const active = filterNextAction === a
              return (
                <button
                  key={a}
                  onClick={() => setFilterNextAction(prev => prev === a ? 'all' : a)}
                  className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
                  style={{
                    background: active ? '#2244AA' : 'rgba(136,187,255,0.06)', color: active ? '#FFFFFF' : '#88BBFF',
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
                background: filterNextAction === null ? '#2244AA' : 'rgba(136,187,255,0.06)', color: filterNextAction === null ? '#FFFFFF' : '#88BBFF',
              }}
            >
              未設定
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#99AACC' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="検索..."
              className="h-[28px] w-[160px] pl-7 pr-3 text-[12px] rounded-[6px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
              style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-[8px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header — コンタクト一覧と統一 */}
        <div
          className="grid items-center gap-x-3 px-5 py-2.5"
          style={{
            gridTemplateColumns: '32px 220px 50px 130px 130px 60px 60px',
            borderBottom: '1px solid #2244AA',
          }}
        >
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">#</span>
          <SortHeader label="氏名" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">温度感</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">ステータス</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">Next Action</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">コール</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">メール</span>
        </div>

        {/* Rows — コンタクト一覧と統一 */}
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            className="grid items-center gap-x-3 px-5 py-2.5 cursor-pointer"
            style={{
              gridTemplateColumns: '32px 220px 50px 130px 130px 60px 60px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none',
            }}
            whileHover={{ background: 'rgba(136,187,255,0.04)' }}
            transition={{ duration: 0.1 }}
            onClick={() => router.push(`/contacts/${item.contactId}`)}
          >
            <span className="text-[12px] text-[#99AACC]">{item.priority}</span>

            {/* 氏名 + 会社名(下) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)', boxShadow: '0 0 14px rgba(94,92,230,0.7), 0 0 5px rgba(125,211,252,0.9), inset 0 1px 0 rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}>
                {item.contactName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#EEEEFF] truncate">{item.contactName}</p>
                <p className="text-[11px] text-[#99AACC] truncate">{item.companyName}</p>
              </div>
            </div>

            {/* 温度感 (ランクA→高, B→中, C→低) */}
            <div>
              {(() => {
                const heatLabel = item.rank === 'A' ? '高' : item.rank === 'B' ? '中' : '低'
                const cfg = RANK_CONFIG[item.rank]
                return (
                  <span
                    className="inline-flex items-center justify-center rounded-full text-[10px] font-black whitespace-nowrap shrink-0"
                    style={{
                      width: 24,
                      height: 24,
                      background: cfg.gradient,
                      boxShadow: `${cfg.glow}`,
                      color: cfg.color,
                      border: '1px solid rgba(255,255,255,0.3)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {heatLabel}
                  </span>
                )
              })()}
            </div>

            <StatusGameBadge status={item.status} />
            <NextActionSelect
              value={nextActions[item.id] ?? null}
              onChange={val => setNextActions(prev => ({ ...prev, [item.id]: val }))}
            />

            {/* コール数 */}
            <div className="flex items-center gap-1">
              <Phone size={11} className="text-[#88BBFF] shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(136,187,255,0.6))' }} />
              <span className="text-[12px] font-bold tabular-nums" style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(136,187,255,0.5)' }}>
                {item.callAttempts}
              </span>
            </div>

            {/* メール送信数 */}
            <div className="flex items-center gap-1">
              <Mail size={11} className="text-[#A78BFA] shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.6))' }} />
              <span className="text-[12px] font-bold tabular-nums" style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(167,139,250,0.5)' }}>
                {item.emailsSent}
              </span>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[13px] text-[#99AACC]">該当するコンタクトがありません</p>
          </div>
        )}
      </motion.div>
    </>
  )
}
