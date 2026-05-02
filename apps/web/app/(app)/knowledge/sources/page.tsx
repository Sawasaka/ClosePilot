'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ObsHero, ObsPageShell } from '@/components/obsidian'
import { SourcesView } from '@/components/knowledge/SourcesView'

export default function KnowledgeSourcesPage() {
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
          eyebrow="Sources"
          title="ソース連携"
          caption="Google Drive / SharePoint / Web ページを RAG の検索対象として接続する設定画面です。"
        />

        <SourcesView />
      </div>
    </ObsPageShell>
  )
}
