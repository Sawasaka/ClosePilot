'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle2, ChevronRight, Users, Lightbulb } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const TRACKS = [
  { role: 'インサイドセールス (IS)', color: '#88BBFF', progress: 65, steps: [
    { label: 'ターゲットリストの作成方法', done: true },
    { label: 'コールスクリプトの活用', done: true },
    { label: 'アポ獲得のベストプラクティス', done: true },
    { label: 'CRMへの活動記録', done: true },
    { label: 'ナーチャリングメールの設定', done: false },
    { label: 'ホットリード判定の活用', done: false },
  ]},
  { role: 'フィールドセールス', color: '#44FF88', progress: 40, steps: [
    { label: '商談準備チェックリスト', done: true },
    { label: '提案書テンプレートの活用', done: true },
    { label: 'パイプライン管理の基本', done: false },
    { label: '交渉・クロージング手法', done: false },
    { label: '見積書作成と承認フロー', done: false },
  ]},
  { role: 'カスタマーサクセス (CS)', color: '#FFDD44', progress: 30, steps: [
    { label: 'オンボーディングフロー', done: true },
    { label: '定例レビューの進め方', done: false },
    { label: 'ヘルススコアの確認方法', done: false },
    { label: 'アップセル / クロスセル提案', done: false },
    { label: 'チャーン防止アクション', done: false },
  ]},
]

const MENTOR = { name: '鈴木花子', team: 'セールスチーム', sessions: 5 }
const MENTEES = [{ name: '佐藤次郎', progress: 35 }]

const RECOMMENDED = [
  { title: 'クロージング力を鍛える5つのテクニック', skill: 'クロージング力', color: '#FF8888' },
  { title: '業界トレンドレポート 2026Q1', skill: '業界知識', color: '#FFDD44' },
]

export default function TrainingPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>('インサイドセールス (IS)')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">研修プログレス</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">研修チェックリスト・メンター</p>
      </div>

      {/* Training Tracks */}
      <div className="space-y-3">
        {TRACKS.map((track, ti) => {
          const isOpen = expandedRole === track.role
          const doneCount = track.steps.filter(s => s.done).length
          return (
            <motion.div key={track.role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ti * 0.06 }}
              className="rounded-[8px] overflow-hidden" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
              <button onClick={() => setExpandedRole(isOpen ? null : track.role)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[rgba(136,187,255,0.04)] transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: track.color + '15', border: `1px solid ${track.color}30` }}>
                  <BookOpen size={18} style={{ color: track.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-semibold text-[#EEEEFF]">{track.role}</p>
                  <p className="text-[12px] text-[#AABBDD] mt-0.5">{doneCount} / {track.steps.length} 完了</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(34,68,170,0.2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${track.progress}%`, background: track.color, boxShadow: `0 0 6px ${track.color}40` }} />
                  </div>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: track.color }}>{track.progress}%</span>
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }}><ChevronRight size={14} style={{ color: '#99AACC' }} /></motion.div>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden" style={{ borderTop: '1px solid #2244AA' }}>
                    <div className="px-5 py-3 space-y-1">
                      {track.steps.map((step, si) => (
                        <div key={si} className="flex items-center gap-3 py-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: step.done ? track.color : 'rgba(34,68,170,0.15)', border: step.done ? 'none' : '1px solid rgba(34,68,170,0.3)' }}>
                            {step.done && <CheckCircle2 size={12} className="text-[#0c1028]" />}
                          </div>
                          <span className={`text-[13px] ${step.done ? 'text-[#99AACC] line-through' : 'text-[#EEEEFF]'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Mentor / Mentee */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} style={{ color: '#88BBFF' }} />
            <h3 className="text-[13px] font-bold text-[#EEEEFF]">メンター</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: '#34C759' }}>{MENTOR.name[0]}</div>
            <div>
              <p className="text-[13px] font-semibold text-[#EEEEFF]">{MENTOR.name}</p>
              <p className="text-[11px] text-[#AABBDD]">{MENTOR.team} · {MENTOR.sessions}回実施</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} style={{ color: '#FFDD44' }} />
            <h3 className="text-[13px] font-bold text-[#EEEEFF]">メンティー</h3>
          </div>
          {MENTEES.map(m => (
            <div key={m.name} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: '#FF9F0A' }}>{m.name[0]}</div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#EEEEFF]">{m.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(34,68,170,0.2)' }}>
                    <div className="h-full rounded-full bg-[#FFDD44]" style={{ width: `${m.progress}%` }} />
                  </div>
                  <span className="text-[11px] text-[#AABBDD]">{m.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Recommended */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} style={{ color: '#FFDD44' }} />
          <h3 className="text-[13px] font-bold text-[#EEEEFF]">推奨コンテンツ</h3>
        </div>
        <div className="space-y-2">
          {RECOMMENDED.map(r => (
            <div key={r.title} className="flex items-center gap-3 py-2 px-3 rounded-[6px] hover:bg-[rgba(136,187,255,0.04)] cursor-pointer transition-colors">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
              <span className="text-[13px] text-[#EEEEFF]">{r.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto shrink-0" style={{ background: r.color + '15', color: r.color }}>{r.skill}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
