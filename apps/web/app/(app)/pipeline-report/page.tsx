'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check, X } from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & DATA — CEO Executive Summary 仕様
// ═══════════════════════════════════════════════════════════════════════════════

type Status = '有効商談' | 'PJ化予定あり' | 'PJ可能案件' | 'PJ進行' | '失注' | '契約'
type Period = 'all' | '2026-03' | '2026-04'

interface DealRow {
  id: string
  company: string
  owners: string[]
  partner?: boolean
  status: Status
  note: string
  period: '2026-03' | '2026-04'
}

const DEALS: DealRow[] = [
  { id: '01', company: 'フォーティエンスコンサルティング株式会社', owners: ['名和', '沢坂', '菊池'], status: '失注', note: 'SKYSEAでログ活用をメインに使用し、デバイス管理もSKYSEAで一元管理が可能なため。', period: '2026-03' },
  { id: '02', company: 'サンテミナ株式会社', owners: ['井之上', '沢坂'], status: 'PJ進行', note: 'Status：POC実施中。Next：① 運用状況の確認 ② 導入ご意向の確認。', period: '2026-03' },
  { id: '03', company: 'フューチャーセキュアウェイブ株式会社', owners: ['名和', '菊池', '沢坂'], status: 'PJ進行', note: 'Status：POC中。Next：5月にセットアップ商談提案予定。', period: '2026-03' },
  { id: '04', company: 'ユニソルホールディングス', owners: ['沢坂'], status: 'PJ進行', note: 'Status：POC中。Next：運用状況と導入ご意向の確認。', period: '2026-03' },
  { id: '05', company: '株式会社ダイドウトランスプラネット', owners: ['後藤'], partner: true, status: 'PJ化予定あり', note: 'Status：M365導入待ち。Next：後藤さんからの連絡待ち → 資産管理＋AIヘルプデスク着手。', period: '2026-03' },
  { id: '06', company: 'ボールトゥウィン株式会社', owners: ['井之上', '沢坂'], status: 'PJ化予定あり', note: 'Status：新規商談完了。Next：エージェント領域および部門ごとの閲覧制限完了次第、ご連絡。', period: '2026-03' },
  { id: '07', company: '豊田スチールセンター株式会社', owners: ['新海', '沢坂'], status: 'PJ化予定あり', note: 'Status：親会社グローバル権限の承認待ち。Next：一度連絡しリマインド予定。', period: '2026-03' },
  { id: '08', company: '株式会社MTG', owners: ['名和', '沢坂'], partner: true, status: 'PJ化予定あり', note: '3月分。Status：RFP対応中。Next：後藤さんからの連絡待ち。', period: '2026-03' },
  { id: '09', company: '株式ガイアート', owners: ['沢坂', '新海'], status: 'PJ可能案件', note: '4月分。Status：PJ可能案件移行済み。Next：推進者含むステークホルダー全体商談。', period: '2026-04' },
  { id: '10', company: 'トゥインクルワールド株式会社', owners: ['沢坂', '新海'], status: 'PJ進行', note: '4月分。Status：新規商談完了、5社コンペ中（ジョーシス含む）。Next：5月セットアップ商談実施 → コンペ最終企業として検討予定。', period: '2026-04' },
  { id: '11', company: '株式会社ナビタイムジャパン', owners: ['名和', '沢坂'], status: 'PJ化予定あり', note: '4月分。資産管理：ニーズあり / AIヘルプデスク：内製化済みのためニーズなし。Next：エージェント領域が一段落後、最小限の再商談を検討。', period: '2026-04' },
  { id: '12', company: '株式会社フレクト', owners: ['沢坂'], status: 'PJ化予定あり', note: '4月分。Status：既存案件掘り起こし商談完了、金額提案済み。Next：資産管理で前向き検討の場合、先方からの連絡待ち。', period: '2026-04' },
  { id: '13', company: 'チームみらい', owners: ['名和', '沢坂'], status: 'PJ進行', note: '4月分。Status：商談完了、POC中。Next：導入ご意向の確認。', period: '2026-04' },
  { id: '14', company: 'Aflac Ventures Japan', owners: ['名和', '沢坂'], status: 'PJ可能案件', note: '4月分。Status：商談完了、情シスの方をご紹介いただいている。Next：VCの連絡先を外し、GW明けにセットアップ商談の日程調整。', period: '2026-04' },
  { id: '15', company: '株式会社DAY TO LIFE', owners: ['後藤'], partner: true, status: 'PJ可能案件', note: '4月分。Status：AIと資産管理領域で料金問い合わせまで完了。Next：後藤さんからの連絡待ち。', period: '2026-04' },
  { id: '16', company: 'EMデバイス株式会社', owners: ['沢坂'], status: 'PJ可能案件', note: '4月分。Status：上長承認プロセス中、多数の複数コンペ案件。Next：4月24日までの連絡待ち（自分から連絡NG）。', period: '2026-04' },
]

