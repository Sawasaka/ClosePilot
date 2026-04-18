'use client'

import { motion } from 'framer-motion'
import { Phone, Target, BookOpen, Flame, Star, Users, Shield, Award } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const BADGES = [
  { name: 'コールマスター', desc: '月間コール100件達成', icon: Phone, color: '#88BBFF', earned: true, date: '2026-03-15' },
  { name: 'アポの達人', desc: '月間アポ10件達成', icon: Target, color: '#44FF88', earned: true, date: '2026-02-28' },
  { name: 'ナレッジ貢献', desc: 'ナレッジ10件投稿', icon: BookOpen, color: '#FFDD44', earned: false, date: null },
  { name: '連続ログイン30日', desc: '30日連続ログイン', icon: Flame, color: '#FF8844', earned: false, date: null },
  { name: '新人賞', desc: '入社1ヶ月以内にアポ獲得', icon: Star, color: '#AA88FF', earned: true, date: '2026-01-20' },
  { name: 'チームプレイヤー', desc: '研修を3回以上実施', icon: Users, color: '#88BBFF', earned: false, date: null },
]

const CERTIFICATIONS = [
  { name: '商談独り立ち認定', status: '取得済み' as const, date: '2026-02-15' },
  { name: 'エンプラ対応認定', status: '申請中' as const, date: null },
  { name: 'CS基礎認定', status: '未取得' as const, date: null },
  { name: 'マネジメント認定', status: '未取得' as const, date: null },
]

const STATUS_STYLES = {
  '取得済み': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24',
    border: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
  },
  '申請中': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00',
    border: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
  },
  '未取得': {
    gradient: 'linear-gradient(135deg, #6B6B70 0%, #48484A 35%, #2C2C2E 70%, #1C1C1E 100%)',
    glow: '0 0 8px rgba(174,174,178,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    color: '#AABBDD',
    border: 'rgba(174,174,178,0.4)',
    textShadow: 'none',
  },
}

export default function AchievementsPage() {
  const earnedCount = BADGES.filter(b => b.earned).length
  const certCount = CERTIFICATIONS.filter(c => c.status === '取得済み').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">達成・バッジ</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">獲得した認定・バッジの一覧</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'バッジ獲得', value: `${earnedCount}/${BADGES.length}`, color: '#88BBFF' },
          { label: '認定取得', value: `${certCount}/${CERTIFICATIONS.length}`, color: '#44FF88' },
          { label: '獲得率', value: `${Math.round((earnedCount / BADGES.length) * 100)}%`, color: '#FFDD44' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-[8px] p-4 text-center" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
            <p className="text-[22px] font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-[#AABBDD] mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge Gallery */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-4 tracking-[0.02em]">バッジギャラリー</h3>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge, i) => {
            const Icon = badge.icon
            return (
              <motion.div key={badge.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.04 }}
                className="rounded-[8px] p-4 text-center" style={{ background: badge.earned ? `${badge.color}08` : 'rgba(34,68,170,0.05)', border: badge.earned ? `1px solid ${badge.color}25` : '1px solid rgba(34,68,170,0.15)', opacity: badge.earned ? 1 : 0.4 }}>
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2"
                  style={{ background: badge.earned ? `${badge.color}18` : 'rgba(34,68,170,0.1)', border: badge.earned ? `1px solid ${badge.color}40` : '1px solid rgba(34,68,170,0.2)', boxShadow: badge.earned ? `0 0 12px ${badge.color}20` : 'none' }}>
                  <Icon size={20} style={{ color: badge.earned ? badge.color : '#2244AA' }} />
                </div>
                <p className="text-[12px] font-semibold text-[#EEEEFF]">{badge.name}</p>
                <p className="text-[10px] text-[#AABBDD] mt-0.5">{badge.desc}</p>
                {badge.date && <p className="text-[9px] text-[#99AACC] mt-1">{badge.date}</p>}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Certifications */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} style={{ color: '#88BBFF' }} />
          <h3 className="text-[13px] font-bold text-[#EEEEFF] tracking-[0.02em]">認定一覧</h3>
        </div>
        <div className="space-y-0">
          {CERTIFICATIONS.map((cert, i) => {
            const st = STATUS_STYLES[cert.status]
            return (
              <div key={cert.name} className="flex items-center gap-3 py-3" style={{ borderBottom: i < CERTIFICATIONS.length - 1 ? '1px solid rgba(34,68,170,0.15)' : 'none' }}>
                <Award size={14} style={{ color: cert.status === '取得済み' ? '#44FF88' : '#2244AA' }} className="shrink-0" />
                <span className="text-[13px] font-semibold text-[#EEEEFF] flex-1">{cert.name}</span>
                <span
                  className="text-[11px] font-bold px-2.5 py-[3px] rounded-full whitespace-nowrap"
                  style={{
                    background: st.gradient,
                    boxShadow: st.glow,
                    color: st.color,
                    border: `1px solid ${st.border}`,
                    textShadow: st.textShadow,
                    letterSpacing: '0.01em',
                  }}
                >
                  {cert.status}
                </span>
                {cert.date && <span className="text-[11px] text-[#99AACC] tabular-nums">{cert.date}</span>}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
