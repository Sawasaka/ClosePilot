'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Phone,
  Mail,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  User,
  X,
  FileEdit,
  Search as SearchIcon,
  Megaphone,
  Share2,
  Calendar,
  UserCheck,
  PhoneOutgoing,
  Send,
  Handshake,
  Inbox,
  HelpCircle,
} from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

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

type LeadSourceType =
  | 'web_form'
  | 'organic_search'
  | 'paid_ads'
  | 'sns'
  | 'event'
  | 'referral'
  | 'cold_call'
  | 'cold_mail'
  | 'partner'
  | 'inbound'
  | 'other'

interface LeadSource {
  type: LeadSourceType
  detail: string
}

interface LeadSourceStyle {
  Icon: React.ElementType
  label: string
  iconFg: string
}

const LEAD_SOURCE_STYLES: Record<LeadSourceType, LeadSourceStyle> = {
  web_form:       { Icon: FileEdit,      label: 'Webフォーム', iconFg: 'var(--color-obs-text-subtle)' },
  organic_search: { Icon: SearchIcon,    label: '自然検索',    iconFg: 'var(--color-obs-text-subtle)' },
  paid_ads:       { Icon: Megaphone,     label: '広告',        iconFg: 'var(--color-obs-primary)'    },
  sns:            { Icon: Share2,        label: 'SNS',         iconFg: 'var(--color-obs-text-subtle)' },
  event:          { Icon: Calendar,      label: '展示会・イベント', iconFg: 'var(--color-obs-middle)' },
  referral:       { Icon: UserCheck,     label: '紹介',        iconFg: '#4ad98a' },
  cold_call:      { Icon: PhoneOutgoing, label: '新規コール',   iconFg: 'var(--color-obs-text-subtle)' },
  cold_mail:      { Icon: Send,          label: '新規メール',   iconFg: 'var(--color-obs-text-subtle)' },
  partner:        { Icon: Handshake,     label: 'パートナー',   iconFg: 'var(--color-obs-text-subtle)' },
  inbound:        { Icon: Inbox,         label: '問い合わせ',   iconFg: 'var(--color-obs-low)' },
  other:          { Icon: HelpCircle,    label: 'その他',       iconFg: 'var(--color-obs-text-subtle)' },
}

type ChipTone = 'neutral' | 'hot' | 'middle' | 'low' | 'primary'

type SortKey = 'name' | 'callAttempts' | 'emailsSent' | 'lastCallAt' | 'nextActionAt' | 'status' | 'contactStatus'
type SortDir = 'asc' | 'desc'

type PersonRole = '決裁者' | '推進者' | '一般'

