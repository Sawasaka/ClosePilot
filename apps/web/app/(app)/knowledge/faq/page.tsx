'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ObsHero, ObsPageShell } from '@/components/obsidian'
import { FaqView } from '@/components/knowledge/FaqView'

export default function FaqPage() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1 text-sm transition-colors mb-3"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          <ChevronLeft size={15} />
          ナレッジに戻る
        </Link>

        <ObsHero
          eyebrow="FAQ"
          title="ナレッジ FAQ"
          caption="チケットから自動蓄積される FAQ。Drive 上の BGM-FAQ.md と双方向同期しています。"
        />

        <FaqView />
      </div>
    </ObsPageShell>
  )
}
