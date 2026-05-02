'use client'

import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { ObsPageShell, ObsHero, ObsCard } from '@/components/obsidian'

export default function CampaignsPage() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Campaigns"
          title="配信管理"
          caption="メールテンプレート・配信履歴を管理"
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ObsCard depth="low" padding="lg" radius="xl" className="text-center">
            <Send size={32} className="mx-auto mb-3" style={{ color: 'var(--color-obs-text-subtle)' }} />
            <p className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              配信管理機能は準備中です
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
              メールテンプレートの作成・配信履歴の確認ができるようになります
            </p>
          </ObsCard>
        </motion.div>
      </div>
    </ObsPageShell>
  )
}
