'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, Briefcase, AlertTriangle, CheckCircle } from 'lucide-react'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WEEKLY_ACTIONS = [
  { day: '月', calls: 5, emails: 3, meetings: 1 },
  { day: '火', calls: 8, emails: 5, meetings: 2 },
  { day: '水', calls: 4, emails: 7, meetings: 3 },
  { day: '木', calls: 9, emails: 4, meetings: 1 },
  { day: '金', calls: 6, emails: 6, meetings: 2 },
]

const TASKS = [
  { type: 'call',     company: '株式会社テクノリード',    person: '田中 誠',  rank: 'A', urgent: true  },
  { type: 'call',     company: '合同会社フューチャー',    person: '鈴木 様',  rank: 'A', urgent: true  },
  { type: 'email',    company: '株式会社イノベーション',  person: '佐藤 様',  rank: 'B', urgent: false },
  { type: 'proposal', company: '株式会社グロース',        person: '',         rank: 'A', urgent: false },
]

type RankBadgeStyle = { gradient: string; glow: string; color: string }
const RANK_BADGE_STYLES: Record<string, RankBadgeStyle> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
}
const DEFAULT_RANK_BADGE: RankBadgeStyle = { gradient: 'rgba(0,0,0,0.07)', glow: 'none', color: '#6E6E73' }

// ─── Action Bar Chart ────────────────────────────────────────────────────────

function ActionBarChart() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t) }, [])

  const maxTotal = Math.max(...WEEKLY_ACTIONS.map(d => d.calls + d.emails + d.meetings))

  const weekTotal = WEEKLY_ACTIONS.reduce((s, d) => s + d.calls + d.emails + d.meetings, 0)
  const callTotal = WEEKLY_ACTIONS.reduce((s, d) => s + d.calls, 0)
  const emailTotal = WEEKLY_ACTIONS.reduce((s, d) => s + d.emails, 0)
  const meetingTotal = WEEKLY_ACTIONS.reduce((s, d) => s + d.meetings, 0)

  return (
    <div className="bg-white rounded-[14px] p-5 flex-1" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">今週のアクション数</h3>
          <p className="text-[11px] text-[#AEAEB2] mt-0.5">合計 <span className="font-semibold text-[#1D1D1F]">{weekTotal}</span> 件</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          {[
            { color: '#0071E3', label: 'コール', count: callTotal },
            { color: '#34C759', label: 'メール', count: emailTotal },
            { color: '#FF9F0A', label: '商談', count: meetingTotal },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] text-[#6E6E73]">{l.label} {l.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-3 h-[100px]">
        {WEEKLY_ACTIONS.map((d, i) => {
          const total = d.calls + d.emails + d.meetings
          const pct = total / maxTotal

          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex flex-col-reverse rounded-[5px] overflow-hidden" style={{ height: `${Math.round(pct * 100)}px`, minHeight: 4 }}>
                {/* Stacked bars: meetings (bottom→top displayed top-to-bottom in flex-col-reverse = shown bottom up) */}
                <motion.div
                  style={{
                    background: 'linear-gradient(180deg, #3B8EEA 0%, #0071E3 100%)',
                    height: mounted ? `${Math.round((d.calls / total) * 100)}%` : '0%',
                    transition: `height 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
                  }}
                />
                <motion.div
                  style={{
                    background: 'linear-gradient(180deg, #4DDD70 0%, #34C759 100%)',
                    height: mounted ? `${Math.round((d.emails / total) * 100)}%` : '0%',
                    transition: `height 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06 + 0.05}s`,
                  }}
                />
                <motion.div
                  style={{
                    background: 'linear-gradient(180deg, #FFBA3D 0%, #FF9F0A 100%)',
                    height: mounted ? `${Math.round((d.meetings / total) * 100)}%` : '0%',
                    transition: `height 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06 + 0.1}s`,
                  }}
                />
              </div>
              <span className="text-[11px] text-[#AEAEB2]">{d.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div>
        <h2 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
          おはようございます、太郎さん
        </h2>
        <p className="text-[13px] text-[#6E6E73] mt-0.5">本日のアクションを確認しましょう</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '本日のタスク',        value: '6', sub: '内2件が期限超過',        color: '#0071E3', bg: 'rgba(0,113,227,0.08)' },
          { label: '優先度高（S/Aランク）', value: '4', sub: 'すぐにコールすべき案件', color: '#34C759', bg: 'rgba(52,199,89,0.08)' },
          { label: '停滞中の取引',         value: '3', sub: '要フォローアップ',       color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[14px] p-5 relative overflow-hidden"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)' }}
          >
            {/* Ambient glow */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${stat.color}30 0%, transparent 70%)` }}
            />
            <p className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.05em]">{stat.label}</p>
            <p
              className="mt-2 text-[34px] font-bold tracking-[-0.04em]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] text-[#AEAEB2]">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row: Bar chart + Task list */}
      <div className="flex gap-4 items-start">

        {/* Weekly action bar chart */}
        <ActionBarChart />

        {/* Priority action list */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-[300px] shrink-0 bg-white rounded-[14px] overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)' }}
        >
          <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">優先アクション</h3>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="divide-y"
            style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}
          >
            {TASKS.map((task, i) => {
              const rank = RANK_BADGE_STYLES[task.rank] ?? DEFAULT_RANK_BADGE
              const TypeIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : Briefcase
              const typeColor = task.type === 'call' ? '#0071E3' : task.type === 'email' ? '#5E5CE6' : '#FF9F0A'
              const typeLabel = task.type === 'call' ? 'コール' : task.type === 'email' ? 'メール' : '提案書'
              const actionLabel = task.type === 'call' ? 'コール' : task.type === 'email' ? '作成' : '作成'

              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 5 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="flex items-center gap-2.5 px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                  style={{ borderBottom: i < TASKS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  {/* Type icon */}
                  <div
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0"
                    style={{ background: `${typeColor}18` }}
                  >
                    <TypeIcon size={12} style={{ color: typeColor }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-medium text-[#1D1D1F] truncate">{task.company}</span>
                      <span
                        className="inline-flex items-center justify-center rounded-[4px] text-[10px] font-bold shrink-0"
                        style={{ width: 20, height: 20, background: rank.gradient, boxShadow: rank.glow, color: rank.color, letterSpacing: '0.03em' }}
                      >
                        {task.rank}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AEAEB2]">
                      {typeLabel}{task.person ? ` — ${task.person}` : ''}
                    </p>
                  </div>

                  {/* Action button */}
                  {task.urgent ? (
                    <button
                      className="shrink-0 px-2.5 py-1.5 rounded-[6px] text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: '#0071E3' }}
                    >
                      {actionLabel}
                    </button>
                  ) : (
                    <button className="shrink-0 p-1.5 rounded-[6px] transition-colors hover:bg-[rgba(0,0,0,0.05)]">
                      <CheckCircle size={14} className="text-[#AEAEB2]" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Stalled deals notice */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 px-4 py-3 rounded-[10px]"
        style={{ background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.2)' }}
      >
        <AlertTriangle size={14} style={{ color: '#FF9F0A' }} className="shrink-0" />
        <p className="text-[13px] text-[#C07000]">
          <span className="font-semibold">3件の取引</span>が14日以上活動なし — 早めのフォローアップが必要です
        </p>
      </motion.div>
    </div>
  )
}
