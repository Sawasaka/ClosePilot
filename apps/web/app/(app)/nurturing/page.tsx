'use client'

import { motion } from 'framer-motion'
import { Mail, Clock, Zap } from 'lucide-react'

const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

export default function NurturingPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">ナーチャリング</h1>
        <p className="text-[13px] text-[#8E8E93] mt-0.5">リードの温度感に応じた最適なメールシナリオを設計</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Mail, label: 'アクティブシナリオ', value: '3', sub: '配信中のメールシナリオ', color: '#0071E3' },
          { icon: Clock, label: '次回配信', value: '3/28', sub: '週次ナーチャリング', color: '#FF9F0A' },
          { icon: Zap, label: '開封率', value: '42%', sub: '直近30日間の平均', color: '#34C759' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="bg-white rounded-[12px] p-5 relative overflow-hidden"
            style={{ boxShadow: CARD_SHADOW }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${card.color}20 0%, transparent 70%)` }} />
            <card.icon size={16} style={{ color: card.color }} />
            <p className="text-[24px] font-bold mt-2 tracking-[-0.03em]" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white rounded-[12px] p-8 text-center"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <Mail size={32} className="mx-auto mb-3 text-[#AEAEB2]" />
        <p className="text-[15px] font-semibold text-[#1D1D1F]">メールシナリオを作成しましょう</p>
        <p className="text-[13px] text-[#8E8E93] mt-1">リードの行動に応じた自動配信シナリオを設計できます</p>
        <button
          className="mt-4 px-5 py-2.5 text-[13px] font-semibold text-white rounded-[8px]"
          style={{ background: 'linear-gradient(135deg, #FF4E38, #FF3B30, #CC1A00)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}
        >
          シナリオを作成
        </button>
      </motion.div>
    </div>
  )
}
