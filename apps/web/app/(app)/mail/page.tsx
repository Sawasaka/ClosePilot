'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, FileStack, Send, Target } from 'lucide-react'
import { ObsPageShell, ObsHero, ObsCard } from '@/components/obsidian'
import { LinkDocsView } from '@/components/marketing/LinkDocsView'

type Tab = 'send' | 'analytics' | 'links'

const TABS: { key: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'send', label: '配信', icon: Send, desc: 'メールテンプレート・配信履歴' },
  { key: 'analytics', label: '分析', icon: BarChart2, desc: '開封率・クリック率・温度感スコア' },
  { key: 'links', label: 'リンク資料化', icon: FileStack, desc: '資料配布と閲覧トラッキング' },
]

export default function MailPage() {
  const [tab, setTab] = useState<Tab>('send')

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Marketing"
          title="メール配信"
          caption="テンプレ作成から効果測定、資料リンク配布までを1画面で。"
        />

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
            {tab === 'send' && <ComingSoon icon={Send} label="配信機能" hint="メールテンプレートの作成・配信履歴の確認ができるようになります" />}
            {tab === 'analytics' && <ComingSoon icon={Target} label="分析機能" hint="流入元別のリード一覧・開封率・クリック率・温度感スコアリングを可視化します" />}
            {tab === 'links' && <LinkDocsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}

function ComingSoon({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ElementType
  label: string
  hint: string
}) {
  return (
    <ObsCard depth="low" padding="lg" radius="xl" className="text-center">
      <Icon size={32} className="mx-auto mb-3" style={{ color: 'var(--color-obs-text-subtle)' }} />
      <p className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
        {label}は準備中です
      </p>
      <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
        {hint}
      </p>
    </ObsCard>
  )
}
