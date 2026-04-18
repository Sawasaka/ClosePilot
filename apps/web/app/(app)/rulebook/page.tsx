'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollText, Shield, Users, Zap, BookOpen, ChevronRight, Plus, Pencil, X, Star } from 'lucide-react'

// ─── RPG風ルールブック ────────────────────────────────────────────────────────

interface Rule {
  id: string
  chapter: string
  title: string
  content: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const RARITY_STYLES = {
  common: {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', borderColor: 'rgba(255,255,255,0.35)', label: 'COMMON',
  },
  rare: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 16px rgba(50,173,230,0.85), 0 0 6px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', label: 'RARE',
  },
  epic: {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 16px rgba(139,92,246,0.85), 0 0 6px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', label: 'EPIC',
  },
  legendary: {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 20px rgba(255,159,10,0.95), 0 0 8px rgba(255,204,102,1), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', label: 'LEGENDARY',
  },
}

const INITIAL_RULES: Rule[] = [
  { id: 'r1', chapter: '第1章', title: '行動規範', content: '全メンバーは誠実さ・透明性・敬意を持って行動する。顧客に対しても社内に対しても同様。嘘や隠し事は即座にトラスト値が下がる。', icon: '⚔️', rarity: 'legendary' },
  { id: 'r2', chapter: '第2章', title: 'コミュニケーション', content: 'Slackの返信は2時間以内。緊急事項は電話。会議は30分以内。アジェンダなしの会議は開催禁止。', icon: '📡', rarity: 'epic' },
  { id: 'r3', chapter: '第3章', title: '営業プロセス', content: '新規リードは24時間以内に初回コンタクト。商談後48時間以内にフォローメール。CRMへの記録は当日中に完了。', icon: '🎯', rarity: 'rare' },
  { id: 'r4', chapter: '第4章', title: '報告義務', content: '週次報告は毎週金曜17:00まで。月次報告は月末3営業日前まで。重大インシデントは発生から1時間以内に報告。', icon: '📜', rarity: 'common' },
  { id: 'r5', chapter: '第5章', title: 'セキュリティ', content: '顧客情報の社外持ち出し禁止。パスワードは90日ごとに変更。2要素認証は全アカウント必須。', icon: '🛡️', rarity: 'epic' },
  { id: 'r6', chapter: '第6章', title: '評価制度', content: '四半期ごとのOKR評価。360度フィードバックを実施。成果だけでなくプロセスも評価対象。', icon: '⭐', rarity: 'rare' },
]

const CHAPTERS = Array.from(new Set(INITIAL_RULES.map(r => r.chapter)))

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

export default function RulebookPage() {
  const [rules, setRules] = useState(INITIAL_RULES)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [filterChapter, setFilterChapter] = useState('')

  const filtered = filterChapter ? rules.filter(r => r.chapter === filterChapter) : rules

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
            boxShadow: '0 0 24px rgba(255,159,10,0.85), 0 0 8px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
            border: '2px solid rgba(255,255,255,0.4)',
          }}
        >
          <ScrollText size={28} style={{ color: '#5B2E00', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
        </div>
        <div>
          <h1 className="text-[24px] font-black text-[#EEEEFF] tracking-[0.02em]" style={{ textShadow: '0 0 16px rgba(255,204,102,0.4)' }}>
            ルールブック
          </h1>
          <p className="text-[13px] text-[#99AACC]">組織のルール・規範を管理。全{rules.length}条</p>
        </div>
      </motion.div>

      {/* Chapter filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterChapter('')}
          className="h-[30px] px-3 text-[12px] font-bold rounded-full transition-all"
          style={{ background: !filterChapter ? '#2244AA' : 'rgba(136,187,255,0.06)', color: !filterChapter ? '#FFF' : '#88BBFF' }}
        >
          全章
        </button>
        {CHAPTERS.map(ch => (
          <button
            key={ch}
            onClick={() => setFilterChapter(ch)}
            className="h-[30px] px-3 text-[12px] font-bold rounded-full transition-all"
            style={{ background: filterChapter === ch ? '#2244AA' : 'rgba(136,187,255,0.06)', color: filterChapter === ch ? '#FFF' : '#88BBFF' }}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Rule cards — RPG spell book style */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((rule, i) => {
          const rarity = RARITY_STYLES[rule.rarity]
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[12px] p-5 cursor-pointer relative overflow-hidden group"
              style={{
                background: FF.card,
                border: FF.border,
                boxShadow: FF.shadow,
              }}
              onClick={() => setSelectedRule(rule)}
              whileHover={{ y: -3, boxShadow: `0 6px 24px rgba(0,0,0,0.55), ${rarity.glow}` }}
            >
              {/* Top glow line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: rarity.gradient,
                boxShadow: rarity.glow,
              }} />

              <div className="flex items-start gap-3">
                <span className="text-[28px] shrink-0" style={{ filter: `drop-shadow(0 0 8px rgba(255,255,255,0.3))` }}>{rule.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#99AACC] uppercase tracking-[0.08em]">{rule.chapter}</span>
                    <span
                      className="inline-flex items-center px-2 py-[2px] rounded-full text-[8px] font-black uppercase tracking-[0.1em]"
                      style={{
                        background: rarity.gradient,
                        boxShadow: rarity.glow,
                        color: rarity.color,
                        border: `1px solid ${rarity.borderColor}`,
                        letterSpacing: '0.08em',
                      }}
                    >
                      {rarity.label}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-[#EEEEFF] mb-2">{rule.title}</h3>
                  <p className="text-[12px] text-[#CCDDF0] leading-relaxed line-clamp-3">{rule.content}</p>
                </div>
              </div>

              {/* Hover arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-[#88BBFF]" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRule && (() => {
          const rarity = RARITY_STYLES[selectedRule.rarity]
          return (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRule(null)} />
              <motion.div
                className="relative w-full max-w-[520px] rounded-[16px] overflow-hidden"
                style={{
                  background: FF.card,
                  border: `2px solid rgba(255,255,255,0.15)`,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.6), ${rarity.glow}`,
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Top glow */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                  background: rarity.gradient,
                  boxShadow: rarity.glow,
                }} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[36px]" style={{ filter: `drop-shadow(0 0 12px rgba(255,255,255,0.4))` }}>{selectedRule.icon}</span>
                      <div>
                        <span className="text-[10px] font-bold text-[#99AACC] uppercase tracking-[0.08em]">{selectedRule.chapter}</span>
                        <h2 className="text-[20px] font-black text-[#EEEEFF]">{selectedRule.title}</h2>
                      </div>
                    </div>
                    <button onClick={() => setSelectedRule(null)} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.08)]">
                      <X size={18} className="text-[#CCDDF0]" />
                    </button>
                  </div>

                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] mb-4"
                    style={{
                      background: rarity.gradient,
                      boxShadow: rarity.glow,
                      color: rarity.color,
                      border: `1px solid ${rarity.borderColor}`,
                    }}
                  >
                    <Star size={10} className="mr-1" />
                    {rarity.label}
                  </span>

                  <div
                    className="rounded-[10px] p-5 mt-2"
                    style={{
                      background: 'rgba(16,16,40,0.8)',
                      border: '1px solid rgba(34,68,170,0.3)',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <p className="text-[14px] text-[#EEEEFF] leading-[1.8]">{selectedRule.content}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