interface Contact {
  id: string
  name: string
  title: string
  department: string
  personRole: PersonRole
  company: string
  companyId: string
  rank: Rank
  status: ApproachStatus
  contactStatus: ContactStatus
  leadSource: LeadSource
  callAttempts: number
  emailsSent: number
  lastCallAt: string | null
  nextActionAt: string | null
  nextAction: NextAction
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: '田中 誠',    title: '営業部長',   department: '営業部',     personRole: '決裁者', company: '株式会社テクノリード',    companyId: '1', rank: 'A', status: 'アポ獲得',   contactStatus: '商談中', leadSource: { type: 'inbound',  detail: '公式サイトの資料DLフォーム経由' },             callAttempts: 3, emailsSent: 5, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', nextAction: '連絡待ち' },
  { id: '2', name: '山本 佳子',  title: 'マネージャー', department: '購買部',     personRole: '推進者', company: '合同会社フューチャー',    companyId: '2', rank: 'A', status: '接続済み',   contactStatus: '商談中', leadSource: { type: 'event',    detail: '2026年Q1 SaaSWORLD出展時に名刺交換' },         callAttempts: 5, emailsSent: 8, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22', nextAction: 'メールアプローチ' },
  { id: '3', name: '佐々木 拓也', title: '代表取締役',  department: '経営企画',   personRole: '決裁者', company: '株式会社イノベーション',  companyId: '3', rank: 'A', status: 'Next Action', contactStatus: 'リード', leadSource: { type: 'referral', detail: '既存顧客（株式会社グロース）からの紹介' },     callAttempts: 2, emailsSent: 3, lastCallAt: '2026-03-18', nextActionAt: '2026-03-25', nextAction: 'コール' },
  { id: '4', name: '中村 理恵',  title: '購買担当',   department: '調達部',     personRole: '一般',  company: '株式会社グロース',        companyId: '4', rank: 'B', status: '不在',      contactStatus: 'リード', leadSource: { type: 'paid_ads', detail: 'Google広告 (キーワード: SFA 切替)' },           callAttempts: 4, emailsSent: 2, lastCallAt: '2026-03-15', nextActionAt: null, nextAction: 'コール' },
  { id: '5', name: '小林 健太',  title: '部長',      department: '営業部',     personRole: '推進者', company: '有限会社サクセス',        companyId: '5', rank: 'B', status: '不通',      contactStatus: 'リード', leadSource: { type: 'cold_call', detail: '営業リスト経由 (2026/02)' },                  callAttempts: 6, emailsSent: 1, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', nextAction: 'コール' },
  { id: '6', name: '鈴木 美香',  title: '課長',      department: 'マーケ部',   personRole: '一般',  company: '株式会社ネクスト',        companyId: '6', rank: 'C', status: '未着手',    contactStatus: 'リード', leadSource: { type: 'organic_search', detail: 'Google検索 → 比較記事' },                callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null },
  { id: '7', name: '加藤 雄介',  title: '取締役',    department: '経営企画',   personRole: '決裁者', company: '合同会社ビジョン',        companyId: '7', rank: 'C', status: '未着手',    contactStatus: '休眠',  leadSource: { type: 'partner',  detail: 'パートナー(株式会社アライアンス)経由' },         callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null },
  { id: '8', name: '吉田 千春',  title: '部長',      department: '人事部',     personRole: '推進者', company: '株式会社スタート',        companyId: '8', rank: 'C', status: 'コール不可', contactStatus: '失注',  leadSource: { type: 'cold_mail', detail: '一斉メール 2025/11 配信' },                    callAttempts: 8, emailsSent: 4, lastCallAt: '2026-03-01', nextActionAt: null, nextAction: null },
]

const ALL_STATUSES: ApproachStatus[] = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'Next Action']
const ALL_CONTACT_STATUSES: ContactStatus[] = ['リード', '商談中', '顧客', '休眠', '失注']
const ALL_RANKS: Rank[] = ['A', 'B', 'C']

// ─── Tone Maps（Obsidian 準拠） ───────────────────────────────────────────────

function rankToTone(rank: Rank): ChipTone {
  if (rank === 'A') return 'hot'
  if (rank === 'B') return 'middle'
  return 'low'
}

function statusToTone(s: ApproachStatus): ChipTone {
  // アポ獲得/接続済み → low (neutral の青)
  // Next Action/メールアプローチ → primary
  // 不在 → middle
  // 不通/コール不可 → hot
  // 未着手 → neutral
  if (s === 'アポ獲得' || s === '接続済み') return 'low'
  if (s === 'Next Action') return 'primary'
  if (s === '不在') return 'middle'
  if (s === '不通' || s === 'コール不可') return 'hot'
  return 'neutral'
}

function contactStatusToTone(s: ContactStatus): ChipTone {
  if (s === '商談中') return 'primary'
  if (s === '顧客') return 'low'
  if (s === 'リード') return 'low'
  if (s === '休眠') return 'neutral'
  return 'hot' // 失注
}

function nextActionToTone(a: Exclude<NextAction, null>): ChipTone {
  if (a === 'メールアプローチ') return 'primary'
  if (a === 'コール') return 'low'
  return 'middle' // 連絡待ち
}

function personRoleToTone(r: PersonRole): ChipTone {
  if (r === '決裁者') return 'primary' // ゴールド枠 → primary で強調
  return 'neutral' // 推進者・一般 は neutral
}

const ALL_NEXT_ACTIONS: Exclude<NextAction, null>[] = ['メールアプローチ', 'コール', '連絡待ち']
const ALL_PERSON_ROLES: PersonRole[] = ['決裁者', '推進者', '一般']

// ─── Sub-components ────────────────────────────────────────────────────────────

function LeadSourceCell({ source }: { source: LeadSource }) {
  const s = LEAD_SOURCE_STYLES[source.type]
  const Icon = s.Icon
  return (
    <div className="min-w-0 flex flex-col gap-0.5">
      <span
        className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap w-fit"
        style={{
          backgroundColor: 'rgba(143,140,144,0.10)',
          color: 'var(--color-obs-text-muted)',
        }}
      >
        <Icon size={11} strokeWidth={2.2} style={{ color: s.iconFg }} />
        {s.label}
      </span>
      {source.detail && (
        <span
          className="text-[10.5px] leading-tight truncate"
          style={{ color: 'var(--color-obs-text-subtle)' }}
          title={source.detail}
        >
          {source.detail}
        </span>
      )}
    </div>
  )
}

function NextActionSelect({ value, onChange }: { value: NextAction; onChange: (v: NextAction) => void }) {
  const [open, setOpen] = useState(false)

  if (!value) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="text-[11px] px-2 py-0.5 rounded-[var(--radius-obs-sm)] transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
          }}
        >
          + 設定
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div
              className="absolute top-full left-0 mt-1 z-40 py-1 min-w-[140px] rounded-[var(--radius-obs-md)]"
              style={{
                backgroundColor: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              }}
            >
              {ALL_NEXT_ACTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => { onChange(a); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors"
                  style={{ color: 'var(--color-obs-text)' }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex"
      >
        <ObsChip tone={nextActionToTone(value)}>{value}</ObsChip>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-1 z-40 py-1 min-w-[140px] rounded-[var(--radius-obs-md)]"
            style={{
              backgroundColor: 'var(--color-obs-surface-highest)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            }}
          >
            {ALL_NEXT_ACTIONS.map(a => {
              const selected = a === value
              return (
                <button
                  key={a}
                  onClick={() => { onChange(a); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors"
                  style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 700 : 400 }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {a}
                </button>
              )
            })}
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors"
              style={{ color: 'var(--color-obs-text-muted)' }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              クリア
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={11} className="ml-1 inline" style={{ color: 'var(--color-obs-text-subtle)' }} />
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
    : <ChevronDown size={11} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts]           = useState<Contact[]>(MOCK_CONTACTS)
  const [search, setSearch]               = useState('')
  const [filterStatuses, setFilterStatuses] = useState<ApproachStatus[]>([])
  const [filterRanks, setFilterRanks]     = useState<Rank[]>([])
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterPersonRole, setFilterPersonRole] = useState<PersonRole | ''>('')
  const [sortKey, setSortKey]             = useState<SortKey>('status')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')
  const [filterContactStatuses, setFilterContactStatuses] = useState<ContactStatus[]>([])
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showRankFilter, setShowRankFilter]     = useState(false)
  const [showContactStatusFilter, setShowContactStatusFilter] = useState(false)

  // 部門のユニーク値
  const ALL_DEPARTMENTS = useMemo(() => Array.from(new Set(contacts.map(c => c.department).filter(Boolean))), [contacts])
  const [showCreateModal, setShowCreateModal]   = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', company: '', title: '', email: '', phone: '',
    rank: 'B' as Rank, contactStatus: 'リード' as ContactStatus, isDecisionMaker: false,
  })

  function handleCreateSubmit() {
    if (!createForm.name.trim() || !createForm.company.trim()) return
    const newContact: Contact = {
      id: `c-${Date.now()}`, name: createForm.name.trim(),
      title: createForm.title, department: '', personRole: '一般', company: createForm.company.trim(),
      companyId: `new-${Date.now()}`, rank: createForm.rank,
      status: '未着手', contactStatus: createForm.contactStatus, leadSource: { type: 'other', detail: '手動追加' }, callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, nextAction: null,
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
    if (filterDepartment)          list = list.filter(c => c.department === filterDepartment)
    if (filterPersonRole)          list = list.filter(c => c.personRole === filterPersonRole)

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
      if (sortKey === 'emailsSent') cmp = a.emailsSent - b.emailsSent
      if (sortKey === 'lastCallAt')  cmp = (a.lastCallAt ?? '').localeCompare(b.lastCallAt ?? '')
      if (sortKey === 'nextActionAt') cmp = (a.nextActionAt ?? '9999').localeCompare(b.nextActionAt ?? '9999')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [contacts, search, filterStatuses, filterContactStatuses, filterRanks, filterDepartment, filterPersonRole, sortKey, sortDir])

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

  const hasFilters = filterStatuses.length > 0 || filterRanks.length > 0 || filterContactStatuses.length > 0 || !!filterDepartment || !!filterPersonRole

  return (
    <ObsPageShell>
      <div
        className="w-full px-8 xl:px-12 2xl:px-16 pb-16"
        onClick={() => { setShowStatusFilter(false); setShowRankFilter(false); setShowContactStatusFilter(false) }}
      >
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Contacts"
          title="コンタクト"
          caption={`全 ${contacts.length.toLocaleString()} 件。アプローチ状況とネクストアクションで優先度を可視化。`}
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} className="mr-1.5 inline" strokeWidth={2.5} />
              コンタクトを追加
            </ObsButton>
          }
        />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap" onClick={e => e.stopPropagation()}>
          {/* Search */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              type="text"
              placeholder="氏名・会社名・役職で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <ObsButton
              variant="ghost"
              size="sm"
              onClick={() => { setShowStatusFilter(v => !v); setShowRankFilter(false); setShowContactStatusFilter(false) }}
              className={filterStatuses.length > 0 ? '!text-[var(--color-obs-primary)]' : ''}
            >
              ステータス
              {filterStatuses.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: 'var(--color-obs-primary-container)', color: 'var(--color-obs-on-primary)' }}
                >
                  {filterStatuses.length}
                </span>
              )}
              <ChevronDown size={12} className="ml-1 inline" />
            </ObsButton>

            <AnimatePresence>
              {showStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 p-2 min-w-[160px] flex flex-col gap-0.5 rounded-[var(--radius-obs-md)]"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {ALL_STATUSES.map(s => {
                    const active = filterStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] text-left transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--color-obs-surface-high)' : 'transparent',
                          color: 'var(--color-obs-text)',
                        }}
                        onMouseOver={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                        }}
                        onMouseOut={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <ObsChip tone={statusToTone(s)}>{s}</ObsChip>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rank filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <ObsButton
              variant="ghost"
              size="sm"
              onClick={() => { setShowRankFilter(v => !v); setShowStatusFilter(false); setShowContactStatusFilter(false) }}
              className={filterRanks.length > 0 ? '!text-[var(--color-obs-primary)]' : ''}
            >
              角度
              {filterRanks.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: 'var(--color-obs-primary-container)', color: 'var(--color-obs-on-primary)' }}
                >
                  {filterRanks.length}
                </span>
              )}
              <ChevronDown size={12} className="ml-1 inline" />
            </ObsButton>

            <AnimatePresence>
              {showRankFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 p-2 flex gap-1 rounded-[var(--radius-obs-md)]"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {ALL_RANKS.map(r => {
                    const active = filterRanks.includes(r)
                    return (
                      <button
                        key={r}
                        onClick={() => toggleRank(r)}
                        className="inline-flex"
                      >
                        <ObsChip tone={active ? rankToTone(r) : 'neutral'} className="w-8 justify-center">
                          {r}
                        </ObsChip>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact status filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <ObsButton
              variant="ghost"
              size="sm"
              onClick={() => { setShowContactStatusFilter(v => !v); setShowStatusFilter(false); setShowRankFilter(false) }}
              className={filterContactStatuses.length > 0 ? '!text-[var(--color-obs-primary)]' : ''}
            >
              フェーズ
              {filterContactStatuses.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: 'var(--color-obs-primary-container)', color: 'var(--color-obs-on-primary)' }}
                >
                  {filterContactStatuses.length}
                </span>
              )}
              <ChevronDown size={12} className="ml-1 inline" />
            </ObsButton>

            <AnimatePresence>
              {showContactStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 p-2 min-w-[140px] flex flex-col gap-0.5 rounded-[var(--radius-obs-md)]"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {ALL_CONTACT_STATUSES.map(s => {
                    const active = filterContactStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleContactStatus(s)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] text-left transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--color-obs-surface-high)' : 'transparent',
                        }}
                        onMouseOver={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                        }}
                        onMouseOut={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <ObsChip tone={contactStatusToTone(s)}>{s}</ObsChip>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 部門フィルター */}
          <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-8 px-3 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={{
              backgroundColor: filterDepartment ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: filterDepartment ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            <option value="">部門</option>
            {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* 職位フィルター */}
          <select
            value={filterPersonRole}
            onChange={e => setFilterPersonRole(e.target.value as PersonRole | '')}
            onClick={e => e.stopPropagation()}
            className="h-8 px-3 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={{
              backgroundColor: filterPersonRole ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: filterPersonRole ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            <option value="">職位</option>
            {ALL_PERSON_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Clear filters */}
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setFilterStatuses([]); setFilterContactStatuses([]); setFilterRanks([]); setFilterDepartment(''); setFilterPersonRole('') }}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-[var(--radius-obs-md)] text-xs font-medium transition-colors whitespace-nowrap overflow-hidden"
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
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Result counter ── */}
        <div className="mb-3 flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          <span>
            <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
              {filtered.length.toLocaleString()}
            </span>
            件 <span className="opacity-60">/ 全 {contacts.length.toLocaleString()} 件</span>
          </span>
        </div>

        {/* ── Table ── */}
        <ObsCard depth="low" padding="none" radius="xl">
          {/* Header */}
          <div
            className="grid grid-cols-[260px_minmax(180px,1fr)_100px_110px_140px_130px_60px_60px] gap-x-3 px-5 py-3 text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {[
              { label: '氏名',          key: 'name' as SortKey,         sortable: true },
              { label: 'リード経由',     key: null,                       sortable: false },
              { label: '部門',          key: null,                       sortable: false },
              { label: '職位',          key: null,                       sortable: false },
              { label: 'ステータス',     key: 'status' as SortKey,       sortable: true },
              { label: 'Next Action',  key: null,                       sortable: false },
              { label: 'コール',        key: 'callAttempts' as SortKey, sortable: true },
              { label: 'メール',        key: 'emailsSent' as SortKey,   sortable: true },
            ].map((col, i) => (
              <div
                key={i}
                className={`leading-none flex items-center ${
                  col.sortable ? 'cursor-pointer select-none transition-colors' : ''
                }`}
                onClick={col.key ? () => toggleSort(col.key as SortKey) : undefined}
                onMouseOver={col.sortable ? (e) => {
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--color-obs-text-muted)'
                } : undefined}
                onMouseOut={col.sortable ? (e) => {
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--color-obs-text-subtle)'
                } : undefined}
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
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <User size={22} style={{ color: 'var(--color-obs-text-subtle)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
                  条件に一致するコンタクトが見つかりません
                </p>
              </div>
            ) : (
              filtered.map((contact) => {
                const dnc = contact.status === 'コール不可'

                return (
                  <motion.div
                    key={contact.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    className={`grid grid-cols-[260px_minmax(180px,1fr)_100px_110px_140px_130px_60px_60px] gap-x-3 items-center px-5 py-3.5 transition-colors duration-150 group cursor-pointer ${dnc ? 'opacity-35' : ''}`}
                    style={{
                      transitionTimingFunction: 'var(--ease-liquid)',
                      boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface)',
                    }}
                    onMouseOver={(e) => {
                      if (!dnc) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                    }}
                    onMouseOut={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    {/* 氏名 + 会社名(下) */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-highest)',
                          color: 'var(--color-obs-text)',
                        }}
                      >
                        {contact.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium truncate leading-tight tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                          {contact.name}
                        </p>
                        <p className="text-[11.5px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {contact.company}
                        </p>
                      </div>
                    </div>

                    {/* リード経由 */}
                    <LeadSourceCell source={contact.leadSource} />

                    {/* 部門 */}
                    <span className="text-[12px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {contact.department || '—'}
                    </span>

                    {/* 職位 */}
                    <div>
                      <ObsChip tone={personRoleToTone(contact.personRole)}>
                        {contact.personRole}
                      </ObsChip>
                    </div>

                    {/* アプローチ */}
                    <div>
                      <ObsChip tone={statusToTone(contact.status)}>
                        {contact.status}
                      </ObsChip>
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
                      <Phone size={11} className="shrink-0" style={{ color: 'var(--color-obs-low)' }} />
                      <span
                        className="text-[13px] font-semibold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {contact.callAttempts}
                      </span>
                    </div>

                    {/* メール送信数 */}
                    <div className="flex items-center gap-1">
                      <Mail size={11} className="shrink-0" style={{ color: 'var(--color-obs-primary)' }} />
                      <span
                        className="text-[13px] font-semibold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {contact.emailsSent}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </ObsCard>

        {/* ── Create Contact Modal ── */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[480px] rounded-[var(--radius-obs-xl)] overflow-hidden pointer-events-auto"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
                      コンタクトを追加
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      onMouseOver={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                      }}
                      onMouseOut={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <X size={15} style={{ color: 'var(--color-obs-text-muted)' }} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 space-y-3">
                    {/* 名前 */}
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        氏名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="田中 誠"
                        value={createForm.name}
                        onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    {/* 会社 */}
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        会社名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="株式会社テクノリード"
                        value={createForm.company}
                        onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      />
                    </div>
                    {/* 役職 + 角度 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          役職
                        </label>
                        <ObsInput
                          type="text"
                          placeholder="営業部長"
                          value={createForm.title}
                          onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          角度
                        </label>
                        <select
                          value={createForm.rank}
                          onChange={e => setCreateForm(f => ({ ...f, rank: e.target.value as Rank }))}
                          className="w-full h-10 px-4 rounded-[var(--radius-obs-md)] text-sm outline-none"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-lowest)',
                            color: 'var(--color-obs-text)',
                            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                          }}
                        >
                          {ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* 電話 + メール */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          電話番号
                        </label>
                        <ObsInput
                          type="tel"
                          placeholder="03-1234-5678"
                          value={createForm.phone}
                          onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          メールアドレス
                        </label>
                        <ObsInput
                          type="email"
                          placeholder="tanaka@example.com"
                          value={createForm.email}
                          onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    {/* 決裁者 */}
                    <label className="flex items-center gap-2.5 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={createForm.isDecisionMaker}
                        onChange={e => setCreateForm(f => ({ ...f, isDecisionMaker: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[var(--color-obs-primary-container)]"
                      />
                      <span className="text-sm" style={{ color: 'var(--color-obs-text)' }}>決裁者</span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-end gap-2 px-6 py-4"
                    style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <ObsButton variant="ghost" onClick={() => setShowCreateModal(false)}>
                      キャンセル
                    </ObsButton>
                    <ObsButton
                      variant="primary"
                      onClick={handleCreateSubmit}
                      disabled={!createForm.name.trim() || !createForm.company.trim()}
                    >
                      追加する
                    </ObsButton>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
