'use client'

import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

export default function LeadsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">リード分析</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">流入元別リードの温度感とスコアリングを分析</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0c1028] rounded-[8px] p-8 text-center"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <Target size={32} className="mx-auto mb-3 text-[#99AACC]" />
        <p className="text-[15px] font-semibold text-[#EEEEFF]">リード分析機能は準備中です</p>
        <p className="text-[13px] text-[#CCDDF0] mt-1">流入元別のリード一覧・資料閲覧率・温度感スコアリングが確認できるようになります</p>
      </motion.div>
    </div>
  )
}
