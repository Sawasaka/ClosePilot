'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GripVertical,
  AlertTriangle,
  Plus,
  TrendingUp,
  Trophy,
  ChevronDown,
} from 'lucide-react'

type Period = 'this_month' | 'last_month' | 'this_quarter' | 'this_year'
type ViewMode = 'all' | 'focused'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Rank = 'A' | 'B' | 'C'
type StageKey =
  | 'IS'
  | 'MEETING_DONE'
  | 'PROJECT_PLANNED'
  | 'POC'
  | 'DECISION_MAKER_OK'
  | 'CLOSED_WON'
  | 'NURTURING'
  | 'LOST_DEAL'
  | 'CHURN'
  | 'LOST'

interface Deal {
  id: string
  name: string
  company: string
  contact: string
  amount: number
  rank: Rank
  owner: string
  stalled: boolean
  stage: StageKey
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const DEALS: Deal[] = [
  { id: 'd1',  name: 'CRM導入プロジェクト',       company: '株式会社テクノリード',    contact: '田中 誠',    amount: 1200000, rank: 'A', owner: '田中太郎', stalled: false, stage: 'IS' },
  { id: 'd2',  name: 'MA連携提案',                company: '合同会社ビジョン',        contact: '加藤 雄介',  amount: 480000,  rank: 'C', owner: '佐藤次郎', stalled: false, stage: 'IS' },
  { id: 'd3',  name: 'SFA刷新案件',               company: '合同会社フューチャー',    contact: '山本 佳子',  amount: 2400000, rank: 'A', owner: '鈴木花子', stalled: false, stage: 'MEETING_DONE' },
  { id: 'd4',  name: 'コンサルティング契約',       company: '株式会社グロース',        contact: '中村 理恵',  amount: 900000,  rank: 'B', owner: '佐藤次郎', stalled: true,  stage: 'MEETING_DONE' },
  { id: 'd5',  name: 'DX推進パッケージ',          company: '株式会社イノベーション',  contact: '佐々木 拓也', amount: 3600000, rank: 'A', owner: '田中太郎', stalled: false, stage: 'PROJECT_PLANNED' },
  { id: 'd6',  name: 'セールスオートメーション導入', company: '有限会社サクセス',       contact: '小林 健太',  amount: 1800000, rank: 'B', owner: '鈴木花子', stalled: false, stage: 'POC' },
  { id: 'd7',  name: 'ライトプラン契約',           company: '株式会社ネクスト',        contact: '鈴木 美香',  amount: 720000,  rank: 'C', owner: '田中太郎', stalled: false, stage: 'DECISION_MAKER_OK' },
  { id: 'd8',  name: 'エンタープライズ契約（2期）', company: '株式会社テクノリード',    contact: '田中 誠',    amount: 4800000, rank: 'A', owner: '田中太郎', stalled: false, stage: 'CLOSED_WON' },
  { id: 'd9',  name: 'スタータープラン再提案',     company: '株式会社スタート',        contact: '吉田 千春',  amount: 600000,  rank: 'C', owner: '佐藤次郎', stalled: false, stage: 'NURTURING' },
  { id: 'd10', name: 'データ分析基盤構築',         company: '株式会社アルファ',        contact: '渡辺 健二',  amount: 1500000, rank: 'B', owner: '鈴木花子', stalled: true,  stage: 'LOST_DEAL' },
  { id: 'd11', name: 'カスタマーサクセス契約',     company: '合同会社ベータ',          contact: '佐藤 良子',  amount: 960000,  rank: 'B', owner: '田中太郎', stalled: false, stage: 'CHURN' },
  { id: 'd12', name: 'AI活用コンサルティング',     company: '株式会社デルタ',          contact: '木村 隆',    amount: 2100000, rank: 'A', owner: '佐藤次郎', stalled: false, stage: 'LOST' },
]

// ─── Stage Config ──────────────────────────────────────────────────────────────

interface StageConfig {
  key: StageKey
  label: string
  color: string
  headerBg: string
  dotColor: string
}

const STAGES: StageConfig[] = [
  { key: 'IS',                label: 'IS',              color: '#6E6E73', headerBg: 'rgba(0,0,0,0.04)',       dotColor: '#AEAEB2' },
  { key: 'MEETING_DONE',      label: '商談済み',        color: '#0044DD', headerBg: 'rgba(0,85,255,0.10)',    dotColor: '#3B82F6' },
  { key: 'PROJECT_PLANNED',   label: 'PJ化予定あり',    color: '#4B48CC', headerBg: 'rgba(94,92,230,0.10)',   dotColor: '#8B8BE8' },
  { key: 'POC',               label: 'POC実施中',       color: '#9B30D9', headerBg: 'rgba(191,90,242,0.10)',  dotColor: '#BF5AF2' },
  { key: 'DECISION_MAKER_OK', label: '決裁者合意済み',  color: '#C07000', headerBg: 'rgba(255,159,10,0.10)',  dotColor: '#FFB82E' },
  { key: 'CLOSED_WON',        label: '受注',            color: '#007A30', headerBg: 'rgba(0,200,83,0.14)',    dotColor: '#00C853' },
  { key: 'NURTURING',         label: 'ナーチャリング',  color: '#5E5CE6', headerBg: 'rgba(94,92,230,0.08)',   dotColor: '#5E5CE6' },
  { key: 'LOST_DEAL',         label: '失注',            color: '#D92B1A', headerBg: 'rgba(255,59,48,0.10)',   dotColor: '#FF6B62' },
  { key: 'CHURN',             label: 'チャーン',        color: '#CF3131', headerBg: 'rgba(255,59,48,0.06)',   dotColor: '#FF3B30' },
  { key: 'LOST',              label: 'ロスト',          color: '#8E8E93', headerBg: 'rgba(0,0,0,0.03)',       dotColor: '#AEAEB2' },
]

// ─── Style Maps ────────────────────────────────────────────────────────────────

type RankConfig = { gradient: string; glow: string; color: string }
const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
}

