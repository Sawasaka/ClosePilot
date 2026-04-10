'use client'

import { useState, useMemo, useEffect } from 'react'
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
  BarChart2,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Signal = 'Hot' | 'Middle' | 'Low'
type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E'
type SortKey = 'name' | 'score' | 'lastCallAt' | 'signal'
type SortDir = 'asc' | 'desc'

interface Company {
  id: string
  name: string
  domain: string
  signal: Signal
  score: number
  industry: string
  owner: string
  lastCallAt: string | null
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COMPANIES: Company[] = [
  { id: '1',  name: '株式会社テクノリード',    domain: 'techno-lead.co.jp',     signal: 'Hot',    score: 4.5, industry: 'IT・SaaS',    owner: '田中太郎', lastCallAt: '2026-03-20' },
  { id: '2',  name: '合同会社フューチャー',    domain: 'future-llc.jp',          signal: 'Hot',    score: 4.0, industry: '製造業',       owner: '鈴木花子', lastCallAt: '2026-03-19' },
  { id: '3',  name: '株式会社イノベーション',  domain: 'innovation-corp.jp',     signal: 'Hot',    score: 3.5, industry: 'コンサル',     owner: '田中太郎', lastCallAt: '2026-03-18' },
  { id: '4',  name: '株式会社グロース',        domain: 'growth-inc.jp',          signal: 'Middle', score: 3.0, industry: 'HR・人材',    owner: '佐藤次郎', lastCallAt: '2026-03-15' },
  { id: '5',  name: '有限会社サクセス',        domain: 'success-ltd.jp',         signal: 'Middle', score: 2.5, industry: '小売・EC',    owner: '鈴木花子', lastCallAt: '2026-03-14' },
  { id: '6',  name: '株式会社ネクスト',        domain: 'next-company.jp',        signal: 'Low',    score: 2.0, industry: '不動産',       owner: '田中太郎', lastCallAt: '2026-03-10' },
  { id: '7',  name: '合同会社ビジョン',        domain: 'vision-llc.jp',          signal: 'Low',    score: 1.5, industry: '広告・マーケ', owner: '佐藤次郎', lastCallAt: '2026-03-08' },
  { id: '8',  name: '株式会社スタート',        domain: 'start-corp.jp',          signal: 'Low',    score: 1.0, industry: 'その他',       owner: '田中太郎', lastCallAt: null },
  { id: '9',  name: '有限会社フォース',        domain: 'force-ltd.jp',           signal: 'Low',    score: 0.5, industry: '建設',         owner: '鈴木花子', lastCallAt: null },
  { id: '10', name: '株式会社アドバンス',      domain: 'advance-co.jp',          signal: 'Low',    score: 0.5, industry: '物流',         owner: '佐藤次郎', lastCallAt: null },
]

const INITIAL_COMPANIES = MOCK_COMPANIES

const ALL_INDUSTRIES = Array.from(new Set(MOCK_COMPANIES.map(c => c.industry)))
const ALL_OWNERS    = Array.from(new Set(MOCK_COMPANIES.map(c => c.owner)))
const ALL_SIGNALS: Signal[] = ['Hot', 'Middle', 'Low']

const PAGE_SIZE = 8

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIGNAL_CONFIG: Record<Signal, { bg: string; text: string; dot: string; label: string }> = {
  Hot:    { bg: 'rgba(255,59,48,0.1)',  text: '#CF3131', dot: '#FF3B30', label: 'Hot' },
  Middle: { bg: 'rgba(255,159,10,0.1)', text: '#C07000', dot: '#FF9F0A', label: 'Middle' },
  Low:    { bg: 'rgba(0,113,227,0.1)',  text: '#0060C7', dot: '#0071E3', label: 'Low' },
}

const SCORE_GRADE_CONFIG: Record<ScoreGrade, { color: string; bg: string }> = {
  A: { color: '#CF3131', bg: 'rgba(255,59,48,0.1)' },
  B: { color: '#C07000', bg: 'rgba(255,159,10,0.1)' },
  C: { color: '#5E5CE6', bg: 'rgba(94,92,230,0.1)' },
  D: { color: '#0060C7', bg: 'rgba(0,113,227,0.1)' },
  E: { color: '#8E8E93', bg: 'rgba(0,0,0,0.05)' },
}

function scoreToGrade(score: number): ScoreGrade {
  if (score >= 4.0) return 'A'
  if (score >= 3.0) return 'B'
  if (score >= 2.0) return 'C'
  if (score >= 1.0) return 'D'
  return 'E'
}

// アルゴリズム詳細のモックデータ
function getScoreBreakdown(score: number) {
  const total = score
  return [
    { label: 'Web行動スコア', value: +(total * 0.45).toFixed(1), max: 2.25, description: 'HP閲覧回数・滞在時間・料金ページ訪問' },
    { label: 'エンゲージメント', value: +(total * 0.3).toFixed(1), max: 1.5, description: 'メール開封率・資料閲覧・セミナー参加' },
    { label: 'タイミングスコア', value: +(total * 0.25).toFixed(1), max: 1.25, description: '問い合わせ時期・予算策定期・決算月' },
  ]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function SignalBadge({ signal }: { signal: Signal }) {
  const s = SIGNAL_CONFIG[signal]
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: s.bg, color: s.text }}>
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  )
}

