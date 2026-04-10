'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, Target, BookOpen, Trophy, Flame, Sparkles } from 'lucide-react'

const CARD = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

const PROFILE = { name: '田中太郎', level: 12, rank: 'シルバー', xp: 2400, xpNext: 3000, totalPoints: 8500, streak: 5 }
const RANKS = ['ブロンズ', 'シルバー', 'ゴールド', 'プラチナ', 'ダイヤモンド']

const QUESTS = [
  { id: 'q1', title: '本日5件コール完了', type: 'デイリー', reward: 50, progress: 3, goal: 5, icon: Phone, color: '#0071E3' },
  { id: 'q2', title: 'メール3通送信', type: 'デイリー', reward: 30, progress: 2, goal: 3, icon: Mail, color: '#5E5CE6' },
  { id: 'q3', title: '今週アポ2件獲得', type: 'ウィークリー', reward: 200, progress: 1, goal: 2, icon: Target, color: '#34C759' },
  { id: 'q4', title: 'ナレッジ記事1件投稿', type: 'ウィークリー', reward: 100, progress: 0, goal: 1, icon: BookOpen, color: '#FF9F0A' },
  { id: 'q5', title: '月間コール100件達成', type: 'マンスリー', reward: 500, progress: 68, goal: 100, icon: Trophy, color: '#FF3B30' },
]

const TIME_EVENTS = [
  { time: '09:00-10:00', label: 'モーニングブースト', bonus: '×2 ポイント', color: '#FF9F0A', active: true },
  { time: '14:00-15:00', label: 'アフタヌーンラッシュ', bonus: '×1.5 ポイント', color: '#0071E3', active: false },
  { time: '17:00-17:30', label: 'ラストスパート', bonus: '×3 ポイント', color: '#FF3B30', active: false },
]

export default function QuestsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">クエスト</h1>
        <p className="text-[13px] text-[#8E8E93] mt-0.5">日々のアクションでXPを獲得し、レベルアップしよう</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[12px] p-5" style={{ boxShadow: CARD }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3B30)' }}>{PROFILE.name[0]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold text-[#1D1D1F]">{PROFILE.name}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFD60A22] text-[#C07000]">Lv.{PROFILE.level}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.05)] text-[#6E6E73]">{PROFILE.rank}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div className="h-full rounded-full bg-[#FFD60A]" style={{ width: `${(PROFILE.xp / PROFILE.xpNext) * 100}%` }} />
              </div>
              <span className="text-[11px] text-[#8E8E93] tabular-nums">{PROFILE.xp} / {PROFILE.xpNext} XP</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[20px] font-bold text-[#FF3B30] tabular-nums">{PROFILE.totalPoints.toLocaleString()}</p>
            <p className="text-[11px] text-[#AEAEB2]">累計ポイント</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <Flame size={14} className="text-[#FF9F0A]" />
          <span className="text-[12px] font-medium text-[#C07000]">{PROFILE.streak}日連続ログイン中</span>
          <span className="ml-2 text-[11px] text-[#AEAEB2]">{RANKS.map((r, i) => <span key={r} className={r === PROFILE.rank ? 'font-bold text-[#1D1D1F]' : ''}>{r}{i < RANKS.length - 1 ? ' → ' : ''}</span>)}</span>
        </div>
      </motion.div>

      {/* Time Events */}
      <div>
        <h3 className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-[0.06em] mb-2 px-1">タイムイベント</h3>
        <div className="grid grid-cols-3 gap-3">
          {TIME_EVENTS.map((ev, i) => (
            <motion.div key={ev.time} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-[10px] p-3 relative overflow-hidden"
              style={{ background: ev.active ? ev.color + '12' : '#FFF', border: ev.active ? `1px solid ${ev.color}30` : '1px solid rgba(0,0,0,0.06)' }}>
              {ev.active && <Sparkles size={12} style={{ color: ev.color }} className="absolute top-2 right-2" />}
              <p className="text-[11px] font-bold tabular-nums" style={{ color: ev.active ? ev.color : '#AEAEB2' }}>{ev.time}</p>
              <p className="text-[13px] font-semibold text-[#1D1D1F] mt-1">{ev.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: ev.color }}>{ev.bonus}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quests */}
      <div>
        <h3 className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-[0.06em] mb-2 px-1">アクティブクエスト</h3>
        <div className="space-y-2">
          {QUESTS.map((q, i) => {
            const Icon = q.icon
            const pct = (q.progress / q.goal) * 100
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-[10px] flex items-center gap-4 px-4 py-3" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: q.color + '14' }}>
                  <Icon size={16} style={{ color: q.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#1D1D1F] truncate">{q.title}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.05)] text-[#6E6E73]">{q.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: q.color }} />
                    </div>
                    <span className="text-[11px] text-[#8E8E93] tabular-nums shrink-0">{q.progress}/{q.goal}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[13px] font-bold" style={{ color: q.color }}>+{q.reward}</span>
                  <p className="text-[10px] text-[#AEAEB2]">pt</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
