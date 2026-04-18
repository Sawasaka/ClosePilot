'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Target, Briefcase, Mail, TrendingUp } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
  btn: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
  btnBorder: '1px solid #3355CC',
}

const REMAINING_BUSINESS_DAYS = 12

interface GoalItem {
  key: string
  label: string
  icon: React.ElementType
  color: string
  target: number
  current: number
}

const MANAGER_RECOMMENDED = { calls: 500, appointments: 10, deals: 3, emails: 100 }

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([
    { key: 'calls', label: 'コール', icon: Phone, color: '#88BBFF', target: 500, current: 320 },
    { key: 'appointments', label: 'アポ獲得', icon: Target, color: '#44FF88', target: 10, current: 5 },
    { key: 'deals', label: '受注', icon: Briefcase, color: '#FFDD44', target: 3, current: 1 },
    { key: 'emails', label: 'メール送信', icon: Mail, color: '#AA88FF', target: 100, current: 65 },
  ])

  function updateTarget(key: string, value: number) {
    setGoals(prev => prev.map(g => g.key === key ? { ...g, target: Math.max(1, value) } : g))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">目標設定</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">月間目標の設定と進捗確認 · 残り {REMAINING_BUSINESS_DAYS} 営業日</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-3">
        {goals.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          const remaining = Math.max(0, g.target - g.current)
          const dailyNeeded = REMAINING_BUSINESS_DAYS > 0 ? Math.ceil(remaining / REMAINING_BUSINESS_DAYS) : 0
          const Icon = g.icon
          return (
            <motion.div key={g.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-[8px] p-4" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} style={{ color: g.color }} />
                <span className="text-[12px] font-semibold text-[#CCDDF0]">{g.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[24px] font-bold tabular-nums" style={{ color: g.color }}>{g.current}</span>
                <span className="text-[13px] text-[#99AACC]">/ {g.target}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(34,68,170,0.2)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="h-full rounded-full" style={{ background: g.color, boxShadow: `0 0 6px ${g.color}40` }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span style={{ color: pct >= 80 ? '#44FF88' : pct >= 50 ? '#FFDD44' : '#FF8888' }}>{pct}% 達成</span>
                <span className="text-[#99AACC]">1日 {dailyNeeded}件必要</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 目標設定フォーム */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-4 tracking-[0.02em]">月間目標を設定</h3>
        <div className="space-y-4">
          {goals.map(g => {
            const Icon = g.icon
            const rec = MANAGER_RECOMMENDED[g.key as keyof typeof MANAGER_RECOMMENDED]
            return (
              <div key={g.key} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-[120px] shrink-0">
                  <Icon size={14} style={{ color: g.color }} />
                  <span className="text-[13px] text-[#EEEEFF]">{g.label}</span>
                </div>
                <input
                  type="number" min={1} value={g.target}
                  onChange={e => updateTarget(g.key, parseInt(e.target.value) || 1)}
                  className="w-[100px] h-[36px] px-3 text-[14px] text-center rounded-[6px] text-[#EEEEFF] outline-none tabular-nums font-semibold"
                  style={{ background: 'rgba(16,16,40,0.6)', border: FF.border }}
                />
                <span className="text-[12px] text-[#99AACC]">件/月</span>
                <div className="flex-1" />
                {rec && (
                  <button
                    onClick={() => updateTarget(g.key, rec)}
                    className="text-[10px] px-2 py-1 rounded-[4px] transition-colors hover:opacity-80"
                    style={{ background: 'rgba(136,187,255,0.08)', color: '#AABBDD', border: '1px solid rgba(34,68,170,0.2)' }}
                  >
                    推奨: {rec}件
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* 必要アクション計算 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} style={{ color: '#88BBFF' }} />
          <h3 className="text-[13px] font-bold text-[#EEEEFF] tracking-[0.02em]">目標達成に必要な日次アクション</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {goals.map(g => {
            const remaining = Math.max(0, g.target - g.current)
            const daily = REMAINING_BUSINESS_DAYS > 0 ? Math.ceil(remaining / REMAINING_BUSINESS_DAYS) : 0
            const Icon = g.icon
            const onTrack = (g.current / g.target) >= ((22 - REMAINING_BUSINESS_DAYS) / 22)
            return (
              <div key={g.key} className="flex items-center gap-3 px-4 py-3 rounded-[6px]"
                style={{ background: onTrack ? 'rgba(68,255,136,0.05)' : 'rgba(255,136,136,0.05)', border: onTrack ? '1px solid rgba(68,255,136,0.15)' : '1px solid rgba(255,136,136,0.15)' }}>
                <Icon size={14} style={{ color: g.color }} />
                <div className="flex-1">
                  <p className="text-[12px] text-[#EEEEFF]">{g.label}</p>
                  <p className="text-[10px]" style={{ color: onTrack ? '#44FF88' : '#FF8888' }}>
                    {onTrack ? '順調' : `遅れ — 残り${remaining}件`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-bold tabular-nums" style={{ color: g.color }}>{daily}</p>
                  <p className="text-[9px] text-[#99AACC]">件/日</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
