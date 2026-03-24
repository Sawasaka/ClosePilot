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
  AlertTriangle,
  TrendingUp,
  X,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Rank = 'A' | 'B' | 'C'
type DealStage =
  | 'NEW_LEAD' | 'QUALIFIED' | 'FIRST_MEETING' | 'SOLUTION_FIT'
  | 'PROPOSAL' | 'NEGOTIATION' | 'VERBAL_COMMIT' | 'CLOSED_WON' | 'CLOSED_LOST'

type SortKey = 'name' | 'amount' | 'stage' | 'updatedAt' | 'probability'
type SortDir = 'asc' | 'desc'

interface Deal {
  id: string
  name: string
  company: string
  contact: string
  owner: string
  rank: Rank
  stage: DealStage
  amount: number
  probability: number
  stalled: boolean
  expectedCloseAt: string | null
  updatedAt: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DEALS: Deal[] = [
  { id: 'd1', name: '株式会社テクノリード - 2026/01/15', company: '株式会社テクノリード', contact: '田中 誠', owner: '田中太郎', rank: 'A', stage: 'NEGOTIATION',   amount: 4800000, probability: 80, stalled: false, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22' },
  { id: 'd2', name: '株式会社イノベーション - 大型案件',  company: '株式会社イノベーション', contact: '佐々木 拓也', owner: '田中太郎', rank: 'A', stage: 'VERBAL_COMMIT', amount: 6000000, probability: 90, stalled: false, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21' },
  { id: 'd3', name: '合同会社フューチャー - 2026/02/01', company: '合同会社フューチャー', contact: '山本 佳子', owner: '鈴木花子', rank: 'A', stage: 'QUALIFIED',      amount: 2400000, probability: 40, stalled: false, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19' },
  { id: 'd4', name: '株式会社グロース - HR導入',        company: '株式会社グロース',    contact: '中村 理恵', owner: '佐藤次郎', rank: 'B', stage: 'QUALIFIED',      amount: 900000,  probability: 30, stalled: true,  expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10' },
  { id: 'd5', name: '株式会社イノベーション - 初回',    company: '株式会社イノベーション', contact: '佐々木 拓也', owner: '田中太郎', rank: 'A', stage: 'FIRST_MEETING', amount: 3600000, probability: 50, stalled: false, expectedCloseAt: '2026-04-20', updatedAt: '2026-03-18' },
  { id: 'd6', name: '有限会社サクセス - PoC',          company: '有限会社サクセス',    contact: '小林 健太', owner: '鈴木花子', rank: 'B', stage: 'SOLUTION_FIT',  amount: 1800000, probability: 60, stalled: true,  expectedCloseAt: '2026-04-10', updatedAt: '2026-03-05' },
  { id: 'd7', name: '株式会社ネクスト - 不動産向け',   company: '株式会社ネクスト',    contact: '鈴木 美香', owner: '田中太郎', rank: 'C', stage: 'PROPOSAL',       amount: 720000,  probability: 35, stalled: false, expectedCloseAt: '2026-04-25', updatedAt: '2026-03-17' },
  { id: 'd8', name: '株式会社テクノリード - 新規',     company: '株式会社テクノリード', contact: '田中 誠',   owner: '田中太郎', rank: 'A', stage: 'NEW_LEAD',      amount: 1200000, probability: 20, stalled: false, expectedCloseAt: '2026-05-15', updatedAt: '2026-03-23' },
]

// ─── Config ────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string }> = {
  NEW_LEAD:      { label: '新規リード', color: 'text-[#6E6E73]',  bg: 'bg-[rgba(0,0,0,0.06)]' },
  QUALIFIED:     { label: '有資格',     color: 'text-[#0044DD]',  bg: 'bg-[rgba(0,85,255,0.11)]' },
  FIRST_MEETING: { label: '初回商談',   color: 'text-[#4B48CC]',  bg: 'bg-[rgba(94,92,230,0.12)]' },
  SOLUTION_FIT:  { label: '課題適合',   color: 'text-[#9B30D9]',  bg: 'bg-[rgba(191,90,242,0.12)]' },
  PROPOSAL:      { label: '提案',       color: 'text-[#C07000]',  bg: 'bg-[rgba(255,159,10,0.12)]' },
  NEGOTIATION:   { label: '交渉',       color: 'text-[#D92B1A]',  bg: 'bg-[rgba(255,59,48,0.12)]' },
  VERBAL_COMMIT: { label: '口頭合意',   color: 'text-[#007A30]',  bg: 'bg-[rgba(0,200,83,0.12)]' },
  CLOSED_WON:    { label: '受注',       color: 'text-[#007A30]',  bg: 'bg-[rgba(0,200,83,0.16)]' },
  CLOSED_LOST:   { label: '失注',       color: 'text-[#AEAEB2]',  bg: 'bg-[rgba(0,0,0,0.06)]' },
}

type RankConfig = { gradient: string; glow: string; color: string }
const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
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

const STAGE_ORDER: DealStage[] = [
  'NEW_LEAD','QUALIFIED','FIRST_MEETING','SOLUTION_FIT',
  'PROPOSAL','NEGOTIATION','VERBAL_COMMIT','CLOSED_WON','CLOSED_LOST',
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

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="text-[#C7C7CC] ml-1 inline" />
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
  const [filterStalled, setFilterStalled] = useState(false)
  const [sortKey, setSortKey]           = useState<SortKey>('amount')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', company: '', contact: '', stage: 'NEW_LEAD' as DealStage,
    amount: '', probability: '20', expectedCloseAt: '',
  })

  function handleCreateSubmit() {
    if (!createForm.name.trim() || !createForm.company.trim()) return
    const today = new Date('2026-03-23')
    const newDeal: Deal = {
      id: `d-${Date.now()}`, name: createForm.name.trim(),
      company: createForm.company.trim(), contact: createForm.contact,
      owner: '田中太郎', rank: 'C', stage: createForm.stage,
      amount: parseInt(createForm.amount) || 0,
      probability: parseInt(createForm.probability) || 20,
      stalled: false, expectedCloseAt: createForm.expectedCloseAt || null,
      updatedAt: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
    }
    setDeals(prev => [newDeal, ...prev])
    setShowCreateModal(false)
    setCreateForm({ name: '', company: '', contact: '', stage: 'NEW_LEAD', amount: '', probability: '20', expectedCloseAt: '' })
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
    if (filterStalled) list = list.filter(d => d.stalled)

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')        cmp = a.name.localeCompare(b.name, 'ja')
      if (sortKey === 'amount')      cmp = a.amount - b.amount
      if (sortKey === 'probability') cmp = a.probability - b.probability
      if (sortKey === 'stage')       cmp = STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      if (sortKey === 'updatedAt')   cmp = a.updatedAt.localeCompare(b.updatedAt)
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [deals, search, filterStage, filterOwner, filterStalled, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const totalAmount = filtered.reduce((s, d) => s + d.amount, 0)
  const stalledCount = deals.filter(d => d.stalled).length
  const hasFilters = !!filterStage || !!filterOwner || filterStalled

  return (
    <div className="space-y-4">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-2xl flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
            <input
              type="text"
              placeholder="取引名・会社名・コンタクトで検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
            />
          </div>

          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value as DealStage | '')}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all ${
              filterStage ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]' : 'bg-white border-[rgba(0,0,0,0.09)] text-[#6E6E73] hover:border-[#C7C7CC]'
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
              filterOwner ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]' : 'bg-white border-[rgba(0,0,0,0.09)] text-[#6E6E73] hover:border-[#C7C7CC]'
            }`}
          >
            <option value="">担当者</option>
            {ALL_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <button
            onClick={() => setFilterStalled(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all ${
              filterStalled
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                : 'bg-white border-[rgba(0,0,0,0.09)] text-[#6E6E73] hover:border-[rgba(0,0,0,0.18)]'
            }`}
          >
            <AlertTriangle size={13} />
            停滞中のみ
            {stalledCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                filterStalled ? 'bg-[#DC2626] text-white' : 'bg-[#F3F4F6] text-[#6E6E73]'
              }`}>
                {stalledCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setFilterStage(''); setFilterOwner(''); setFilterStalled(false) }}
                className="flex items-center gap-1 text-xs text-[#6E6E73] hover:text-[#374151] whitespace-nowrap overflow-hidden transition-colors"
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
          <span className="text-sm font-semibold text-[#1D1D1F] tabular-nums">{formatAmount(totalAmount)}</span>
          <span className="text-xs text-[#AEAEB2]">パイプライン総額</span>
        </div>
        <span className="w-px h-3 bg-[rgba(0,0,0,0.07)]" />
        <span className="text-xs text-[#AEAEB2]">{filtered.length}件表示</span>
        {stalledCount > 0 && (
          <>
            <span className="w-px h-3 bg-[rgba(0,0,0,0.07)]" />
            <span className="flex items-center gap-1 text-xs text-[#FF3B30] font-medium">
              <AlertTriangle size={12} />
              停滞中 {stalledCount}件
            </span>
          </>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div className="grid grid-cols-[2.5fr_1.2fr_140px_100px_100px_80px_110px] gap-0 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.018)' }}>
          {[
            { label: '取引名',   key: 'name' as SortKey,        sortable: true },
            { label: '担当営業', key: null,                     sortable: false },
            { label: 'ステージ', key: 'stage' as SortKey,       sortable: true },
            { label: '金額',     key: 'amount' as SortKey,      sortable: true },
            { label: '確度',     key: 'probability' as SortKey, sortable: true },
            { label: '更新',     key: 'updatedAt' as SortKey,   sortable: true },
            { label: '',         key: null,                     sortable: false },
          ].map((col, i) => (
            <div
              key={i}
              className={`text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.06em] leading-none flex items-center ${
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
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <Briefcase size={22} className="text-[#C7C7CC]" />
              </div>
              <p className="text-sm text-[#6E6E73]">条件に一致する取引が見つかりません</p>
            </div>
          ) : (
            filtered.map(deal => {
              const stage = STAGE_CONFIG[deal.stage]
              const rank  = RANK_CONFIG[deal.rank]

              return (
                <motion.div
                  key={deal.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  onClick={() => router.push(`/deals/${deal.id}`)}
                  className="grid grid-cols-[2.5fr_1.2fr_140px_100px_100px_80px_110px] gap-0 items-center px-5 py-3.5 border-b border-[rgba(0,0,0,0.04)] last:border-0 transition-colors duration-100 group hover:bg-[rgba(0,0,0,0.02)] cursor-pointer"
                  style={deal.stalled ? {
                    background: 'linear-gradient(90deg, rgba(255,59,48,0.05) 0%, transparent 40%)',
                    borderLeft: '3px solid #FF3B30',
                  } : undefined}
                >
                  {/* 取引名 */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[7px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                      <Briefcase size={13} className="text-[#AEAEB2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {deal.stalled && (
                          <div className="relative flex shrink-0" style={{ width: 7, height: 7 }}>
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: '#FF3B30' }}
                              animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                            />
                            <div className="relative rounded-full" style={{ width: 7, height: 7, backgroundColor: '#FF3B30' }} />
                          </div>
                        )}
                        <p className="text-sm font-medium text-[#1D1D1F] truncate">{deal.company}</p>
                      </div>
                      <p className="text-[11px] text-[#AEAEB2] truncate">{deal.contact}</p>
                    </div>
                    <span
                      className="inline-flex items-center justify-center rounded-[5px] text-[10px] font-bold shrink-0"
                      style={{ width: 22, height: 22, background: rank.gradient, boxShadow: rank.glow, color: rank.color, letterSpacing: '0.03em' }}
                    >
                      {deal.rank}
                    </span>
                  </div>

                  {/* 担当者 */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}>
                      <span className="text-[9px] font-semibold text-white">{deal.owner[0]}</span>
                    </div>
                    <span className="text-sm text-[#374151] truncate">{deal.owner}</span>
                  </div>

                  {/* ステージ */}
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${stage.bg} ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>

                  {/* 金額 */}
                  <span className="text-sm font-semibold text-[#1D1D1F] tabular-nums">
                    {formatAmount(deal.amount)}
                  </span>

                  {/* 確度 */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-[7px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: getProbGradient(deal.probability) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${deal.probability}%` }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: getProbTextColor(deal.probability) }}>
                      {deal.probability}%
                    </span>
                  </div>

                  {/* 更新日 */}
                  <span className="text-sm text-[#6E6E73] tabular-nums">{formatDate(deal.updatedAt)}</span>

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
                className="bg-white rounded-[14px] w-full max-w-[480px] mx-4 pointer-events-auto"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <h2 className="text-[15px] font-semibold text-[#1D1D1F]">取引を追加</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[rgba(0,0,0,0.06)] transition-colors">
                    <X size={15} className="text-[#6E6E73]" />
                  </button>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">取引名 <span className="text-[#FF3B30]">*</span></label>
                    <input type="text" placeholder="株式会社テクノリード - 2026/03/23"
                      value={createForm.name}
                      onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">会社名 <span className="text-[#FF3B30]">*</span></label>
                    <input type="text" placeholder="株式会社テクノリード"
                      value={createForm.company}
                      onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">コンタクト</label>
                      <input type="text" placeholder="田中 誠"
                        value={createForm.contact}
                        onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">ステージ</label>
                      <select value={createForm.stage}
                        onChange={e => setCreateForm(f => ({ ...f, stage: e.target.value as DealStage }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      >
                        {STAGE_ORDER.filter(s => !['CLOSED_WON','CLOSED_LOST'].includes(s)).map(s => (
                          <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">見込み金額（円）</label>
                      <input type="number" placeholder="1200000"
                        value={createForm.amount}
                        onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.05em] block mb-1">想定クローズ日</label>
                      <input type="date"
                        value={createForm.expectedCloseAt}
                        onChange={e => setCreateForm(f => ({ ...f, expectedCloseAt: e.target.value }))}
                        className="w-full px-3 py-2 text-sm bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.09)] rounded-[8px] text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                  <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.05)] rounded-[8px] transition-all">
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
