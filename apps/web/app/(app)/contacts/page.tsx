'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Phone,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  User,
  X,
  CalendarClock,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Rank = 'A' | 'B' | 'C'
type ApproachStatus =
  | '未着手'
  | '不通'
  | '不在'
  | '接続済み'
  | 'コール不可'
  | 'アポ獲得'
  | 'Next Action'

type ContactStatus = 'リード' | '商談中' | '顧客' | '休眠' | '失注'
type NextAction = 'メールアプローチ' | 'コール' | '連絡待ち' | null

type SortKey = 'name' | 'callAttempts' | 'lastCallAt' | 'nextActionAt' | 'status' | 'contactStatus'
type SortDir = 'asc' | 'desc'

interface Contact {
  id: string
  name: string
  title: string
  company: string
  companyId: string
  rank: Rank
  status: ApproachStatus
  contactStatus: ContactStatus
  callAttempts: number
  lastCallAt: string | null
  nextActionAt: string | null
  nextAction: NextAction
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: '田中 誠',    title: '営業部長',   company: '株式会社テクノリード',    companyId: '1', rank: 'A', status: 'アポ獲得',   contactStatus: '商談中', callAttempts: 3, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', nextAction: '連絡待ち' },
  { id: '2', name: '山本 佳子',  title: 'マネージャー', company: '合同会社フューチャー',    companyId: '2', rank: 'A', status: '接続済み',   contactStatus: '商談中', callAttempts: 5, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22', nextAction: 'メールアプローチ' },
  { id: '3', name: '佐々木 拓也', title: '代表取締役',  company: '株式会社イノベーション',  companyId: '3', rank: 'A', status: 'Next Action', contactStatus: 'リード', callAttempts: 2, lastCallAt: '2026-03-18', nextActionAt: '2026-03-25', nextAction: 'コール' },
  { id: '4', name: '中村 理恵',  title: '購買担当',   company: '株式会社グロース',        companyId: '4', rank: 'B', status: '不在',      contactStatus: 'リード', callAttempts: 4, lastCallAt: '2026-03-15', nextActionAt: null, nextAction: 'コール' },
  { id: '5', name: '小林 健太',  title: '部長',      company: '有限会社サクセス',        companyId: '5', rank: 'B', status: '不通',      contactStatus: 'リード', callAttempts: 6, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', nextAction: 'コール' },
  { id: '6', name: '鈴木 美香',  title: '課長',      company: '株式会社ネクスト',        companyId: '6', rank: 'C', status: '未着手',    contactStatus: 'リード', callAttempts: 0, lastCallAt: null,          nextActionAt: null, nextAction: null },
  { id: '7', name: '加藤 雄介',  title: '取締役',    company: '合同会社ビジョン',        companyId: '7', rank: 'C', status: '未着手',    contactStatus: '休眠',  callAttempts: 0, lastCallAt: null,          nextActionAt: null, nextAction: null },
  { id: '8', name: '吉田 千春',  title: '部長',      company: '株式会社スタート',        companyId: '8', rank: 'C', status: 'コール不可', contactStatus: '失注',  callAttempts: 8, lastCallAt: '2026-03-01', nextActionAt: null, nextAction: null },
]

const ALL_STATUSES: ApproachStatus[] = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'Next Action']
const ALL_CONTACT_STATUSES: ContactStatus[] = ['リード', '商談中', '顧客', '休眠', '失注']
const ALL_RANKS: Rank[] = ['A', 'B', 'C']

// ─── Style Maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ApproachStatus, { bg: string; text: string; dot: string }> = {
  '未着手':    { bg: 'bg-[rgba(0,0,0,0.05)]',      text: 'text-[#6E6E73]',  dot: 'bg-[#AEAEB2]' },
  '不通':      { bg: 'bg-[rgba(255,59,48,0.1)]',   text: 'text-[#CF3131]',  dot: 'bg-[#FF3B30]' },
  '不在':      { bg: 'bg-[rgba(255,159,10,0.1)]',  text: 'text-[#C07000]',  dot: 'bg-[#FF9F0A]' },
  '接続済み':  { bg: 'bg-[rgba(0,113,227,0.1)]',   text: 'text-[#0060C7]',  dot: 'bg-[#0071E3]' },
  'コール不可': { bg: 'bg-[rgba(255,59,48,0.1)]',  text: 'text-[#CF3131]',  dot: 'bg-[#FF3B30]' },
  'アポ獲得':  { bg: 'bg-[rgba(52,199,89,0.1)]',   text: 'text-[#1A7A35]',  dot: 'bg-[#34C759]' },
  'Next Action': { bg: 'bg-[rgba(94,92,230,0.1)]', text: 'text-[#4B48CC]',  dot: 'bg-[#5E5CE6]' },
}

