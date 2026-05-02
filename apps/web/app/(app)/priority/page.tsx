'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Building2,
  FileText,
  Quote,
} from 'lucide-react'
import { ObsPageShell, ObsHero, ObsCard, ObsButton, ObsChip } from '@/components/obsidian'

// ─── Types ──────────────────────────────────────────────────────────────────

type SortKey = 'score' | 'occurrences' | 'effort' | 'impact'
type SortDir = 'asc' | 'desc'

interface Evidence {
  id: string
  companyId: string
  companyName: string
  meetingId: string
  meetingTitle: string
  meetingDate: string // YYYY-MM-DD
  sectionId: string // 議事録内の項目ID（アンカー）
  sectionTitle: string // 議事録内の項目タイトル
  quote: string // 発言抜粋
  segment: 'new' | 'existing'
}

interface PriorityItem {
  id: string
  title: string
  category: string
  effort: number // 1-5
  impact: number // 1-5
  evidences: Evidence[]
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ITEMS: PriorityItem[] = [
  {
    id: 'p1',
    title: '既存ツールとのデータ連携',
    category: 'インテグレーション',
    effort: 4,
    impact: 5,
    evidences: [
      { id: 'e1', companyId: 'c001', companyName: '株式会社NTT', meetingId: 'm101', meetingTitle: '2026/03 定例ヒアリング', meetingDate: '2026-03-14', sectionId: 's3', sectionTitle: '課題: 既存ツール連携', quote: 'Salesforceと双方向同期ができないと、営業担当が両方見に行く必要があって二度手間になる。', segment: 'new' },
      { id: 'e2', companyId: 'c002', companyName: 'JR東日本', meetingId: 'm105', meetingTitle: '初回商談', meetingDate: '2026-03-22', sectionId: 's2', sectionTitle: '要件整理', quote: 'SAP側の顧客マスタと自動同期が前提条件。手動は不可。', segment: 'new' },
      { id: 'e3', companyId: 'c003', companyName: '株式会社日立製作所', meetingId: 'm108', meetingTitle: '導入後フィードバック', meetingDate: '2026-03-28', sectionId: 's4', sectionTitle: '要望', quote: 'Slackとの連携も欲しい。商談結果を自動でチャンネルに通知して欲しい。', segment: 'new' },
      { id: 'e4', companyId: 'c004', companyName: '株式会社東芝', meetingId: 'm110', meetingTitle: '継続契約面談', meetingDate: '2026-04-02', sectionId: 's1', sectionTitle: '今期の不満点', quote: 'HubSpotからのデータ移行時に取りこぼしがあった。連携APIを安定させて欲しい。', segment: 'existing' },
    ],
  },
  {
    id: 'p2',
    title: 'ダッシュボード表示速度',
    category: 'パフォーマンス',
    effort: 3,
    impact: 4,
    evidences: [
      { id: 'e5', companyId: 'c005', companyName: '第一生命ホールディングス', meetingId: 'm112', meetingTitle: 'UX改善ワークショップ', meetingDate: '2026-03-18', sectionId: 's2', sectionTitle: 'パフォーマンス課題', quote: '朝一でダッシュボードを開くと10秒以上待たされる。スマホだとさらに遅い。', segment: 'new' },
      { id: 'e6', companyId: 'c001', companyName: '株式会社NTT', meetingId: 'm101', meetingTitle: '2026/03 定例ヒアリング', meetingDate: '2026-03-14', sectionId: 's5', sectionTitle: 'その他', quote: '営業が100名を超えてから一覧表示が重くなっている。', segment: 'new' },
      { id: 'e7', companyId: 'c006', companyName: '株式会社トヨタ自動車', meetingId: 'm115', meetingTitle: '月次レビュー', meetingDate: '2026-04-01', sectionId: 's3', sectionTitle: '改善要望', quote: 'グラフ描画のレスポンスをもう少し速くしてほしい。', segment: 'existing' },
    ],
  },
  {
    id: 'p3',
    title: 'カスタムレポートの柔軟性',
    category: '機能要望',
    effort: 3,
    impact: 4,
    evidences: [
      { id: 'e8', companyId: 'c007', companyName: '株式会社リクルートホールディングス', meetingId: 'm120', meetingTitle: 'QBR', meetingDate: '2026-03-25', sectionId: 's4', sectionTitle: 'レポート要件', quote: '指標を自由に組み合わせられるピボットUIが欲しい。今は定型レポートしか出せない。', segment: 'new' },
      { id: 'e9', companyId: 'c008', companyName: '株式会社ユニクロ', meetingId: 'm122', meetingTitle: '年次更新面談', meetingDate: '2026-04-05', sectionId: 's2', sectionTitle: '継続条件', quote: '店舗別KPIをドリルダウンで見られる必要がある。', segment: 'existing' },
      { id: 'e10', companyId: 'c009', companyName: '株式会社ソフトバンク第１', meetingId: 'm125', meetingTitle: '経営陣プレゼン', meetingDate: '2026-04-08', sectionId: 's1', sectionTitle: '導入判断材料', quote: 'エクスポート形式(CSV/Excel)でフィールド選択できるようにしたい。', segment: 'existing' },
    ],
  },
  {
    id: 'p4',
    title: 'SSO対応（SAML）',
    category: 'セキュリティ',
    effort: 4,
    impact: 5,
    evidences: [
      { id: 'e11', companyId: 'c010', companyName: 'Astemo株式会社', meetingId: 'm130', meetingTitle: '情シス面談', meetingDate: '2026-03-30', sectionId: 's1', sectionTitle: 'セキュリティ要件', quote: 'Okta経由のSAML SSOは導入の前提条件。', segment: 'new' },
      { id: 'e12', companyId: 'c002', companyName: 'JR東日本', meetingId: 'm105', meetingTitle: '初回商談', meetingDate: '2026-03-22', sectionId: 's5', sectionTitle: 'セキュリティ', quote: 'AzureAD SSOに対応していないと稟議が通らない。', segment: 'new' },
    ],
  },
  {
    id: 'p5',
    title: 'オートメーション設定のUI改善',
    category: 'UX/UI',
    effort: 2,
    impact: 3,
    evidences: [
      { id: 'e13', companyId: 'c011', companyName: '株式会社資生堂', meetingId: 'm133', meetingTitle: '運用相談', meetingDate: '2026-04-03', sectionId: 's2', sectionTitle: 'ワークフロー', quote: 'IFTTT風のビジュアルエディタがあると、ノーコードで現場が組める。', segment: 'existing' },
      { id: 'e14', companyId: 'c006', companyName: '株式会社トヨタ自動車', meetingId: 'm115', meetingTitle: '月次レビュー', meetingDate: '2026-04-01', sectionId: 's4', sectionTitle: '運用負荷', quote: '条件分岐が3段階以上になると設定画面で混乱する。', segment: 'existing' },
    ],
  },
  {
    id: 'p6',
    title: 'API連携の安定性',
    category: 'インテグレーション',
    effort: 3,
    impact: 4,
    evidences: [
      { id: 'e15', companyId: 'c012', companyName: '株式会社ダイコク電機', meetingId: 'm140', meetingTitle: '技術相談', meetingDate: '2026-04-06', sectionId: 's1', sectionTitle: 'API品質', quote: 'Webhook配信の失敗時リトライを強化してほしい。取りこぼしが月数件発生している。', segment: 'new' },
      { id: 'e16', companyId: 'c004', companyName: '株式会社東芝', meetingId: 'm110', meetingTitle: '継続契約面談', meetingDate: '2026-04-02', sectionId: 's3', sectionTitle: 'API', quote: 'バルクAPIのレート制限を緩和して欲しい。', segment: 'existing' },
    ],
  },
  {
    id: 'p7',
    title: 'ナレッジベースの検索精度向上',
    category: '機能要望',
    effort: 2,
    impact: 3,
    evidences: [
      { id: 'e17', companyId: 'c013', companyName: '株式会社ＵＢＥ', meetingId: 'm142', meetingTitle: 'CS定例', meetingDate: '2026-04-10', sectionId: 's2', sectionTitle: 'ナレッジ検索', quote: '全文検索で同義語が拾えない。「解約」と「キャンセル」が別物扱いになる。', segment: 'existing' },
      { id: 'e18', companyId: 'c008', companyName: '株式会社ユニクロ', meetingId: 'm122', meetingTitle: '年次更新面談', meetingDate: '2026-04-05', sectionId: 's5', sectionTitle: '要望', quote: 'タグ検索とフリーワードのAND条件が欲しい。', segment: 'existing' },
    ],
  },
  {
    id: 'p8',
    title: '監査ログの出力',
    category: 'セキュリティ',
    effort: 2,
    impact: 3,
    evidences: [
      { id: 'e19', companyId: 'c010', companyName: 'Astemo株式会社', meetingId: 'm130', meetingTitle: '情シス面談', meetingDate: '2026-03-30', sectionId: 's3', sectionTitle: 'コンプライアンス', quote: '管理者操作の監査ログをCSVで落とせないと内部監査に使えない。', segment: 'new' },
    ],
  },
  {
    id: 'p9',
    title: 'モバイル対応の有無',
    category: 'UX/UI',
    effort: 5,
    impact: 4,
    evidences: [
      { id: 'e20', companyId: 'c002', companyName: 'JR東日本', meetingId: 'm105', meetingTitle: '初回商談', meetingDate: '2026-03-22', sectionId: 's6', sectionTitle: 'デバイス', quote: '現場の営業がiPadから使いたい。スマホ最適化されたUIが必要。', segment: 'new' },
    ],
  },
  {
    id: 'p10',
    title: 'オンボーディング後のフォロー不足',
    category: 'サポート',
    effort: 1,
    impact: 2,
    evidences: [
      { id: 'e21', companyId: 'c011', companyName: '株式会社資生堂', meetingId: 'm133', meetingTitle: '運用相談', meetingDate: '2026-04-03', sectionId: 's5', sectionTitle: 'サポート体制', quote: '導入3ヶ月後の定着チェックが無い。CSMの定期接触が欲しい。', segment: 'existing' },
    ],
  },
]

// ─── Score Calc ─────────────────────────────────────────────────────────────

function calcScore(
  item: PriorityItem,
  newWeight: number,
): { score: number; occurrences: number; newCount: number; existingCount: number } {
  const newCount = item.evidences.filter((e) => e.segment === 'new').length
  const existingCount = item.evidences.filter((e) => e.segment === 'existing').length
  const occurrences = newCount + existingCount
  const existingWeight = 100 - newWeight
  const weighted = (newCount * newWeight + existingCount * existingWeight) / 100
  const effortInverse = 6 - item.effort
  const score = Math.round(weighted * effortInverse * item.impact * 10) / 10
  return { score, occurrences, newCount, existingCount }
}

function formatMeetingDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PriorityPage() {
  const [newWeight, setNewWeight] = useState(40)
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showSettings, setShowSettings] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const scored = useMemo(() => {
    return MOCK_ITEMS.map((item) => ({
      ...item,
      ...calcScore(item, newWeight),
    })).sort((a, b) => {
      const aVal = (a as Record<string, number | string>)[sortKey] as number
      const bVal = (b as Record<string, number | string>)[sortKey] as number
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
  }, [newWeight, sortKey, sortDir])

  const maxScore = Math.max(...scored.map((s) => s.score))

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey)
      return (
        <ArrowUpDown size={10} className="ml-1 inline" style={{ color: 'var(--color-obs-text-subtle)' }} />
      )
    return sortDir === 'asc' ? (
      <ChevronUp size={10} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
    ) : (
      <ChevronDown size={10} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
    )
  }

