'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Settings2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type SortKey = 'score' | 'occurrences' | 'effort' | 'impact'
type SortDir = 'asc' | 'desc'

interface PriorityItem {
  id: string
  title: string
  category: string
  occurrences: number
  newCount: number
  existingCount: number
  effort: number      // 1-5 (1=簡単, 5=大変)
  impact: number      // 1-5 (1=低, 5=高)
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ITEMS: PriorityItem[] = [
  { id: 'p1', title: '既存ツールとのデータ連携',       category: 'インテグレーション', occurrences: 4, newCount: 3, existingCount: 1, effort: 4, impact: 5 },
  { id: 'p2', title: 'ダッシュボード表示速度',         category: 'パフォーマンス',     occurrences: 3, newCount: 2, existingCount: 1, effort: 3, impact: 4 },
  { id: 'p3', title: 'カスタムレポートの柔軟性',       category: '機能要望',           occurrences: 3, newCount: 1, existingCount: 2, effort: 3, impact: 4 },
  { id: 'p4', title: 'SSO対応（SAML）',               category: 'セキュリティ',       occurrences: 2, newCount: 2, existingCount: 0, effort: 4, impact: 5 },
  { id: 'p5', title: 'オートメーション設定のUI改善',   category: 'UX/UI',              occurrences: 2, newCount: 0, existingCount: 2, effort: 2, impact: 3 },
  { id: 'p6', title: 'API連携の安定性',               category: 'インテグレーション', occurrences: 2, newCount: 1, existingCount: 1, effort: 3, impact: 4 },
  { id: 'p7', title: 'ナレッジベースの検索精度向上',   category: '機能要望',           occurrences: 2, newCount: 0, existingCount: 2, effort: 2, impact: 3 },
  { id: 'p8', title: '監査ログの出力',                 category: 'セキュリティ',       occurrences: 1, newCount: 1, existingCount: 0, effort: 2, impact: 3 },
  { id: 'p9', title: 'モバイル対応の有無',             category: 'UX/UI',              occurrences: 1, newCount: 1, existingCount: 0, effort: 5, impact: 4 },
  { id: 'p10', title: 'オンボーディング後のフォロー不足', category: 'サポート',         occurrences: 1, newCount: 0, existingCount: 1, effort: 1, impact: 2 },
]

const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

// ─── Score Calc ─────────────────────────────────────────────────────────────

function calcScore(item: PriorityItem, newWeight: number): number {
  const existingWeight = 100 - newWeight
  const weightedOccurrences = (item.newCount * newWeight + item.existingCount * existingWeight) / 100
  const effortInverse = 6 - item.effort // 1→5, 5→1
  return Math.round(weightedOccurrences * effortInverse * item.impact * 10) / 10
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PriorityPage() {
  const [newWeight, setNewWeight] = useState(40)
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showSettings, setShowSettings] = useState(false)

  const scored = useMemo(() => {
    return MOCK_ITEMS.map(item => ({
      ...item,
      score: calcScore(item, newWeight),
    })).sort((a, b) => {
      const key = sortKey
      const aVal = key === 'score' ? a.score : a[key]
      const bVal = key === 'score' ? b.score : b[key]
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number)
    })
  }, [newWeight, sortKey, sortDir])