function ScoreDisplay({ score, companyName }: { score: number; companyName: string }) {
  const [showDetail, setShowDetail] = useState(false)
  const grade = scoreToGrade(score)
  const cfg = SCORE_GRADE_CONFIG[grade]
  const breakdown = getScoreBreakdown(score)

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setShowDetail(!showDetail) }}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[5px] text-[11px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
          {grade}
        </span>
        <span className="text-[13px] font-semibold tabular-nums text-[#1D1D1F]">{score.toFixed(1)}</span>
      </button>

      <AnimatePresence>
        {showDetail && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDetail(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-[32px] z-50 w-[300px] rounded-[12px] p-4 bg-white"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.14)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-semibold text-[#1D1D1F]">スコア詳細</p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[4px] text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>{grade}</span>
                  <span className="text-[15px] font-bold tabular-nums" style={{ color: cfg.color }}>{score.toFixed(1)}</span>
                  <span className="text-[11px] text-[#AEAEB2]">/ 5.0</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {breakdown.map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-[#6E6E73]">{item.label}</span>
                      <span className="text-[11px] font-semibold tabular-nums text-[#1D1D1F]">{item.value}</span>
                    </div>
                    <p className="text-[10px] text-[#AEAEB2] mb-1">{item.description}</p>
                    <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(item.value / item.max) * 100}%`, background: cfg.color, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#AEAEB2] mt-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                スコアは上記5要素の重み付けで自動算出されます
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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

type CompanyCategory = 'パートナー企業' | 'ダイレクト企業'

interface CreateCompanyForm {
  name: string
  domain: string
  industry: string
  signal: Signal
  owner: string
  category: CompanyCategory
}

const DEFAULT_CREATE_FORM: CreateCompanyForm = {
  name: '', domain: '', industry: '', signal: 'Middle', owner: '', category: 'ダイレクト企業',
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [search, setSearch]         = useState('')
  const [filterSignals, setFilterSignals]   = useState<Signal[]>([])
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterOwner, setFilterOwner]       = useState('')
  const [sortKey, setSortKey]       = useState<SortKey>('score')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')
  const [page, setPage]             = useState(1)
  const [showSignalFilter, setShowSignalFilter] = useState(false)
  const [showScoreLogic, setShowScoreLogic] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateCompanyForm>(DEFAULT_CREATE_FORM)

  useEffect(() => {
    const handler = () => setShowCreateModal(true)
    window.addEventListener('header-action', handler)
    return () => window.removeEventListener('header-action', handler)
  }, [])

  function handleCreateSubmit() {
    const newCompany: Company = {
      id: String(Date.now()),
      name: createForm.name.trim(),
      domain: createForm.domain.trim(),
      industry: createForm.industry || 'その他',
      signal: createForm.signal,
      score: 2.0,
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
    if (filterSignals.length > 0) {
      list = list.filter(c => filterSignals.includes(c.signal))
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
      if (sortKey === 'signal')    cmp = ALL_SIGNALS.indexOf(a.signal) - ALL_SIGNALS.indexOf(b.signal)
      if (sortKey === 'lastCallAt')
        cmp = (a.lastCallAt ?? '').localeCompare(b.lastCallAt ?? '')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [companies, search, filterSignals, filterIndustry, filterOwner, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  function toggleSignal(s: Signal) {
    setFilterSignals(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    setPage(1)
  }

  const hasFilters = filterSignals.length > 0 || filterIndustry || filterOwner

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

          {/* Signal filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSignalFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all duration-150 ${
                filterSignals.length > 0
                  ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]'
              }`}
              style={filterSignals.length > 0 ? { background: 'rgba(0,113,227,0.08)' } : undefined}
            >
              シグナル
              {filterSignals.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] flex items-center justify-center font-bold">
                  {filterSignals.length}
                </span>
              )}
              <ChevronDown size={13} />
            </button>
            <AnimatePresence>
              {showSignalFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 bg-white rounded-[10px] p-2 flex flex-col gap-0.5 min-w-[120px]"
                  style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.10), 0 16px 48px rgba(0,0,0,0.08)' }}
                >
                  {ALL_SIGNALS.map(s => {
                    const cfg = SIGNAL_CONFIG[s]
                    const active = filterSignals.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSignal(s)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                          active ? '' : 'hover:bg-[rgba(0,0,0,0.04)] text-[#3C3C43]'
                        }`}
                        style={active ? { background: cfg.bg, color: cfg.text } : undefined}
                      >
                        <span className="w-[6px] h-[6px] rounded-full" style={{ background: cfg.dot }} />
                        {s}
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

      {/* ── Scoring Logic Panel ── */}
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)' }}>
        <button
          onClick={() => setShowScoreLogic(!showScoreLogic)}
          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[rgba(0,0,0,0.015)] transition-colors"
        >
          <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center" style={{ background: 'rgba(94,92,230,0.1)' }}>
            <BarChart2 size={13} style={{ color: '#5E5CE6' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-semibold text-[#1D1D1F]">スコアリングロジック</p>
            <p className="text-[11px] text-[#8E8E93]">スコアの算出方法と各要素の重み付けを確認</p>
          </div>
          <motion.div animate={{ rotate: showScoreLogic ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} style={{ color: '#AEAEB2' }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showScoreLogic && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                {/* Grade scale */}
                <div className="flex items-center gap-3 py-3 mb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span className="text-[11px] text-[#8E8E93]">グレード:</span>
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(g => {
                    const cfg = SCORE_GRADE_CONFIG[g]
                    const range = g === 'A' ? '4.0-5.0' : g === 'B' ? '3.0-3.9' : g === 'C' ? '2.0-2.9' : g === 'D' ? '1.0-1.9' : '0-0.9'
                    return (
                      <div key={g} className="flex items-center gap-1">
                        <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] text-[10px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>{g}</span>
                        <span className="text-[10px] text-[#AEAEB2] tabular-nums">{range}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Algorithm breakdown */}
                <div className="space-y-3">
                  {[
                    { label: 'Web行動スコア', weight: '45%', color: '#FF3B30', description: 'HP閲覧回数・滞在時間・料金ページ訪問・資料ダウンロード回数から算出。直近7日間の行動を重み付け。' },
                    { label: 'エンゲージメント', weight: '30%', color: '#5E5CE6', description: 'メール開封率・クリック率・資料閲覧深度・セミナー参加履歴。過去30日間のインタラクション頻度。' },
                    { label: 'タイミングスコア', weight: '25%', color: '#0071E3', description: '問い合わせ時期・予算策定期（決算月の3ヶ月前）・年度切り替え時期を考慮した購買タイミング推定。' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-[6px] h-[6px] rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#1D1D1F]">{item.label}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ background: `${item.color}14`, color: item.color }}>{item.weight}</span>
                        </div>
                        <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-[#AEAEB2] mt-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  各要素は0〜5.0の範囲で算出され、重み付けにより最終スコア（5.0満点）が決定されます。スコアは日次で自動更新されます。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              {filterSignals.map(s => (
                <FilterChip key={s} label={s} onRemove={() => toggleSignal(s)} />
              ))}
              {filterIndustry && (
                <FilterChip label={filterIndustry} onRemove={() => setFilterIndustry('')} />
              )}
              {filterOwner && (
                <FilterChip label={filterOwner} onRemove={() => setFilterOwner('')} />
              )}
            </AnimatePresence>
            <button
              onClick={() => { setFilterSignals([]); setFilterIndustry(''); setFilterOwner('') }}
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
            { label: 'シグナル', key: 'signal' as SortKey, sortable: true },
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

                  {/* シグナル */}
                  <div>
                    <SignalBadge signal={company.signal} />
                  </div>

                  {/* スコア */}
                  <div>
                    <ScoreDisplay score={company.score} companyName={company.name} />
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
                <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.02em]">企業を作成</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(0,0,0,0.06)]"
                >
                  <X size={14} className="text-[#6E6E73]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* 区分 */}
                <div>
                  <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">区分 <span className="text-[#FF3B30]">*</span></label>
                  <div className="flex gap-2">
                    {(['パートナー企業', 'ダイレクト企業'] as CompanyCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCreateForm(f => ({ ...f, category: cat }))}
                        className="flex-1 h-[36px] text-[13px] font-medium rounded-[8px] transition-all"
                        style={{
                          background: createForm.category === cat ? '#1D1D1F' : '#F5F5F7',
                          color: createForm.category === cat ? '#FFFFFF' : '#6E6E73',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

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
                    <label className="block text-[12px] font-medium text-[#3C3C43] mb-1.5">シグナル</label>
                    <select
                      value={createForm.signal}
                      onChange={e => setCreateForm(f => ({ ...f, signal: e.target.value as Signal }))}
                      className="w-full px-3 py-2 text-[13px] bg-[#F5F5F7] rounded-[8px] text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {ALL_SIGNALS.map(s => <option key={s} value={s}>{s}</option>)}
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
