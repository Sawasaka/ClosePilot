'use client'

import { motion } from 'framer-motion'
import { Phone, Target, BookOpen, Flame, Star, Users } from 'lucide-react'

const TEAM_MEMBERS = [
  { name: '田中太郎', level: 12, badges: ['コールマスター', 'ナレッジ貢献'], color: '#0071E3', trainingGiven: 3 },
  { name: '鈴木花子', level: 15, badges: ['アポの女王', '連続ログイン30日'], color: '#34C759', trainingGiven: 5 },
  { name: '佐藤次郎', level: 8, badges: ['新人賞'], color: '#FF9F0A', trainingGiven: 1 },
]

const BADGES = [
  { name: 'コールマスター', desc: '月間コール100件達成', icon: Phone, color: '#0071E3' },
  { name: 'アポの女王', desc: '月間アポ10件達成', icon: Target, color: '#34C759' },
  { name: 'ナレッジ貢献', desc: 'ナレッジ10件投稿', icon: BookOpen, color: '#FF9F0A' },
  { name: '連続ログイン30日', desc: '30日連続ログイン', icon: Flame, color: '#FF3B30' },
  { name: '新人賞', desc: '入社1ヶ月以内にアポ獲得', icon: Star, color: '#AF52DE' },
  { name: 'チームプレイヤー', desc: '研修を3回以上実施', icon: Users, color: '#5E5CE6' },
]

export default function TeamPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">チームプレイ</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">チーム協力・バッジ・レベルの見える化</p>
      </div>

      {/* Team Members */}
      <div>
        <h3 className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.06em] mb-3 px-1">チームメンバー</h3>
        <div className="space-y-2">
          {TEAM_MEMBERS.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#0c1028] rounded-[10px] flex items-center gap-4 px-5 py-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0" style={{ background: m.color }}>{m.name[0]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#EEEEFF]">{m.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFD60A22] text-[#FFC266]">Lv.{m.level}</span>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {m.badges.map(b => <span key={b} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-[#CCDDF0]">{b}</span>)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] text-[#CCDDF0]">研修実施</p>
                <p className="text-[16px] font-bold text-[#5E5CE6]">{m.trainingGiven}回</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.06em] mb-3 px-1">バッジ一覧</h3>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge, i) => {
            const Icon = badge.icon
            return (
              <motion.div key={badge.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                className="bg-[#0c1028] rounded-[10px] p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: badge.color + '14' }}>
                  <Icon size={20} style={{ color: badge.color }} />
                </div>
                <p className="text-[12px] font-semibold text-[#EEEEFF] mt-2">{badge.name}</p>
                <p className="text-[10px] text-[#99AACC] mt-0.5">{badge.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