const ALL_NEXT_ACTIONS: NextAction[] = ['メールアプローチ', 'コール', '連絡待ち']

const NEXT_ACTION_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'メールアプローチ': { bg: 'bg-[rgba(94,92,230,0.1)]',   text: 'text-[#4B48CC]',  dot: 'bg-[#5E5CE6]' },
  'コール':          { bg: 'bg-[rgba(0,113,227,0.1)]',    text: 'text-[#0060C7]',  dot: 'bg-[#0071E3]' },
  '連絡待ち':        { bg: 'bg-[rgba(255,159,10,0.1)]',   text: 'text-[#C07000]',  dot: 'bg-[#FF9F0A]' },
}

type RankConfig = { gradient: string; glow: string; color: string }
const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
}

const CONTACT_STATUS_STYLES: Record<ContactStatus, { bg: string; text: string; dot: string }> = {
  'リード':  { bg: 'bg-[rgba(0,113,227,0.1)]',   text: 'text-[#0060C7]',  dot: 'bg-[#0071E3]' },
  '商談中':  { bg: 'bg-[rgba(94,92,230,0.1)]',    text: 'text-[#4B48CC]',  dot: 'bg-[#5E5CE6]' },
  '顧客':    { bg: 'bg-[rgba(52,199,89,0.1)]',    text: 'text-[#1A7A35]',  dot: 'bg-[#34C759]' },
  '休眠':    { bg: 'bg-[rgba(0,0,0,0.05)]',       text: 'text-[#6E6E73]',  dot: 'bg-[#AEAEB2]' },
  '失注':    { bg: 'bg-[rgba(255,59,48,0.1)]',    text: 'text-[#CF3131]',  dot: 'bg-[#FF3B30]' },
}

// ─── Priority: should call now?
function isCallPriority(c: Contact): boolean {
  return (c.status === '未着手' || c.status === '不通' || c.status === '不在' || c.status === 'Next Action')
    && c.rank === 'A'
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  const now = new Date('2026-03-23')
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000)
  if (diff === 0) return '今日'
  if (diff === 1) return '明日'
  if (diff === -1) return '昨日'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isOverdue(s: string | null): boolean {
  if (!s) return false
  return new Date(s) < new Date('2026-03-23')
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApproachStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      {status}
    </span>
  )
}

function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const s = CONTACT_STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      {status}
    </span>
  )
}

function RankBadge({ rank }: { rank: Rank }) {
  const r = RANK_CONFIG[rank]
  return (
    <span
      className="inline-flex items-center justify-center rounded-[5px] text-[10px] font-bold shrink-0"
      style={{ width: 22, height: 22, background: r.gradient, boxShadow: r.glow, color: r.color, letterSpacing: '0.03em' }}
    >
      {rank}
    </span>
  )
}

