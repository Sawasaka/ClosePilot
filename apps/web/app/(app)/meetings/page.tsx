'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users, Clock, Tag, ChevronRight, Search } from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

// ─── Types ──────────────────────────────────────────────────────────────────

type CustomerType = '新規顧客' | '既存顧客'
type FilterTab = 'all' | '新規顧客' | '既存顧客'

interface Meeting {
  id: string
  title: string
  customerName: string
  customerType: CustomerType
  date: string
  duration: string
  participants: string[]
  issueCount: number
  summary: string
  issues: string[]
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1', title: '初回商談 — CRM導入検討', customerName: '株式会社テクノリード',
    customerType: '新規顧客', date: '2026-03-26', duration: '45分',
    participants: ['田中 誠', '田中太郎'], issueCount: 3,
    summary: 'CRM導入の背景と現在の課題をヒアリング。既存ツールとの連携が最大の関心事。',
    issues: ['既存ツールとのデータ連携', '導入時のデータ移行工数', 'モバイル対応の有無'],
  },
  {
    id: 'm2', title: '定例MTG — 運用改善', customerName: '合同会社フューチャー',
    customerType: '既存顧客', date: '2026-03-25', duration: '30分',
    participants: ['山本 佳子', '鈴木花子'], issueCount: 2,
    summary: 'レポート機能の改善要望とオートメーション設定のサポート依頼。',
    issues: ['カスタムレポートの柔軟性', 'オートメーション設定のUI改善'],
  },
  {
    id: 'm3', title: 'PoC振り返り', customerName: '有限会社サクセス',
    customerType: '新規顧客', date: '2026-03-24', duration: '60分',
    participants: ['小林 健太', '鈴木花子', '佐藤次郎'], issueCount: 4,
    summary: 'PoC期間中の利用状況を振り返り。API連携の安定性とダッシュボードの表示速度が課題。',
    issues: ['API連携の安定性', 'ダッシュボード表示速度', '権限設定の粒度', 'Slack通知の柔軟性'],
  },
  {
    id: 'm4', title: '契約更新ヒアリング', customerName: '株式会社イノベーション',
    customerType: '既存顧客', date: '2026-03-23', duration: '25分',
    participants: ['佐々木 拓也', '田中太郎'], issueCount: 1,
    summary: '契約更新に向けた満足度ヒアリング。全体的に満足だが、ナレッジ機能の充実を希望。',
    issues: ['ナレッジベースの検索精度向上'],
  },
  {
    id: 'm5', title: '要件定義 — エンタープライズプラン', customerName: '株式会社デルタ',
    customerType: '新規顧客', date: '2026-03-22', duration: '90分',
    participants: ['木村 隆', '佐藤次郎', '田中太郎'], issueCount: 5,
    summary: '大規模導入に向けた要件定義。SSO、監査ログ、マルチテナント対応が必須要件。',
    issues: ['SSO対応（SAML）', '監査ログの出力', 'マルチテナント対応', 'SLA保証', 'オンプレ連携'],
  },
  {
    id: 'm6', title: 'CS定期レビュー', customerName: '株式会社グロース',
    customerType: '既存顧客', date: '2026-03-21', duration: '30分',
    participants: ['中村 理恵', '佐藤次郎'], issueCount: 2,
    summary: '利用率が低下傾向。オンボーディング後のフォロー体制とヘルプコンテンツの充実が必要。',
    issues: ['オンボーディング後のフォロー不足', 'ヘルプコンテンツの充実'],
  },
]

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [tab, setTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = MOCK_MEETINGS
    if (tab !== 'all') list = list.filter(m => m.customerType === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.customerName.toLowerCase().includes(q) ||
        m.issues.some(i => i.toLowerCase().includes(q))
      )
    }
    return list
  }, [tab, search])

  const newCount = MOCK_MEETINGS.filter(m => m.customerType === '新規顧客').length
  const existingCount = MOCK_MEETINGS.filter(m => m.customerType === '既存顧客').length
  const totalIssues = MOCK_MEETINGS.reduce((s, m) => s + m.issueCount, 0)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Meeting Notes"
          title="議事録"
          caption="顧客ヒアリングから課題・ニーズを抽出し、開発優先度へ反映する。"
          action={
            <div className="flex items-center gap-3">
              <ObsChip tone="primary">合計 {MOCK_MEETINGS.length}</ObsChip>
              <ObsChip tone="hot">課題 {totalIssues}</ObsChip>
            </div>
          }
        />

        {/* Tabs + Search */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            {([
              { key: 'all' as FilterTab, label: '全て', count: MOCK_MEETINGS.length },
              { key: '新規顧客' as FilterTab, label: '新規顧客', count: newCount },
              { key: '既存顧客' as FilterTab, label: '既存顧客', count: existingCount },
            ]).map(t => (
              <ObsButton
                key={t.key}
                variant={tab === t.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="ml-1.5 opacity-70 tabular-nums">{t.count}</span>
              </ObsButton>
            ))}
          </div>
          <div className="relative w-[240px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="議事録・課題を検索..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Meeting Cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((meeting, i) => {
            const isExpanded = expandedId === meeting.id
            const typeTone = meeting.customerType === '新規顧客' ? 'primary' : 'low'
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ObsCard
                  depth="high"
                  padding="none"
                  radius="lg"
                  className="overflow-hidden cursor-pointer transition-colors duration-150"
                  onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                    >
                      <FileText size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="text-[14px] font-semibold truncate tracking-[-0.01em]"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {meeting.title}
                        </p>
                        <ObsChip tone={typeTone}>{meeting.customerType}</ObsChip>
                      </div>
                      <div
                        className="flex items-center gap-3 text-[12px]"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <span>{meeting.customerName}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{meeting.date} · {meeting.duration}</span>
                        <span className="flex items-center gap-1"><Users size={10} />{meeting.participants.length}名</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="flex items-center gap-1 text-[12px] font-semibold"
                        style={{ color: 'var(--color-obs-hot)' }}
                      >
                        <Tag size={11} />
                        {meeting.issueCount}件
                      </span>
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                        <ChevronRight size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      </motion.div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                    >
                      <div className="px-5 py-5">
                        <p
                          className="text-[13px] mb-4 leading-relaxed"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {meeting.summary}
                        </p>
                        <div>
                          <p
                            className="text-[11px] font-medium uppercase tracking-[0.08em] mb-2"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            抽出された課題
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.issues.map((issue, j) => (
                              <ObsChip key={j} tone="hot">{issue}</ObsChip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </ObsCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </ObsPageShell>
  )
}
