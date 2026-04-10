'use client'

import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

export default function CampaignsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">配信管理</h1>
        <p className="text-[13px] text-[#8E8E93] mt-0.5">メールテンプレート・配信履歴を管理</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[12px] p-8 text-center"
        style={{ boxShadow: CARD_SHADOW }}
      >
        <Send size={32} className="mx-auto mb-3 text-[#AEAEB2]" />
        <p className="text-[15px] font-semibold text-[#1D1D1F]">配信管理機能は準備中です</p>
        <p className="text-[13px] text-[#8E8E93] mt-1">メールテンプレートの作成・配信履歴の確認ができるようになります</p>
      </motion.div>
    </div>
  )
}
