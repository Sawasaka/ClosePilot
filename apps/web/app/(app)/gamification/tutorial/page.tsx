'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react'

const CARD = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

const TRACKS = [
  {
    role: 'インサイドセールス (IS)', color: '#0071E3', progress: 65,
    steps: [
      { label: 'ターゲットリストの作成方法', done: true },
      { label: 'コールスクリプトの活用', done: true },
      { label: 'アポ獲得のベストプラクティス', done: true },
      { label: 'CRMへの活動記録', done: true },
      { label: 'ナーチャリングメールの設定', done: false },
      { label: 'ホットリード判定の活用', done: false },
    ],
  },
  {
    role: 'フィールドセールス', color: '#34C759', progress: 40,
    steps: [
      { label: '商談準備チェックリスト', done: true },
      { label: '提案書テンプレートの活用', done: true },
      { label: 'パイプライン管理の基本', done: false },
      { label: '交渉・クロージング手法', done: false },
      { label: '見積書作成と承認フロー', done: false },
    ],
  },
  {
    role: 'カスタマーサクセス (CS)', color: '#FF9F0A', progress: 30,
    steps: [
      { label: 'オンボーディングフロー', done: true },
      { label: '定例レビューの進め方', done: false },
      { label: 'ヘルススコアの確認方法', done: false },
      { label: 'アップセル / クロスセル提案', done: false },
      { label: 'チャーン防止アクション', done: false },
    ],
  },
]

export default function TutorialPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>('インサイドセールス (IS)')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">チュートリアル</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">営業ロールごとのスキルロードマップとプログレス</p>
      </div>

      <div className="space-y-4">
        {TRACKS.map((track, ti) => {
          const isOpen = expandedRole === track.role
          const doneCount = track.steps.filter(s => s.done).length
          return (
            <motion.div key={track.role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: ti * 0.06 }} className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: CARD }}>
              <button onClick={() => setExpandedRole(isOpen ? null : track.role)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[rgba(136,187,255,0.04)] transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: track.color + '15' }}>
                  <BookOpen size={18} style={{ color: track.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-semibold text-[#EEEEFF]">{track.role}</p>
                  <p className="text-[12px] text-[#CCDDF0] mt-0.5">{doneCount} / {track.steps.length} 完了</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(34,68,170,0.15)' }}>
                    <div className="h-full rounded-full" style={{ width: `${track.progress}%`, background: track.color }} />
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: track.color }}>{track.progress}%</span>
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
                    <ChevronRight size={14} className="text-[#99AACC]" />
                  </motion.div>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden" style={{ borderTop: '1px solid #2244AA' }}>
                    <div className="px-5 py-3 space-y-1">
                      {track.steps.map((step, si) => (
                        <div key={si} className="flex items-center gap-3 py-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: step.done ? track.color : 'rgba(0,0,0,0.06)' }}>
                            {step.done && <CheckCircle2 size={12} className="text-white" />}
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
    </div>
  )
}
