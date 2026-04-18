'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & DATA
// ═══════════════════════════════════════════════════════════════════════════════

type Stage = 'IS' | '商談済み' | 'PJ化予定' | 'POC実施中' | '決裁者合意' | '受注'
type Period = 'all' | '2026-03' | '2026-04'

interface Deal {
  id: string
  company: string
  contact: string
  stage: Stage
  amount: number
  owner: string
  createdAt: string
  closedAt: string | null
  note: string
}

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'IS',        label: 'IS',           color: '#CCDDF0' },
  { key: '商談済み',   label: '商談済み',      color: '#88BBFF' },
  { key: 'PJ化予定',   label: 'PJ化予定',     color: '#AA88FF' },
  { key: 'POC実施中',  label: 'POC実施中',    color: '#FFDD44' },
  { key: '決裁者合意',  label: '決裁者合意',   color: '#FF8844' },
  { key: '受注',       label: '受注',         color: '#44FF88' },
]

const DEALS: Deal[] = [
  { id: 'd1',  company: '株式会社テクノリード',    contact: '田中 誠',    stage: '受注',      amount: 4800000, owner: '田中太郎', createdAt: '2026-01-10', closedAt: '2026-03-15', note: 'エンタープライズ契約（2期）' },
  { id: 'd2',  company: '株式会社イノベーション',  contact: '佐々木 拓也', stage: '決裁者合意', amount: 6000000, owner: '田中太郎', createdAt: '2026-02-01', closedAt: null, note: '大型案件。口頭合意済み、契約書待ち' },
  { id: 'd3',  company: '合同会社フューチャー',    contact: '山本 佳子',  stage: '商談済み',   amount: 2400000, owner: '鈴木花子', createdAt: '2026-02-15', closedAt: null, note: '初回商談完了。課題感あり' },
  { id: 'd4',  company: '株式会社グロース',        contact: '中村 理恵',  stage: 'PJ化予定',  amount: 900000,  owner: '佐藤次郎', createdAt: '2026-02-20', closedAt: null, note: '2回目商談調整中' },
  { id: 'd5',  company: '有限会社サクセス',        contact: '小林 健太',  stage: 'POC実施中', amount: 1800000, owner: '鈴木花子', createdAt: '2026-01-25', closedAt: null, note: 'PoC実施中。4月中に結論予定' },
  { id: 'd6',  company: '株式会社ネクスト',        contact: '鈴木 美香',  stage: 'IS',        amount: 720000,  owner: '田中太郎', createdAt: '2026-03-01', closedAt: null, note: '初回コール済み。反応良好' },
  { id: 'd7',  company: '株式会社デルタ',          contact: '木村 隆',    stage: 'PJ化予定',  amount: 2100000, owner: '佐藤次郎', createdAt: '2026-03-05', closedAt: null, note: 'エンプラ要件あり。SSO必須' },
  { id: 'd8',  company: '合同会社ビジョン',        contact: '加藤 雄介',  stage: 'IS',        amount: 480000,  owner: '佐藤次郎', createdAt: '2026-03-10', closedAt: null, note: 'MA連携ニーズ' },
  { id: 'd9',  company: '株式会社スタート',        contact: '吉田 千春',  stage: '商談済み',   amount: 600000,  owner: '佐藤次郎', createdAt: '2026-03-12', closedAt: null, note: '再提案。スタータープラン検討中' },
  { id: 'd10', company: '株式会社アルファ',        contact: '渡辺 健二',  stage: 'POC実施中', amount: 1500000, owner: '鈴木花子', createdAt: '2026-04-01', closedAt: null, note: '4月開始。データ分析基盤構築' },
  { id: 'd11', company: '合同会社ベータ',          contact: '佐藤 良子',  stage: '商談済み',   amount: 960000,  owner: '田中太郎', createdAt: '2026-04-03', closedAt: null, note: 'CS契約更新検討' },
  { id: 'd12', company: 'フューチャーセキュアウェイブ', contact: '高橋 健一', stage: 'PJ化予定', amount: 3200000, owner: '田中太郎', createdAt: '2026-04-05', closedAt: null, note: '2回目商談完了。検証フェーズ移行中' },
]

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function calcMetrics(deals: Deal[]) {
  const byStage: Record<Stage, Deal[]> = { IS: [], '商談済み': [], 'PJ化予定': [], 'POC実施中': [], '決裁者合意': [], '受注': [] }
  deals.forEach(d => byStage[d.stage].push(d))

  const totalDeals = deals.length
  const wonDeals = byStage['受注'].length
  const totalAmount = deals.reduce((s, d) => s + d.amount, 0)
  const wonAmount = byStage['受注'].reduce((s, d) => s + d.amount, 0)
  const closeRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0

  // ステージ間の転換率
  const stageKeys: Stage[] = ['IS', '商談済み', 'PJ化予定', 'POC実施中', '決裁者合意', '受注']
  // 各ステージ以降に到達した案件数（累積）
  const atOrBeyond = stageKeys.map((_, si) => {
    return deals.filter(d => {
      const di = stageKeys.indexOf(d.stage)
      return di >= si
    }).length
  })

  const conversionRates = stageKeys.map((_, si) => {
    if (si === 0) return 100
    return atOrBeyond[0] > 0 ? Math.round((atOrBeyond[si] / atOrBeyond[0]) * 100) : 0
  })

  // ステージ間の移行率
  const stageTransitions = stageKeys.map((_, si) => {
    if (si === 0) return 100
    return atOrBeyond[si - 1] > 0 ? Math.round((atOrBeyond[si] / atOrBeyond[si - 1]) * 100) : 0
  })

  return { byStage, totalDeals, wonDeals, totalAmount, wonAmount, closeRate, atOrBeyond, conversionRates, stageTransitions }
}

