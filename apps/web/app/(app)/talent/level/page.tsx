'use client'

import { motion } from 'framer-motion'
import { Flame, TrendingUp } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const PROFILE = {
  name: '田中太郎', team: 'インサイドセールス', level: 12, rank: 'シルバー',
  xp: 2400, xpNext: 3000, totalPoints: 8500, streak: 5,
}
const RANKS = ['ブロンズ', 'シルバー', 'ゴールド', 'プラチナ', 'ダイヤモンド']

const SKILLS = [
  { name: 'ヒアリング力', value: 4, max: 5, color: '#88BBFF' },
  { name: '提案力', value: 3, max: 5, color: '#AA88FF' },
  { name: 'クロージング力', value: 2, max: 5, color: '#FF8888' },
  { name: 'プロダクト知識', value: 4, max: 5, color: '#44FF88' },
  { name: '業界知識', value: 3, max: 5, color: '#FFDD44' },
]

const GROWTH_LOG = [
  { date: '2026-03-20', text: 'Lv.11 → Lv.12 にレベルアップ', color: '#FFDD44' },
  { date: '2026-03-18', text: 'クロージング力が 1 → 2 に上昇', color: '#FF8888' },
  { date: '2026-03-15', text: '「コールマスター」バッジ獲得', color: '#88BBFF' },
  { date: '2026-03-10', text: '月間コール100件達成', color: '#44FF88' },
  { date: '2026-03-05', text: 'Lv.10 → Lv.11 にレベルアップ', color: '#FFDD44' },
]

export default function MyLevelPage() {
  const xpPct = (PROFILE.xp / PROFILE.xpNext) * 100

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">マイレベル</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">XP・ランク・スキルマップ</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[8px] p-6" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[22px] font-black shrink-0"
            style={{
              background: 'linear-gradient(135deg, #5AC8FA 0%, #5577DD 35%, #2244AA 70%, #3355CC 100%)',
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 0 24px rgba(85,119,221,0.85), 0 0 8px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
            {PROFILE.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[18px] font-bold text-[#EEEEFF]">{PROFILE.name}</span>
              <span
                className="text-[11px] font-black px-2.5 py-[3px] rounded-full whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #FFF080 0%, #FFE040 30%, #FFD60A 60%, #FF9F0A 100%)',
                  boxShadow: '0 0 14px rgba(255,214,10,0.85), 0 0 5px rgba(255,240,128,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
                  color: '#7B2D00',
                  border: '1px solid rgba(255,255,255,0.4)',
                  letterSpacing: '0.02em',
                }}
              >
                Lv.{PROFILE.level}
              </span>
              <span
                className="text-[11px] font-black px-2.5 py-[3px] rounded-full whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
                  boxShadow: '0 0 12px rgba(174,174,178,0.75), inset 0 1px 0 rgba(255,255,255,0.5)',
                  color: '#2C2C2E',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                {PROFILE.rank}
              </span>
            </div>
            <p className="text-[12px] text-[#CCDDF0] mb-2">{PROFILE.team}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid rgba(125,211,252,0.4)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)', boxShadow: '0 0 12px rgba(50,173,230,0.85), 0 0 4px rgba(125,211,252,0.95)' }} />
              </div>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: '#7AB4FF', textShadow: '0 0 6px rgba(50,173,230,0.7)' }}>{PROFILE.xp} / {PROFILE.xpNext} XP</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[28px] font-black tabular-nums" style={{ color: '#FFDD44', textShadow: '0 0 12px rgba(255,221,68,0.85), 0 0 4px rgba(255,240,128,0.95)' }}>{PROFILE.totalPoints.toLocaleString()}</p>
            <p className="text-[11px] text-[#CCDDF0]">累計ポイント</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(34,68,170,0.2)' }}>
          <Flame size={14} style={{ color: '#FF8844', filter: 'drop-shadow(0 0 4px rgba(255,136,68,0.85))' }} />
          <span className="text-[12px] font-bold" style={{ color: '#FF8844', textShadow: '0 0 6px rgba(255,136,68,0.6)' }}>{PROFILE.streak}日連続ログイン</span>
          <span className="ml-4 text-[11px] text-[#99AACC]">
            {RANKS.map((r, i) => <span key={r} className={r === PROFILE.rank ? 'font-bold text-[#88BBFF]' : ''}>{r}{i < RANKS.length - 1 ? ' → ' : ''}</span>)}
          </span>
        </div>
      </motion.div>

      {/* Skill Map */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-4 tracking-[0.02em]">スキルマップ</h3>
        <div className="space-y-3">
          {SKILLS.map((skill, i) => (
            <motion.div key={skill.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center gap-3">
              <span className="w-[100px] text-[12px] text-[#CCDDF0] shrink-0">{skill.name}</span>
              <div className="flex-1 flex gap-1.5">
                {Array.from({ length: skill.max }).map((_, j) => (
                  <div key={j} className="flex-1 h-5 rounded-[3px]" style={{
                    background: j < skill.value
                      ? `linear-gradient(180deg, ${skill.color}ff 0%, ${skill.color}cc 100%)`
                      : 'rgba(16,16,40,0.6)',
                    boxShadow: j < skill.value
                      ? `0 0 12px ${skill.color}cc, 0 0 4px ${skill.color}, inset 0 1px 0 rgba(255,255,255,0.4)`
                      : 'inset 0 1px 2px rgba(0,0,0,0.4)',
                    border: j < skill.value
                      ? `1px solid rgba(255,255,255,0.4)`
                      : '1px solid rgba(34,68,170,0.3)',
                  }} />
                ))}
              </div>
              <span
                className="text-[12px] font-black tabular-nums w-8 text-right"
                style={{ color: skill.color, textShadow: `0 0 8px ${skill.color}cc, 0 0 2px ${skill.color}` }}
              >
                {skill.value}/{skill.max}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Growth Log */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-4 tracking-[0.02em]">成長ログ</h3>
        <div className="space-y-0">
          {GROWTH_LOG.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.04 }}
              className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < GROWTH_LOG.length - 1 ? '1px solid rgba(34,68,170,0.15)' : 'none' }}>
              <TrendingUp size={12} style={{ color: log.color, filter: `drop-shadow(0 0 4px ${log.color}cc)` }} className="shrink-0" />
              <span className="text-[12px] text-[#99AACC] tabular-nums shrink-0 w-16">{log.date.slice(5)}</span>
              <span className="text-[13px] text-[#EEEEFF]">{log.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
