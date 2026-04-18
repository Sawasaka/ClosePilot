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
type Signal = 'Hot' | 'Middle' | 'Low'

interface SignalGameStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
}

const SIGNAL_STYLES: Record<Signal, SignalGameStyle> = {
  Hot: {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#FFE4D9', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  Middle: {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  Low: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E0F4FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
}

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
  signal: Signal
  callAttempts: number
  emailsSent: number
  lastCallAt: string | null
  nextActionAt: string | null
  nextAction: NextAction
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: '田中 誠',    title: '営業部長',   department: '営業部',     personRole: '決裁者', company: '株式会社テクノリード',    companyId: '1', rank: 'A', status: 'アポ獲得',   contactStatus: '商談中', signal: 'Hot',    callAttempts: 3, emailsSent: 5, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', nextAction: '連絡待ち' },
  { id: '2', name: '山本 佳子',  title: 'マネージャー', department: '購買部',     personRole: '推進者', company: '合同会社フューチャー',    companyId: '2', rank: 'A', status: '接続済み',   contactStatus: '商談中', signal: 'Hot',    callAttempts: 5, emailsSent: 8, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22', nextAction: 'メールアプローチ' },
  { id: '3', name: '佐々木 拓也', title: '代表取締役',  department: '経営企画',   personRole: '決裁者', company: '株式会社イノベーション',  companyId: '3', rank: 'A', status: 'Next Action', contactStatus: 'リード', signal: 'Hot',    callAttempts: 2, emailsSent: 3, lastCallAt: '2026-03-18', nextActionAt: '2026-03-25', nextAction: 'コール' },
  { id: '4', name: '中村 理恵',  title: '購買担当',   department: '調達部',     personRole: '一般',  company: '株式会社グロース',        companyId: '4', rank: 'B', status: '不在',      contactStatus: 'リード', signal: 'Middle', callAttempts: 4, emailsSent: 2, lastCallAt: '2026-03-15', nextActionAt: null, nextAction: 'コール' },
  { id: '5', name: '小林 健太',  title: '部長',      department: '営業部',     personRole: '推進者', company: '有限会社サクセス',        companyId: '5', rank: 'B', status: '不通',      contactStatus: 'リード', signal: 'Middle', callAttempts: 6, emailsSent: 1, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', nextAction: 'コール' },
  { id: '6', name: '鈴木 美香',  title: '課長',      department: 'マーケ部',   personRole: '一般',  company: '株式会社ネクスト',        companyId: '6', rank: 'C', status: '未着手',    contactStatus: 'リード', signal: 'Low',    callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null },
  { id: '7', name: '加藤 雄介',  title: '取締役',    department: '経営企画',   personRole: '決裁者', company: '合同会社ビジョン',        companyId: '7', rank: 'C', status: '未着手',    contactStatus: '休眠',  signal: 'Low',    callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null },
  { id: '8', name: '吉田 千春',  title: '部長',      department: '人事部',     personRole: '推進者', company: '株式会社スタート',        companyId: '8', rank: 'C', status: 'コール不可', contactStatus: '失注',  signal: 'Low',    callAttempts: 8, emailsSent: 4, lastCallAt: '2026-03-01', nextActionAt: null, nextAction: null },
]

const ALL_STATUSES: ApproachStatus[] = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'Next Action']
const ALL_CONTACT_STATUSES: ContactStatus[] = ['リード', '商談中', '顧客', '休眠', '失注']
const ALL_RANKS: Rank[] = ['A', 'B', 'C']

// ─── Style Maps ───────────────────────────────────────────────────────────────

interface GameStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
}

const STATUS_GAME_STYLES_LOCAL: Record<ApproachStatus, GameStyle> = {
  '未着手': {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', dotColor: '#48484A', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
  },
  '不通': {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#FFE4D9', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  '不在': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  '接続済み': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E0F4FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  'コール不可': {
    gradient: 'linear-gradient(135deg, #6B6B70 0%, #48484A 35%, #2C2C2E 70%, #1C1C1E 100%)',
    glow: '0 0 12px rgba(255,59,48,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
    color: '#FF8A82', dotColor: '#FF3B30', borderColor: 'rgba(255,59,48,0.5)', textShadow: '0 0 6px rgba(255,59,48,0.7)',
  },
  'アポ獲得': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 16px rgba(52,199,89,0.9), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  'Next Action': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E9E5FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
}

