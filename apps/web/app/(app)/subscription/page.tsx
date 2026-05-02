'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Zap, Plus, Check, Star, Crown, X } from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

// ─── クレジット型サブスクリプション管理 ─────────────────────────────────────────

interface Plan {
  id: string
  name: string
  price: string
  priceNote: string
  credits: number
  features: string[]
  icon: React.ElementType
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'plan1',
    name: 'スタンダード',
    price: '¥9,800',
    priceNote: '/月',
    credits: 500,
    features: ['CRM基本機能', 'タスク管理', 'パイプライン管理', 'AI資料生成 (月5回)', 'メールサポート'],
    icon: Zap,
  },
  {
    id: 'plan2',
    name: 'プロフェッショナル',
    price: '¥29,800',
    priceNote: '/月',
    credits: 2000,
    features: ['スタンダード全機能', 'AI資料生成 (無制限)', 'ルールブック機能', 'API連携', '優先サポート', 'カスタムレポート'],
    icon: Star,
    popular: true,
  },
  {
    id: 'plan3',
    name: 'エンタープライズ',
    price: '¥98,000',
    priceNote: '/月',
    credits: 10000,
    features: ['プロフェッショナル全機能', '専属サポート担当', '導入コンサルティング', 'カスタム開発対応', 'SLA保証 (99.9%)', 'オンサイト研修', '専用Slackチャンネル'],
    icon: Crown,
  },
]

const CREDIT_PACKS = [
  { amount: 100,  price: '¥2,980',  perCredit: '¥29.8' },
  { amount: 500,  price: '¥12,800', perCredit: '¥25.6', popular: true },
  { amount: 2000, price: '¥39,800', perCredit: '¥19.9' },
]

export default function SubscriptionPage() {
  const [currentPlan] = useState('plan2')
  const [credits] = useState(1247)
  const [totalCredits] = useState(2000)
  const [showBuyCredits, setShowBuyCredits] = useState(false)

  const usagePct = (credits / totalCredits) * 100

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Subscription"
          title="プラン・クレジット"
          caption="クレジット利用状況とプラン管理。必要な量だけチャージして利用。"
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowBuyCredits(true)}>
              <Plus size={14} className="inline mr-1.5" />
              クレジット追加
            </ObsButton>
          }
        />

        {/* ── Credit usage card ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
            <div
              style={{
                position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div className="flex items-center justify-between relative">
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  現在のクレジット残高
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-[family-name:var(--font-display)] text-[44px] font-bold tabular-nums tracking-[-0.03em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {credits.toLocaleString()}
                  </span>
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    / {totalCredits.toLocaleString()} cr
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  使用済み: {(totalCredits - credits).toLocaleString()} cr
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  残り: {credits.toLocaleString()} cr
                </span>
              </div>
            </div>
          </ObsCard>
        </motion.div>

        {/* ── Plans ── */}
        <div className="mt-8">
          <ObsSectionHeader title="プランを選択" caption="利用規模に応じてプランを変更できます" />
          <div className="grid grid-cols-3 gap-5">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon
              const isCurrent = currentPlan === plan.id
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ObsCard
                    depth={isCurrent ? 'highest' : 'high'}
                    padding="lg"
                    radius="xl"
                    className="relative h-full flex flex-col"
                  >
                    {plan.popular && (
                      <div
                        className="absolute top-4 right-4 px-2 py-[3px] rounded-full text-[9px] font-semibold uppercase tracking-[0.1em]"
                        style={{
                          backgroundColor: 'rgba(171,199,255,0.14)',
                          color: 'var(--color-obs-primary)',
                        }}
                      >
                        POPULAR
                      </div>
                    )}

                    <div
                      className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center mb-4"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                      }}
                    >
                      <Icon size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                    </div>

                    <h3
                      className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] mb-1"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.03em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {plan.price}
                      </span>
                      <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                        {plan.priceNote}
                      </span>
                    </div>
                    <p
                      className="text-[12px] font-medium tabular-nums mb-5"
                      style={{ color: 'var(--color-obs-primary)' }}
                    >
                      月間 {plan.credits.toLocaleString()} クレジット
                    </p>

                    <div className="space-y-2 mb-6 flex-1">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check
                            size={13}
                            className="shrink-0 mt-0.5"
                            strokeWidth={2.5}
                            style={{ color: 'var(--color-obs-low)' }}
                          />
                          <span
                            className="text-[12.5px] leading-relaxed"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    {isCurrent ? (
                      <div
                        className="w-full h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center text-[13px] font-medium"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-high)',
                          color: 'var(--color-obs-primary)',
                        }}
                      >
                        現在のプラン
                      </div>
                    ) : (
                      <ObsButton variant="primary" size="md" className="w-full">
                        プランを変更
                      </ObsButton>
                    )}
                  </ObsCard>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Credit purchase modal ── */}
        <AnimatePresence>
          {showBuyCredits && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowBuyCredits(false)}
              />
              <motion.div
                className="relative w-full max-w-[520px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      クレジット追加購入
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowBuyCredits(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    現在の残高:{' '}
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {credits.toLocaleString()} cr
                    </span>
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {CREDIT_PACKS.map((pack) => (
                      <motion.button
                        key={pack.amount}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-[var(--radius-obs-lg)] p-4 text-center relative overflow-hidden transition-all"
                        style={{
                          backgroundColor: pack.popular
                            ? 'rgba(171,199,255,0.10)'
                            : 'var(--color-obs-surface-high)',
                          boxShadow: pack.popular
                            ? 'inset 0 0 0 1px rgba(171,199,255,0.35)'
                            : 'none',
                        }}
                      >
                        {pack.popular && (
                          <span
                            className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-[0.04em]"
                            style={{
                              backgroundColor: 'rgba(171,199,255,0.18)',
                              color: 'var(--color-obs-primary)',
                            }}
                          >
                            おすすめ
                          </span>
                        )}
                        <p
                          className="font-[family-name:var(--font-display)] text-[26px] font-bold tabular-nums mb-1 tracking-[-0.03em]"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {pack.amount.toLocaleString()}
                        </p>
                        <p
                          className="text-[10px] mb-2"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          クレジット
                        </p>
                        <p
                          className="text-[15px] font-semibold"
                          style={{ color: 'var(--color-obs-text) ' }}
                        >
                          {pack.price}
                        </p>
                        <p
                          className="text-[10px] mt-1"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          {pack.perCredit}/cr
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  <ObsButton variant="primary" size="lg" className="w-full">
                    購入する
                  </ObsButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
