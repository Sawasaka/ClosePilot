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
  X,
  Activity,
  Zap,
  Radio,
  HelpCircle,
  Mail,
  FileText,
  Globe,
  Check,
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
// パイプライン(/pipeline)のステージと完全連動
type DealStage =
  | 'IS' | 'NURTURING' | 'MEETING_PLANNED' | 'MEETING_DONE'
  | 'PROJECT_PLANNED' | 'MULTI_MEETING' | 'POC'
  | 'LOST_DEAL' | 'CLOSED_WON' | 'CHURN' | 'LOST'

type Signal = 'Hot' | 'Middle' | 'Low'
type ChipTone = 'neutral' | 'hot' | 'middle' | 'low' | 'primary'

// シグナル：自社1stパーティーデータ（サイト訪問・資料DL・メール開封等）から算出
function signalToTone(s: Signal): ChipTone {
  if (s === 'Hot') return 'hot'
  if (s === 'Middle') return 'middle'
  return 'low'
}
function signalLabel(s: Signal): string {
  if (s === 'Hot') return '強'
  if (s === 'Middle') return '中'
  return '弱'
}
function signalIcon(s: Signal) {
  if (s === 'Hot') return Zap
  if (s === 'Middle') return Activity
  return Radio
}
// 1stパーティ シグナル：3チャネル（メール開封・資料DL・サイト訪問）の有無を直近7日で集計
// - 強：3つすべて
// - 中：2つ揃う or 「資料DL」「サイト訪問」のいずれか単独
// - 弱：メール開封のみ
type SignalChannel = 'email' | 'doc' | 'site'
const SIGNAL_CHANNELS: { key: SignalChannel; label: string; Icon: typeof Mail }[] = [
  { key: 'email', label: 'メール開封', Icon: Mail },
  { key: 'doc',   label: '資料DL',     Icon: FileText },
  { key: 'site',  label: 'サイト訪問', Icon: Globe },
]

// 各シグナル段階のサンプル充足パターン（実装時はGA4/MA/サイトログ等から取得）
const SIGNAL_HITS: Record<Signal, Record<SignalChannel, boolean>> = {
  Hot:    { email: true,  doc: true,  site: true },   // 3つすべて
  Middle: { email: true,  doc: false, site: true },   // 2つ揃う（メール+サイト）
  Low:    { email: true,  doc: false, site: false },  // メールのみ
}

// 取引詳細(deals/[id])のタスク種別と完全に連動
type NextActionType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other' | null
type SortKey = 'name' | 'stage' | 'updatedAt' | 'probability' | 'taskDueAt'
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

interface NextActionConfig {
  label: string
  tone: ChipTone
}

const NEXT_ACTION_CONFIG: Record<Exclude<NextActionType, null>, NextActionConfig> = {
  call:     { label: 'コール',     tone: 'low' },       // 青系 → low
  email:    { label: 'メール',     tone: 'primary' },   // 紫/青系 → primary
  meeting:  { label: '商談',       tone: 'low' },       // 緑系 → neutral系、Obsidian準拠でlow
  proposal: { label: '提案書送付', tone: 'middle' },    // 黄系 → middle
  followup: { label: 'フォロー',   tone: 'primary' },   // ピンク→primary代替
  other:    { label: 'その他',     tone: 'neutral' },
}

// ─── Stage Config ───────────────────────────────────────────────────────────────

interface StageConfig {
  label: string
  tone: ChipTone
}

const STAGE_CONFIG: Record<DealStage, StageConfig> = {
  IS:              { label: 'IS',             tone: 'low' },
  NURTURING:       { label: 'ナーチャリング', tone: 'primary' },
  MEETING_PLANNED: { label: '商談予定',        tone: 'low' },
  MEETING_DONE:    { label: '商談済み',        tone: 'primary' },
  PROJECT_PLANNED: { label: 'PJ化予定あり',    tone: 'primary' },
  MULTI_MEETING:   { label: '複数商談済み',    tone: 'primary' },
  POC:             { label: 'POC実施中',       tone: 'primary' },
  LOST_DEAL:       { label: '失注',           tone: 'hot' },
  CLOSED_WON:      { label: '受注',           tone: 'low' },
  CHURN:           { label: 'チャーン',       tone: 'hot' },
  LOST:            { label: 'ロスト',         tone: 'neutral' },
}

// パイプラインのSTAGESと同じ並び順
const STAGE_ORDER: DealStage[] = [
  'IS', 'NURTURING', 'MEETING_PLANNED', 'MEETING_DONE',
  'PROJECT_PLANNED', 'MULTI_MEETING', 'POC',
  'LOST_DEAL', 'CLOSED_WON', 'CHURN', 'LOST',
]

