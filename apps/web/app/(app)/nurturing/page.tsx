'use client'

import { motion } from 'framer-motion'
import { Mail, Clock, Zap } from 'lucide-react'

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
  btn: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
  btnBorder: '1px solid #3355CC',
  btnShadow: '0 2px 8px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.15)',
}

export default function NurturingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">ナーチャリング</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">リードの温度感に応じた最適なメールシナリオを設計</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Mail, label: 'アクティブシナリオ', value: '3', sub: '配信中のメールシナリオ', color: '#88BBFF' },
          { icon: Clock, label: '次回配信', value: '3/28', sub: '週次ナーチャリング', color: '#FFDD44' },
          { icon: Zap, label: '開封率', value: '42%', sub: '直近30日間の平均', color: '#44FF88' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="rounded-[8px] p-5 relative overflow-hidden"
            style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}
          >
            <card.icon size={16} style={{ color: card.color }} />
            <p className="text-[24px] font-bold mt-2 tracking-[-0.03em]" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[12px] text-[#AABBDD] mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-[8px] p-8 text-center"
        style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}
      >
        <Mail size={32} className="mx-auto mb-3" style={{ color: '#3355AA' }} />
        <p className="text-[15px] font-semibold text-[#EEEEFF]">メールシナリオを作成しましょう</p>
        <p className="text-[13px] text-[#AABBDD] mt-1">リードの行動に応じた自動配信シナリオを設計できます</p>
        <button
          className="mt-4 px-5 py-2.5 text-[13px] font-semibold text-white rounded-[6px]"
          style={{ background: FF.btn, border: FF.btnBorder, boxShadow: FF.btnShadow }}
        >
          シナリオを作成
        </button>
      </motion.div>
    </div>
  )
}
