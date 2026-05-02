'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Hash,
  MessageSquare,
  MessagesSquare,
  ExternalLink,
  FileText,
  Database,
  Globe,
  CheckCircle2,
  XCircle,
  Plus,
  Quote,
  Sparkles,
  Link2,
  User,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'
import {
  findTicket,
  formatDateTime,
  SOURCE_LABEL,
  SOURCE_STYLE,
  STATUS_LABEL,
  STATUS_STYLE,
} from '../_lib/mock'
import type { RagSource, Supplement, TicketSource } from '../_lib/mock'

const SOURCE_ICON: Record<TicketSource, React.ElementType> = {
  slack: Hash,
  google_chat: MessagesSquare,
  teams: MessageSquare,
}

const RAG_TYPE_ICON: Record<RagSource['type'], React.ElementType> = {
  drive: Database,
  sharepoint: FileText,
  web: Globe,
}

const RAG_TYPE_LABEL: Record<RagSource['type'], string> = {
  drive: 'Google Drive',
  sharepoint: 'SharePoint',
  web: 'Web',
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const initial = findTicket(id)

  if (!initial) return notFound()

  const [supplements, setSupplements] = useState<Supplement[]>(initial.supplements)
  const [supType, setSupType] = useState<'text' | 'url'>('text')
  const [supDraft, setSupDraft] = useState('')

  const stStyle = STATUS_STYLE[initial.status]
  const srcStyle = SOURCE_STYLE[initial.source]
  const SrcIcon = SOURCE_ICON[initial.source]

  const sortedSupplements = useMemo(
    () => [...supplements].sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()),
    [supplements],
  )

  function addSupplement() {
    if (!supDraft.trim()) return
    const now = new Date().toISOString()
    setSupplements((arr) => [
      ...arr,
      {
        id: `sup-${Date.now()}`,
        type: supType,
        content: supDraft.trim(),
        addedBy: 'あなた',
        addedAt: now,
        triggeredAiUpdate: true,
      },
    ])
    setSupDraft('')
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* Back link */}
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1 text-sm transition-colors mb-3"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          <ChevronLeft size={15} />
          チケット一覧
        </Link>

        <ObsHero
          eyebrow={`Ticket #${initial.number}`}
          title={initial.title}
          caption={`${SOURCE_LABEL[initial.source]} ${initial.channel} で起票 ・ ${initial.category}`}
          action={
            <span
              className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium tracking-[-0.005em]"
              style={{ backgroundColor: stStyle.bg, color: stStyle.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stStyle.color }} />
              {STATUS_LABEL[initial.status]}
            </span>
          }
        />

        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* ── Main column ── */}
          <div className="flex flex-col gap-6">
            {/* 質問カード */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  }}
                >
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-on-primary)' }}>
                    {initial.reporter[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                      {initial.reporter}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: srcStyle.bg, color: srcStyle.color }}
                    >
                      <SrcIcon size={10} strokeWidth={2.2} />
                      {SOURCE_LABEL[initial.source]} {initial.channel}
                    </span>
                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {formatDateTime(initial.createdAt)}
                    </span>
                  </div>
                  <blockquote
                    className="mt-3 text-[14px] leading-relaxed pl-3"
                    style={{
                      color: 'var(--color-obs-text)',
                      borderLeft: '2px solid var(--color-obs-primary)',
                    }}
                  >
                    {initial.question}
                  </blockquote>
                </div>
              </div>
            </ObsCard>

            {/* AI 回答 */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} style={{ color: 'var(--color-obs-primary)' }} />
                <h3
                  className="text-[12px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  AI 回答
                </h3>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {formatDateTime(initial.aiAnsweredAt)}
                </span>
              </div>
              <div
                className="text-[13.5px] leading-[1.7] whitespace-pre-wrap"
                style={{ color: 'var(--color-obs-text)' }}
                dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(initial.aiAnswer) }}
              />

              {/* 参照ソース */}
              {initial.ragSources.length > 0 && (
                <div className="mt-5 pt-4" style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.12)' }}>
                  <p
                    className="text-[10.5px] font-semibold uppercase tracking-[0.1em] mb-2"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    参照ソース ({initial.ragSources.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {initial.ragSources.map((s) => (
                      <RagSourceCard key={s.id} source={s} />
                    ))}
                  </div>
                </div>
              )}
            </ObsCard>

            {/* フィードバック (履歴のみ) */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <div className="flex items-center gap-2 mb-3">
                <Quote size={13} style={{ color: 'var(--color-obs-text-muted)' }} />
                <h3
                  className="text-[12px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  チャット側のフィードバック
                </h3>
              </div>
              {initial.feedback ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] font-medium"
                    style={{
                      backgroundColor: initial.feedback.resolved ? 'rgba(126,198,255,0.14)' : 'rgba(255,107,107,0.14)',
                      color: initial.feedback.resolved ? 'var(--color-obs-low)' : 'var(--color-obs-hot)',
                    }}
                  >
                    {initial.feedback.resolved ? (
                      <>
                        <CheckCircle2 size={13} />
                        解決した
                      </>
                    ) : (
                      <>
                        <XCircle size={13} />
                        解決しなかった
                      </>
                    )}
                  </span>
                  <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {initial.feedback.by}
                  </span>
                  <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {formatDateTime(initial.feedback.at)}
                  </span>
                  <span
                    className="text-[10.5px] ml-auto opacity-70"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    ※ チャットツール側で押されたボタンの結果を表示
                  </span>
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  まだ回答に対する評価がありません。
                </p>
              )}
            </ObsCard>

            {/* 補足リスト + 追加フォーム */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <div className="flex items-center gap-2 mb-3">
                <Plus size={13} style={{ color: 'var(--color-obs-middle)' }} />
                <h3
                  className="text-[12px] font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  補足情報 ({sortedSupplements.length})
                </h3>
              </div>

              {/* 履歴 */}
              {sortedSupplements.length > 0 ? (
                <div className="flex flex-col gap-2 mb-5">
                  {sortedSupplements.map((sup) => (
                    <SupplementCard key={sup.id} sup={sup} />
                  ))}
                </div>
              ) : (
                <p className="text-[13px] mb-5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  まだ補足情報はありません。AI回答が不適切だった場合は下記から補足してください。
                </p>
              )}

              {/* 追加フォーム */}
              <div
                className="rounded-[var(--radius-obs-md)] p-3"
                style={{
                  backgroundColor: 'var(--color-obs-surface-low)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {(['text', 'url'] as const).map((t) => {
                    const active = supType === t
                    return (
                      <button
                        key={t}
                        onClick={() => setSupType(t)}
                        className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-medium transition-colors"
                        style={{
                          backgroundColor: active ? 'rgba(171,199,255,0.14)' : 'transparent',
                          color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                        }}
                      >
                        {t === 'text' ? 'テキストで補足' : 'URLで補足'}
                      </button>
                    )
                  })}
                </div>
                {supType === 'text' ? (
                  <textarea
                    value={supDraft}
                    onChange={(e) => setSupDraft(e.target.value)}
                    placeholder="AI回答を更新する補足情報を記入..."
                    rows={3}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-sm)] outline-none resize-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                    }}
                  />
                ) : (
                  <input
                    value={supDraft}
                    onChange={(e) => setSupDraft(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 h-9 text-[12.5px] rounded-[var(--radius-obs-sm)] outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                    }}
                  />
                )}
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    補足を追加すると AI 回答が再生成され、次回同じ質問に反映されます
                  </p>
                  <ObsButton variant="primary" size="sm" onClick={addSupplement} disabled={!supDraft.trim()}>
                    <span className="inline-flex items-center gap-1">
                      <RefreshCw size={11} />
                      追加して再生成
                    </span>
                  </ObsButton>
                </div>
              </div>
            </ObsCard>
          </div>

          {/* ── Side column ── */}
          <aside className="flex flex-col gap-5">
            {/* 起票元 */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <h3
                className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                起票元
              </h3>
              <SideRow icon={SrcIcon} label="ソース" value={SOURCE_LABEL[initial.source]} />
              <SideRow icon={Hash} label="チャンネル" value={initial.channel} mono />
              <SideRow icon={User} label="起票者" value={initial.reporter} />
              <SideRow icon={Clock} label="起票日時" value={formatDateTime(initial.createdAt)} />
              <SideRow icon={RefreshCw} label="最終更新" value={formatDateTime(initial.updatedAt)} />
            </ObsCard>

            {/* メタ情報 */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <h3
                className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                AI が参照したソース
              </h3>
              <div className="flex flex-col gap-1.5">
                {Object.entries(
                  initial.ragSources.reduce<Record<string, number>>((acc, s) => {
                    acc[s.type] = (acc[s.type] ?? 0) + 1
                    return acc
                  }, {}),
                ).map(([type, count]) => {
                  const Icon = RAG_TYPE_ICON[type as RagSource['type']]
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-obs-text)' }}>
                        <Icon size={12} style={{ color: 'var(--color-obs-text-muted)' }} />
                        {RAG_TYPE_LABEL[type as RagSource['type']]}
                      </span>
                      <span className="text-[12px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                        {count}件
                      </span>
                    </div>
                  )
                })}
              </div>
            </ObsCard>

            {/* FAQへの反映状態 */}
            <ObsCard depth="high" padding="lg" radius="xl">
              <h3
                className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                FAQ への反映
              </h3>
              <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                解決済みのチケットは <span style={{ color: 'var(--color-obs-text)' }} className="font-medium">BGM-FAQ.md</span>
                に自動追記されます。次回同じ質問が来た際は最新の補足情報が反映されます。
              </p>
              <Link href="/knowledge/faq" className="inline-flex items-center gap-1 mt-3 text-[12px] font-medium transition-colors" style={{ color: 'var(--color-obs-primary)' }}>
                FAQ ページを開く
                <ExternalLink size={11} />
              </Link>
            </ObsCard>
          </aside>
        </div>
      </div>
    </ObsPageShell>
  )
}

