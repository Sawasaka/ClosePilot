'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, BookOpen, Database } from 'lucide-react'
import { ObsHero, ObsPageShell } from '@/components/obsidian'
import { TicketsView } from '@/components/knowledge/TicketsView'
import { FaqView } from '@/components/knowledge/FaqView'
import { SourcesView } from '@/components/knowledge/SourcesView'

type Tab = 'tickets' | 'faq' | 'sources'

const TABS: { key: Tab; label: string; icon: React.ElementType; caption: string }[] = [
  {
    key: 'tickets',
    label: 'チケット',
    icon: Inbox,
    caption: '社内チャット (Slack / Google Chat / Teams) への問い合わせを AI が回答した履歴。Drive / SharePoint と同期した RAG が情報源です。',
  },
  {
    key: 'faq',
    label: 'FAQ',
    icon: BookOpen,
    caption: 'チケットから自動蓄積された FAQ。Drive 上の BGM-FAQ.md と双方向同期しています。',
  },
  {
    key: 'sources',
    label: 'ソース連携',
    icon: Database,
    caption: 'Google Drive / SharePoint / Web ページを RAG の検索対象として接続する設定画面です。',
  },
]

export default function KnowledgePage() {
  const [tab, setTab] = useState<Tab>('tickets')
  const current = TABS.find((t) => t.key === tab)!

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero eyebrow="Knowledge" title="ナレッジ" caption={current.caption} />

        {/* Tab nav */}
        <div
          className="inline-flex items-center p-1 rounded-[var(--radius-obs-md)] mb-6 gap-1"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {TABS.map((t) => {
            const active = tab === t.key
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[calc(var(--radius-obs-md)-2px)] text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-obs-primary-container)' : 'transparent',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === 'tickets' && <TicketsView />}
            {tab === 'faq' && <FaqView />}
            {tab === 'sources' && <SourcesView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