const ALL_STAGES = Object.keys(STAGE_CONFIG) as DealStage[]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="ml-1 inline" style={{ color: 'var(--color-obs-text-subtle)' }} />
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
    : <ChevronDown size={12} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals]               = useState<Deal[]>(MOCK_DEALS)
  const [search, setSearch]             = useState('')
  const [filterStage, setFilterStage]   = useState<DealStage | ''>('')
  const [filterOwner, setFilterOwner]   = useState('')
  const [sortKey, setSortKey]           = useState<SortKey>('updatedAt')
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

  const hasFilters = !!filterStage || !!filterOwner

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">

        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Deals"
          title="取引"
          caption={`全 ${deals.length.toLocaleString()} 件。ステージと担当者ごとに進捗を管理。`}
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} className="mr-1.5 inline" strokeWidth={2.5} />
              取引を追加
            </ObsButton>
          }
        />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              type="text"
              placeholder="取引名・会社名・コンタクトで検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stage filter */}
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value as DealStage | '')}
            className="h-8 px-3 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={{
              backgroundColor: filterStage ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: filterStage ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            <option value="">ステージ</option>
            {ALL_STAGES.map(s => (
              <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
            ))}
          </select>

          {/* Owner filter */}
          <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            className="h-8 px-3 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={{
              backgroundColor: filterOwner ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: filterOwner ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
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
                className="inline-flex items-center gap-1 h-8 px-3 rounded-[var(--radius-obs-md)] text-xs font-medium whitespace-nowrap overflow-hidden transition-colors"
                style={{ color: 'var(--color-obs-text-muted)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <X size={12} />クリア
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Stats ── */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {filtered.length}件表示
          </span>
        </div>

        {/* ── Table ── */}
        <ObsCard depth="low" padding="none" radius="xl">
          {/* Header */}
          <div
            className="grid grid-cols-[300px_90px_1fr_140px_140px_120px] gap-x-3 px-5 py-3 text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {[
              { label: '取引名',         key: 'name' as SortKey,       sortable: true,  signal: false },
              { label: '1st シグナル', key: null,                sortable: false, signal: true  },
              { label: '',               key: null,                    sortable: false, signal: false },
              { label: '担当者',         key: null,                    sortable: false, signal: false },
              { label: 'ステージ',       key: 'stage' as SortKey,      sortable: true,  signal: false },
              { label: 'ネクストアクション', key: null,                  sortable: false, signal: false },
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
                {col.signal ? (
                  <SignalHeader label={col.label} />
                ) : (
                  <>
                    {col.label}
                    {col.sortable && col.key && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </>
                )}
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
                  <Briefcase size={22} style={{ color: 'var(--color-obs-text-subtle)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
                  条件に一致する取引が見つかりません
                </p>
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
                    className="grid grid-cols-[300px_90px_1fr_140px_140px_120px] gap-x-3 items-center px-5 py-3.5 transition-colors duration-150 group cursor-pointer"
                    style={{
                      transitionTimingFunction: 'var(--ease-liquid)',
                      boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface)',
                    }}
                    onMouseOver={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                    }}
                    onMouseOut={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    {/* 取引名 */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                      >
                        <Briefcase size={13} style={{ color: 'var(--color-obs-text-muted)' }} />
                      </div>
                      <p className="text-sm font-medium truncate min-w-0" style={{ color: 'var(--color-obs-text)' }}>
                        {deal.company}
                      </p>
                    </div>

                    {/* シグナル（1stパーティーデータ） */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <SignalBadge signal={deal.signal} />
                    </div>

                    {/* スペーサー */}
                    <div />

                    {/* 担当者 */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-semibold"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-highest)',
                          color: 'var(--color-obs-text)',
                        }}
                      >
                        {deal.owner[0]}
                      </div>
                      <span className="text-sm truncate" style={{ color: 'var(--color-obs-text)' }}>
                        {deal.owner}
                      </span>
                    </div>

                    {/* ステージ */}
                    <div>
                      <ObsChip tone={stage.tone}>
                        {stage.label}
                      </ObsChip>
                    </div>

                    {/* ネクストアクション */}
                    <div>
                      {deal.nextAction ? (
                        <ObsChip tone={NEXT_ACTION_CONFIG[deal.nextAction].tone}>
                          {NEXT_ACTION_CONFIG[deal.nextAction].label}
                        </ObsChip>
                      ) : (
                        <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>—</span>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </ObsCard>

        {/* ── Create Deal Modal ── */}
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
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
                      取引を追加
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

                  <div className="px-6 py-4 space-y-3">
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        取引名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="株式会社テクノリード - 2026/03/23"
                        value={createForm.name}
                        onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          コンタクト
                        </label>
                        <ObsInput
                          type="text"
                          placeholder="田中 誠"
                          value={createForm.contact}
                          onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          ステージ
                        </label>
                        <select
                          value={createForm.stage}
                          onChange={e => setCreateForm(f => ({ ...f, stage: e.target.value as DealStage }))}
                          className="w-full h-10 px-4 rounded-[var(--radius-obs-md)] text-sm outline-none"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-lowest)',
                            color: 'var(--color-obs-text)',
                            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                          }}
                        >
                          {STAGE_ORDER.filter(s => !['CLOSED_WON','LOST_DEAL','CHURN','LOST'].includes(s)).map(s => (
                            <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        想定クローズ日
                      </label>
                      <ObsInput
                        type="date"
                        value={createForm.expectedCloseAt}
                        onChange={e => setCreateForm(f => ({ ...f, expectedCloseAt: e.target.value }))}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
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

// ─── Signal Header（列見出し：First Party Signal + ?） ────────────────────────
// ヘッダーホバーで「強/中/弱」の判定ロジック（過去7日 × 3チャネル）を端的に説明
function SignalHeader({ label }: { label: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span>{label}</span>
      <HelpCircle size={11} className="cursor-help" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.8 }} />
      {hover && (
        <div
          className="absolute left-0 bottom-full mb-1.5 z-30 w-[280px] rounded-[var(--radius-obs-md)] overflow-hidden animate-[fadeIn_0.18s_ease-out] normal-case tracking-normal"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 -12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(65,71,83,0.4)',
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
          >
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-primary)' }}>
              <Activity size={11} />
              判定ロジック
            </span>
            <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              過去7日
            </span>
          </div>
          <div className="px-3 py-2.5 space-y-2 text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            <p style={{ color: 'var(--color-obs-text-subtle)' }}>
              3チャネル（メール開封 / 資料DL / サイト訪問）の充足度で算出
            </p>
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 shrink-0 w-10 h-5 rounded-full justify-center text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)' }}>
                <Zap size={9} strokeWidth={2.4} />強
              </span>
              <span>3つすべて達成</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 shrink-0 w-10 h-5 rounded-full justify-center text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)' }}>
                <Activity size={9} strokeWidth={2.4} />中
              </span>
              <span>2つ達成、または 資料DL / サイト訪問 のいずれか単独</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 shrink-0 w-10 h-5 rounded-full justify-center text-[10px] font-bold" style={{ backgroundColor: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' }}>
                <Radio size={9} strokeWidth={2.4} />弱
              </span>
              <span>メール開封のみ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Signal Badge（1stパーティーデータ） ─────────────────────────────────────
// シグナルバッジ：3チャネルの充足チェックリストをホバーで表示
function SignalBadge({ signal }: { signal: Signal }) {
  const [hover, setHover] = useState(false)
  const Icon = signalIcon(signal)
  const tone = signalToTone(signal)
  const label = signalLabel(signal)
  const hits = SIGNAL_HITS[signal]
  const hitCount = (Object.values(hits) as boolean[]).filter(Boolean).length

  // tone → 色マッピング
  const colorMap: Record<ChipTone, { fg: string; bg: string; ring: string }> = {
    hot:     { fg: 'var(--color-obs-hot)',     bg: 'rgba(255,107,107,0.14)', ring: 'rgba(255,107,107,0.32)' },
    middle:  { fg: 'var(--color-obs-middle)',  bg: 'rgba(255,184,107,0.14)', ring: 'rgba(255,184,107,0.32)' },
    low:     { fg: 'var(--color-obs-low)',     bg: 'rgba(126,198,255,0.14)', ring: 'rgba(126,198,255,0.32)' },
    primary: { fg: 'var(--color-obs-primary)', bg: 'rgba(171,199,255,0.14)', ring: 'rgba(171,199,255,0.32)' },
    neutral: { fg: 'var(--color-obs-text-muted)', bg: 'rgba(143,140,144,0.14)', ring: 'rgba(143,140,144,0.32)' },
  }
  const c = colorMap[tone]

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold cursor-help"
        style={{ backgroundColor: c.bg, color: c.fg, boxShadow: `inset 0 0 0 1px ${c.ring}` }}
      >
        <Icon size={11} strokeWidth={2.4} />
        {label}
      </span>

      {hover && (
        <div
          className="absolute left-0 top-full mt-1.5 z-30 w-[240px] rounded-[var(--radius-obs-md)] overflow-hidden animate-[fadeIn_0.18s_ease-out]"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(65,71,83,0.4)',
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
          >
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: c.fg }}>
              <Icon size={11} strokeWidth={2.4} />
              シグナル {label}
            </span>
            <span className="text-[10.5px] tabular-nums font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {hitCount} / 3
            </span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            {SIGNAL_CHANNELS.map((ch) => {
              const ok = hits[ch.key]
              const ChIcon = ch.Icon
              return (
                <div key={ch.key} className="flex items-center justify-between text-[11.5px]">
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: ok ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}
                  >
                    <ChIcon size={11} strokeWidth={2.2} />
                    {ch.label}
                  </span>
                  {ok ? (
                    <Check size={12} strokeWidth={3} style={{ color: '#6ee7a1' }} />
                  ) : (
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>—</span>
                  )}
                </div>
              )
            })}
          </div>
          <div
            className="px-3 py-1.5 text-[10px]"
            style={{
              color: 'var(--color-obs-text-subtle)',
              backgroundColor: 'var(--color-obs-surface-low)',
            }}
          >
            <span className="inline-flex items-center gap-1">
              <Activity size={9} />
              過去7日 / 1stパーティーデータ
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
