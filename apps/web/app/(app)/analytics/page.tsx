'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, TrendingUp, Users, DollarSign, CalendarDays, Award } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type AnalyticsTab = 'channel' | 'rep' | 'event'

interface LeadSource {
  id: string
  label: string
  leads: number
  deals: number
  pocs: number
  won: number
  avgDealAmount: number
}

interface RepData {
  name: string
  deals: number
  won: number
  avgAmount: number
  avgCycleDays: number
  color: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const LEAD_SOURCES: LeadSource[] = [
  { id: 'hp',       label: 'HP問い合わせ', leads: 50,  deals: 12, pocs: 8,  won: 6, avgDealAmount: 1500000 },
  { id: 'pricing',  label: '料金ページ',   leads: 30,  deals: 10, pocs: 7,  won: 5, avgDealAmount: 800000  },
  { id: 'seminar',  label: 'セミナー主催', leads: 80,  deals: 20, pocs: 12, won: 8, avgDealAmount: 2000000 },
  { id: 'referral', label: '紹介',         leads: 15,  deals: 10, pocs: 9,  won: 8, avgDealAmount: 3200000 },
  { id: 'paid_ads', label: '有料広告',     leads: 100, deals: 8,  pocs: 3,  won: 1, avgDealAmount: 600000  },
  { id: 'partner',  label: 'パートナー',   leads: 20,  deals: 9,  pocs: 7,  won: 6, avgDealAmount: 2500000 },
]

const REPS: RepData[] = [
  { name: '田中太郎', deals: 18, won: 8, avgAmount: 3200000, avgCycleDays: 42, color: '#0071E3' },
  { name: '鈴木花子', deals: 14, won: 7, avgAmount: 2800000, avgCycleDays: 38, color: '#34C759' },
  { name: '佐藤次郎', deals: 12, won: 4, avgAmount: 1900000, avgCycleDays: 56, color: '#FF9F0A' },
]

const FUNNEL_COLORS = {
  leads:  { color: '#AEAEB2', label: 'リード' },
  deals:  { color: '#0071E3', label: '商談化' },
  pocs:   { color: '#5E5CE6', label: 'PoC'   },
  won:    { color: '#34C759', label: '受注'   },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1000000) return `¥${(n / 1000000).toFixed(1)}M`
  return `¥${(n / 10000).toFixed(0)}万`
}

// ─── Channel Funnel Table ────────────────────────────────────────────────────

