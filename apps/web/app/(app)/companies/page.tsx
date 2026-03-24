'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Rank = 'A' | 'B' | 'C'
type SortKey = 'name' | 'score' | 'lastCallAt' | 'rank'
type SortDir = 'asc' | 'desc'

interface Company {
  id: string
  name: string
  domain: string
  rank: Rank
  score: number
  industry: string
  owner: string
  lastCallAt: string | null
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: '株式会社テクノリード',    domain: 'techno-lead.co.jp',     rank: 'A', score: 8.5, industry: 'IT・SaaS',    owner: '田中太郎', lastCallAt: '2026-03-20' },
  { id: '2', name: '合同会社フューチャー',    domain: 'future-llc.jp',          rank: 'A', score: 7.2, industry: '製造業',       owner: '鈴木花子', lastCallAt: '2026-03-19' },
  { id: '3', name: '株式会社イノベーション',  domain: 'innovation-corp.jp',     rank: 'A', score: 6.8, industry: 'コンサル',     owner: '田中太郎', lastCallAt: '2026-03-18' },
  { id: '4', name: '株式会社グロース',        domain: 'growth-inc.jp',          rank: 'B', score: 5.1, industry: 'HR・人材',    owner: '佐藤次郎', lastCallAt: '2026-03-15' },
  { id: '5', name: '有限会社サクセス',        domain: 'success-ltd.jp',         rank: 'B', score: 4.7, industry: '小売・EC',    owner: '鈴木花子', lastCallAt: '2026-03-14' },
  { id: '6', name: '株式会社ネクスト',        domain: 'next-company.jp',        rank: 'C', score: 3.2, industry: '不動産',       owner: '田中太郎', lastCallAt: '2026-03-10' },
  { id: '7', name: '合同会社ビジョン',        domain: 'vision-llc.jp',          rank: 'C', score: 2.9, industry: '広告・マーケ', owner: '佐藤次郎', lastCallAt: '2026-03-08' },
  { id: '8', name: '株式会社スタート',        domain: 'start-corp.jp',          rank: 'C', score: 1.5, industry: 'その他',       owner: '田中太郎', lastCallAt: null },
  { id: '9', name: '有限会社フォース',        domain: 'force-ltd.jp',           rank: 'C', score: 1.2, industry: '建設',         owner: '鈴木花子', lastCallAt: null },
  { id: '10', name: '株式会社アドバンス',     domain: 'advance-co.jp',          rank: 'C', score: 0.8, industry: '物流',         owner: '佐藤次郎', lastCallAt: null },
]

const INITIAL_COMPANIES = MOCK_COMPANIES

const ALL_INDUSTRIES = Array.from(new Set(MOCK_COMPANIES.map(c => c.industry)))
const ALL_OWNERS    = Array.from(new Set(MOCK_COMPANIES.map(c => c.owner)))
const ALL_RANKS: Rank[] = ['A', 'B', 'C']

const PAGE_SIZE = 8

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RankConfig = { gradient: string; glow: string; color: string }
const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
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

