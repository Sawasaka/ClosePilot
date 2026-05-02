'use client'

import { ClipboardCheck } from 'lucide-react'
import { ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'

export default function TalentEvaluationPage() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="HR / Evaluation"
          title="評価"
          caption="メンバーの行動量・成果・スキル進捗を多面的に可視化します。"
        />
        <ObsCard depth="high" padding="lg" radius="xl">
          <div className="flex flex-col items-center justify-center py-16 gap-5">
            <div
              className="w-16 h-16 rounded-[var(--radius-obs-lg)] flex items-center justify-center"
              style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
            >
              <ClipboardCheck size={26} style={{ color: 'var(--color-obs-primary)' }} />
            </div>
            <div className="text-center flex flex-col gap-1.5 max-w-md">
              <h2
                className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em]"
                style={{ color: 'var(--color-obs-text)' }}
              >
                準備中
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                目標達成度・コンピテンシー・360度評価を集約した評価ビューを実装予定です。
              </p>
            </div>
          </div>
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}
