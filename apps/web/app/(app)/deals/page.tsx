'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  X,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Rank = 'A' | 'B' | 'C'
// パイプライン(/pipeline)のステージと完全連動
type DealStage =
  | 'IS' | 'NURTURING' | 'MEETING_PLANNED' | 'MEETING_DONE'
  | 'PROJECT_PLANNED' | 'MULTI_MEETING' | 'POC'
  | 'LOST_DEAL' | 'CLOSED_WON' | 'CHURN' | 'LOST'

type Signal = 'Hot' | 'Middle' | 'Low'

interface SignalGameStyle {
  label: string
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
}

// 確度: 高(Hot) / 中(Middle) / 低(Low)
const SIGNAL_STYLES: Record<Signal, SignalGameStyle> = {
  Hot: {
    label: '高',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#FFE4D9', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  Middle: {
    label: '中',
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  Low: {
    label: '低',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E0F4FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
}

// 取引詳細(deals/[id])のタスク種別と完全に連動
type NextActionType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other' | null
type SortKey = 'name' | 'amount' | 'stage' | 'updatedAt' | 'probability' | 'taskDueAt'
type SortDir = 'asc' | 'desc'

interface Deal {
  id: string
  name: string
  company: string
  contact: string
  owner: string
  rank: Rank
  stage: DealStage
  signal: Signal
  amount: number
  probability: number
  expectedCloseAt: string | null
  updatedAt: string
  nextAction: NextActionType
  taskDueAt: string | null
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DEALS: Deal[] = [
  { id: 'd1', name: '株式会社テクノリード - 2026/01/15', company: '株式会社テクノリード', contact: '田中 誠', owner: '田中太郎', rank: 'A', stage: 'CLOSED_WON',     signal: 'Hot',    amount: 4800000, probability: 80, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22', nextAction: 'proposal', taskDueAt: '2026-03-28' },
  { id: 'd2', name: '株式会社イノベーション - 大型案件',  company: '株式会社イノベーション', contact: '佐々木 拓也', owner: '田中太郎', rank: 'A', stage: 'POC',             signal: 'Hot',    amount: 6000000, probability: 90, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21', nextAction: 'meeting', taskDueAt: '2026-03-26' },
  { id: 'd3', name: '合同会社フューチャー - 2026/02/01', company: '合同会社フューチャー', contact: '山本 佳子', owner: '鈴木花子', rank: 'A', stage: 'MEETING_PLANNED', signal: 'Hot',    amount: 2400000, probability: 40, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19', nextAction: 'call', taskDueAt: '2026-03-25' },
  { id: 'd4', name: '株式会社グロース - HR導入',        company: '株式会社グロース',    contact: '中村 理恵', owner: '佐藤次郎', rank: 'B', stage: 'MEETING_DONE',    signal: 'Middle', amount: 900000,  probability: 30, expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10', nextAction: 'email', taskDueAt: '2026-03-24' },
  { id: 'd5', name: '株式会社イノベーション - 初回',    company: '株式会社イノベーション', contact: '佐々木 拓也', owner: '田中太郎', rank: 'A', stage: 'PROJECT_PLANNED', signal: 'Hot',    amount: 3600000, probability: 50, expectedCloseAt: '2026-04-20', updatedAt: '2026-03-18', nextAction: 'followup', taskDueAt: '2026-03-30' },
  { id: 'd6', name: '有限会社サクセス - PoC',          company: '有限会社サクセス',    contact: '小林 健太', owner: '鈴木花子', rank: 'B', stage: 'MULTI_MEETING',  signal: 'Middle', amount: 1800000, probability: 60, expectedCloseAt: '2026-04-10', updatedAt: '2026-03-05', nextAction: 'meeting', taskDueAt: '2026-04-02' },
  { id: 'd7', name: '株式会社ネクスト - 不動産向け',   company: '株式会社ネクスト',    contact: '鈴木 美香', owner: '田中太郎', rank: 'C', stage: 'NURTURING',       signal: 'Low',    amount: 720000,  probability: 35, expectedCloseAt: '2026-04-25', updatedAt: '2026-03-17', nextAction: 'proposal', taskDueAt: '2026-04-05' },
  { id: 'd8', name: '株式会社テクノリード - 新規',     company: '株式会社テクノリード', contact: '田中 誠',   owner: '田中太郎', rank: 'A', stage: 'IS',              signal: 'Middle', amount: 1200000, probability: 20, expectedCloseAt: '2026-05-15', updatedAt: '2026-03-23', nextAction: 'call', taskDueAt: null },
]

// ─── Next Action Config ─────────────────────────────────────────────────────────

interface NextActionGameStyle {
  label: string
  gradient: string
  glow: string
  color: string
  borderColor: string
  textShadow: string
}

const NEXT_ACTION_CONFIG: Record<Exclude<NextActionType, null>, NextActionGameStyle> = {
  call: {
    label: 'コール',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  email: {
    label: 'メール',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  meeting: {
    label: '商談',
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  proposal: {
    label: '提案書送付',
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  followup: {
    label: 'フォロー',
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(110,15,60,0.6)',
  },
  other: {
    label: 'その他',
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
  },
}

// ─── Config ────────────────────────────────────────────────────────────────────

interface StageGameStyle {
  label: string
  gradient: string
  glow: string
  color: string
  borderColor: string
  textShadow: string
}

const STAGE_CONFIG: Record<DealStage, StageGameStyle> = {
  IS: {
    label: 'IS',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  NURTURING: {
    label: 'ナーチャリング',
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(110,15,60,0.6)',
  },
  MEETING_PLANNED: {
    label: '商談予定',
    gradient: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 35%, #0EA5E9 70%, #0369A1 100%)',
    glow: '0 0 14px rgba(14,165,233,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,50,100,0.6)',
  },
  MEETING_DONE: {
    label: '商談済み',
    gradient: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 35%, #3B82F6 70%, #1D4ED8 100%)',
    glow: '0 0 14px rgba(59,130,246,0.85), 0 0 5px rgba(96,165,250,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,120,0.6)',
  },
  PROJECT_PLANNED: {
    label: 'PJ化予定あり',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  MULTI_MEETING: {
    label: '複数商談済み',
    gradient: 'linear-gradient(135deg, #DDD6FE 0%, #C084FC 35%, #A855F7 70%, #7E22CE 100%)',
    glow: '0 0 14px rgba(168,85,247,0.85), 0 0 5px rgba(192,132,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(70,20,120,0.6)',
  },
  POC: {
    label: 'POC実施中',
    gradient: 'linear-gradient(135deg, #F0ABFC 0%, #E879F9 35%, #D946EF 70%, #A21CAF 100%)',
    glow: '0 0 14px rgba(217,70,239,0.85), 0 0 5px rgba(232,121,249,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(90,15,110,0.6)',
  },
  LOST_DEAL: {
    label: '失注',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  CLOSED_WON: {
    label: '受注',
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 18px rgba(52,199,89,0.95), 0 0 6px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#053D24', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  CHURN: {
    label: 'チャーン',
    gradient: 'linear-gradient(135deg, #FCA5A5 0%, #FF8A82 35%, #FF6B62 70%, #DC2626 100%)',
    glow: '0 0 12px rgba(255,107,98,0.7), inset 0 1px 0 rgba(255,255,255,0.3)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  LOST: {
    label: 'ロスト',
    gradient: 'linear-gradient(135deg, #6B6B70 0%, #48484A 35%, #2C2C2E 70%, #1C1C1E 100%)',
    glow: '0 0 8px rgba(174,174,178,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    color: '#AABBDD', borderColor: 'rgba(174,174,178,0.4)', textShadow: 'none',
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

function getProbGradient(p: number): string {
  if (p >= 70) return 'linear-gradient(90deg, #34C759 0%, #30D158 100%)'
  if (p >= 40) return 'linear-gradient(90deg, #FF9F0A 0%, #FFCC00 100%)'
  return 'linear-gradient(90deg, #FF6B6B 0%, #FF3B30 100%)'
}
function getProbTextColor(p: number): string {
  if (p >= 70) return '#1A7A35'
  if (p >= 40) return '#C07000'
  return '#CF3131'
}

// パイプラインのSTAGESと同じ並び順
const STAGE_ORDER: DealStage[] = [
  'IS', 'NURTURING', 'MEETING_PLANNED', 'MEETING_DONE',
  'PROJECT_PLANNED', 'MULTI_MEETING', 'POC',
  'LOST_DEAL', 'CLOSED_WON', 'CHURN', 'LOST',
]

const ALL_STAGES = Object.keys(STAGE_CONFIG) as DealStage[]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1000000) return `¥${(n / 1000000).toFixed(1)}M`
  return `¥${(n / 10000).toFixed(0)}万`
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isOverdue(s: string | null): boolean {
  if (!s) return false
  return new Date(s) < new Date('2026-03-23')
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="text-[#99AACC] ml-1 inline" />
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="ml-1 inline" style={{ color: '#0071E3' }} />
    : <ChevronDown size={12} className="ml-1 inline" style={{ color: '#0071E3' }} />
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals]               = useState<Deal[]>(MOCK_DEALS)
  const [search, setSearch]             = useState('')
  const [filterStage, setFilterStage]   = useState<DealStage | ''>('')
  const [filterOwner, setFilterOwner]   = useState('')
  const [sortKey, setSortKey]           = useState<SortKey>('amount')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', company: '', contact: '', stage: 'IS' as DealStage,
    amount: '', probability: '20', expectedCloseAt: '',
  })

  function handleCreateSubmit() {
    if (!createForm.name.trim() || !createForm.company.trim()) return
    const today = new Date('2026-03-23')
    const newDeal: Deal = {
      id: `d-${Date.now()}`, name: createForm.name.trim(),
      company: createForm.company.trim(), contact: createForm.contact,
      owner: '田中太郎', rank: 'C', stage: createForm.stage, signal: 'Low',
      amount: parseInt(createForm.amount) || 0,
      probability: parseInt(createForm.probability) || 20,
      expectedCloseAt: createForm.expectedCloseAt || null,
      updatedAt: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
      nextAction: null,
      taskDueAt: null,
    }
    setDeals(prev => [newDeal, ...prev])
    setShowCreateModal(false)
    setCreateForm({ name: '', company: '', contact: '', stage: 'IS', amount: '', probability: '20', expectedCloseAt: '' })
  }

  const ALL_OWNERS = Array.from(new Set(deals.map(d => d.owner)))

  const filtered = useMemo(() => {
    let list = deals
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.contact.toLowerCase().includes(q)
      )
    }
    if (filterStage)   list = list.filter(d => d.stage === filterStage)
    if (filterOwner)   list = list.filter(d => d.owner === filterOwner)
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')        cmp = a.name.localeCompare(b.name, 'ja')
      if (sortKey === 'amount')      cmp = a.amount - b.amount
      if (sortKey === 'probability') cmp = a.probability - b.probability
      if (sortKey === 'stage')       cmp = STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      if (sortKey === 'updatedAt')   cmp = a.updatedAt.localeCompare(b.updatedAt)
      if (sortKey === 'taskDueAt')   cmp = (a.taskDueAt ?? '9999').localeCompare(b.taskDueAt ?? '9999')
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [deals, search, filterStage, filterOwner, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0)
  const hasFilters = !!filterStage || !!filterOwner

  return (
    <div className="space-y-4">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-2xl flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99AACC]" />
            <input
              type="text"
              placeholder="取引名・会社名・コンタクトで検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0c1028] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
            />
          </div>

          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value as DealStage | '')}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all ${
              filterStage ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]' : 'bg-[#0c1028] border-[rgba(0,0,0,0.09)] text-[#CCDDF0] hover:border-[#C7C7CC]'
            }`}
          >
            <option value="">ステージ</option>
            {ALL_STAGES.map(s => (
              <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
            ))}
          </select>

          <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all ${
              filterOwner ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]' : 'bg-[#0c1028] border-[rgba(0,0,0,0.09)] text-[#CCDDF0] hover:border-[#C7C7CC]'
            }`}
          >
            <option value="">担当者</option>
            {ALL_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setFilterStage(''); setFilterOwner('') }}
                className="flex items-center gap-1 text-xs text-[#CCDDF0] hover:text-[#EEEEFF] whitespace-nowrap overflow-hidden transition-colors"
              >
                <X size={12} />クリア
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
          取引を追加
        </motion.button>
      </div>

      {/* ── Stats ── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} style={{ color: '#0055FF' }} />
          <span className="text-sm font-semibold text-[#EEEEFF] tabular-nums">{formatAmount(totalAmount)}</span>
          <span className="text-xs text-[#99AACC]">パイプライン総額</span>
        </div>
        <span className="w-px h-3 bg-[rgba(34,68,170,0.2)]" />
        <span className="text-xs text-[#99AACC]">{filtered.length}件表示</span>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
        {/* Header */}
        <div className="grid grid-cols-[300px_50px_1fr_140px_140px_120px_110px] gap-x-3 px-5 py-2.5" style={{ borderBottom: '1px solid #2244AA', background: 'rgba(0,0,0,0.018)' }}>
          {[
            { label: '取引名',         key: 'name' as SortKey,       sortable: true },
            { label: '角度',           key: null,                    sortable: false },
            { label: '',               key: null,                    sortable: false },
            { label: '担当者',         key: null,                    sortable: false },
            { label: 'ステージ',       key: 'stage' as SortKey,      sortable: true },
            { label: 'ネクストアクション', key: null,                  sortable: false },
            { label: '',              key: null,                    sortable: false },
          ].map((col, i) => (
            <div
              key={i}
              className={`text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.06em] leading-none flex items-center ${
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
              <div className="w-12 h-12 rounded-full bg-[rgba(34,68,170,0.1)] flex items-center justify-center">
                <Briefcase size={22} className="text-[#99AACC]" />
              </div>
              <p className="text-sm text-[#CCDDF0]">条件に一致する取引が見つかりません</p>
            </div>
          ) : (
            filtered.map(deal => {
              const stage = STAGE_CONFIG[deal.stage]

              return (
                <motion.div
                  key={deal.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  onClick={() => router.push(`/deals/${deal.id}`)}
                  className="grid grid-cols-[300px_50px_1fr_140px_140px_120px_110px] gap-x-3 items-center px-5 py-3.5 border-b border-[rgba(0,0,0,0.04)] last:border-0 transition-colors duration-100 group hover:bg-[rgba(136,187,255,0.04)] cursor-pointer"
                >
                  {/* 取引名 */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[7px] bg-[rgba(34,68,170,0.1)] flex items-center justify-center shrink-0">
                      <Briefcase size={13} className="text-[#99AACC]" />
                    </div>
                    <p className="text-sm font-medium text-[#EEEEFF] truncate min-w-0">{deal.company}</p>
                  </div>

                  {/* 角度 */}
                  <div>
                    {(() => {
                      const s = SIGNAL_STYLES[deal.signal]
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
                          title={`角度: ${s.label}`}
                        >
                          {s.label}
                        </span>
                      )
                    })()}
                  </div>

                  {/* スペーサー */}
                  <div />

                  {/* 担当者 */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)', boxShadow: '0 0 14px rgba(94,92,230,0.7), 0 0 5px rgba(125,211,252,0.9), inset 0 1px 0 rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}>
                      <span className="text-[9px] font-semibold text-white">{deal.owner[0]}</span>
                    </div>
                    <span className="text-sm text-[#EEEEFF] truncate">{deal.owner}</span>
                  </div>

                  {/* ステージ */}
                  <div>
                    <span
                      className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
                      style={{
                        background: stage.gradient,
                        boxShadow: stage.glow,
                        color: stage.color,
                        border: `1px solid ${stage.borderColor}`,
                        textShadow: stage.textShadow,
                        letterSpacing: '0.01em',
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {/* ネクストアクション */}
                  <div>
                    {deal.nextAction ? (() => {
                      const na = NEXT_ACTION_CONFIG[deal.nextAction]
                      return (
                        <span
                          className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
                          style={{
                            background: na.gradient,
                            boxShadow: na.glow,
                            color: na.color,
                            border: `1px solid ${na.borderColor}`,
                            textShadow: na.textShadow,
                            letterSpacing: '0.01em',
                          }}
                        >
                          {na.label}
                        </span>
                      )
                    })() : (
                      <span className="text-[11px] text-[#99AACC]">—</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-[#0071E3] px-3 py-1.5 rounded-[6px] hover:bg-[rgba(0,113,227,0.08)] transition-all duration-100">
                      詳細を見る
                    </button>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </div>

      {/* ── Create Deal Modal ── */}
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
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(34,68,170,0.3)' }}>
                  <h2 className="text-[15px] font-semibold text-[#EEEEFF]">取引を追加</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(136,187,255,0.06)] transition-colors">
                    <X size={15} className="text-[#CCDDF0]" />
                  </button>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">取引名 <span className="text-[#FF3B30]">*</span></label>
                    <input type="text" placeholder="株式会社テクノリード - 2026/03/23"
                      value={createForm.name}
                      onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">会社名 <span className="text-[#FF3B30]">*</span></label>
                    <input type="text" placeholder="株式会社テクノリード"
                      value={createForm.company}
                      onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">コンタクト</label>
                      <input type="text" placeholder="田中 誠"
                        value={createForm.contact}
                        onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">ステージ</label>
                      <select value={createForm.stage}
                        onChange={e => setCreateForm(f => ({ ...f, stage: e.target.value as DealStage }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      >
                        {STAGE_ORDER.filter(s => !['CLOSED_WON','LOST_DEAL','CHURN','LOST'].includes(s)).map(s => (
                          <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">見込み金額（円）</label>
                      <input type="number" placeholder="1200000"
                        value={createForm.amount}
                        onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em] block mb-1">想定クローズ日</label>
                      <input type="date"
                        value={createForm.expectedCloseAt}
                        onChange={e => setCreateForm(f => ({ ...f, expectedCloseAt: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#EEEEFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid rgba(34,68,170,0.3)' }}>
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-[#CCDDF0] hover:text-[#EEEEFF] hover:bg-[rgba(136,187,255,0.06)] rounded-[8px] transition-all">
                    キャンセル
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreateSubmit}
                    disabled={!createForm.name.trim() || !createForm.company.trim()}
                    className="px-5 py-2 text-sm font-medium text-white rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed"
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