function formatAmount(n: number): string {
  if (n >= 1000000) return `¥${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `¥${(n / 1000).toFixed(0)}K`
  return `¥${n.toLocaleString()}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'all', label: '全期間' },
  { key: '2026-03', label: '2026年3月' },
  { key: '2026-04', label: '2026年4月' },
]

export default function PipelineReportPage() {
  const [period, setPeriod] = useState<Period>('all')

  const filtered = useMemo(() => {
    if (period === 'all') return DEALS
    return DEALS.filter(d => d.createdAt.startsWith(period))
  }, [period])

  const m = useMemo(() => calcMetrics(filtered), [filtered])

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[21px] font-bold text-[#EEEEFF] tracking-[0.01em]">パイプラインレポート</h1>
          <p className="text-[13px] text-[#AABBDD] mt-0.5">パーソナルパイプラインの転換率・案件化率を分析</p>
        </div>
        {/* Period tabs */}
        <div className="flex gap-1.5">
          {PERIOD_OPTIONS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className="h-[30px] px-3 text-[12px] font-medium rounded-[6px] transition-all"
              style={{ background: period === p.key ? '#2244AA' : 'rgba(136,187,255,0.06)', color: period === p.key ? '#FFFFFF' : '#88BBFF', border: period === p.key ? '1px solid #3355CC' : '1px solid transparent' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '総案件数', value: `${m.totalDeals}`, sub: '件', color: '#88BBFF' },
          { label: '受注数', value: `${m.wonDeals}`, sub: '件', color: '#44FF88' },
          { label: 'クローズ率', value: `${m.closeRate}`, sub: '%', color: m.closeRate >= 20 ? '#44FF88' : '#FF8888' },
          { label: '受注金額', value: formatAmount(m.wonAmount), sub: '', color: '#FFDD44' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-[8px] p-4" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
            <p className="text-[10px] font-bold text-[#99AACC] uppercase tracking-[0.08em]">{kpi.label}</p>
            <p className="text-[28px] font-bold mt-1 tabular-nums" style={{ color: kpi.color }}>
              {kpi.value}<span className="text-[14px] ml-0.5 font-semibold">{kpi.sub}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── ファネルフロー ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-[8px] p-5" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <h3 className="text-[13px] font-bold text-[#EEEEFF] mb-5 tracking-[0.02em]">パイプラインファネル</h3>
        <div className="flex items-center gap-0">
          {STAGES.map((stage, si) => {
            const count = m.atOrBeyond[si]
            const convRate = m.conversionRates[si]
            const transRate = m.stageTransitions[si]
            const maxCount = m.atOrBeyond[0] || 1
            const barHeight = Math.max(20, (count / maxCount) * 100)

            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div className="flex-1 flex flex-col items-center">
                  {/* 転換率（最上部） */}
                  <div className="text-center mb-2">
                    <p className="text-[18px] font-bold tabular-nums" style={{ color: stage.color }}>{count}</p>
                    <p className="text-[9px] text-[#99AACC]">社</p>
                  </div>

                  {/* バー */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}px` }}
                    transition={{ duration: 0.5, delay: 0.2 + si * 0.06 }}
                    className="w-full max-w-[60px] rounded-[4px]"
                    style={{ background: `${stage.color}30`, border: `1px solid ${stage.color}40`, boxShadow: `0 0 8px ${stage.color}15` }}
                  />

                  {/* ステージ名 */}
                  <p className="text-[10px] font-semibold mt-2 text-center" style={{ color: stage.color }}>{stage.label}</p>

                  {/* 全体転換率 */}
                  <p className="text-[9px] tabular-nums mt-0.5" style={{ color: '#99AACC' }}>
                    {convRate}%
                  </p>
                </div>

                {/* 矢印 + 移行率 */}
                {si < STAGES.length - 1 && (
                  <div className="flex flex-col items-center mx-1 shrink-0">
                    <span className="text-[10px] font-bold tabular-nums mb-1" style={{ color: m.stageTransitions[si + 1] >= 50 ? '#44FF88' : '#FF8888' }}>
                      {m.stageTransitions[si + 1]}%
                    </span>
                    <ArrowRight size={12} style={{ color: '#2244AA' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── 案件一覧テーブル ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-[8px] overflow-hidden" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #2244AA' }}>
          <h3 className="text-[13px] font-bold text-[#EEEEFF] tracking-[0.02em]">案件一覧</h3>
          <span className="text-[11px] text-[#99AACC]">{filtered.length} 件</span>
        </div>

        {/* Header */}
        <div className="grid items-center px-5 py-2" style={{ gridTemplateColumns: '28px 1.2fr 0.8fr 90px 80px 1fr', borderBottom: '1px solid rgba(34,68,170,0.3)', background: 'rgba(16,24,56,0.4)' }}>
          <span className="text-[10px] text-[#99AACC] font-bold">#</span>
          <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.06em]">企業 / 担当</span>
          <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.06em]">ステータス</span>
          <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.06em]">金額</span>
          <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.06em]">担当</span>
          <span className="text-[10px] text-[#99AACC] font-bold uppercase tracking-[0.06em]">進捗・備考</span>
        </div>

        {/* Rows */}
        {filtered.map((deal, i) => {
          const stageCfg = STAGES.find(s => s.key === deal.stage)
          const color = stageCfg?.color || '#7788AA'
          return (
            <motion.div key={deal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.03 }}
              className="grid items-center px-5 py-3 hover:bg-[rgba(136,187,255,0.03)] transition-colors"
              style={{ gridTemplateColumns: '28px 1.2fr 0.8fr 90px 80px 1fr', borderBottom: '1px solid rgba(34,68,170,0.15)' }}>
              <span className="text-[11px] text-[#99AACC] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="text-[13px] font-semibold text-[#EEEEFF] truncate">{deal.company}</p>
                <p className="text-[10px] text-[#AABBDD]">{deal.contact}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />
                {deal.stage}
              </span>
              <span className="text-[12px] font-semibold text-[#EEEEFF] tabular-nums">{formatAmount(deal.amount)}</span>
              <span className="text-[11px] text-[#CCDDF0]">{deal.owner}</span>
              <div className="flex items-start gap-1.5 min-w-0">
                {deal.note.includes('⚠') && <AlertTriangle size={11} className="text-[#FF8888] shrink-0 mt-0.5" />}
                <p className="text-[11px] text-[#CCDDF0] truncate">{deal.note}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── インサイト ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { title: '案件化率', value: `${m.conversionRates[2]}%`, desc: 'IS → PJ化予定 への転換率', color: '#AA88FF' },
          { title: 'POC移行率', value: `${m.conversionRates[3]}%`, desc: 'PJ化予定 → POC実施中 への移行率', color: '#FFDD44' },
          { title: '最終クローズ率', value: `${m.closeRate}%`, desc: '全案件のうち受注に至った割合', color: '#44FF88' },
        ].map((insight, i) => (
          <motion.div key={insight.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
            className="rounded-[8px] p-4" style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
            <p className="text-[10px] font-bold text-[#99AACC] uppercase tracking-[0.08em] mb-1">{insight.title}</p>
            <p className="text-[24px] font-bold tabular-nums" style={{ color: insight.color }}>{insight.value}</p>
            <p className="text-[10px] text-[#AABBDD] mt-1">{insight.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