  const totalEvidences = MOCK_ITEMS.reduce((s, i) => s + i.evidences.length, 0)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Development Priority"
          title="開発優先度"
          caption={`企業の声${totalEvidences}件から自動スコアリング。各行を展開すると根拠となる議事録が確認できます。`}
          action={
            <ObsButton variant="ghost" size="md" onClick={() => setShowSettings((v) => !v)}>
              <span className="inline-flex items-center gap-1.5">
                <Settings2 size={14} />
                ウエイト設定
              </span>
            </ObsButton>
          }
        />

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 overflow-hidden"
          >
            <ObsCard depth="high" padding="md" radius="lg">
              <h3
                className="text-[13px] font-semibold mb-3 tracking-[-0.01em]"
                style={{ color: 'var(--color-obs-text)' }}
              >
                顧客セグメントの重要度ウエイト
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-primary)' }}>
                      新規顧客 {newWeight}%
                    </span>
                    <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-low)' }}>
                      既存顧客 {100 - newWeight}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-obs-primary) ${newWeight}%, var(--color-obs-low) ${newWeight}%)`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] mt-3" style={{ color: 'var(--color-obs-text-subtle)' }}>
                スコア = 加重出現数 × (6 - 工数) × インパクト
              </p>
            </ObsCard>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: '最優先', value: scored[0]?.title ?? '—', score: scored[0]?.score ?? 0, hot: true },
            {
              label: 'Top 3 平均スコア',
              value: (scored.slice(0, 3).reduce((s, i) => s + i.score, 0) / 3).toFixed(1),
              score: null,
              hot: false,
            },
            { label: 'エビデンス総数', value: `${totalEvidences}件`, score: null, hot: false },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <ObsCard depth="high" padding="md" radius="lg">
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {card.label}
                </p>
                <p
                  className="text-[16px] font-semibold mt-1.5 truncate tracking-[-0.01em]"
                  style={{ color: card.hot ? 'var(--color-obs-hot)' : 'var(--color-obs-text)' }}
                >
                  {card.value}
                </p>
                {card.score !== null && (
                  <p
                    className="text-[11px] mt-1 tabular-nums"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    スコア: {card.score}
                  </p>
                )}
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {/* Ranking Table */}
        <ObsCard depth="low" padding="none" radius="xl">
          <div
            className="grid items-center px-6 py-4 text-[11px] font-medium uppercase tracking-[0.1em]"
            style={{
              gridTemplateColumns: '32px 1fr 90px 80px 80px 120px 24px',
              color: 'var(--color-obs-text-subtle)',
            }}
          >
            <span>#</span>
            <span>課題 / エビデンス</span>
            <button
              onClick={() => toggleSort('occurrences')}
              className="text-left flex items-center transition-colors"
              style={{
                color: sortKey === 'occurrences' ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
              }}
            >
              出現数
              <SortIcon col="occurrences" />
            </button>
            <button
              onClick={() => toggleSort('effort')}
              className="text-left flex items-center transition-colors"
              style={{
                color: sortKey === 'effort' ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
              }}
            >
              工数
              <SortIcon col="effort" />
            </button>
            <button
              onClick={() => toggleSort('impact')}
              className="text-left flex items-center transition-colors"
              style={{
                color: sortKey === 'impact' ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
              }}
            >
              インパクト
              <SortIcon col="impact" />
            </button>
            <button
              onClick={() => toggleSort('score')}
              className="text-left flex items-center transition-colors"
              style={{
                color: sortKey === 'score' ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
              }}
            >
              スコア
              <SortIcon col="score" />
            </button>
            <span />
          </div>

          {scored.map((item, i) => {
            const barWidth = maxScore > 0 ? (item.score / maxScore) * 100 : 0
            const isTop3 = i < 3 && sortKey === 'score' && sortDir === 'desc'
            const expanded = expandedId === item.id
            return (
              <div key={item.id}>
                <motion.button
                  onClick={() => setExpandedId((v) => (v === item.id ? null : item.id))}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="grid w-full items-center px-6 py-3.5 transition-colors duration-150 text-left"
                  style={{
                    gridTemplateColumns: '32px 1fr 90px 80px 80px 120px 24px',
                    backgroundColor: expanded ? 'var(--color-obs-surface-high)' : 'transparent',
                  }}
                  onMouseOver={(e) => {
                    if (!expanded)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--color-obs-surface-high)'
                  }}
                  onMouseOut={(e) => {
                    if (!expanded)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span
                    className="text-[12px] font-bold tabular-nums"
                    style={{ color: isTop3 ? 'var(--color-obs-hot)' : 'var(--color-obs-text-subtle)' }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-[13.5px] font-medium truncate"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {item.title}
                      </p>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 tabular-nums"
                        style={{
                          color: 'var(--color-obs-primary)',
                          backgroundColor: 'rgba(171,199,255,0.12)',
                        }}
                      >
                        {item.evidences.length}件
                      </span>
                    </div>
                    <p
                      className="text-[11px] mt-0.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {item.category} ・ 新規{item.newCount}件 / 既存{item.existingCount}件
                    </p>
                  </div>
                  <span
                    className="text-[13px] tabular-nums"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {item.occurrences}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="w-2.5 h-2.5 rounded-[2px]"
                        style={{
                          backgroundColor:
                            j < item.effort
                              ? 'var(--color-obs-middle)'
                              : 'var(--color-obs-surface-high)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="w-2.5 h-2.5 rounded-[2px]"
                        style={{
                          backgroundColor:
                            j < item.impact
                              ? 'var(--color-obs-primary)'
                              : 'var(--color-obs-surface-high)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-[5px] rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isTop3 ? 'var(--color-obs-hot)' : 'var(--color-obs-primary)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      />
                    </div>
                    <span
                      className="text-[13px] font-semibold tabular-nums w-8 text-right"
                      style={{ color: isTop3 ? 'var(--color-obs-hot)' : 'var(--color-obs-text)' }}
                    >
                      {item.score}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className="transition-transform duration-200 ml-auto"
                    style={{
                      color: expanded ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </motion.button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                      style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                    >
                      <EvidenceList evidences={item.evidences} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}

// ─── Evidence List ──────────────────────────────────────────────────────────

function EvidenceList({ evidences }: { evidences: Evidence[] }) {
  return (
    <div className="px-6 py-5 flex flex-col gap-2">
      <div
        className="text-[10px] font-medium tracking-[0.1em] uppercase mb-1 inline-flex items-center gap-1.5"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        <Quote size={11} />
        根拠となる企業の声 ({evidences.length}件)
      </div>
      {evidences.map((ev) => (
        <EvidenceCard key={ev.id} ev={ev} />
      ))}
    </div>
  )
}

function EvidenceCard({ ev }: { ev: Evidence }) {
  return (
    <div
      className="rounded-[var(--radius-obs-md)] p-4 flex flex-col gap-2.5"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      {/* Header: 企業 / セグメント / 日付 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/companies/${ev.companyId}`}
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold tracking-[-0.005em] transition-colors"
          style={{ color: 'var(--color-obs-text)' }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-obs-primary)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-obs-text)'
          }}
        >
          <Building2 size={12} />
          {ev.companyName}
          <ExternalLink size={10} className="opacity-60" />
        </Link>
        <ObsChip tone={ev.segment === 'new' ? 'primary' : 'low'}>
          {ev.segment === 'new' ? '新規' : '既存'}
        </ObsChip>
        <span
          className="text-[11px] tabular-nums ml-auto"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {formatMeetingDate(ev.meetingDate)}
        </span>
      </div>

      {/* 議事録 / 項目リンク */}
      <Link
        href={`/meetings/${ev.meetingId}#${ev.sectionId}`}
        className="inline-flex items-center gap-1.5 text-[12px] transition-colors w-fit"
        style={{ color: 'var(--color-obs-text-muted)' }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-obs-primary)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-obs-text-muted)'
        }}
      >
        <FileText size={11} />
        <span className="truncate max-w-[280px]">{ev.meetingTitle}</span>
        <span className="opacity-50">›</span>
        <span
          className="truncate max-w-[200px]"
          style={{ color: 'var(--color-obs-primary)' }}
        >
          {ev.sectionTitle}
        </span>
        <ExternalLink size={10} className="opacity-60" />
      </Link>

      {/* 引用 */}
      <blockquote
        className="text-[12.5px] leading-relaxed pl-3"
        style={{
          color: 'var(--color-obs-text)',
          borderLeft: '2px solid var(--color-obs-primary)',
        }}
      >
        「{ev.quote}」
      </blockquote>
    </div>
  )
}
