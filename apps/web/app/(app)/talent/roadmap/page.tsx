'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const STAGES = [
  { label: '新人', done: true },
  { label: 'IS独り立ち', done: true },
  { label: 'FS対応可', current: true, done: false },
  { label: 'リーダー', done: false },
  { label: 'マネージャー', done: false },
]

const MILESTONES = [
  { title: '初アポ獲得', status: 'done' as const, date: '2026-01-15', condition: '初回のアポイント獲得' },
  { title: '月間コール100件', status: 'done' as const, date: '2026-02-28', condition: '1ヶ月でコール100件達成' },
  { title: '初受注', status: 'active' as const, date: null, condition: '初めての受注を獲得 — あと1件' },
  { title: 'エンプラ対応認定', status: 'locked' as const, date: null, condition: 'エンタープライズ商談を3件クローズ' },
  { title: 'チームリーダー認定', status: 'locked' as const, date: null, condition: 'メンティー2名以上を独り立ちさせる' },
]

export default function RoadmapPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">ロードマップ</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">キャリアパスとマイルストーン</p>
      </div>

      {/* Career Stage Timeline */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-5 tracking-[0.02em]">キャリアステージ</h3>
        <div className="flex items-center gap-0">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{
                    background: stage.done ? 'linear-gradient(135deg, #2244AA, #4488FF)' : stage.current ? 'linear-gradient(135deg, #FFDD44, #FF8844)' : 'rgba(34,68,170,0.15)',
                    border: stage.current ? '2px solid #FFDD44' : stage.done ? '2px solid #4488FF' : '2px solid rgba(34,68,170,0.3)',
                    boxShadow: stage.current ? '0 0 16px rgba(255,221,68,0.4)' : stage.done ? '0 0 8px rgba(68,136,255,0.3)' : 'none',
                  }}>
                  {stage.done ? <CheckCircle2 size={16} className="text-white" /> : <span className="text-[11px] font-bold" style={{ color: stage.current ? '#1a1a2e' : '#4466AA' }}>{i + 1}</span>}
                </div>
                <span className="text-[11px] font-semibold text-center" style={{ color: stage.current ? '#FFDD44' : stage.done ? '#88BBFF' : '#4466AA' }}>{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className="w-8 h-0.5 -mt-5 shrink-0" style={{ background: stage.done ? '#4488FF' : 'rgba(34,68,170,0.2)' }} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Next Milestone */}
      {(() => {
        const next = MILESTONES.find(m => m.status === 'active')
        if (!next) return null
        return (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="rounded-[8px] p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,221,68,0.08), rgba(255,136,68,0.05))', border: '1px solid rgba(255,221,68,0.2)', boxShadow: '0 0 20px rgba(255,221,68,0.08)' }}>
            <p className="text-[10px] font-bold text-[#FF8844] uppercase tracking-[0.1em] mb-1">NEXT MILESTONE</p>
            <p className="text-[16px] font-bold text-[#FFDD44]">{next.title}</p>
            <p className="text-[13px] text-[#CC8833] mt-1">{next.condition}</p>
          </motion.div>
        )
      })()}

      {/* Milestones List */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-4 tracking-[0.02em]">マイルストーン一覧</h3>
        <div className="space-y-0">
          {MILESTONES.map((ms, i) => (
            <motion.div key={ms.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.04 }}
              className="flex items-center gap-3 py-3" style={{ borderBottom: i < MILESTONES.length - 1 ? '1px solid rgba(34,68,170,0.15)' : 'none', opacity: ms.status === 'locked' ? 0.5 : 1 }}>
              {ms.status === 'done' ? <CheckCircle2 size={16} style={{ color: '#44FF88' }} className="shrink-0" />
                : ms.status === 'active' ? <ArrowRight size={16} style={{ color: '#FFDD44' }} className="shrink-0" />
                : <Circle size={16} style={{ color: '#2244AA' }} className="shrink-0" />}
              <div className="flex-1">
                <p className="text-[13px] font-semibold" style={{ color: ms.status === 'done' ? '#44FF88' : ms.status === 'active' ? '#FFDD44' : '#4466AA' }}>{ms.title}</p>
                <p className="text-[11px] text-[#AABBDD] mt-0.5">{ms.condition}</p>
              </div>
              {ms.date && <span className="text-[11px] text-[#99AACC] tabular-nums shrink-0">{ms.date}</span>}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
