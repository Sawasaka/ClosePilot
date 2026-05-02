'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

const STAGES = [
  { label: '新人', done: true },
  { label: 'IS独り立ち', done: true },
  { label: 'FS対応可', current: true, done: false },
  { label: 'リーダー', done: false },
  { label: 'マネージャー', done: false },
]

const MILESTONES = [
  { title: '初アポ獲得', status: 'done' as const, date: '2026-01-15', condition: '初回のアポイント獲得' },
  { title: '月間コール100件', status: 'done' as const, date: '2026-02-28', condition: '1ヶ月でコール100件達成' },
  { title: '初受注', status: 'active' as const, date: null, condition: '初めての受注を獲得 — あと1件' },
  { title: 'エンプラ対応認定', status: 'locked' as const, date: null, condition: 'エンタープライズ商談を3件クローズ' },
  { title: 'チームリーダー認定', status: 'locked' as const, date: null, condition: 'メンティー2名以上を独り立ちさせる' },
]

export default function RoadmapPage() {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Career Roadmap"
          title="ロードマップ"
          caption="キャリアパスとマイルストーン"
        />

        {/* ── Career Stage Timeline ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <ObsCard depth="high" padding="lg" radius="xl">
            <ObsSectionHeader title="キャリアステージ" />
            <div className="flex items-center gap-0">
              {STAGES.map((stage, i) => (
                <div key={stage.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-2.5"
                      style={{
                        background: stage.done
                          ? 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                          : stage.current
                            ? 'linear-gradient(135deg, var(--color-obs-middle) 0%, var(--color-obs-hot) 100%)'
                            : 'var(--color-obs-surface-high)',
                      }}
                    >
                      {stage.done ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-obs-on-primary)' }} />
                      ) : (
                        <span
                          className="text-[12px] font-semibold"
                          style={{
                            color: stage.current
                              ? 'var(--color-obs-on-primary)'
                              : 'var(--color-obs-text-subtle)',
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[11.5px] font-semibold text-center"
                      style={{
                        color: stage.current
                          ? 'var(--color-obs-middle)'
                          : stage.done
                            ? 'var(--color-obs-primary)'
                            : 'var(--color-obs-text-subtle)',
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className="w-8 h-0.5 -mt-6 shrink-0 rounded-full"
                      style={{
                        backgroundColor: stage.done
                          ? 'var(--color-obs-primary)'
                          : 'var(--color-obs-surface-high)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </ObsCard>
        </motion.div>

        {/* ── Next Milestone ── */}
        {(() => {
          const next = MILESTONES.find(m => m.status === 'active')
          if (!next) return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-6"
            >
              <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, var(--color-obs-middle) 0%, transparent 70%)',
                    opacity: 0.15,
                  }}
                />
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5"
                  style={{ color: 'var(--color-obs-middle)' }}
                >
                  NEXT MILESTONE
                </p>
                <p
                  className="font-[family-name:var(--font-display)] text-[20px] font-bold tracking-[-0.02em]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {next.title}
                </p>
                <p className="text-[13px] mt-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                  {next.condition}
                </p>
              </ObsCard>
            </motion.div>
          )
        })()}

        {/* ── Milestones List ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6"
        >
          <ObsCard depth="high" padding="lg" radius="xl">
            <ObsSectionHeader title="マイルストーン一覧" />
            <div className="space-y-0">
              {MILESTONES.map((ms, i) => (
                <motion.div
                  key={ms.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="flex items-center gap-3 py-3.5"
                  style={{ opacity: ms.status === 'locked' ? 0.5 : 1 }}
                >
                  {ms.status === 'done' ? (
                    <CheckCircle2 size={17} style={{ color: 'var(--color-obs-low)' }} className="shrink-0" />
                  ) : ms.status === 'active' ? (
                    <ArrowRight size={17} style={{ color: 'var(--color-obs-middle)' }} className="shrink-0" />
                  ) : (
                    <Circle size={17} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{
                        color:
                          ms.status === 'done'
                            ? 'var(--color-obs-low)'
                            : ms.status === 'active'
                              ? 'var(--color-obs-middle)'
                              : 'var(--color-obs-text-subtle)',
                      }}
                    >
                      {ms.title}
                    </p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {ms.condition}
                    </p>
                  </div>
                  {ms.date && (
                    <span
                      className="text-[11.5px] tabular-nums shrink-0"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {ms.date}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </ObsCard>
        </motion.div>
      </div>
    </ObsPageShell>
  )
}