function NextActionSelect({ value, onChange }: { value: NextAction; onChange: (v: NextAction) => void }) {
  const [open, setOpen] = useState(false)

  if (!value) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="text-[11px] text-[#AEAEB2] hover:text-[#6E6E73] px-2 py-0.5 rounded-[4px] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
        >
          + 設定
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-[8px] py-1 min-w-[140px]"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}>
              {ALL_NEXT_ACTIONS.map(a => {
                const s = NEXT_ACTION_STYLES[a]
                return (
                  <button key={a} onClick={() => { onChange(a); setOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(0,0,0,0.03)] transition-colors ${s.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
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

  const style = NEXT_ACTION_STYLES[value]
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${style.bg} ${style.text} hover:opacity-80 transition-opacity`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
        {value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-40 bg-white rounded-[8px] py-1 min-w-[140px]"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}>
            {ALL_NEXT_ACTIONS.map(a => {
              const s = NEXT_ACTION_STYLES[a]
              const selected = a === value
              return (
                <button key={a} onClick={() => { onChange(a); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors ${selected ? `${s.bg} ${s.text} font-medium` : `hover:bg-[rgba(0,0,0,0.03)] ${s.text}`}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
                  {a}
                </button>
              )
            })}
            <button onClick={() => { onChange(null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left text-[#AEAEB2] hover:bg-[rgba(0,0,0,0.03)] transition-colors">
              クリア
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={11} className="text-[#C7C7CC] ml-1 inline" />
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="ml-1 inline" style={{ color: '#0071E3' }} />
    : <ChevronDown size={11} className="ml-1 inline" style={{ color: '#0071E3' }} />
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts]           = useState<Contact[]>(MOCK_CONTACTS)
  const [search, setSearch]               = useState('')
  const [filterStatuses, setFilterStatuses] = useState<ApproachStatus[]>([])
  const [filterRanks, setFilterRanks]     = useState<Rank[]>([])
  const [sortKey, setSortKey]             = useState<SortKey>('status')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')
  const [filterContactStatuses, setFilterContactStatuses] = useState<ContactStatus[]>([])
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showRankFilter, setShowRankFilter]     = useState(false)
  const [showContactStatusFilter, setShowContactStatusFilter] = useState(false)
  const [showCreateModal, setShowCreateModal]   = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', company: '', title: '', email: '', phone: '',
    rank: 'B' as Rank, contactStatus: 'リード' as ContactStatus, isDecisionMaker: false,
  })

  function handleCreateSubmit() {
    if (!createForm.name.trim() || !createForm.company.trim()) return
    const newContact: Contact = {
      id: `c-${Date.now()}`, name: createForm.name.trim(),
      title: createForm.title, company: createForm.company.trim(),
      companyId: `new-${Date.now()}`, rank: createForm.rank,
      status: '未着手', contactStatus: createForm.contactStatus, callAttempts: 0, lastCallAt: null, nextActionAt: null, nextAction: null,
    }
    setContacts(prev => [newContact, ...prev])
    setShowCreateModal(false)
    setCreateForm({ name: '', company: '', title: '', email: '', phone: '', rank: 'B', contactStatus: 'リード', isDecisionMaker: false })
  }

  // ── Filter + Sort ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = contacts

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
      )
    }
    if (filterStatuses.length > 0) list = list.filter(c => filterStatuses.includes(c.status))
    if (filterContactStatuses.length > 0) list = list.filter(c => filterContactStatuses.includes(c.contactStatus))
    if (filterRanks.length > 0)    list = list.filter(c => filterRanks.includes(c.rank))

    const STATUS_ORDER: Record<ApproachStatus, number> = {
      'アポ獲得': 0, 'Next Action': 1, '接続済み': 2,
      '不在': 3, '不通': 4, '未着手': 5, 'コール不可': 6,
    }

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'contactStatus') cmp = a.contactStatus.localeCompare(b.contactStatus, 'ja')
      if (sortKey === 'status')      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      if (sortKey === 'name')        cmp = a.name.localeCompare(b.name, 'ja')
      if (sortKey === 'callAttempts') cmp = a.callAttempts - b.callAttempts
      if (sortKey === 'lastCallAt')  cmp = (a.lastCallAt ?? '').localeCompare(b.lastCallAt ?? '')
      if (sortKey === 'nextActionAt') cmp = (a.nextActionAt ?? '9999').localeCompare(b.nextActionAt ?? '9999')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [contacts, search, filterStatuses, filterContactStatuses, filterRanks, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function toggleStatus(s: ApproachStatus) {
    setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }
  function toggleRank(r: Rank) {
    setFilterRanks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }
  function toggleContactStatus(s: ContactStatus) {
    setFilterContactStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const hasFilters = filterStatuses.length > 0 || filterRanks.length > 0 || filterContactStatuses.length > 0

  return (
    <div className="space-y-4" onClick={() => { setShowStatusFilter(false); setShowRankFilter(false) }}>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
            <input
              type="text"
              placeholder="氏名・会社名・役職で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none transition-all"
              style={{ border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,113,227,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.1)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)' }}
            />
          </div>

          {/* Status filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowStatusFilter(v => !v); setShowRankFilter(false) }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all duration-150 whitespace-nowrap ${
                filterStatuses.length > 0
                  ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                  : 'bg-white border-[#E5E7EB] text-[#6E6E73] hover:border-[#C7C7CC] hover:text-[#1D1D1F]'
              }`}
            >
              ステータス
              {filterStatuses.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] flex items-center justify-center font-bold">
                  {filterStatuses.length}
                </span>
              )}
              <ChevronDown size={13} />
            </button>

            <AnimatePresence>
              {showStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 bg-white rounded-[10px] p-2 min-w-[160px] flex flex-col gap-0.5"
                  style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.10), 0 16px 48px rgba(0,0,0,0.08)' }}
                >
                  {ALL_STATUSES.map(s => {
                    const style = STATUS_STYLES[s]
                    const active = filterStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-sm transition-colors text-left ${
                          active ? `${style.bg} ${style.text}` : 'hover:bg-[rgba(0,0,0,0.04)] text-[#3C3C43]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                        {s}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rank filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowRankFilter(v => !v); setShowStatusFilter(false) }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all duration-150 ${
                filterRanks.length > 0
                  ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                  : 'bg-white border-[#E5E7EB] text-[#6E6E73] hover:border-[#C7C7CC] hover:text-[#1D1D1F]'
              }`}
            >
              ランク
              {filterRanks.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] flex items-center justify-center font-bold">
                  {filterRanks.length}
                </span>
              )}
              <ChevronDown size={13} />
            </button>
            <AnimatePresence>
              {showRankFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 bg-white rounded-[10px] p-2 flex gap-1"
                  style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.10), 0 16px 48px rgba(0,0,0,0.08)' }}
                >
                  {ALL_RANKS.map(r => {
                    const cfg = RANK_CONFIG[r]
                    const active = filterRanks.includes(r)
                    return (
                      <button
                        key={r}
                        onClick={() => toggleRank(r)}
                        className={`w-8 h-8 rounded-[6px] text-[11px] font-bold transition-all duration-100 ${
                          !active ? 'hover:bg-[rgba(0,0,0,0.04)] text-[#6E6E73]' : ''
                        }`}
                        style={active ? { background: cfg.gradient, boxShadow: cfg.glow, color: cfg.color } : undefined}
                      >
                        {r}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact status filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowContactStatusFilter(v => !v); setShowStatusFilter(false); setShowRankFilter(false) }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all duration-150 whitespace-nowrap ${
                filterContactStatuses.length > 0
                  ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                  : 'bg-white border-[#E5E7EB] text-[#6E6E73] hover:border-[#C7C7CC] hover:text-[#1D1D1F]'
              }`}
            >
              フェーズ
              {filterContactStatuses.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] flex items-center justify-center font-bold">
                  {filterContactStatuses.length}
                </span>
              )}
              <ChevronDown size={13} />
            </button>

            <AnimatePresence>
              {showContactStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 bg-white rounded-[10px] p-2 min-w-[140px] flex flex-col gap-0.5"
                  style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.10), 0 16px 48px rgba(0,0,0,0.08)' }}
                >
                  {ALL_CONTACT_STATUSES.map(s => {
                    const style = CONTACT_STATUS_STYLES[s]
                    const active = filterContactStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleContactStatus(s)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-sm transition-colors text-left ${
                          active ? `${style.bg} ${style.text}` : 'hover:bg-[rgba(0,0,0,0.04)] text-[#3C3C43]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                        {s}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear filters */}
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setFilterStatuses([]); setFilterContactStatuses([]); setFilterRanks([]) }}
                className="flex items-center gap-1 text-xs text-[#6E6E73] hover:text-[#1D1D1F] transition-colors whitespace-nowrap overflow-hidden"
              >
                <X size={12} />
                クリア
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-[8px] shrink-0"
          style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)', boxShadow: '0 1px 4px rgba(0,113,227,0.3)' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          コンタクトを追加
        </motion.button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold tabular-nums tracking-tight text-[#1D1D1F]">
            {contacts.length}
          </span>
          <span className="text-xs text-[#AEAEB2]">全件</span>
        </div>
        <span className="text-xs text-[#AEAEB2] ml-auto">
          {filtered.length}件表示
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)' }}>

        {/* Header */}
        <div className="grid grid-cols-[1.6fr_1.2fr_100px_130px_120px_70px_80px_100px] gap-0 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.018)' }}>
          {[
            { label: '氏名',        key: 'name' as SortKey,           sortable: true },
            { label: '会社',        key: null,                        sortable: false },
            { label: 'フェーズ',     key: 'contactStatus' as SortKey,  sortable: true },
            { label: 'アプローチ',    key: 'status' as SortKey,        sortable: true },
            { label: 'Next Action', key: null,                        sortable: false },
            { label: 'コール数',     key: 'callAttempts' as SortKey,   sortable: true },
            { label: '最終コール',    key: 'lastCallAt' as SortKey,    sortable: true },
            { label: '次回予定',     key: 'nextActionAt' as SortKey,   sortable: true },
          ].map((col, i) => (
            <div
              key={i}
              className={`text-[11px] font-medium uppercase tracking-[0.055em] leading-none flex items-center text-[#AEAEB2] ${
                col.sortable ? 'cursor-pointer hover:text-[#6E6E73] select-none transition-colors' : ''
              }`}
              onClick={col.key ? () => toggleSort(col.key as SortKey) : undefined}
            >
              {col.label}
              {col.sortable && col.key && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
            </div>
          ))}
        </div>

        {/* Rows */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgba(0,0,0,0.04)] flex items-center justify-center">
                <User size={22} className="text-[#C7C7CC]" />
              </div>
              <p className="text-sm text-[#6E6E73]">条件に一致するコンタクトが見つかりません</p>
            </div>
          ) : (
            filtered.map((contact) => {
              const dnc = contact.status === 'コール不可'
              const priority = isCallPriority(contact)
              const overdue = isOverdue(contact.nextActionAt)

              return (
                <motion.div
                  key={contact.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                  className={`grid grid-cols-[1.6fr_1.2fr_100px_130px_120px_70px_80px_100px] gap-0 items-center px-5 py-3.5 last:border-0 transition-colors duration-100 group cursor-pointer ${
                    dnc ? 'opacity-35' : 'hover:bg-[rgba(0,0,0,0.02)]'
                  }`}
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  {/* 氏名 */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}>
                      {contact.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#1D1D1F] truncate leading-tight tracking-[-0.01em]">{contact.name}</p>
                      <p className="text-[11.5px] text-[#AEAEB2] truncate">{contact.title}</p>
                    </div>
                    <div className="shrink-0">
                      <RankBadge rank={contact.rank} />
                    </div>
                  </div>

                  {/* 会社 */}
                  <span className="text-[13px] text-[#6E6E73] truncate tracking-[-0.01em]">{contact.company}</span>

                  {/* フェーズ */}
                  <div>
                    <ContactStatusBadge status={contact.contactStatus} />
                  </div>

                  {/* アプローチ */}
                  <div>
                    <StatusBadge status={contact.status} />
                  </div>

                  {/* Next Action */}
                  <div onClick={e => e.stopPropagation()}>
                    <NextActionSelect
                      value={contact.nextAction}
                      onChange={val => setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, nextAction: val } : c))}
                    />
                  </div>

                  {/* コール数 */}
                  <div className="flex items-center gap-1">
                    <Phone size={11} className="text-[#AEAEB2] shrink-0" />
                    <span className="text-[13px] text-[#1D1D1F] tabular-nums">{contact.callAttempts}</span>
                  </div>

                  {/* 最終コール */}
                  <span className="text-[13px] text-[#6E6E73] tabular-nums">
                    {formatDate(contact.lastCallAt)}
                  </span>

                  {/* 次回予定 */}
                  <span className={`text-[13px] tabular-nums flex items-center gap-1 ${
                    overdue ? 'font-medium' : 'text-[#6E6E73]'
                  }`}
                  style={overdue ? { color: '#FF3B30' } : undefined}>
                    {overdue && <CalendarClock size={11} className="shrink-0" />}
                    {formatDate(contact.nextActionAt)}
                  </span>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </div>

      {/* ── Create Contact Modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-[14px] w-full max-w-[480px] mx-4 pointer-events-auto"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <h2 className="text-[15px] font-semibold text-[#1D1D1F]">コンタクトを追加</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.06)] transition-colors">
                    <X size={15} className="text-[#6E6E73]" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-3">
                  {/* 名前 */}
                  <div>
                    <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">
                      氏名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text" placeholder="田中 誠"
                      value={createForm.name}
                      onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  {/* 会社 */}
                  <div>
                    <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">
                      会社名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text" placeholder="株式会社テクノリード"
                      value={createForm.company}
                      onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  {/* 役職 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">役職</label>
                      <input
                        type="text" placeholder="営業部長"
                        value={createForm.title}
                        onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">ランク</label>
                      <select
                        value={createForm.rank}
                        onChange={e => setCreateForm(f => ({ ...f, rank: e.target.value as Rank }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      >
                        {ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 電話 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">電話番号</label>
                      <input
                        type="tel" placeholder="03-1234-5678"
                        value={createForm.phone}
                        onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">メールアドレス</label>
                      <input
                        type="email" placeholder="tanaka@example.com"
                        value={createForm.email}
                        onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                  </div>
                  {/* 決裁者 */}
                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={createForm.isDecisionMaker}
                      onChange={e => setCreateForm(f => ({ ...f, isDecisionMaker: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#0071E3]"
                    />
                    <span className="text-sm text-[#1D1D1F]">決裁者</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.05)] rounded-[8px] transition-all"
                  >
                    キャンセル
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreateSubmit}
                    disabled={!createForm.name.trim() || !createForm.company.trim()}
                    className="px-5 py-2 text-sm font-medium text-white rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)', boxShadow: '0 1px 4px rgba(0,113,227,0.3)' }}
                  >
                    追加する
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
