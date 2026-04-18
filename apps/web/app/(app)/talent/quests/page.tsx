'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, Target, BookOpen, Trophy, Flame, Sparkles } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const PROFILE = { name: '田中太郎', level: 12, rank: 'シルバー', xp: 2400, xpNext: 3000, totalPoints: 8500, streak: 5 }

const QUESTS = [
  { id: 'q1', title: '本日5件コール完了', type: 'デイリー', reward: 50, progress: 3, goal: 5, icon: Phone, color: '#88BBFF' },
  { id: 'q2', title: 'メール3通送信', type: 'デイリー', reward: 30, progress: 2, goal: 3, icon: Mail, color: '#AA88FF' },
  { id: 'q3', title: '今週アポ2件獲得', type: 'ウィークリー', reward: 200, progress: 1, goal: 2, icon: Target, color: '#44FF88' },
  { id: 'q4', title: 'ナレッジ記事1件投稿', type: 'ウィークリー', reward: 100, progress: 0, goal: 1, icon: BookOpen, color: '#FFDD44' },
  { id: 'q5', title: '月間コール100件達成', type: 'マンスリー', reward: 500, progress: 68, goal: 100, icon: Trophy, color: '#FF4444' },
]

const TIME_EVENTS = [
  { time: '09:00-10:00', label: 'モーニングブースト', bonus: '×2 ポイント', color: '#FFDD44', active: true },
  { time: '14:00-15:00', label: 'アフタヌーンラッシュ', bonus: '×1.5 ポイント', color: '#88BBFF', active: false },
  { time: '17:00-17:30', label: 'ラストスパート', bonus: '×3 ポイント', color: '#FF4444', active: false },
]

export default function TalentQuestsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">クエスト</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">個人目標・デイリー/ウィークリーミッション</p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[16px] font-bold"
            style={{ background: 'linear-gradient(135deg, #2244AA, #3355CC)', border: '2px solid #5577DD' }}>
            {PROFILE.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[#EEEEFF]">{PROFILE.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,221,68,0.15)', color: '#FFDD44' }}>Lv.{PROFILE.level}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(34,68,170,0.2)' }}>
                <div className="h-full rounded-full" style={{ width: `${(PROFILE.xp / PROFILE.xpNext) * 100}%`, background: 'linear-gradient(90deg, #2244AA, #4488FF)', boxShadow: '0 0 6px rgba(68,136,255,0.4)' }} />
              </div>
              <span className="text-[11px] text-[#AABBDD] tabular-nums">{PROFILE.xp}/{PROFILE.xpNext} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Flame size={14} style={{ color: '#FF8844' }} />
            <span className="text-[12px] font-semibold text-[#FF8844]">{PROFILE.streak}日</span>
          </div>
        </div>
      </motion.div>

      {/* Time Events */}
      <div>
        <h3 className="text-[11px] font-bold text-[#99AACC] uppercase tracking-[0.1em] mb-2 px-1">タイムイベント</h3>
        <div className="grid grid-cols-3 gap-3">
          {TIME_EVENTS.map((ev, i) => (
            <motion.div key={ev.time} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-[8px] p-3 relative overflow-hidden"
              style={{ background: ev.active ? `${ev.color}0A` : FF.card, border: ev.active ? `1px solid ${ev.color}30` : FF.border, boxShadow: ev.active ? `0 0 16px ${ev.color}15` : FF.shadow }}>
              {ev.active && <Sparkles size={12} style={{ color: ev.color }} className="absolute top-2 right-2" />}
              <p className="text-[10px] font-bold tabular-nums" style={{ color: ev.active ? ev.color : '#4466AA' }}>{ev.time}</p>
              <p className="text-[13px] font-semibold text-[#EEEEFF] mt-1">{ev.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: ev.color }}>{ev.bonus}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Quests */}
      <div>
        <h3 className="text-[11px] font-bold text-[#99AACC] uppercase tracking-[0.1em] mb-2 px-1">アクティブクエスト</h3>
        <div className="space-y-2">
          {QUESTS.map((q, i) => {
            const Icon = q.icon
            const pct = (q.progress / q.goal) * 100
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                className="rounded-[8px] flex items-center gap-4 px-4 py-3" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
                <div className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: `${q.color}14`, border: `1px solid ${q.color}25` }}>
                  <Icon size={16} style={{ color: q.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#EEEEFF] truncate">{q.title}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,68,170,0.15)', color: '#AABBDD' }}>{q.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(34,68,170,0.2)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: q.color, boxShadow: `0 0 4px ${q.color}40` }} />
                    </div>
                    <span className="text-[11px] text-[#AABBDD] tabular-nums shrink-0">{q.progress}/{q.goal}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[13px] font-bold" style={{ color: q.color }}>+{q.reward}</span>
                  <p className="text-[10px] text-[#99AACC]">pt</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
