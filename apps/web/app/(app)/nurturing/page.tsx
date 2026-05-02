'use client'

import { motion } from 'framer-motion'
import { Mail, Clock, Zap } from 'lucide-react'
import { ObsPageShell, ObsHero, ObsCard, ObsButton } from '@/components/obsidian'

export default function NurturingPage() {
  const kpis = [
    { icon: Mail, label: 'アクティブシナリオ', value: '3', sub: '配信中のメールシナリオ', color: 'var(--color-obs-primary)' },
    { icon: Clock, label: '次回配信', value: '3/28', sub: '週次ナーチャリング', color: 'var(--color-obs-middle)' },
    { icon: Zap, label: '開封率', value: '42%', sub: '直近30日間の平均', color: 'var(--color-obs-low)' },
  ]

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Nurturing"
          title="ナーチャリング"
          caption="リードの温度感に応じた最適なメールシナリオを設計"
        />

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {kpis.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <ObsCard depth="high" padding="md" radius="lg">
                <card.icon size={16} style={{ color: card.color }} />
                <p
                  className="text-[28px] font-bold mt-2 tracking-[-0.03em] font-[family-name:var(--font-display)]"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {card.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                  {card.sub}
                </p>
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {/* ── Empty state ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <ObsCard depth="low" padding="lg" radius="xl" className="text-center">
            <Mail size={32} className="mx-auto mb-3" style={{ color: 'var(--color-obs-text-subtle)' }} />
            <p className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              メールシナリオを作成しましょう
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
              リードの行動に応じた自動配信シナリオを設計できます
            </p>
            <div className="mt-5 inline-block">
              <ObsButton variant="primary" size="md">
                シナリオを作成
              </ObsButton>
            </div>
          </ObsCard>
        </motion.div>
      </div>
    </ObsPageShell>
  )
}
