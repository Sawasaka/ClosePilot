'use client'

import Link from 'next/link'
import { ChevronLeft, ExternalLink, MapPin, Phone, Mail, Building2 } from 'lucide-react'
import {
  ObsCard,
  ObsChip,
  ObsDefList,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

// 型：API レスポンスの構造（ゆるめ）
type Raw = {
  id: string
  name: string
  nameKana?: string | null
  corporateNumber?: string | null
  corporateType?: string | null
  websiteUrl?: string | null
  prefecture?: string | null
  city?: string | null
  address?: string | null
  employeeCount?: string | null
  revenue?: string | null
  representative?: string | null
  representativePhone?: string | null
  representativeEmail?: string | null
  serviceSummary?: string | null
  companyFeatures?: string | null
  enrichmentStatus?: string | null
  lastCrawledAt?: string | null
  lastEnrichedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  industry?: { name: string; category?: string | null } | null
  serviceTags?: Array<{ tag: { name: string } }>
  offices?: Array<{
    id: string
    name: string
    officeType: string
    prefecture: string | null
    city: string | null
    address: string | null
    phone: string | null
    isPrimary: boolean
  }>
  departments?: Array<{
    id: string
    name: string
    departmentType: string | null
    phone: string | null
    email: string | null
    contactPersonName: string | null
    contactPersonTitle: string | null
    headcount: string | null
  }>
  companyIntents?: Array<{
    intentLevel: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE'
    departmentType: string
    signalCount: number
    latestSignalAt: string | null
  }>
  intentSignals?: Array<{
    id: string
    title: string
    signalType: string
    source: string
    sourceUrl: string
    publishedAt: string | null
    departmentType: string | null
  }>
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

function extractDomain(url: string | null | undefined): string {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const INTENT_LABEL: Record<string, { tone: 'hot' | 'middle' | 'low' | 'neutral'; text: string }> = {
  HOT: { tone: 'hot', text: '● HOT' },
  MIDDLE: { tone: 'middle', text: '● MIDDLE' },
  LOW: { tone: 'low', text: '● LOW' },
  NONE: { tone: 'neutral', text: '—' },
}

export default function CompanyDetailClient({
  id: _id,
  initialData,
}: {
  id: string
  initialData: Raw | null
}) {
  const c = initialData

  // 初期データが無い（モックIDなど）場合
  if (!c) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 xl:px-12 2xl:px-16 py-20 text-center">
          <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
            企業が見つかりません
          </p>
          <div className="mt-6">
            <Link href="/companies" className="text-sm underline" style={{ color: 'var(--color-obs-primary)' }}>
              企業一覧に戻る
            </Link>
          </div>
        </div>
      </ObsPageShell>
    )
  }

  const topIntent = c.companyIntents?.[0]
  const addrParts = [c.prefecture, c.city, c.address].filter(Boolean).join('')
  const domain = extractDomain(c.websiteUrl)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-24">
        {/* ── Back link ── */}
        <div className="pt-6 pb-2">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            <ChevronLeft size={14} />
            企業一覧
          </Link>
        </div>

        {/* ── Hero ── */}
        <ObsHero
          eyebrow={c.industry?.name ?? 'Company Master'}
          title={c.name}
          caption={[c.nameKana, addrParts].filter(Boolean).join(' · ')}
          action={
            topIntent ? (
              <ObsChip tone={INTENT_LABEL[topIntent.intentLevel]?.tone ?? 'neutral'}>
                {INTENT_LABEL[topIntent.intentLevel]?.text ?? topIntent.intentLevel}
              </ObsChip>
            ) : null
          }
        />

        {/* ── 3-col grid ── */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* メインカラム */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* 事業内容・特徴 */}
            {(c.serviceSummary || c.companyFeatures) && (
              <ObsCard depth="high" padding="lg">
                <ObsSectionHeader title="About" caption="事業内容と特徴" />
                {c.serviceSummary && (
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--color-obs-text)' }}>
                    {c.serviceSummary}
                  </p>
                )}
                {c.companyFeatures && (
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {c.companyFeatures}
                  </p>
                )}
                {c.serviceTags && c.serviceTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {c.serviceTags.map((st, i) => (
                      <ObsChip key={i} tone="primary">
                        {st.tag.name}
                      </ObsChip>
                    ))}
                  </div>
                )}
              </ObsCard>
            )}

            {/* 基本情報 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="基本情報" />
              <ObsDefList
                columns={2}
                items={[
                  { label: '正式名称', value: c.name },
                  { label: 'カナ', value: c.nameKana ?? '—' },
                  { label: '法人番号', value: c.corporateNumber ?? '—' },
                  { label: '法人種別', value: c.corporateType ?? '—' },
                  {
                    label: '公式サイト',
                    value: c.websiteUrl ? (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 transition-colors"
                        style={{ color: 'var(--color-obs-primary)' }}
                      >
                        {domain || c.websiteUrl}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      '—'
                    ),
                  },
                  {
                    label: '住所',
                    value: addrParts ? (
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin size={13} className="mt-[3px] shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }} />
                        {addrParts}
                      </span>
                    ) : (
                      '—'
                    ),
                  },
                  { label: '従業員数', value: c.employeeCount ?? '—' },
                  { label: '売上', value: c.revenue ?? '—' },
                  { label: '代表者', value: c.representative ?? '—' },
                  {
                    label: '代表電話',
                    value: c.representativePhone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                        {c.representativePhone}
                      </span>
                    ) : (
                      '—'
                    ),
                  },
                  {
                    label: '代表メール',
                    value: c.representativeEmail ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                        {c.representativeEmail}
                      </span>
                    ) : (
                      '—'
                    ),
                  },
                ]}
              />
            </ObsCard>

            {/* 拠点一覧 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="拠点" caption={`${c.offices?.length ?? 0}件`} />
              {!c.offices || c.offices.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  拠点データなし
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {c.offices.map((o) => (
                    <ObsCard key={o.id} depth="low" padding="md" radius="md">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                        >
                          <Building2 size={18} style={{ color: 'var(--color-obs-text-muted)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-obs-text)' }}>
                              {o.name}
                            </span>
                            {o.isPrimary && <ObsChip tone="primary">本社</ObsChip>}
                            <ObsChip tone="neutral">{o.officeType}</ObsChip>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {[o.prefecture, o.city, o.address].filter(Boolean).join(' ')}
                          </p>
                          {o.phone && (
                            <p className="text-xs mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                              <Phone size={11} /> {o.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </ObsCard>
                  ))}
                </div>
              )}
            </ObsCard>

            {/* 部門 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader
                title="部門"
                caption={
                  c.departments && c.departments.length > 0
                    ? `${c.departments.length}件`
                    : 'エンリッチメント実行で取得（Haiku 4.5）'
                }
              />
              {!c.departments || c.departments.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  部門データなし
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {c.departments.map((d) => (
                    <ObsCard key={d.id} depth="low" padding="md" radius="md">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-obs-text)' }}>
                              {d.name}
                            </span>
                            {d.departmentType && <ObsChip tone="neutral">{d.departmentType}</ObsChip>}
                          </div>
                          {d.contactPersonName && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                              {d.contactPersonName}
                              {d.contactPersonTitle && `（${d.contactPersonTitle}）`}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-xs" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {d.phone && <div className="inline-flex items-center gap-1"><Phone size={11} /> {d.phone}</div>}
                          {d.email && <div className="inline-flex items-center gap-1 mt-1"><Mail size={11} /> {d.email}</div>}
                        </div>
                      </div>
                    </ObsCard>
                  ))}
                </div>
              )}
            </ObsCard>

            {/* インテントシグナル履歴 */}
            {c.intentSignals && c.intentSignals.length > 0 && (
              <ObsCard depth="high" padding="lg">
                <ObsSectionHeader title="採用シグナル履歴" caption={`最新 ${c.intentSignals.length}件`} />
                <div className="flex flex-col">
                  {c.intentSignals.map((s, i) => (
                    <a
                      key={s.id}
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 py-3 transition-colors duration-150"
                      style={{
                        borderTop: i === 0 ? 'none' : undefined,
                        transitionTimingFunction: 'var(--ease-liquid)',
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <ObsChip tone="neutral">{s.signalType}</ObsChip>
                      <span
                        className="flex-1 text-sm truncate"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {s.title}
                      </span>
                      <span className="text-xs shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {s.departmentType ?? '—'}
                      </span>
                      <span
                        className="text-xs shrink-0 tabular-nums w-20 text-right"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {formatDate(s.publishedAt)}
                      </span>
                    </a>
                  ))}
                </div>
              </ObsCard>
            )}
          </div>

          {/* サイドカラム */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* インテント集約 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="インテント" caption="部門別の採用動向" />
              {!c.companyIntents || c.companyIntents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  インテントデータなし
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {c.companyIntents.map((ci, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <ObsChip tone={INTENT_LABEL[ci.intentLevel]?.tone ?? 'neutral'}>
                        {ci.intentLevel}
                      </ObsChip>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: 'var(--color-obs-text)' }}>
                          {ci.departmentType}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {ci.signalCount}シグナル · {ci.latestSignalAt ? formatDate(ci.latestSignalAt) : '—'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ObsCard>

            {/* メタ情報 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="データ状態" />
              <ObsDefList
                columns={1}
                items={[
                  {
                    label: 'エンリッチ状態',
                    value: <ObsChip tone="neutral">{c.enrichmentStatus ?? '—'}</ObsChip>,
                  },
                  { label: '最終クロール', value: formatDate(c.lastCrawledAt) },
                  { label: '最終エンリッチ', value: formatDate(c.lastEnrichedAt) },
                  { label: 'データ取得日', value: formatDate(c.createdAt) },
                  { label: 'データ更新日', value: formatDate(c.updatedAt) },
                ]}
              />
            </ObsCard>
          </div>
        </div>
      </div>
    </ObsPageShell>
  )
}
