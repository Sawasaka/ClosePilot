'use client'

import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">配信管理</h1>
        <p className="text-[13px] text-[#AABBDD] mt-0.5">メールテンプレート・配信履歴を管理</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-[8px] p-8 text-center"
        style={{ background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)', border: '1px solid #2244AA', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
      >
        <Send size={32} className="mx-auto mb-3" style={{ color: '#3355AA' }} />
        <p className="text-[15px] font-semibold text-[#EEEEFF]">配信管理機能は準備中です</p>
        <p className="text-[13px] text-[#AABBDD] mt-1">メールテンプレートの作成・配信履歴の確認ができるようになります</p>
      </motion.div>
    </div>
  )
}
