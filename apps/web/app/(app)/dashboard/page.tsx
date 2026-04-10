'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, PhoneCall, CalendarCheck, ChevronDown, TrendingUp, Trophy } from 'lucide-react'
import type { ISRepActivity } from '@/types/crm'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_IS_REPS: ISRepActivity[] = [
  {
    repId: 'u1', repName: '田中太郎', color: '#0071E3',
    today: { calls: 12, connected: 4, appointments: 1, emails: 5 },
    thisWeek: { calls: 48, connected: 16, appointments: 4, emails: 22, emailOpenRate: 42, emailReplyRate: 8 },
  },
  {
    repId: 'u2', repName: '鈴木花子', color: '#34C759',
    today: { calls: 15, connected: 6, appointments: 2, emails: 3 },
    thisWeek: { calls: 62, connected: 22, appointments: 7, emails: 18, emailOpenRate: 38, emailReplyRate: 12 },
  },
  {
    repId: 'u3', repName: '佐藤次郎', color: '#FF9F0A',
    today: { calls: 8, connected: 2, appointments: 0, emails: 7 },
    thisWeek: { calls: 35, connected: 10, appointments: 2, emails: 30, emailOpenRate: 45, emailReplyRate: 6 },
  },
]

// Pipeline stage mock data for dashboard
const PIPELINE_STAGES = [
  { label: 'IS',             amount: 1680000,  count: 2, color: '#6E6E73' },
  { label: '商談済み',       amount: 3300000,  count: 2, color: '#0044DD' },
  { label: 'PJ化予定あり',   amount: 3600000,  count: 1, color: '#4B48CC' },
  { label: 'POC実施中',     amount: 1800000,  count: 1, color: '#9B30D9' },
  { label: '決裁者合意済み', amount: 720000,   count: 1, color: '#C07000' },
  { label: '受注',           amount: 4800000,  count: 1, color: '#007A30' },
]

const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