// ─── Sub Components ──────────────────────────────────────────────────────────

function RagSourceCard({ source }: { source: RagSource }) {
  const Icon = RAG_TYPE_ICON[source.type]
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-[var(--radius-obs-md)] p-3 transition-colors group"
      style={{
        backgroundColor: 'var(--color-obs-surface-low)',
      }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-obs-surface-low)'
      }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Icon size={12} style={{ color: 'var(--color-obs-primary)' }} />
        <span className="text-[12.5px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
          {source.name}
        </span>
        <span className="text-[10.5px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(171,199,255,0.10)', color: 'var(--color-obs-primary)' }}>
          {RAG_TYPE_LABEL[source.type]}
        </span>
        {source.folder && (
          <span className="text-[10.5px] font-mono ml-auto truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {source.folder}
          </span>
        )}
        <ExternalLink size={10} className="opacity-60" style={{ color: 'var(--color-obs-text-subtle)' }} />
      </div>
      <blockquote
        className="mt-2 text-[11.5px] leading-relaxed pl-2.5"
        style={{ color: 'var(--color-obs-text-muted)', borderLeft: '2px solid rgba(171,199,255,0.30)' }}
      >
        {source.snippet}
      </blockquote>
    </a>
  )
}

function SupplementCard({ sup }: { sup: Supplement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="rounded-[var(--radius-obs-md)] p-3"
      style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
    >
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
          {sup.addedBy}
        </span>
        <span className="text-[10.5px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(109,106,111,0.18)', color: 'var(--color-obs-text-muted)' }}>
          {sup.type === 'url' ? 'URL' : 'テキスト'}
        </span>
        {sup.triggeredAiUpdate && (
          <span className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)' }}>
            <Sparkles size={9} />
            AI回答に反映済
          </span>
        )}
        <span className="text-[10.5px] tabular-nums ml-auto" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {formatDateTime(sup.addedAt)}
        </span>
      </div>
      {sup.type === 'url' ? (
        <a
          href={sup.content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-mono transition-colors"
          style={{ color: 'var(--color-obs-primary)' }}
        >
          <Link2 size={11} />
          {sup.content}
          <ExternalLink size={10} className="opacity-70" />
        </a>
      ) : (
        <blockquote
          className="text-[12.5px] leading-relaxed pl-2.5"
          style={{
            color: 'var(--color-obs-text)',
            borderLeft: '2px solid rgba(255,184,107,0.40)',
          }}
        >
          {sup.content}
        </blockquote>
      )}
    </motion.div>
  )
}

function SideRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}>
      <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
        <Icon size={11} />
        {label}
      </span>
      <span
        className={`text-[12px] truncate max-w-[180px] ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--color-obs-text)' }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Inline markdown helper (** で囲んだ箇所だけ太字化) ────────────────────────

function renderInlineMarkdown(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-obs-primary);font-weight:600">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--color-obs-surface-low);padding:1px 6px;border-radius:4px;font-size:0.92em">$1</code>')
}
