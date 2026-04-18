'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, Target, BookOpen, Users, Gift } from 'lucide-react'

const CARD = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

const POINT_RULES = [
  { action: 'コール1件', points: 10, icon: Phone, color: '#0071E3' },
  { action: 'メール送信', points: 5, icon: Mail, color: '#5E5CE6' },
  { action: 'アポ獲得', points: 100, icon: Target, color: '#34C759' },
  { action: 'ナレッジ投稿', points: 50, icon: BookOpen, color: '#FF9F0A' },
  { action: '研修実施（教える側）', points: 200, icon: Users, color: '#AF52DE' },
  { action: 'ログインボーナス', points: 20, icon: Gift, color: '#FF3B30' },
]

const INCENTIVES = [
  { name: 'Amazonギフト券 ¥1,000', cost: 1000, icon: '🎁' },
  { name: '特別休暇 半日', cost: 3000, icon: '🌴' },
  { name: 'チームランチ券', cost: 2000, icon: '🍱' },
  { name: '書籍購入券 ¥3,000', cost: 1500, icon: '📚' },
]

export default function EconomyPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">仮想経済</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">ポイント設計・インセンティブ交換・ログインボーナス</p>
      </div>

      {/* Point Rules */}
      <div>
        <h3 className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.06em] mb-3 px-1">ポイント設計</h3>
        <div className="grid grid-cols-3 gap-3">
          {POINT_RULES.map((rule, i) => {
            const Icon = rule.icon
            return (
              <motion.div key={rule.action} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                className="bg-[#0c1028] rounded-[10px] p-4 text-center" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ background: rule.color + '14' }}>
                  <Icon size={18} style={{ color: rule.color }} />
                </div>
                <p className="text-[12px] font-medium text-[#EEEEFF] mt-2">{rule.action}</p>
                <p className="text-[16px] font-bold mt-1" style={{ color: rule.color }}>+{rule.points} pt</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Incentives */}
      <div>
        <h3 className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.06em] mb-3 px-1">インセンティブ交換</h3>
        <div className="grid grid-cols-2 gap-3">
          {INCENTIVES.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#0c1028] rounded-[10px] p-4 flex items-center gap-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
              <span className="text-[24px]">{item.icon}</span>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#EEEEFF]">{item.name}</p>
                <p className="text-[12px] text-[#FF3B30] font-semibold mt-0.5">{item.cost.toLocaleString()} pt</p>
              </div>
              <button className="px-3 py-1.5 text-[11px] font-semibold text-white rounded-[6px]" style={{ background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)' }}>交換</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Login Bonus */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-[#0c1028] rounded-[8px] p-5" style={{ boxShadow: CARD }}>
        <div className="flex items-center gap-2 mb-3">
          <Gift size={16} className="text-[#FF3B30]" />
          <h3 className="text-[14px] font-semibold text-[#EEEEFF]">ログインボーナス</h3>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5,6,7].map(day => {
            const claimed = day <= 5
            return (
              <div key={day} className="flex-1 text-center">
                <div className={`w-full aspect-square rounded-[8px] flex items-center justify-center text-[12px] font-bold ${claimed ? 'text-white' : 'text-[#99AACC]'}`}
                  style={{ background: claimed ? 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)' : 'rgba(34,68,170,0.15)' }}>
                  {claimed ? '✓' : day}
                </div>
                <p className="text-[10px] text-[#99AACC] mt-1">Day {day}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
