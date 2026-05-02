'use client'

import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { ObsPageShell, ObsHero, ObsCard } from '@/components/obsidian'

export default function LeadsPage() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Leads"
          title="リード分析"
          caption="流入元別リードの温度感とスコアリングを分析"
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ObsCard depth="low" padding="lg" radius="xl" className="text-center">
            <Target size={32} className="mx-auto mb-3" style={{ color: 'var(--color-obs-text-subtle)' }} />
            <p className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              リード分析機能は準備中です
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
              流入元別のリード一覧・資料閲覧率・温度感スコアリングが確認できるようになります
            </p>
          </ObsCard>
        </motion.div>
      </div>
    </ObsPageShell>
  )
}