function ChannelFunnelTable({ costMap, setCostMap }: {
  costMap: Record<string, string>
  setCostMap: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div className="bg-white rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        {Object.entries(FUNNEL_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v.color }} />
            <span className="text-[11px] text-[#6E6E73]">{v.label}</span>
          </div>
        ))}
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[160px_1fr_120px_80px] gap-0 px-5 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.06em]">経路</span>
        <span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.06em]">ファネル</span>
        <span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.06em] text-center">費用</span>
        <span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.06em] text-right">ROI</span>
      </div>

      {/* Rows */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {LEAD_SOURCES.map((src, i) => {
          const cost = parseInt(costMap[src.id] || '0', 10) || 0
          const revenue = src.won * src.avgDealAmount
          const roi = cost > 0 ? (revenue / cost).toFixed(1) + 'x' : '—'
          const roiColor = cost > 0
            ? (revenue / cost >= 3 ? '#1A7A35' : revenue / cost >= 1 ? '#C07000' : '#CF3131')
            : '#AEAEB2'

          return (
            <motion.div
              key={src.id}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="grid grid-cols-[160px_1fr_120px_80px] gap-0 items-center px-5 py-3.5"
              style={{ borderBottom: i < LEAD_SOURCES.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
            >
              {/* 経路名 */}
              <span className="text-[13px] font-medium text-[#1D1D1F]">{src.label}</span>

              {/* Funnel bars */}
              <div className="flex flex-col gap-1 pr-4">
                {(Object.entries({
                  leads: src.leads,
                  deals: src.deals,
                  pocs:  src.pocs,
                  won:   src.won,
                }) as [keyof typeof FUNNEL_COLORS, number][]).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex-1 h-[6px] rounded-full bg-[#F5F5F7] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: FUNNEL_COLORS[key].color,
                          width: mounted ? `${Math.round((val / src.leads) * 100)}%` : '0%',
                          transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                        }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums text-[#6E6E73] w-12 text-right">
                      {val}件 ({Math.round((val / src.leads) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* 費用入力 */}
              <div className="flex items-center px-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#AEAEB2]">¥</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={costMap[src.id] ?? ''}
                    onChange={e => setCostMap(m => ({ ...m, [src.id]: e.target.value }))}
                    className="w-full pl-5 pr-2 py-1.5 text-[12px] bg-[#F5F5F7] rounded-[6px] text-[#1D1D1F] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white transition-all tabular-nums"
                  />
                </div>
              </div>

              {/* ROI */}
              <div className="text-right">
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: roiColor }}>
                  {roi}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

// ─── Rep Card ───────────────────────────────────────────────────────────────

function RepCard({ rep, index }: { rep: RepData; index: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100 + index * 60); return () => clearTimeout(t) }, [index])
  const winRate = Math.round((rep.won / rep.deals) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[12px] p-5"
      style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Rep name + avatar */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
          style={{ background: `linear-gradient(145deg, ${rep.color}, ${rep.color}aa)` }}
        >
          {rep.name[0]}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">{rep.name}</p>
          <p className="text-[11px] text-[#AEAEB2]">営業担当</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[22px] font-bold tabular-nums tracking-tight" style={{ color: rep.color }}>{winRate}%</p>
          <p className="text-[10px] text-[#AEAEB2]">受注率</p>
        </div>
      </div>

      {/* Win rate gauge */}
      <div className="mb-4">
        <div className="h-2 rounded-full bg-[#F5F5F7] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: rep.color,
              width: mounted ? `${winRate}%` : '0%',
              transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '総商談数', value: `${rep.deals}件`, icon: BarChart2 },
          { label: '受注数', value: `${rep.won}件`, icon: Award },
          { label: '平均金額', value: formatAmount(rep.avgAmount), icon: DollarSign },
          { label: '平均サイクル', value: `${rep.avgCycleDays}日`, icon: CalendarDays },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 p-2.5 rounded-[8px]"
            style={{ background: 'rgba(0,0,0,0.025)' }}
          >
            <Icon size={13} className="text-[#AEAEB2] shrink-0" />
            <div>
              <p className="text-[10px] text-[#AEAEB2] leading-none mb-0.5">{label}</p>
              <p className="text-[13px] font-semibold text-[#1D1D1F] tabular-nums">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('channel')
  const [costMap, setCostMap] = useState<Record<string, string>>({})

  // Summary KPIs
  const totalLeads = LEAD_SOURCES.reduce((s, x) => s + x.leads, 0)
  const totalWon   = LEAD_SOURCES.reduce((s, x) => s + x.won, 0)
  const avgWinRate = Math.round((totalWon / LEAD_SOURCES.reduce((s, x) => s + x.deals, 0)) * 100)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bestROI = [...LEAD_SOURCES].sort((a, b) => {
    const ra = parseInt(costMap[a.id] || '0') > 0 ? (a.won * a.avgDealAmount) / parseInt(costMap[a.id] || '0') : 0
    const rb = parseInt(costMap[b.id] || '0') > 0 ? (b.won * b.avgDealAmount) / parseInt(costMap[b.id] || '0') : 0
    return rb - ra
  })[0]!  // LEAD_SOURCES is non-empty, so [0] is always defined

  const TABS: { key: AnalyticsTab; label: string; icon: React.ElementType }[] = [
    { key: 'channel', label: 'IS経路分析', icon: TrendingUp },
    { key: 'rep',     label: 'FS担当者分析', icon: Users },
    { key: 'event',  label: 'イベント成果', icon: BarChart2 },
  ]

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">アナリティクス</h1>
        <p className="text-[13px] text-[#6E6E73] mt-0.5">経路別・担当者別の商談パフォーマンス分析</p>
      </div>

      {/* ── Summary KPI Bar ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: '総リード数',
            value: `${totalLeads}件`,
            sub: '全経路合計',
            icon: Users,
            color: '#0071E3',
            bg: 'rgba(0,113,227,0.08)',
          },
          {
            label: '平均受注率',
            value: `${avgWinRate}%`,
            sub: '商談→受注',
            icon: Award,
            color: '#34C759',
            bg: 'rgba(52,199,89,0.08)',
          },
          {
            label: '最高ROI経路',
            value: bestROI.label,
            sub: `受注${bestROI.won}件 / 受注額${formatAmount(bestROI.won * bestROI.avgDealAmount)}`,
            icon: TrendingUp,
            color: '#5E5CE6',
            bg: 'rgba(94,92,230,0.08)',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] p-4 flex items-start gap-3"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: kpi.bg }}
            >
              <kpi.icon size={16} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[11px] text-[#AEAEB2] uppercase tracking-[0.04em] font-medium mb-0.5">{kpi.label}</p>
              <p className="text-[18px] font-semibold text-[#1D1D1F] tracking-[-0.02em] leading-none">{kpi.value}</p>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="bg-white rounded-[12px] overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        <div className="flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium transition-colors duration-100 ${
                activeTab === tab.key ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="analytics-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: '#0071E3' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === 'channel' && (
              <motion.div
                key="channel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChannelFunnelTable costMap={costMap} setCostMap={setCostMap} />
              </motion.div>
            )}

            {activeTab === 'rep' && (
              <motion.div
                key="rep"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-3 gap-4"
              >
                {REPS.map((rep, i) => (
                  <RepCard key={rep.name} rep={rep} index={i} />
                ))}
              </motion.div>
            )}

            {activeTab === 'event' && (
              <motion.div
                key="event"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div
                  className="w-14 h-14 rounded-[14px] flex items-center justify-center"
                  style={{ background: 'rgba(0,113,227,0.08)' }}
                >
                  <BarChart2 size={24} style={{ color: '#0071E3' }} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.02em]">イベント成果分析</p>
                  <p className="text-[13px] text-[#AEAEB2] mt-1">セミナー・展示会・ウェビナーの成果分析 — 近日公開</p>
                </div>
                <div
                  className="px-4 py-2 rounded-full text-[12px] font-medium"
                  style={{ background: 'rgba(0,113,227,0.08)', color: '#0071E3' }}
                >
                  Coming Soon
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