  const maxScore = Math.max(...scored.map(s => s.score))

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return <ArrowUpDown size={10} className="text-[#99AACC] ml-0.5 inline" />
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="ml-0.5 inline text-[#0071E3]" />
      : <ChevronDown size={10} className="ml-0.5 inline text-[#0071E3]" />
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">開発優先度</h1>
          <p className="text-[13px] text-[#CCDDF0] mt-0.5">課題の多さ × 工数 × インパクトで自動スコアリング</p>
        </div>
        <button
          onClick={() => setShowSettings(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-medium text-[#CCDDF0] transition-all hover:bg-[rgba(136,187,255,0.06)]"
          style={{ border: '1px solid #2244AA' }}
        >
          <Settings2 size={14} />
          ウエイト設定
        </button>
      </div>

      {/* Weight Settings */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#0c1028] rounded-[8px] p-5"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <h3 className="text-[13px] font-semibold text-[#EEEEFF] mb-3">顧客セグメントの重要度ウエイト</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-[#0071E3]">新規顧客 {newWeight}%</span>
                <span className="text-[12px] font-medium text-[#34C759]">既存顧客 {100 - newWeight}%</span>
              </div>
              <input
                type="range"
                min={0} max={100} value={newWeight}
                onChange={e => setNewWeight(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #0071E3 ${newWeight}%, #34C759 ${newWeight}%)` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#99AACC] mt-2">
            スコア = 加重出現数 × (6 - 工数) × インパクト
          </p>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '最優先', value: scored[0]?.title ?? '—', score: scored[0]?.score ?? 0, color: '#FF3B30' },
          { label: 'Top 3 平均スコア', value: (scored.slice(0, 3).reduce((s, i) => s + i.score, 0) / 3).toFixed(1), score: null, color: '#0071E3' },
          { label: '課題総数', value: `${MOCK_ITEMS.length}件`, score: null, color: '#CCDDF0' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="bg-[#0c1028] rounded-[8px] p-4"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <p className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">{card.label}</p>
            <p className="text-[16px] font-semibold mt-1 truncate" style={{ color: card.color }}>{card.value}</p>
            {card.score !== null && (
              <p className="text-[11px] text-[#99AACC] mt-0.5">スコア: {card.score}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Ranking Table */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
        <div className="grid items-center px-5 py-2.5" style={{ gridTemplateColumns: '32px 1fr 90px 70px 70px 100px', borderBottom: '1px solid #2244AA', background: 'rgba(0,0,0,0.018)' }}>
          <span className="text-[11px] text-[#99AACC] font-medium">#</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">課題</span>
          <button onClick={() => toggleSort('occurrences')} className="text-[11px] font-medium uppercase tracking-[0.04em] text-left flex items-center" style={{ color: sortKey === 'occurrences' ? '#88BBFF' : '#4466AA' }}>
            出現数<SortIcon col="occurrences" />
          </button>
          <button onClick={() => toggleSort('effort')} className="text-[11px] font-medium uppercase tracking-[0.04em] text-left flex items-center" style={{ color: sortKey === 'effort' ? '#88BBFF' : '#4466AA' }}>
            工数<SortIcon col="effort" />
          </button>
          <button onClick={() => toggleSort('impact')} className="text-[11px] font-medium uppercase tracking-[0.04em] text-left flex items-center" style={{ color: sortKey === 'impact' ? '#88BBFF' : '#4466AA' }}>
            インパクト<SortIcon col="impact" />
          </button>
          <button onClick={() => toggleSort('score')} className="text-[11px] font-medium uppercase tracking-[0.04em] text-left flex items-center" style={{ color: sortKey === 'score' ? '#88BBFF' : '#4466AA' }}>
            スコア<SortIcon col="score" />
          </button>
        </div>

        {scored.map((item, i) => {
          const barWidth = maxScore > 0 ? (item.score / maxScore) * 100 : 0
          const isTop3 = i < 3 && sortKey === 'score' && sortDir === 'desc'
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="grid items-center px-5 py-3 hover:bg-[rgba(136,187,255,0.04)] transition-colors"
              style={{
                gridTemplateColumns: '32px 1fr 90px 70px 70px 100px',
                borderBottom: '1px solid rgba(34,68,170,0.2)',
                background: isTop3 ? 'rgba(255,59,48,0.02)' : undefined,
              }}
            >
              <span className={`text-[12px] font-bold tabular-nums ${isTop3 ? 'text-[#FF3B30]' : 'text-[#99AACC]'}`}>{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#EEEEFF] truncate">{item.title}</p>
                <p className="text-[11px] text-[#99AACC]">{item.category}</p>
              </div>
              <span className="text-[13px] text-[#EEEEFF] tabular-nums">{item.occurrences}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-3 h-3 rounded-[2px]" style={{ background: j < item.effort ? '#FF9F0A' : 'rgba(0,0,0,0.06)' }} />
                ))}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-3 h-3 rounded-[2px]" style={{ background: j < item.impact ? '#0071E3' : 'rgba(0,0,0,0.06)' }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(34,68,170,0.15)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: isTop3 ? '#FF4444' : '#88BBFF' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
                <span className="text-[13px] font-semibold tabular-nums w-8 text-right" style={{ color: isTop3 ? '#FF4444' : '#EEEEFF' }}>
                  {item.score}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