const OWNER_COLORS: Record<string, string> = {
  '田中太郎': '#0071E3',
  '鈴木花子': '#FF2D78',
  '佐藤次郎': '#FF9F0A',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`
}

// ─── Deal Card ─────────────────────────────────────────────────────────────────

function DealCard({ deal }: { deal: Deal }) {
  const rank = RANK_CONFIG[deal.rank]
  const ownerColor = OWNER_COLORS[deal.owner] ?? '#6B7280'

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
      }}
      whileHover={{ y: -2, transition: { duration: 0.15, ease: 'easeOut' } }}
      className="relative rounded-[10px] p-3.5 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: deal.stalled ? '#FFFAFA' : 'white',
        border: deal.stalled ? '1px solid rgba(255,59,48,0.18)' : '1px solid rgba(0,0,0,0.07)',
        borderLeft: deal.stalled ? '3px solid #FF3B30' : '1px solid rgba(0,0,0,0.07)',
        boxShadow: deal.stalled
          ? '0 2px 12px rgba(255,59,48,0.12), 0 1px 3px rgba(0,0,0,0.04)'
          : '0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Drag handle + rank + stalled */}
      <div className="flex items-start justify-between mb-2">
        <GripVertical size={13} className="text-[#D1D5DB] mt-0.5 -ml-0.5 shrink-0" />
        <div className="flex items-center gap-1.5">
          {deal.stalled && (
            <div className="flex items-center gap-1">
              <div className="relative flex shrink-0" style={{ width: 6, height: 6 }}>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: '#FF3B30' }}
                  animate={{ scale: [1, 2.5], opacity: [0.7, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                />
                <div className="relative rounded-full" style={{ width: 6, height: 6, backgroundColor: '#FF3B30' }} />
              </div>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium" style={{ color: '#FF3B30' }}>
                <AlertTriangle size={9} strokeWidth={2.5} />
                停滞中
              </span>
            </div>
          )}
          <span
            className="inline-flex items-center justify-center rounded-[4px] text-[10px] font-bold"
            style={{ width: 20, height: 20, background: rank.gradient, boxShadow: rank.glow, color: rank.color, letterSpacing: '0.03em' }}
          >
            {deal.rank}
          </span>
        </div>
      </div>

      {/* Deal name */}
      <p className="text-[13px] font-semibold text-[#1D1D1F] leading-snug mb-3 truncate">
        {deal.name}
      </p>

      {/* Amount */}
      <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight tabular-nums mb-3">
        {formatAmount(deal.amount)}
      </p>

      {/* Owner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: ownerColor + '22' }}
          >
            <span className="text-[9px] font-bold" style={{ color: ownerColor }}>
              {deal.owner[0]}
            </span>
          </div>
          <span className="text-[11px] text-[#6E6E73]">{deal.owner}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Pipeline Column ────────────────────────────────────────────────────────────

function PipelineColumn({
  stage, deals, ownerFilter, isFocused, isDimmed,
}: {
  stage: StageConfig
  deals: Deal[]
  ownerFilter: string
  isFocused: boolean
  isDimmed: boolean
}) {
  const total = deals.reduce((s, d) => s + d.amount, 0)
  const stalledCount = deals.filter(d => d.stalled).length
  const isWon = stage.key === 'CLOSED_WON'
  const colWidth = isFocused ? 'w-[360px]' : isDimmed ? 'w-[100px]' : 'w-[240px]'

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
      }}
      animate={{ opacity: isDimmed ? 0.35 : 1 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col ${colWidth} shrink-0 transition-all duration-300`}
    >
      {/* Column Header */}
      <div
        className="rounded-[10px] px-3 py-2.5 mb-3 border"
        style={{
          backgroundColor: stage.headerBg,
          borderColor: stage.color + '30',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stage.dotColor }}
            />
            <span className="text-[12px] font-semibold" style={{ color: stage.color }}>
              {stage.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {stalledCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-[#EF4444]">
                <AlertTriangle size={9} />
                {stalledCount}
              </span>
            )}
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: stage.color }}
            >
              {deals.length}
            </span>
          </div>
        </div>

        {total > 0 && (
          <p className="text-[11px] font-medium tabular-nums" style={{ color: stage.color }}>
            {formatAmount(total)}
          </p>
        )}
      </div>

      {/* Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="flex flex-col gap-2 flex-1"
      >
        {!isDimmed && deals.map(deal => (
          <div
            key={deal.id}
            className="transition-opacity duration-200"
            style={{ opacity: ownerFilter !== '全員' && deal.owner !== ownerFilter ? 0.35 : 1,
                     pointerEvents: ownerFilter !== '全員' && deal.owner !== ownerFilter ? 'none' : 'auto' }}
          >
            <DealCard deal={deal} />
          </div>
        ))}

        {/* Add deal button */}
        <motion.button
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.2 } },
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-[8px] border border-dashed border-[rgba(0,0,0,0.1)] text-[12px] text-[#AEAEB2] hover:border-[rgba(0,85,255,0.4)] hover:text-[#0055FF] hover:bg-[rgba(0,85,255,0.05)] transition-all duration-150"
        >
          <Plus size={13} />
          追加
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
  this_month: '今月',
  last_month: '先月',
  this_quarter: '今四半期',
  this_year: '今年',
}