function ScoreBar({ score, rank }: { score: number; rank: Rank }) {
  const pct = (score / 10) * 100
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-[#1D1D1F] tabular-nums w-7 text-right">{score.toFixed(1)}</span>
      <div className="w-16 h-[7px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: RANK_CONFIG[rank].gradient }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={13} className="text-[#D1D5DB] ml-1 inline" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-[#0071E3] ml-1 inline" />
    : <ChevronDown size={13} className="text-[#0071E3] ml-1 inline" />
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.12 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-xs font-medium"
      style={{ background: 'rgba(0,113,227,0.1)', color: '#0071E3' }}
    >
      {label}
      <button onClick={onRemove} className="hover:text-[#0060C7] transition-colors ml-0.5">
        <X size={11} />
      </button>
    </motion.span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface CreateCompanyForm {
  name: string
  domain: string
  industry: string
  rank: Rank
  owner: string
}

const DEFAULT_CREATE_FORM: CreateCompanyForm = {
  name: '', domain: '', industry: '', rank: 'B', owner: '',
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [search, setSearch]         = useState('')
  const [filterRanks, setFilterRanks]       = useState<Rank[]>([])
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterOwner, setFilterOwner]       = useState('')
  const [sortKey, setSortKey]       = useState<SortKey>('score')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')
  const [page, setPage]             = useState(1)
  const [showRankFilter, setShowRankFilter] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateCompanyForm>(DEFAULT_CREATE_FORM)

  function handleCreateSubmit() {
    const newCompany: Company = {
      id: String(Date.now()),
      name: createForm.name.trim(),
      domain: createForm.domain.trim(),
      industry: createForm.industry || 'その他',
      rank: createForm.rank,
      score: 3.0,
      owner: createForm.owner.trim() || '未割当',
      lastCallAt: null,
    }
    setCompanies(prev => [newCompany, ...prev])
    setCreateForm(DEFAULT_CREATE_FORM)
    setShowCreateModal(false)
  }

  // ── Filter & Sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = companies

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q)
      )
    }
    if (filterRanks.length > 0) {
      list = list.filter(c => filterRanks.includes(c.rank))
    }
    if (filterIndustry) {
      list = list.filter(c => c.industry === filterIndustry)
    }
    if (filterOwner) {
      list = list.filter(c => c.owner === filterOwner)
    }

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')      cmp = a.name.localeCompare(b.name, 'ja')
      if (sortKey === 'score')     cmp = a.score - b.score
      if (sortKey === 'rank')      cmp = ALL_RANKS.indexOf(a.rank) - ALL_RANKS.indexOf(b.rank)
      if (sortKey === 'lastCallAt')
        cmp = (a.lastCallAt ?? '').localeCompare(b.lastCallAt ?? '')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [companies, search, filterRanks, filterIndustry, filterOwner, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  function toggleRank(r: Rank) {
    setFilterRanks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
    setPage(1)
  }

  const hasFilters = filterRanks.length > 0 || filterIndustry || filterOwner

  return (
    <div className="space-y-4">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="企業名・ドメインで検索..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] transition-shadow"
            />
          </div>

          {/* Rank filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRankFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all duration-150 ${
                filterRanks.length > 0
                  ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]'
              }`}
              style={filterRanks.length > 0 ? { background: 'rgba(0,113,227,0.08)' } : undefined}
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

          {/* Industry filter */}
          <select
            value={filterIndustry}
            onChange={e => { setFilterIndustry(e.target.value); setPage(1) }}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all duration-150 ${
              filterIndustry
                ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
            }`}
            style={filterIndustry ? { background: 'rgba(0,113,227,0.08)' } : undefined}
          >
            <option value="">業種</option>
            {ALL_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          {/* Owner filter */}
          <select
            value={filterOwner}
            onChange={e => { setFilterOwner(e.target.value); setPage(1) }}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all duration-150 ${
              filterOwner
                ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
            }`}
            style={filterOwner ? { background: 'rgba(0,113,227,0.08)' } : undefined}
          >
            <option value="">担当者</option>
            {ALL_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <motion.button
          whileHover={{ filter: 'brightness(1.05)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-[8px] shrink-0"
          style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)', boxShadow: '0 1px 3px rgba(0,113,227,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          企業を追加
        </motion.button>
      </div>

      {/* ── Active Filter Chips ── */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap items-center gap-1.5"
          >
            <span className="text-xs text-[#AEAEB2]">フィルター:</span>
            <AnimatePresence>
              {filterRanks.map(r => (
                <FilterChip key={r} label={`ランク ${r}`} onRemove={() => toggleRank(r)} />
              ))}
              {filterIndustry && (
                <FilterChip label={filterIndustry} onRemove={() => setFilterIndustry('')} />
              )}
              {filterOwner && (
                <FilterChip label={filterOwner} onRemove={() => setFilterOwner('')} />
              )}
            </AnimatePresence>
            <button
              onClick={() => { setFilterRanks([]); setFilterIndustry(''); setFilterOwner('') }}
              className="text-xs text-[#6E6E73] hover:text-[#1D1D1F] underline ml-1 transition-colors"
            >
              すべてクリア
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)' }}>

        {/* Header */}
        <div className="grid grid-cols-[2fr_1.5fr_80px_140px_1fr_1fr_80px_120px] gap-0 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(0,0,0,0.018)' }}>
          {[
            { label: '企業名', key: 'name' as SortKey, sortable: true },
            { label: 'ドメイン', key: null, sortable: false },
            { label: 'ランク', key: 'rank' as SortKey, sortable: true },
            { label: 'スコア', key: 'score' as SortKey, sortable: true },
            { label: '業種', key: null, sortable: false },
            { label: '担当者', key: null, sortable: false },
            { label: '最終コール', key: 'lastCallAt' as SortKey, sortable: true },
            { label: '', key: null, sortable: false },
          ].map((col, i) => (
            <div
              key={i}
              className={`text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.06em] leading-none ${col.sortable ? 'cursor-pointer hover:text-[#6E6E73] select-none transition-colors' : ''} flex items-center`}
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
          <AnimatePresence mode="wait">
            {paged.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                  <Building2 size={22} className="text-[#D1D5DB]" />
                </div>
                <p className="text-sm text-[#6B7280]">条件に一致する企業が見つかりません</p>
              </motion.div>
            ) : (
              paged.map((company) => (
                <motion.div
                  key={company.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  onClick={() => router.push(`/companies/${company.id}`)}
                  className="grid grid-cols-[2fr_1.5fr_80px_140px_1fr_1fr_80px_120px] gap-0 items-center px-5 py-3.5 last:border-0 hover:bg-[rgba(0,0,0,0.02)] transition-colors duration-100 group cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                >
                  {/* 企業名 */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}>
                      <Building2 size={13} className="text-[#9CA3AF]" />
                    </div>
                    <span className="text-sm font-medium text-[#1D1D1F] truncate">{company.name}</span>
                  </div>

                  {/* ドメイン */}
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-sm text-[#6E6E73] truncate">{company.domain}</span>
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={11} className="text-[#9CA3AF] hover:text-[#0071E3]" />
                    </a>
                  </div>

                  {/* ランク */}
                  <div>
                    <RankBadge rank={company.rank} />
                  </div>

                  {/* スコア */}
                  <div>
                    <ScoreBar score={company.score} rank={company.rank} />
                  </div>

                  {/* 業種 */}
                  <span className="text-sm text-[#6E6E73] truncate">{company.industry}</span>

                  {/* 担当者 */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}
                    >
                      <span className="text-[9px] font-semibold text-white">
                        {company.owner[0]}
                      </span>
                    </div>
                    <span className="text-sm text-[#374151] truncate">{company.owner}</span>
                  </div>

                  {/* 最終コール */}
                  <span className={`text-sm tabular-nums ${company.lastCallAt ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>
                    {formatDate(company.lastCallAt)}
                  </span>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-[#0071E3] hover:bg-[rgba(0,113,227,0.08)] px-3 py-1.5 rounded-[6px] transition-all duration-100">
                      詳細を見る
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#AEAEB2]">
          {filtered.length}件中 {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} 件を表示
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#6E6E73] hover:bg-[rgba(0,0,0,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-[6px] text-sm font-medium transition-colors duration-100 ${
                  p === page
                    ? 'bg-[#0071E3] text-white'
                    : 'text-[#6E6E73] hover:bg-[rgba(0,0,0,0.05)]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#6E6E73] hover:bg-[rgba(0,0,0,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Create Company Modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[16px] w-full max-w-[440px] overflow-hidden"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.02em]">企業を追加</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(0,0,0,0.06)]"
                >
                  <X size={14} className="text-[#6E6E73]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* 企業名 */}
                <div>
                  <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">
                    企業名 <span className="text-[#FF3B30]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="株式会社〇〇"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-[13px] bg-[#F5F5F7] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                  />
                </div>

                {/* ドメイン */}
                <div>
                  <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">ドメイン</label>
                  <input
                    type="text"
                    placeholder="example.co.jp"
                    value={createForm.domain}
                    onChange={e => setCreateForm(f => ({ ...f, domain: e.target.value }))}
                    className="w-full px-3 py-2 text-[13px] bg-[#F5F5F7] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                  />
                </div>

                {/* 業種 + ランク */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">業種</label>
                    <input
                      type="text"
                      placeholder="IT・SaaS"
                      value={createForm.industry}
                      onChange={e => setCreateForm(f => ({ ...f, industry: e.target.value }))}
                      className="w-full px-3 py-2 text-[13px] bg-[#F5F5F7] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">ランク</label>
                    <select
                      value={createForm.rank}
                      onChange={e => setCreateForm(f => ({ ...f, rank: e.target.value as Rank }))}
                      className="w-full px-3 py-2 text-[13px] bg-[#F5F5F7] rounded-[8px] text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* 担当者 */}
                <div>
                  <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">担当者</label>
                  <input
                    type="text"
                    placeholder="田中太郎"
                    value={createForm.owner}
                    onChange={e => setCreateForm(f => ({ ...f, owner: e.target.value }))}
                    className="w-full px-3 py-2 text-[13px] bg-[#F5F5F7] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] transition-all"
                >
                  キャンセル
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateSubmit}
                  disabled={!createForm.name.trim()}
                  className="px-4 py-2 text-[13px] font-semibold text-white rounded-[8px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)', boxShadow: '0 1px 3px rgba(0,113,227,0.3)' }}
                >
                  追加する
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
