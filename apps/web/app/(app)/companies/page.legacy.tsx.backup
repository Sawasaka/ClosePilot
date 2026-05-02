'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  X,
  List,
  Check,
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

const INITIAL_COMPANIES: Company[] = []

const ALL_INDUSTRIES = Array.from(new Set(MOCK_COMPANIES.map(c => c.industry)))
const ALL_OWNERS    = Array.from(new Set(MOCK_COMPANIES.map(c => c.owner)))
const ALL_SIGNALS: Signal[] = ['Hot', 'Middle', 'Low']

const PAGE_SIZE = 100

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface SignalGameStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
  label: string
}

const SIGNAL_CONFIG: Record<Signal, SignalGameStyle> = {
  Hot: {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#FFE4D9',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(120,0,0,0.6)',
    label: 'Hot',
  },
  Middle: {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00',
    dotColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
    label: 'Middle',
  },
  Low: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#E0F4FF',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(0,40,90,0.6)',
    label: 'Low',
  },
}

const SCORE_GRADE_CONFIG: Record<ScoreGrade, { color: string; bg: string; gradient: string; glow: string; barColor: string }> = {
  A: {
    color: '#FFFFFF',
    bg: 'rgba(255,59,48,0.25)',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 16px rgba(255,75,40,0.85), 0 0 6px rgba(255,180,80,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    barColor: '#FF6B35',
  },
  B: {
    color: '#7B2D00',
    bg: 'rgba(255,214,10,0.28)',
    gradient: 'linear-gradient(135deg, #FFF080 0%, #FFE040 30%, #FFD60A 60%, #FF9F0A 100%)',
    glow: '0 0 16px rgba(255,214,10,0.85), 0 0 6px rgba(255,240,128,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    barColor: '#FFD60A',
  },
  C: {
    color: '#FFFFFF',
    bg: 'rgba(139,92,246,0.28)',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 16px rgba(139,92,246,0.85), 0 0 6px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    barColor: '#A78BFA',
  },
  D: {
    color: '#FFFFFF',
    bg: 'rgba(50,173,230,0.28)',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 16px rgba(50,173,230,0.85), 0 0 6px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    barColor: '#5AC8FA',
  },
  E: {
    color: '#FFFFFF',
    bg: 'rgba(142,142,147,0.25)',
    gradient: 'linear-gradient(135deg, #C7C7CC 0%, #AEAEB2 35%, #8E8E93 70%, #636366 100%)',
    glow: '0 0 12px rgba(142,142,147,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
    barColor: '#AEAEB2',
  },
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

function ScoreDisplay({ score }: { score: number }) {
  const [showDetail, setShowDetail] = useState(false)
  const grade = scoreToGrade(score)
  const cfg = SCORE_GRADE_CONFIG[grade]
  const breakdown = getScoreBreakdown(score)

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setShowDetail(!showDetail) }}
        className="flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <span
          className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[6px] text-[12px] font-black"
          style={{
            background: cfg.gradient,
            color: cfg.color,
            boxShadow: cfg.glow,
            border: '1px solid rgba(255,255,255,0.25)',
            textShadow: cfg.color === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
            letterSpacing: '0.04em',
          }}
        >
          {grade}
        </span>
        <span
          className="text-[14px] font-bold tabular-nums"
          style={{
            color: '#FFFFFF',
            textShadow: `0 0 8px ${cfg.barColor}99, 0 0 2px ${cfg.barColor}`,
          }}
        >
          {score.toFixed(1)}
        </span>
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
              className="absolute left-0 top-[36px] z-50 w-[300px] rounded-[8px] p-4 bg-[#0c1028]"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px #2244AA' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-semibold text-[#EEEEFF]">インテント詳細</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[5px] text-[11px] font-black"
                    style={{
                      background: cfg.gradient,
                      color: cfg.color,
                      boxShadow: cfg.glow,
                      border: '1px solid rgba(255,255,255,0.25)',
                      textShadow: cfg.color === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                    }}
                  >
                    {grade}
                  </span>
                  <span
                    className="text-[16px] font-black tabular-nums"
                    style={{
                      color: '#FFFFFF',
                      textShadow: `0 0 8px ${cfg.barColor}99, 0 0 2px ${cfg.barColor}`,
                    }}
                  >
                    {score.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-[#99AACC]">/ 5.0</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {breakdown.map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-[#CCDDF0]">{item.label}</span>
                      <span className="text-[11px] font-semibold tabular-nums text-[#EEEEFF]">{item.value}</span>
                    </div>
                    <p className="text-[10px] text-[#99AACC] mb-1">{item.description}</p>
                    <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(136,187,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(item.value / item.max) * 100}%`, background: cfg.gradient, boxShadow: `0 0 6px ${cfg.barColor}80`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#99AACC] mt-3 pt-2" style={{ borderTop: '1px solid rgba(34,68,170,0.2)' }}>
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
  if (col !== sortKey) return <ArrowUpDown size={13} className="text-[#88BBFF] ml-1 inline" />
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
      <button onClick={onRemove} className="hover:text-[#7AB4FF] transition-colors ml-0.5">
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
  const searchParams = useSearchParams()
  const isListCreateMode = searchParams?.get('mode') === 'list-create'

  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch]         = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showListModal, setShowListModal] = useState(false)
  const [listForm, setListForm] = useState({ name: '', description: '', owner: '田中太郎' })
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [sortKey, setSortKey]       = useState<SortKey>('score')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')
  const [page, setPage]             = useState(1)
  const [showScoreLogic, setShowScoreLogic] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateCompanyForm>(DEFAULT_CREATE_FORM)

  useEffect(() => {
    const handler = () => setShowCreateModal(true)
    window.addEventListener('header-action', handler)
    return () => window.removeEventListener('header-action', handler)
  }, [])

  // 企業マスター (4,071社) を API から取得して Company 型にマッピング
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/company-master?take=5000')
        if (!res.ok) {
          if (!cancelled) setIsLoading(false)
          return
        }
        const json = (await res.json()) as {
          data: Array<{
            id: string
            name: string
            websiteUrl: string | null
            prefecture: string
            industry: { name: string } | null
            companyIntents: Array<{
              intentLevel: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE'
              signalCount: number
              latestSignalAt: string | null
            }>
          }>
        }
        const mapped: Company[] = json.data.map((c) => {
          const topIntent = c.companyIntents[0]
          const signal: Signal =
            topIntent?.intentLevel === 'HOT'
              ? 'Hot'
              : topIntent?.intentLevel === 'MIDDLE'
                ? 'Middle'
                : 'Low'
          const score =
            topIntent?.intentLevel === 'HOT'
              ? 4.5
              : topIntent?.intentLevel === 'MIDDLE'
                ? 3.0
                : topIntent?.intentLevel === 'LOW'
                  ? 1.5
                  : 0.5
          let domain = ''
          if (c.websiteUrl) {
            try {
              const u = new URL(c.websiteUrl.startsWith('http') ? c.websiteUrl : `https://${c.websiteUrl}`)
              domain = u.hostname.replace(/^www\./, '')
            } catch {
              domain = c.websiteUrl
            }
          }
          return {
            id: c.id,
            name: c.name,
            domain,
            signal,
            score,
            industry: c.industry?.name ?? 'その他',
            owner: '未割当',
            lastCallAt: topIntent?.latestSignalAt ?? null,
          }
        })
        if (!cancelled) {
          setCompanies(mapped)
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
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
    if (filterIndustry) {
      list = list.filter(c => c.industry === filterIndustry)
    }
    if (filterGrade) {
      list = list.filter(c => scoreToGrade(c.score) === filterGrade)
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
  }, [companies, search, filterIndustry, filterGrade, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const hasFilters = !!filterIndustry || !!filterGrade

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(visibleIds: string[]) {
    const allSelected = visibleIds.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        visibleIds.forEach(id => next.delete(id))
      } else {
        visibleIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  return (
    <div className="space-y-4">

      {/* ── List Create Mode Banner ── */}
      {isListCreateMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[8px] px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, rgba(34,68,170,0.18) 0%, rgba(26,51,136,0.12) 100%)',
            border: '1px solid #3355CC',
            boxShadow: '0 0 16px rgba(34,68,170,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(136,187,255,0.12)', border: '1px solid #3355CC' }}>
              <List size={14} style={{ color: '#88BBFF' }} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#EEEEFF]">ISリスト作成モード</p>
              <p className="text-[11px] text-[#CCDDF0] mt-0.5">リストに追加する企業を選択してください</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#88BBFF]">
              <span className="text-[16px] font-bold tabular-nums">{selectedIds.size}</span> 社選択中
            </span>
            <button
              onClick={() => toggleSelectAll(filtered.map(c => c.id))}
              className="px-3 py-1.5 text-[11px] font-medium rounded-[5px] transition-colors"
              style={{ background: 'rgba(136,187,255,0.08)', border: '1px solid #2244AA', color: '#88BBFF' }}
            >
              {filtered.every(c => selectedIds.has(c.id)) && filtered.length > 0 ? '全選択を解除' : `全${filtered.length}社を選択`}
            </button>
            <div className="w-px h-5" style={{ background: '#2244AA' }} />
            <button
              onClick={() => { setSelectedIds(new Set()); router.push('/companies') }}
              className="text-[11px] text-[#CCDDF0] hover:text-[#EEEEFF] transition-colors"
            >
              キャンセル
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={() => setShowListModal(true)}
              className="px-4 py-2 text-[12px] font-semibold rounded-[6px] transition-all"
              style={{
                background: selectedIds.size > 0 ? 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)' : 'rgba(34,68,170,0.2)',
                border: selectedIds.size > 0 ? '1px solid #3355CC' : '1px solid transparent',
                color: selectedIds.size > 0 ? '#FFFFFF' : '#4466AA',
                cursor: selectedIds.size > 0 ? 'pointer' : 'default',
              }}
            >
              リストを作成 →
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCDDF0]" />
            <input
              type="text"
              placeholder="企業名・ドメインで検索..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0c1028] border border-[#2244AA] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-1 focus:ring-[#0071E3] focus:border-[#0071E3] transition-shadow"
            />
          </div>

          {/* インテント(スコアグレード)絞り込み */}
          <select
            value={filterGrade}
            onChange={e => { setFilterGrade(e.target.value); setPage(1) }}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all duration-150 ${
              filterGrade
                ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#D1D5DB]'
            }`}
            style={filterGrade ? { background: 'rgba(0,113,227,0.08)' } : undefined}
          >
            <option value="">インテント</option>
            <option value="A">A (4.0以上)</option>
            <option value="B">B (3.0以上)</option>
            <option value="C">C (2.0以上)</option>
            <option value="D">D (1.0以上)</option>
            <option value="E">E (0以上)</option>
          </select>

          {/* Industry filter */}
          <select
            value={filterIndustry}
            onChange={e => { setFilterIndustry(e.target.value); setPage(1) }}
            className={`px-3 py-2 text-sm rounded-[8px] border appearance-none cursor-pointer transition-all duration-150 ${
              filterIndustry
                ? 'border-[rgba(0,113,227,0.3)] text-[#0071E3]'
                : 'bg-[#0c1028] border-[#2244AA] text-[#CCDDF0] hover:border-[#D1D5DB]'
            }`}
            style={filterIndustry ? { background: 'rgba(0,113,227,0.08)' } : undefined}
          >
            <option value="">業種</option>
            {ALL_INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isListCreateMode && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={() => router.push('/companies?mode=list-create')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[8px]"
              style={{
                background: 'rgba(136,187,255,0.06)',
                border: '1px solid #2244AA',
                color: '#88BBFF',
              }}
            >
              <List size={14} strokeWidth={2.5} />
              ISリスト作成
            </motion.button>
          )}
          <motion.button
            whileHover={{ filter: 'brightness(1.05)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-[8px]"
            style={{
              background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
              border: '1px solid #3355CC',
              boxShadow: '0 2px 8px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.15)',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            企業を追加
          </motion.button>
        </div>
      </div>

      {/* ── Scoring Logic Panel ── */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
        <button
          onClick={() => setShowScoreLogic(!showScoreLogic)}
          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[rgba(136,187,255,0.04)] transition-colors"
        >
          <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center" style={{ background: 'rgba(94,92,230,0.1)' }}>
            <BarChart2 size={13} style={{ color: '#5E5CE6' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-semibold text-[#EEEEFF]">インテント算出ロジック</p>
            <p className="text-[11px] text-[#CCDDF0]">インテントスコアの算出方法と各要素の重み付けを確認</p>
          </div>
          <motion.div animate={{ rotate: showScoreLogic ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} style={{ color: '#99AACC' }} />
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
              <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(34,68,170,0.2)' }}>
                {/* Grade scale */}
                <div className="flex items-center gap-3 py-3 mb-3" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
                  <span className="text-[11px] text-[#CCDDF0]">グレード:</span>
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(g => {
                    const cfg = SCORE_GRADE_CONFIG[g]
                    const range = g === 'A' ? '4.0-5.0' : g === 'B' ? '3.0-3.9' : g === 'C' ? '2.0-2.9' : g === 'D' ? '1.0-1.9' : '0-0.9'
                    return (
                      <div key={g} className="flex items-center gap-1">
                        <span
                          className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[5px] text-[10px] font-black"
                          style={{
                            background: cfg.gradient,
                            color: cfg.color,
                            boxShadow: cfg.glow,
                            border: '1px solid rgba(255,255,255,0.25)',
                            textShadow: cfg.color === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                          }}
                        >
                          {g}
                        </span>
                        <span className="text-[10px] text-[#99AACC] tabular-nums">{range}</span>
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
                          <span className="text-[12px] font-semibold text-[#EEEEFF]">{item.label}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ background: `${item.color}14`, color: item.color }}>{item.weight}</span>
                        </div>
                        <p className="text-[11px] text-[#CCDDF0] mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-[#99AACC] mt-3 pt-2" style={{ borderTop: '1px solid rgba(34,68,170,0.2)' }}>
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
            <span className="text-xs text-[#99AACC]">フィルター:</span>
            <AnimatePresence>
              {filterGrade && (
                <FilterChip label={`インテント ${filterGrade}`} onRemove={() => setFilterGrade('')} />
              )}
              {filterIndustry && (
                <FilterChip label={filterIndustry} onRemove={() => setFilterIndustry('')} />
              )}
            </AnimatePresence>
            <button
              onClick={() => { setFilterIndustry(''); setFilterGrade('') }}
              className="text-xs text-[#CCDDF0] hover:text-[#EEEEFF] underline ml-1 transition-colors"
            >
              すべてクリア
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>

        {/* Header */}
        <div className="grid grid-cols-[300px_120px_1fr_140px_120px] gap-x-3 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)', background: 'rgba(16,24,56,0.6)' }}>
          <div className="flex items-center gap-2.5">
            {isListCreateMode && (() => {
              const visibleIds = paged.map(c => c.id)
              const allChecked = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id))
              const someChecked = visibleIds.some(id => selectedIds.has(id))
              return (
                <button
                  onClick={() => toggleSelectAll(visibleIds)}
                  className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: allChecked ? 'linear-gradient(180deg, #2244AA, #1a3388)' : 'rgba(16,16,40,0.6)',
                    border: allChecked || someChecked ? '1px solid #5577DD' : '1px solid #2244AA',
                    boxShadow: allChecked ? '0 0 8px rgba(85,119,221,0.4)' : 'none',
                  }}
                >
                  {allChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                  {!allChecked && someChecked && <div className="w-2 h-[2px] bg-[#88BBFF] rounded-full" />}
                </button>
              )
            })()}
            <div
              className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.06em] leading-none cursor-pointer hover:text-[#CCDDF0] select-none transition-colors flex items-center"
              onClick={() => toggleSort('name')}
            >
              企業名
              <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
            </div>
          </div>
          {[
            { label: 'インテント', key: 'score' as SortKey, sortable: true },
            { label: '', key: null, sortable: false },
            { label: '業種', key: null, sortable: false },
            { label: '', key: null, sortable: false },
          ].map((col, i) => (
            <div
              key={i}
              className={`text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.06em] leading-none ${col.sortable ? 'cursor-pointer hover:text-[#CCDDF0] select-none transition-colors' : ''} flex items-center`}
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
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[rgba(136,187,255,0.2)] border-t-[#88BBFF] animate-spin" />
                <p className="text-sm text-[#99AACC]">企業データを読み込み中…</p>
              </motion.div>
            ) : paged.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-[rgba(34,68,170,0.1)] flex items-center justify-center">
                  <Building2 size={22} className="text-[#88BBFF]" />
                </div>
                <p className="text-sm text-[#CCDDF0]">条件に一致する企業が見つかりません</p>
              </motion.div>
            ) : (
              paged.map((company) => {
                const isSelected = selectedIds.has(company.id)
                return (
                <motion.div
                  key={company.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  onClick={() => isListCreateMode ? toggleSelect(company.id) : router.push(`/companies/${company.id}`)}
                  onMouseEnter={() => { if (!isListCreateMode) router.prefetch(`/companies/${company.id}`) }}
                  className="grid grid-cols-[300px_120px_1fr_140px_120px] gap-x-3 items-center px-5 py-3.5 last:border-0 transition-colors duration-100 group cursor-pointer"
                  style={{
                    borderBottom: '1px solid rgba(34,68,170,0.15)',
                    background: isListCreateMode && isSelected ? 'rgba(34,68,170,0.15)' : undefined,
                  }}
                >
                  {/* 企業名 */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isListCreateMode && (
                      <div
                        className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: isSelected ? 'linear-gradient(180deg, #2244AA, #1a3388)' : 'rgba(16,16,40,0.6)',
                          border: isSelected ? '1px solid #5577DD' : '1px solid #2244AA',
                          boxShadow: isSelected ? '0 0 8px rgba(85,119,221,0.4)' : 'none',
                        }}
                      >
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    )}
                    <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: 'rgba(136,187,255,0.10)', border: '1px solid rgba(136,187,255,0.15)' }}>
                      <Building2 size={13} className="text-[#88BBFF]" />
                    </div>
                    <span className="text-sm font-medium text-[#EEEEFF] truncate">{company.name}</span>
                  </div>

                  {/* インテント (スコア) */}
                  <div>
                    <ScoreDisplay score={company.score} />
                  </div>

                  {/* スペーサー */}
                  <div />

                  {/* 業種 */}
                  <span className="text-sm text-[#CCDDF0] truncate">{company.industry}</span>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-[#88BBFF] hover:bg-[rgba(136,187,255,0.10)] px-3 py-1.5 rounded-[6px] transition-all duration-100">
                      詳細を見る
                    </button>
                  </div>
                </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#99AACC]">
          {filtered.length}件中 {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} 件を表示
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#CCDDF0] hover:bg-[rgba(136,187,255,0.06)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            {(() => {
              // 省略付きページネーション: 先頭/末尾/現在±2 だけ出す
              const items: Array<number | 'ellipsis-left' | 'ellipsis-right'> = []
              const siblings = 2
              const showLeft = page - siblings > 2
              const showRight = page + siblings < totalPages - 1
              items.push(1)
              if (showLeft) items.push('ellipsis-left')
              const start = Math.max(2, page - siblings)
              const end = Math.min(totalPages - 1, page + siblings)
              for (let p = start; p <= end; p++) items.push(p)
              if (showRight) items.push('ellipsis-right')
              if (totalPages > 1) items.push(totalPages)
              return items.map((item, idx) => {
                if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                  return (
                    <span
                      key={`${item}-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-[#99AACC] text-sm select-none"
                    >
                      …
                    </span>
                  )
                }
                return (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-8 h-8 flex items-center justify-center rounded-[6px] text-sm font-medium transition-colors duration-100 ${
                      item === page
                        ? 'bg-[#0071E3] text-white'
                        : 'text-[#CCDDF0] hover:bg-[rgba(136,187,255,0.06)]'
                    }`}
                  >
                    {item}
                  </button>
                )
              })
            })()}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#CCDDF0] hover:bg-[rgba(136,187,255,0.06)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── ISリスト作成モーダル ── */}
      <AnimatePresence>
        {showListModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowListModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="rounded-[12px] w-full max-w-[440px] overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)', border: '1px solid #2244AA', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4" style={{ borderBottom: '1px solid #2244AA' }}>
                <h2 className="text-[15px] font-bold text-[#EEEEFF]">ISリストを作成</h2>
                <p className="text-[11px] text-[#CCDDF0] mt-1">{selectedIds.size} 社の企業をリストに追加します</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#99AACC] uppercase tracking-[0.06em] mb-1.5">リスト名</label>
                  <input
                    type="text" value={listForm.name}
                    onChange={e => setListForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="例: Hot企業フォローリスト"
                    className="w-full h-[36px] px-3 text-[13px] rounded-[6px] outline-none"
                    style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA', color: '#EEEEFF' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#99AACC] uppercase tracking-[0.06em] mb-1.5">説明（任意）</label>
                  <input
                    type="text" value={listForm.description}
                    onChange={e => setListForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="リストの目的"
                    className="w-full h-[36px] px-3 text-[13px] rounded-[6px] outline-none"
                    style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA', color: '#EEEEFF' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#99AACC] uppercase tracking-[0.06em] mb-1.5">担当者</label>
                  <select
                    value={listForm.owner}
                    onChange={e => setListForm(f => ({ ...f, owner: e.target.value }))}
                    className="w-full h-[36px] px-3 text-[13px] rounded-[6px] outline-none cursor-pointer"
                    style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA', color: '#EEEEFF' }}
                  >
                    <option value="田中太郎">田中太郎</option>
                    <option value="鈴木花子">鈴木花子</option>
                    <option value="佐藤次郎">佐藤次郎</option>
                  </select>
                </div>
              </div>
              <div className="px-5 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #2244AA' }}>
                <button
                  onClick={() => setShowListModal(false)}
                  className="px-4 py-2 text-[12px] font-medium rounded-[6px]"
                  style={{ background: 'rgba(136,187,255,0.06)', color: '#88BBFF', border: '1px solid #2244AA' }}
                >
                  キャンセル
                </button>
                <button
                  disabled={!listForm.name.trim()}
                  onClick={() => {
                    setShowListModal(false)
                    setSelectedIds(new Set())
                    router.push('/lists')
                  }}
                  className="px-5 py-2 text-[12px] font-bold rounded-[6px]"
                  style={{
                    background: listForm.name.trim() ? 'linear-gradient(180deg, #2244AA, #1a3388)' : 'rgba(34,68,170,0.2)',
                    border: listForm.name.trim() ? '1px solid #3355CC' : '1px solid transparent',
                    color: listForm.name.trim() ? '#FFFFFF' : '#4466AA',
                    cursor: listForm.name.trim() ? 'pointer' : 'default',
                  }}
                >
                  リストを作成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-[#0c1028] rounded-[16px] w-full max-w-[440px] overflow-hidden"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2244AA' }}>
                <h2 className="text-[15px] font-semibold text-[#EEEEFF] tracking-[-0.02em]">企業を作成</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(136,187,255,0.06)]"
                >
                  <X size={14} className="text-[#CCDDF0]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* 区分 */}
                <div>
                  <label className="block text-[12px] font-medium text-[#CCDDF0] mb-1.5">区分 <span className="text-[#FF3B30]">*</span></label>
                  <div className="flex gap-2">
                    {(['パートナー企業', 'ダイレクト企業'] as CompanyCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCreateForm(f => ({ ...f, category: cat }))}
                        className="flex-1 h-[36px] text-[13px] font-medium rounded-[8px] transition-all"
                        style={{
                          background: createForm.category === cat ? '#2244AA' : 'rgba(136,187,255,0.06)',
                          color: createForm.category === cat ? '#FFFFFF' : '#88BBFF',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 企業名 */}
                <div>
                  <label className="block text-[12px] font-medium text-[#CCDDF0] mb-1.5">
                    企業名 <span className="text-[#FF3B30]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="株式会社〇〇"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-[13px] bg-[rgba(34,68,170,0.1)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-[#0c1028] transition-all"
                  />
                </div>

                {/* ドメイン */}
                <div>
                  <label className="block text-[12px] font-medium text-[#CCDDF0] mb-1.5">ドメイン</label>
                  <input
                    type="text"
                    placeholder="example.co.jp"
                    value={createForm.domain}
                    onChange={e => setCreateForm(f => ({ ...f, domain: e.target.value }))}
                    className="w-full px-3 py-2 text-[13px] bg-[rgba(34,68,170,0.1)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-[#0c1028] transition-all"
                  />
                </div>

                {/* 業種 + ランク */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[12px] font-medium text-[#CCDDF0] mb-1.5">業種</label>
                    <input
                      type="text"
                      placeholder="IT・SaaS"
                      value={createForm.industry}
                      onChange={e => setCreateForm(f => ({ ...f, industry: e.target.value }))}
                      className="w-full px-3 py-2 text-[13px] bg-[rgba(34,68,170,0.1)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-[#0c1028] transition-all"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-[12px] font-medium text-[#CCDDF0] mb-1.5">シグナル</label>
                    <select
                      value={createForm.signal}
                      onChange={e => setCreateForm(f => ({ ...f, signal: e.target.value as Signal }))}
                      className="w-full px-3 py-2 text-[13px] bg-[rgba(34,68,170,0.1)] rounded-[8px] text-[#EEEEFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-[#0c1028] transition-all appearance-none cursor-pointer"
                    >
                      {ALL_SIGNALS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* 担当者 */}
                <div>
                  <label className="block text-[12px] font-medium text-[#CCDDF0] mb-1.5">担当者</label>
                  <input
                    type="text"
                    placeholder="田中太郎"
                    value={createForm.owner}
                    onChange={e => setCreateForm(f => ({ ...f, owner: e.target.value }))}
                    className="w-full px-3 py-2 text-[13px] bg-[rgba(34,68,170,0.1)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-[#0c1028] transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-4" style={{ borderTop: '1px solid #2244AA' }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#CCDDF0] hover:text-[#EEEEFF] hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] transition-all"
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