const ALL_NEXT_ACTIONS: NextAction[] = ['メールアプローチ', 'コール', '連絡待ち']

const NEXT_ACTION_GAME_STYLES: Record<string, GameStyle> = {
  'メールアプローチ': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E9E5FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  'コール': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E0F4FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  '連絡待ち': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
}

type RankConfig = { gradient: string; glow: string; color: string }
const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,75,40,0.85), 0 0 5px rgba(255,180,80,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#fff',
  },
  B: {
    gradient: 'linear-gradient(135deg, #FFF080 0%, #FFE040 30%, #FFD60A 60%, #FF9F0A 100%)',
    glow: '0 0 14px rgba(255,214,10,0.85), 0 0 5px rgba(255,240,128,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#7B2D00',
  },
  C: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#fff',
  },
}

const CONTACT_STATUS_GAME_STYLES: Record<ContactStatus, GameStyle> = {
  'リード': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E0F4FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  '商談中': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E9E5FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  '顧客': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 16px rgba(52,199,89,0.9), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  '休眠': {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', dotColor: '#48484A', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
  },
  '失注': {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#FFE4D9', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
}

// 職位 (PersonRole) のFFスタイル
const PERSON_ROLE_GAME_STYLES: Record<PersonRole, GameStyle> = {
  '決裁者': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  '推進者': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E9E5FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  '一般': {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', dotColor: '#48484A', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
  },
}

const ALL_PERSON_ROLES: PersonRole[] = ['決裁者', '推進者', '一般']

function gameBadgeStyle(s: GameStyle): React.CSSProperties {
  return {
    background: s.gradient,
    boxShadow: s.glow,
    color: s.color,
    border: `1px solid ${s.borderColor}`,
    textShadow: s.textShadow,
    letterSpacing: '0.01em',
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApproachStatus }) {
  const s = STATUS_GAME_STYLES_LOCAL[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
      style={gameBadgeStyle(s)}
    >
      <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: s.dotColor, boxShadow: `0 0 4px ${s.dotColor}cc` }} />
      {status}
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
          className="text-[11px] text-[#99AACC] hover:text-[#CCDDF0] px-2 py-0.5 rounded-[4px] hover:bg-[rgba(136,187,255,0.06)] transition-colors"
        >
          + 設定
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 mt-1 z-40 bg-[#0c1028] rounded-[8px] py-1 min-w-[140px]"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}>
              {ALL_NEXT_ACTIONS.map(a => {
                if (!a) return null
                const s = NEXT_ACTION_GAME_STYLES[a]!
                return (
                  <button key={a} onClick={() => { onChange(a); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors text-[#CCDDF0]">
                    <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: s.dotColor, boxShadow: `0 0 4px ${s.dotColor}` }} />
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

  const style = NEXT_ACTION_GAME_STYLES[value]!
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap hover:scale-105 transition-transform"
        style={gameBadgeStyle(style)}
      >
        <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: style.dotColor, boxShadow: `0 0 4px ${style.dotColor}cc` }} />
        {value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-40 bg-[#0c1028] rounded-[8px] py-1 min-w-[140px]"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}>
            {ALL_NEXT_ACTIONS.map(a => {
              if (!a) return null
              const s = NEXT_ACTION_GAME_STYLES[a]!
              const selected = a === value
              return (
                <button key={a} onClick={() => { onChange(a); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors text-[#CCDDF0]"
                  style={selected ? { fontWeight: 700 } : undefined}>
                  <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: s.dotColor, boxShadow: `0 0 4px ${s.dotColor}` }} />
                  {a}
                </button>
              )
            })}
            <button onClick={() => { onChange(null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left text-[#99AACC] hover:bg-[rgba(136,187,255,0.06)] transition-colors">
              クリア
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={11} className="text-[#99AACC] ml-1 inline" />
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
      status: '未着手', contactStatus: createForm.contactStatus, signal: 'Low', callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, nextAction: null,
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
    <div className="space-y-4" onClick={() => { setShowStatusFilter(false); setShowRankFilter(false) }}>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99AACC]" />
            <input
              type="text"
              placeholder="氏名・会社名・役職で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0c1028] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none transition-all"
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
                  : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#C7C7CC] hover:text-[#EEEEFF]'
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
                  className="absolute top-full mt-1.5 left-0 z-20 bg-[#0c1028] rounded-[10px] p-2 min-w-[160px] flex flex-col gap-0.5"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}
                >
                  {ALL_STATUSES.map(s => {
                    const style = STATUS_GAME_STYLES_LOCAL[s]
                    const active = filterStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors text-left"
                        style={active ? gameBadgeStyle(style) : { color: '#CCDDF0' }}
                      >
                        <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: style.dotColor, boxShadow: `0 0 4px ${style.dotColor}` }} />
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
                  : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#C7C7CC] hover:text-[#EEEEFF]'
              }`}
            >
              角度
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
                  className="absolute top-full mt-1.5 left-0 z-20 bg-[#0c1028] rounded-[10px] p-2 flex gap-1"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}
                >
                  {ALL_RANKS.map(r => {
                    const cfg = RANK_CONFIG[r]
                    const active = filterRanks.includes(r)
                    return (
                      <button
                        key={r}
                        onClick={() => toggleRank(r)}
                        className={`w-8 h-8 rounded-[6px] text-[11px] font-bold transition-all duration-100 ${
                          !active ? 'hover:bg-[rgba(0,0,0,0.04)] text-[#CCDDF0]' : ''
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
                  : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#C7C7CC] hover:text-[#EEEEFF]'
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
                  className="absolute top-full mt-1.5 left-0 z-20 bg-[#0c1028] rounded-[10px] p-2 min-w-[140px] flex flex-col gap-0.5"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}
                >
                  {ALL_CONTACT_STATUSES.map(s => {
                    const style = CONTACT_STATUS_GAME_STYLES[s]
                    const active = filterContactStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleContactStatus(s)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-bold transition-colors text-left"
                        style={active ? gameBadgeStyle(style) : { color: '#CCDDF0' }}
                      >
                        <span className="rounded-full shrink-0" style={{ width: 6, height: 6, background: style.dotColor, boxShadow: `0 0 4px ${style.dotColor}` }} />
                        {s}
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
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all duration-150 ${
              filterDepartment
                ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#D1D5DB] hover:text-[#EEEEFF]'
            }`}
            style={filterDepartment ? { background: 'rgba(0,113,227,0.08)' } : undefined}
          >
            <option value="">部門</option>
            {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* 職位フィルター */}
          <select
            value={filterPersonRole}
            onChange={e => setFilterPersonRole(e.target.value as PersonRole | '')}
            onClick={e => e.stopPropagation()}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all duration-150 ${
              filterPersonRole
                ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#D1D5DB] hover:text-[#EEEEFF]'
            }`}
            style={filterPersonRole ? { background: 'rgba(0,113,227,0.08)' } : undefined}
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
                className="flex items-center gap-1 text-xs text-[#CCDDF0] hover:text-[#EEEEFF] transition-colors whitespace-nowrap overflow-hidden"
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
          <span className="text-lg font-semibold tabular-nums tracking-tight text-[#EEEEFF]">
            {contacts.length}
          </span>
          <span className="text-xs text-[#99AACC]">全件</span>
        </div>
        <span className="text-xs text-[#99AACC] ml-auto">
          {filtered.length}件表示
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>

        {/* Header */}
        <div className="grid grid-cols-[260px_50px_1fr_100px_110px_140px_130px_60px_60px] gap-x-3 px-5 py-2.5" style={{ borderBottom: '1px solid #2244AA', background: 'rgba(0,0,0,0.018)' }}>
          {[
            { label: '氏名',         key: 'name' as SortKey,           sortable: true },
            { label: '温度感',       key: null,                        sortable: false },
            { label: '',             key: null,                        sortable: false },
            { label: '部門',         key: null,                        sortable: false },
            { label: '職位',         key: null,                        sortable: false },
            { label: 'ステータス',    key: 'status' as SortKey,         sortable: true },
            { label: 'Next Action', key: null,                        sortable: false },
            { label: 'コール',       key: 'callAttempts' as SortKey,   sortable: true },
            { label: 'メール',       key: 'emailsSent' as SortKey,     sortable: true },
          ].map((col, i) => (
            <div
              key={i}
              className={`text-[11px] font-medium uppercase tracking-[0.055em] leading-none flex items-center text-[#99AACC] ${
                col.sortable ? 'cursor-pointer hover:text-[#CCDDF0] select-none transition-colors' : ''
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
                <User size={22} className="text-[#99AACC]" />
              </div>
              <p className="text-sm text-[#CCDDF0]">条件に一致するコンタクトが見つかりません</p>
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
                  className={`grid grid-cols-[260px_50px_1fr_100px_110px_140px_130px_60px_60px] gap-x-3 items-center px-5 py-3.5 last:border-0 transition-colors duration-100 group cursor-pointer ${
                    dnc ? 'opacity-35' : 'hover:bg-[rgba(136,187,255,0.04)]'
                  }`}
                  style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}
                >
                  {/* 氏名 + 会社名(下) */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)', boxShadow: '0 0 14px rgba(94,92,230,0.7), 0 0 5px rgba(125,211,252,0.9), inset 0 1px 0 rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {contact.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-[#EEEEFF] truncate leading-tight tracking-[-0.01em]">{contact.name}</p>
                      <p className="text-[11.5px] text-[#99AACC] truncate">{contact.company}</p>
                    </div>
                  </div>

                  {/* 温度感 */}
                  <div>
                    {(() => {
                      const s = SIGNAL_STYLES[contact.signal]
                      const heatLabel = contact.signal === 'Hot' ? '高' : contact.signal === 'Middle' ? '中' : '低'
                      return (
                        <span
                          className="inline-flex items-center justify-center rounded-full text-[10px] font-black whitespace-nowrap shrink-0"
                          style={{
                            width: 24,
                            height: 24,
                            background: s.gradient,
                            boxShadow: s.glow,
                            color: s.color,
                            border: `1px solid ${s.borderColor}`,
                            textShadow: s.textShadow,
                            letterSpacing: '0.04em',
                          }}
                          title={`温度感: ${heatLabel}`}
                        >
                          {heatLabel}
                        </span>
                      )
                    })()}
                  </div>

                  {/* スペーサー */}
                  <div />

                  {/* 部門 */}
                  <span className="text-[12px] text-[#CCDDF0] truncate">{contact.department || '—'}</span>

                  {/* 職位 */}
                  <div>
                    {(() => {
                      const s = PERSON_ROLE_GAME_STYLES[contact.personRole]
                      return (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-bold whitespace-nowrap"
                          style={gameBadgeStyle(s)}
                        >
                          {contact.personRole}
                        </span>
                      )
                    })()}
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
                    <Phone size={11} className="text-[#88BBFF] shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(136,187,255,0.6))' }} />
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(136,187,255,0.5)' }}
                    >
                      {contact.callAttempts}
                    </span>
                  </div>

                  {/* メール送信数 */}
                  <div className="flex items-center gap-1">
                    <Mail size={11} className="text-[#A78BFA] shrink-0" style={{ filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.6))' }} />
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(167,139,250,0.5)' }}
                    >
                      {contact.emailsSent}
                    </span>
                  </div>
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
                className="bg-[#0c1028] rounded-[8px] w-full max-w-[480px] mx-4 pointer-events-auto"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #2244AA' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(34,68,170,0.3)' }}>
                  <h2 className="text-[15px] font-semibold text-[#EEEEFF]">コンタクトを追加</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(136,187,255,0.06)] transition-colors">
                    <X size={15} className="text-[#CCDDF0]" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-3">
                  {/* 名前 */}
                  <div>
                    <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">
                      氏名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text" placeholder="田中 誠"
                      value={createForm.name}
                      onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  {/* 会社 */}
                  <div>
                    <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">
                      会社名 <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text" placeholder="株式会社テクノリード"
                      value={createForm.company}
                      onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  {/* 役職 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">役職</label>
                      <input
                        type="text" placeholder="営業部長"
                        value={createForm.title}
                        onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">角度</label>
                      <select
                        value={createForm.rank}
                        onChange={e => setCreateForm(f => ({ ...f, rank: e.target.value as Rank }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      >
                        {ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 電話 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">電話番号</label>
                      <input
                        type="tel" placeholder="03-1234-5678"
                        value={createForm.phone}
                        onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">メールアドレス</label>
                      <input
                        type="email" placeholder="tanaka@example.com"
                        value={createForm.email}
                        onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
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
                    <span className="text-sm text-[#EEEEFF]">決裁者</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid rgba(34,68,170,0.3)' }}>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-[#CCDDF0] hover:text-[#EEEEFF] hover:bg-[rgba(136,187,255,0.06)] rounded-[8px] transition-all"
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