const OWNERS = ['全員', '田中太郎', '鈴木花子', '佐藤次郎']

export default function PipelinePage() {
  const [period, setPeriod] = useState<Period>('this_month')
  const [ownerFilter, setOwnerFilter] = useState('全員')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [focusedStage, setFocusedStage] = useState<StageKey>('POC')

  // Group deals by stage
  const dealsByStage = STAGES.reduce<Record<StageKey, Deal[]>>((acc, s) => {
    acc[s.key] = DEALS.filter(d => d.stage === s.key)
    return acc
  }, {} as Record<StageKey, Deal[]>)

  // Pipeline totals (excluding CLOSED_WON)
  const activeDeals = DEALS.filter(d => d.stage !== 'CLOSED_WON')
  const totalPipeline = activeDeals.reduce((s, d) => s + d.amount, 0)
  const stalledTotal  = DEALS.filter(d => d.stalled).reduce((s, d) => s + d.amount, 0)
  const wonTotal      = dealsByStage['CLOSED_WON'].reduce((s, d) => s + d.amount, 0)

  // All stages visible on board
  const boardStages   = STAGES

  return (
    <div className="flex flex-col h-full">

      {/* ── Summary Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-5 mb-5 pb-5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div>
          <p className="text-[11px] text-[#AEAEB2] uppercase tracking-[0.06em] font-medium mb-0.5">パイプライン総額</p>
          <p className="text-2xl font-semibold text-[#1D1D1F] tabular-nums tracking-tight">
            {formatAmount(totalPipeline)}
          </p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(0,0,0,0.07)' }} />
        <div>
          <p className="text-[11px] text-[#AEAEB2] uppercase tracking-[0.06em] font-medium mb-0.5">案件数</p>
          <p className="text-2xl font-semibold text-[#1D1D1F] tabular-nums tracking-tight">{activeDeals.length}</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(0,0,0,0.07)' }} />
        <div>
          <p className="text-[11px] text-[#AEAEB2] uppercase tracking-[0.06em] font-medium mb-0.5">停滞中</p>
          <p className="text-2xl font-semibold text-[#FF3B30] tabular-nums tracking-tight">
            {DEALS.filter(d => d.stalled).length}件
          </p>
          <p className="text-[11px] text-[#AEAEB2] tabular-nums">{formatAmount(stalledTotal)}</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(0,0,0,0.07)' }} />
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#34C759]" />
          <div>
            <p className="text-[11px] text-[#AEAEB2] uppercase tracking-[0.06em] font-medium mb-0.5">今月受注</p>
            <p className="text-2xl font-semibold text-[#007A30] tabular-nums tracking-tight">{formatAmount(wonTotal)}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <motion.button
            whileHover={{ filter: 'brightness(1.05)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-[8px]"
            style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)', boxShadow: '0 1px 3px rgba(0,113,227,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
          >
            <Plus size={15} strokeWidth={2.5} />
            取引を追加
          </motion.button>
        </div>
      </motion.div>

      {/* ── Filter Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 flex-wrap mb-4 p-3 rounded-[10px]"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Period */}
        <div className="flex items-center gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{
                background: period === p ? 'rgba(0,113,227,0.1)' : 'transparent',
                color: period === p ? '#0071E3' : '#6E6E73',
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.08)' }} />

        {/* Owner */}
        <div className="flex items-center gap-1">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{
                background: ownerFilter === o ? 'rgba(0,113,227,0.1)' : 'transparent',
                color: ownerFilter === o ? '#0071E3' : '#6E6E73',
              }}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(0,0,0,0.08)' }} />

        {/* View mode */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setViewMode('all')}
            className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
            style={{
              background: viewMode === 'all' ? 'rgba(0,113,227,0.1)' : 'transparent',
              color: viewMode === 'all' ? '#0071E3' : '#6E6E73',
            }}
          >
            全体
          </button>
          <button
            onClick={() => setViewMode('focused')}
            className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
            style={{
              background: viewMode === 'focused' ? 'rgba(0,113,227,0.1)' : 'transparent',
              color: viewMode === 'focused' ? '#0071E3' : '#6E6E73',
            }}
          >
            フェーズ別
          </button>
          <AnimatePresence>
            {viewMode === 'focused' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="relative ml-1">
                  <select
                    value={focusedStage}
                    onChange={e => setFocusedStage(e.target.value as StageKey)}
                    className="pl-2.5 pr-6 py-1.5 text-[12px] font-medium rounded-[6px] appearance-none cursor-pointer focus:outline-none"
                    style={{ background: 'rgba(0,0,0,0.05)', color: '#1D1D1F' }}
                  >
                    {boardStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#6E6E73] pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="flex gap-3 h-full"
          style={{ minWidth: 'max-content' }}
        >
          {/* Main pipeline stages */}
          {boardStages.map(stage => (
            <PipelineColumn
              key={stage.key}
              stage={stage}
              deals={dealsByStage[stage.key]}
              ownerFilter={ownerFilter}
              isFocused={viewMode === 'focused' && stage.key === focusedStage}
              isDimmed={viewMode === 'focused' && stage.key !== focusedStage}
            />
          ))}

        </motion.div>
      </div>
    </div>
  )
}