function formatAmount(n: number): string {
  return `¥${n.toLocaleString('ja-JP')}`
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedRepId, setSelectedRepId] = useState('u1')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const rep = MOCK_IS_REPS.find(r => r.repId === selectedRepId) ?? MOCK_IS_REPS[0]
  const connectionRate = rep.today.calls > 0 ? ((rep.today.connected / rep.today.calls) * 100).toFixed(0) : '0'

  const totalPipeline = PIPELINE_STAGES.filter(s => s.label !== '受注').reduce((s, st) => s + st.amount, 0)
  const totalCount = PIPELINE_STAGES.filter(s => s.label !== '受注').reduce((s, st) => s + st.count, 0)
  const wonStage = PIPELINE_STAGES.find(s => s.label === '受注')
  const maxAmount = Math.max(...PIPELINE_STAGES.map(s => s.amount))

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
            ダッシュボード
          </h1>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">担当者別の成績・アクション分析</p>
        </div>

        {/* Rep selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 h-[34px] px-3 rounded-[8px] text-[13px] font-medium transition-all"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
              color: '#1D1D1F',
            }}
          >
            <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: rep.color }}>
              {rep.repName[0]}
            </div>
            {rep.repName}
            <ChevronDown size={13} style={{ color: '#8E8E93' }} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div
                className="absolute right-0 top-[40px] z-50 w-[180px] rounded-[10px] py-1 overflow-hidden"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                }}
              >
                {MOCK_IS_REPS.map(r => (
                  <button
                    key={r.repId}
                    onClick={() => { setSelectedRepId(r.repId); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] transition-colors text-left"
                    style={{ color: r.repId === selectedRepId ? '#0071E3' : '#1D1D1F', fontWeight: r.repId === selectedRepId ? 600 : 400 }}
                  >
                    <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: r.color }}>
                      {r.repName[0]}
                    </div>
                    {r.repName}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-[14px] p-5"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">パイプライン</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} style={{ color: '#0071E3' }} />
              <span className="text-[13px] font-semibold text-[#1D1D1F] tabular-nums">{formatAmount(totalPipeline)}</span>
              <span className="text-[11px] text-[#AEAEB2]">/ {totalCount}件</span>
            </div>
            {wonStage && (
              <>
                <span className="w-px h-3" style={{ background: 'rgba(0,0,0,0.07)' }} />
                <div className="flex items-center gap-1.5">
                  <Trophy size={13} style={{ color: '#34C759' }} />
                  <span className="text-[13px] font-semibold text-[#007A30] tabular-nums">{formatAmount(wonStage.amount)}</span>
                  <span className="text-[11px] text-[#AEAEB2]">受注</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {PIPELINE_STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <div className="w-[100px] shrink-0 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-[11px] text-[#6E6E73] truncate">{stage.label}</span>
              </div>
              <div className="flex-1 h-[22px] rounded-[4px] relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stage.amount / maxAmount) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-[4px]"
                  style={{ background: stage.color + 'CC', minWidth: 2 }}
                />
              </div>
              <div className="w-[90px] shrink-0 text-right">
                <span className="text-[12px] font-semibold text-[#1D1D1F] tabular-nums">{formatAmount(stage.amount)}</span>
              </div>
              <span className="w-[30px] shrink-0 text-right text-[11px] text-[#AEAEB2] tabular-nums">{stage.count}件</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '本日コール', value: `${rep.today.calls}`, sub: `接続率 ${connectionRate}%`, color: '#0071E3' },
          { label: 'アポ獲得', value: `${rep.today.appointments}`, sub: `今週合計 ${rep.thisWeek.appointments}件`, color: '#34C759' },
          { label: 'メール送信', value: `${rep.today.emails}`, sub: `開封率 ${rep.thisWeek.emailOpenRate}%`, color: '#FF9F0A' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[14px] p-5 relative overflow-hidden"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${stat.color}30 0%, transparent 70%)` }} />
            <p className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.05em]">{stat.label}</p>
            <p className="mt-2 text-[34px] font-bold tracking-[-0.04em]" style={{ color: stat.color }}>{stat.value}</p>
            <p className="mt-1 text-[11px] text-[#AEAEB2]">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 今週の実績 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-[14px] p-5"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <h3 className="text-[14px] font-semibold text-[#1D1D1F] tracking-[-0.01em] mb-4">今週の実績</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'コール', value: rep.thisWeek.calls, color: '#0071E3', icon: PhoneCall },
            { label: '接続', value: rep.thisWeek.connected, color: '#34C759', icon: Phone },
            { label: 'アポ獲得', value: rep.thisWeek.appointments, color: '#FF9F0A', icon: CalendarCheck },
            { label: 'メール', value: rep.thisWeek.emails, color: '#5E5CE6', icon: Mail },
          ].map(item => (
            <div key={item.label} className="rounded-[10px] px-4 py-3" style={{ background: `${item.color}0A` }}>
              <div className="flex items-center gap-2 mb-1">
                <item.icon size={13} style={{ color: item.color }} />
                <p className="text-[11px] text-[#8E8E93]">{item.label}</p>
              </div>
              <p className="text-[24px] font-bold tracking-[-0.03em] tabular-nums" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* メール指標 */}
        <div className="mt-4 pt-3 flex items-center gap-6" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#8E8E93]">開封率</span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">{rep.thisWeek.emailOpenRate}%</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#8E8E93]">返信率</span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">{rep.thisWeek.emailReplyRate}%</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#8E8E93]">接続率</span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">{rep.thisWeek.calls > 0 ? Math.round((rep.thisWeek.connected / rep.thisWeek.calls) * 100) : 0}%</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#8E8E93]">アポ率</span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">{rep.thisWeek.connected > 0 ? Math.round((rep.thisWeek.appointments / rep.thisWeek.connected) * 100) : 0}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
