'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsChip,
} from '@/components/obsidian'

// ─── ルールブック ─────────────────────────────────────────────────────────────

interface Rule {
  id: string
  chapter: string
  title: string
  content: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const RARITY_TONE: Record<Rule['rarity'], 'neutral' | 'primary' | 'low' | 'middle'> = {
  common: 'neutral',
  rare: 'low',
  epic: 'primary',
  legendary: 'middle',
}

const RARITY_LABEL: Record<Rule['rarity'], string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
}

const INITIAL_RULES: Rule[] = [
  { id: 'r1', chapter: '第1章', title: '行動規範', content: '全メンバーは誠実さ・透明性・敬意を持って行動する。顧客に対しても社内に対しても同様。嘘や隠し事は即座にトラスト値が下がる。', icon: '⚔️', rarity: 'legendary' },
  { id: 'r2', chapter: '第2章', title: 'コミュニケーション', content: 'Slackの返信は2時間以内。緊急事項は電話。会議は30分以内。アジェンダなしの会議は開催禁止。', icon: '📡', rarity: 'epic' },
  { id: 'r3', chapter: '第3章', title: '営業プロセス', content: '新規リードは24時間以内に初回コンタクト。商談後48時間以内にフォローメール。CRMへの記録は当日中に完了。', icon: '🎯', rarity: 'rare' },
  { id: 'r4', chapter: '第4章', title: '報告義務', content: '週次報告は毎週金曜17:00まで。月次報告は月末3営業日前まで。重大インシデントは発生から1時間以内に報告。', icon: '📜', rarity: 'common' },
  { id: 'r5', chapter: '第5章', title: 'セキュリティ', content: '顧客情報の社外持ち出し禁止。パスワードは90日ごとに変更。2要素認証は全アカウント必須。', icon: '🛡️', rarity: 'epic' },
  { id: 'r6', chapter: '第6章', title: '評価制度', content: '四半期ごとのOKR評価。360度フィードバックを実施。成果だけでなくプロセスも評価対象。', icon: '⭐', rarity: 'rare' },
]

const CHAPTERS = Array.from(new Set(INITIAL_RULES.map(r => r.chapter)))

export default function RulebookPage() {
  const [rules] = useState(INITIAL_RULES)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [filterChapter, setFilterChapter] = useState('')

  const filtered = filterChapter ? rules.filter(r => r.chapter === filterChapter) : rules

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Rulebook"
          title="ルールブック"
          caption={`組織のルール・規範を管理。全 ${rules.length} 条。`}
        />

        {/* ── Chapter filter ── */}
        <div className="flex items-center gap-1.5 mb-6 flex-wrap">
          <button
            onClick={() => setFilterChapter('')}
            className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
            style={{
              backgroundColor: !filterChapter ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: !filterChapter ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            全章
          </button>
          {CHAPTERS.map(ch => {
            const active = filterChapter === ch
            return (
              <button
                key={ch}
                onClick={() => setFilterChapter(ch)}
                className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
                style={{
                  backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                {ch}
              </button>
            )
          })}
        </div>

        {/* ── Rule cards ── */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard
                depth="high"
                padding="md"
                radius="xl"
                onClick={() => setSelectedRule(rule)}
                className="relative group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-[32px] shrink-0 leading-none">{rule.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="text-[10px] font-medium uppercase tracking-[0.12em]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {rule.chapter}
                      </span>
                      <ObsChip tone={RARITY_TONE[rule.rarity]}>{RARITY_LABEL[rule.rarity]}</ObsChip>
                    </div>
                    <h3
                      className="font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-[-0.015em] mb-2"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {rule.title}
                    </h3>
                    <p
                      className="text-[12.5px] leading-relaxed line-clamp-3"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      {rule.content}
                    </p>
                  </div>
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  </div>
                </div>
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {/* ── Detail Modal ── */}
        <AnimatePresence>
          {selectedRule && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                onClick={() => setSelectedRule(null)}
              />
              <motion.div
                className="relative w-full max-w-[520px]"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ObsCard depth="highest" padding="lg" radius="2xl">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[36px] leading-none">{selectedRule.icon}</span>
                      <div>
                        <span
                          className="text-[10px] font-medium uppercase tracking-[0.12em]"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          {selectedRule.chapter}
                        </span>
                        <h2
                          className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.02em] mt-0.5"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {selectedRule.title}
                        </h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRule(null)}
                      className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                    >
                      <X size={18} style={{ color: 'var(--color-obs-text-muted)' }} />
                    </button>
                  </div>

                  <div className="mb-5">
                    <ObsChip tone={RARITY_TONE[selectedRule.rarity]}>
                      {RARITY_LABEL[selectedRule.rarity]}
                    </ObsChip>
                  </div>

                  <div
                    className="rounded-[var(--radius-obs-lg)] p-5"
                    style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                  >
                    <p
                      className="text-[14px] leading-[1.9]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {selectedRule.content}
                    </p>
                  </div>
                </ObsCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