// ステータスごとの色（Liquid Obsidian パレット）
const STATUS_STYLES: Record<Status, { color: string; bg: string; label: string }> = {
  '有効商談':    { color: '#e3c06b', bg: 'rgba(227, 192, 107, 0.14)', label: '有効商談' },
  'PJ化予定あり': { color: '#e3c06b', bg: 'rgba(227, 192, 107, 0.14)', label: 'PJ化予定あり' },
  'PJ可能案件':  { color: '#7ec6ff', bg: 'rgba(126, 198, 255, 0.14)', label: 'PJ可能案件' },
  'PJ進行':      { color: '#6bd6a2', bg: 'rgba(107, 214, 162, 0.14)', label: 'PJ進行' },
  '失注':        { color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.14)', label: '失注' },
  '契約':        { color: '#6bd6a2', bg: 'rgba(107, 214, 162, 0.14)', label: '契約' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: '全体' },
  { key: '2026-03', label: '2026年3月' },
  { key: '2026-04', label: '2026年4月' },
]

// 最深のネイビー背景（スクショ準拠）
const PAGE_BG = '#0c1424'
const CARD_BG = '#0f1a2e'
const CARD_BG_DEEP = '#0a1422'

export default function PipelineReportPage() {
  const [period, setPeriod] = useState<Period>('all')
  const [conclusionOpen, setConclusionOpen] = useState(false)
  const [conclusion, setConclusion] = useState('要注意')

  const filteredDeals = useMemo(() => {
    if (period === 'all') return DEALS
    return DEALS.filter(d => d.period === period)
  }, [period])

  // パイプラインのステージ別集計（有効商談 ⊇ PJ化予定 ⊇ PJ可能 ⊇ PJ進行）
  const counts = useMemo(() => {
    const isActive = (s: Status) => s !== '失注' && s !== '契約'
    const valid = filteredDeals.filter(d => isActive(d.status)).length
    const pjPlanned = filteredDeals.filter(d => ['PJ化予定あり', 'PJ可能案件', 'PJ進行'].includes(d.status)).length
    const pjPossible = filteredDeals.filter(d => ['PJ可能案件', 'PJ進行'].includes(d.status)).length
    const pjRunning = filteredDeals.filter(d => d.status === 'PJ進行').length
    const lost = filteredDeals.filter(d => d.status === '失注').length
    const contracted = filteredDeals.filter(d => d.status === '契約').length

    const totalForRate = valid + lost // 失注も含めたファネル入口の件数
    const finalRate = totalForRate > 0 ? Math.round((pjRunning / (totalForRate || 1)) * 100) : 0

    return {
      valid,
      pjPlanned,
      pjPossible,
      pjRunning,
      lost,
      contracted,
      finalRate,
      plannedRate: valid > 0 ? Math.round((pjPlanned / valid) * 100) : 0,
      possibleRate: pjPlanned > 0 ? Math.round((pjPossible / pjPlanned) * 100) : 0,
      runningRate: pjPossible > 0 ? Math.round((pjRunning / pjPossible) * 100) : 0,
      lostRate: pjRunning > 0 ? Math.round((lost / pjRunning) * 100) : 0,
      contractRate: pjRunning > 0 ? Math.round((contracted / pjRunning) * 100) : 0,
    }
  }, [filteredDeals])

  return (
    <ObsPageShell>
      <div style={{ backgroundColor: PAGE_BG }} className="min-h-screen">
        <div className="w-full max-w-[1240px] mx-auto px-8 xl:px-12 pb-16">
          {/* ═══════════════════════════ Header ═══════════════════════════ */}
          <div className="pt-14 pb-10">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 flex items-center justify-center font-[family-name:var(--font-display)] text-2xl font-bold"
                style={{
                  backgroundColor: CARD_BG,
                  color: '#e3c06b',
                  borderRadius: '6px',
                  boxShadow: 'inset 0 0 0 1px rgba(227, 192, 107, 0.3)',
                }}
              >
                Z
              </div>
              <div className="flex flex-col">
                <h1
                  className="font-[family-name:var(--font-display)] text-[28px] font-semibold tracking-[-0.02em]"
                  style={{ color: '#e4e2e4' }}
                >
                  商談パイプラインレポート
                </h1>
                <span
                  className="text-[11px] font-medium tracking-[0.2em] mt-0.5"
                  style={{ color: '#8f8c90' }}
                >
                  EXECUTIVE SUMMARY
                </span>
              </div>
            </div>
            <div
              className="mt-6 h-px w-full"
              style={{ backgroundColor: 'rgba(227, 192, 107, 0.25)' }}
            />
          </div>

          {/* ═══════════════════════════ Period Tabs ═══════════════════════════ */}
          <div className="flex gap-8 mb-6">
            {PERIODS.map(p => {
              const active = period === p.key
              return (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className="text-[13px] font-medium pb-2 transition-colors duration-150"
                  style={{
                    color: active ? '#e4e2e4' : '#5d6478',
                    borderBottom: active ? '1.5px solid #e3c06b' : '1.5px solid transparent',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* ═══════════════════════════ Executive Summary Card ═══════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-[12px] p-8 mb-14"
            style={{
              backgroundColor: CARD_BG,
              boxShadow: 'inset 0 0 0 1px rgba(120, 140, 200, 0.08)',
            }}
          >
            {/* 左側の金色アクセントライン */}
            <div
              className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r"
              style={{ backgroundColor: '#e3c06b' }}
            />

            <SectionLabel>エグゼクティブサマリー</SectionLabel>

            <div className="grid grid-cols-[200px_1fr_1fr] gap-10 mt-5">
              {/* 結論 */}
              <div>
                <FieldLabel>結論</FieldLabel>
                <div className="relative mt-2">
                  <button
                    onClick={() => setConclusionOpen(v => !v)}
                    className="w-full flex items-center justify-between rounded-[6px] px-3 h-10 text-[14px] font-medium transition-colors"
                    style={{
                      backgroundColor: CARD_BG_DEEP,
                      color: '#e3c06b',
                      boxShadow: 'inset 0 0 0 1px rgba(227, 192, 107, 0.25)',
                    }}
                  >
                    <span>{conclusion}</span>
                    <ChevronDown size={14} style={{ color: '#8f8c90' }} />
                  </button>
                  {conclusionOpen && (
                    <div
                      className="absolute z-10 mt-1 w-full rounded-[6px] overflow-hidden"
                      style={{ backgroundColor: CARD_BG_DEEP, boxShadow: 'inset 0 0 0 1px rgba(120, 140, 200, 0.12)' }}
                    >
                      {['順調', '要注意', '危険'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setConclusion(opt); setConclusionOpen(false) }}
                          className="w-full text-left px-3 h-9 text-[13px] transition-colors"
                          style={{ color: '#e4e2e4' }}
                          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(227, 192, 107, 0.08)')}
                          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* NEXT */}
              <div>
                <FieldLabel>NEXT</FieldLabel>
                <div
                  className="mt-2 rounded-[6px] p-4 text-[12.5px] leading-[1.9]"
                  style={{ backgroundColor: CARD_BG_DEEP, color: '#c2c0c6' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <DocIcon />
                    <span className="font-medium" style={{ color: '#e4e2e4' }}>トライアル期間の週次MTG</span>
                  </div>
                  <div>1週目：動作確認</div>
                  <div>2週目：運用確認</div>
                  <div>3週目：最終調整</div>
                  <div>4週目：意向確認</div>
                </div>
              </div>

              {/* 助けが必要な1点 */}
              <div>
                <FieldLabel>助けが必要な1点</FieldLabel>
                <div
                  className="mt-2 rounded-[6px] p-4 text-[12.5px] leading-[1.9]"
                  style={{ backgroundColor: CARD_BG_DEEP, color: '#c2c0c6' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <DocIcon />
                    <span className="font-medium" style={{ color: '#e4e2e4' }}>機能アップデート</span>
                  </div>
                  <div className="mt-1">4月：担当者の割り当て通知</div>
                  <div>5月：チケットからのFAQ自動作成（Gドライブ・シェアポイント）</div>
                  <div className="mt-2" style={{ color: '#e3c06b' }}>※Must Have</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════ Pipeline Funnel ═══════════════════════════ */}
          <div className="flex items-center gap-3 mb-5">
            <SectionLabel>商談パイプライン</SectionLabel>
            <span className="text-[11px]" style={{ color: '#8f8c90' }}>— {period === 'all' ? '全期間合算' : period === '2026-03' ? '2026年3月' : '2026年4月'}</span>
            <button
              className="ml-1 text-[10.5px] px-2 py-1 rounded-[4px] transition-colors"
              style={{
                backgroundColor: CARD_BG,
                color: '#e3c06b',
                boxShadow: 'inset 0 0 0 1px rgba(227, 192, 107, 0.25)',
              }}
            >
              認定条件とは？
            </button>
          </div>

          <div className="grid grid-cols-[1fr_36px_1fr_36px_1fr_36px_1fr] gap-0 items-stretch mb-4">
            <StageCard
              label="有効商談数"
              value={counts.valid}
              color="#e3c06b"
              condition="担当部門 / 導入検討中 / 時期感あり"
              rateLabel="最終転換率"
              rate={counts.finalRate}
              rateColor="#e3c06b"
            />
            <Arrow label="昇格" />
            <StageCard
              label="PJ化予定あり"
              value={counts.pjPlanned}
              color="#7ec6ff"
              condition="2回目の商談意向 / トライアル意向"
              rateLabel="移行率"
              rate={counts.plannedRate}
              rateColor="#6bd6a2"
            />
            <Arrow label="PJ化" />
            <StageCard
              label="PJ可能案件"
              value={counts.pjPossible}
              color="#7ec6ff"
              condition="推進可能"
              rateLabel="移行率"
              rate={counts.possibleRate}
              rateColor="#6bd6a2"
            />
            <Arrow label="POC" />
            <StageCard
              label="PJ進行"
              value={counts.pjRunning}
              color="#6bd6a2"
              condition="POC実施確定 / 2回目商談以降に移行"
              rateLabel="移行率"
              rate={counts.runningRate}
              rateColor="#6bd6a2"
              accentBorder
            />
          </div>

          {/* 失注 / 契約 */}
          <div className="grid grid-cols-2 gap-4 mb-14">
            <OutcomeCard
              icon={<X size={14} style={{ color: '#ff6b6b' }} strokeWidth={2.5} />}
              iconBg="rgba(255, 107, 107, 0.12)"
              label="失注"
              value={counts.lost}
              rateLabel="PJ進行比"
              rate={counts.lostRate}
              accent="#ff6b6b"
            />
            <OutcomeCard
              icon={<Check size={14} style={{ color: '#6bd6a2' }} strokeWidth={2.5} />}
              iconBg="rgba(107, 214, 162, 0.12)"
              label="契約"
              value={counts.contracted}
              rateLabel="PJ進行比"
              rate={counts.contractRate}
              accent="#6bd6a2"
            />
          </div>

          {/* ═══════════════════════════ Deals List ═══════════════════════════ */}
          <div className="flex items-center gap-3 mb-4">
            <SectionLabel>有効商談一覧</SectionLabel>
            <span className="text-[11px]" style={{ color: '#8f8c90' }}>— {filteredDeals.length}件</span>
          </div>

          <div
            className="rounded-[10px] overflow-hidden"
            style={{ backgroundColor: CARD_BG }}
          >
            {/* Header */}
            <div
              className="grid items-center px-6 py-3 text-[11px] font-medium tracking-[0.12em] uppercase"
              style={{
                gridTemplateColumns: '44px 1.3fr 0.7fr 1.4fr',
                color: '#8f8c90',
              }}
            >
              <span>#</span>
              <span>企業名 / 担当</span>
              <span>ステータス</span>
              <span>進捗・備考</span>
            </div>

            {/* Rows */}
            {filteredDeals.map((d, i) => {
              const s = STATUS_STYLES[d.status]
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 * i }}
                  className="grid items-center px-6 py-4 transition-colors duration-150"
                  style={{
                    gridTemplateColumns: '44px 1.3fr 0.7fr 1.4fr',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(120, 140, 200, 0.06)',
                  }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(120, 140, 200, 0.03)')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span className="text-[12px] tabular-nums" style={{ color: '#5d6478' }}>
                    {d.id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold" style={{ color: '#e4e2e4' }}>
                        {d.company}
                      </span>
                      {d.partner && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-[3px]"
                          style={{
                            backgroundColor: 'rgba(120, 140, 200, 0.08)',
                            color: '#8f8c90',
                          }}
                        >
                          パートナー
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: '#8f8c90' }}>
                      {d.owners.join(' / ')}
                    </div>
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </span>
                  </div>
                  <div className="text-[12px] leading-[1.7]" style={{ color: '#c2c0c6' }}>
                    {d.note}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ═══════════════════════════ Footer ═══════════════════════════ */}
          <div className="mt-14 pt-6 flex items-center justify-between text-[11px]"
            style={{
              color: '#5d6478',
              borderTop: '1px solid rgba(120, 140, 200, 0.08)',
            }}
          >
            <div>
              <span className="font-[family-name:var(--font-display)] font-semibold" style={{ color: '#e3c06b' }}>zooba</span>
              <span className="mx-3" style={{ color: '#3d4458' }}>|</span>
              <span>商談パイプラインレポート</span>
            </div>
            <div>Confidential · CEO Executive Summary · 2026.03.30</div>
          </div>
        </div>
      </div>
    </ObsPageShell>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-px" style={{ backgroundColor: '#e3c06b' }} />
      <span className="text-[11px] font-medium tracking-[0.12em]" style={{ color: '#e3c06b' }}>
        {children}
      </span>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-[0.18em] uppercase" style={{ color: '#8f8c90' }}>
      {children}
    </span>
  )
}

function DocIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="2" width="10" height="12" rx="1.5" fill="#e3c06b" opacity="0.25" />
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#e3c06b" strokeWidth="1" opacity="0.6" />
      <line x1="5.5" y1="6" x2="10.5" y2="6" stroke="#e3c06b" strokeWidth="1" opacity="0.6" />
      <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" stroke="#e3c06b" strokeWidth="1" opacity="0.6" />
      <line x1="5.5" y1="11" x2="8.5" y2="11" stroke="#e3c06b" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

function StageCard({
  label, value, color, condition, rateLabel, rate, rateColor, accentBorder,
}: {
  label: string
  value: number
  color: string
  condition: string
  rateLabel: string
  rate: number
  rateColor: string
  accentBorder?: boolean
}) {
  return (
    <div
      className="relative rounded-[10px] p-5 flex flex-col"
      style={{
        backgroundColor: CARD_BG,
        boxShadow: accentBorder
          ? `inset 0 0 0 1px ${color}50`
          : 'inset 0 0 0 1px rgba(120, 140, 200, 0.06)',
        minHeight: 200,
      }}
    >
      <div className="text-[12px] font-medium mb-3" style={{ color }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-[family-name:var(--font-display)] tabular-nums tracking-[-0.04em]"
          style={{ color, fontSize: '56px', fontWeight: 300, lineHeight: 1 }}
        >
          {value}
        </span>
        <span className="text-[14px] font-medium" style={{ color: '#8f8c90' }}>社</span>
      </div>
      <div className="h-px my-4" style={{ backgroundColor: 'rgba(120, 140, 200, 0.08)' }} />
      <div className="text-[10px] tracking-[0.1em] mb-1" style={{ color: '#5d6478' }}>認定条件</div>
      <div className="text-[11.5px] leading-[1.6] flex-1" style={{ color: '#c2c0c6' }}>
        {condition}
      </div>
      <div className="h-px my-3" style={{ backgroundColor: 'rgba(120, 140, 200, 0.08)' }} />
      <div className="flex items-baseline justify-between">
        <span className="text-[10.5px]" style={{ color: '#8f8c90' }}>{rateLabel}</span>
        <span
          className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-[18px]"
          style={{ color: rateColor }}
        >
          {rate}%
        </span>
      </div>
    </div>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
        <path d="M0 6 L16 6 M12 2 L18 6 L12 10" stroke="#5d6478" strokeWidth="1.2" fill="none" />
      </svg>
      <span className="text-[9.5px] mt-1" style={{ color: '#5d6478' }}>{label}</span>
    </div>
  )
}

function OutcomeCard({
  icon, iconBg, label, value, rateLabel, rate, accent,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: number
  rateLabel: string
  rate: number
  accent: string
}) {
  return (
    <div
      className="rounded-[10px] p-5 flex items-center gap-5"
      style={{
        backgroundColor: CARD_BG,
        boxShadow: `inset 0 0 0 1px ${accent}20`,
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[11.5px] mb-1" style={{ color: '#8f8c90' }}>{label}</div>
        <div className="flex items-baseline gap-1">
          <span
            className="font-[family-name:var(--font-display)] tabular-nums tracking-[-0.04em]"
            style={{ color: '#e4e2e4', fontSize: '32px', fontWeight: 300, lineHeight: 1 }}
          >
            {value}
          </span>
          <span className="text-[13px]" style={{ color: '#8f8c90' }}>社</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[10.5px]" style={{ color: '#8f8c90' }}>{rateLabel}</span>
        <span className="font-[family-name:var(--font-display)] font-semibold text-[16px] tabular-nums" style={{ color: accent }}>
          {rate}%
        </span>
      </div>
    </div>
  )
}
