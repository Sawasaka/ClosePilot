'use client'

import { useState, useRef, DragEvent } from 'react'
import {
  GripVertical,
  Plus,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type IntentSignal = 'Hot' | 'Middle' | 'Low'
type StageKey =
  | 'IS'
  | 'MEETING_DONE'
  | 'PROJECT_PLANNED'
  | 'POC'
  | 'DECISION_MAKER_OK'
  | 'CLOSED_WON'
  | 'NURTURING'
  | 'LOST_DEAL'
  | 'CHURN'
  | 'LOST'

interface Deal {
  id: string
  name: string
  company: string
  contact: string
  amount: number
  intent: IntentSignal
  owner: string
  stage: StageKey
  order: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_DEALS: Deal[] = [
  { id: 'd1',  name: 'CRM導入プロジェクト',       company: '株式会社テクノリード',    contact: '田中 誠',    amount: 1200000, intent: 'Hot',    owner: '田中太郎', stage: 'IS',               order: 0 },
  { id: 'd2',  name: 'MA連携提案',                company: '合同会社ビジョン',        contact: '加藤 雄介',  amount: 480000,  intent: 'Low',    owner: '佐藤次郎', stage: 'IS',               order: 1 },
  { id: 'd3',  name: 'SFA刷新案件',               company: '合同会社フューチャー',    contact: '山本 佳子',  amount: 2400000, intent: 'Hot',    owner: '鈴木花子', stage: 'MEETING_DONE',     order: 0 },
  { id: 'd4',  name: 'コンサルティング契約',       company: '株式会社グロース',        contact: '中村 理恵',  amount: 900000,  intent: 'Middle', owner: '佐藤次郎', stage: 'MEETING_DONE',     order: 1 },
  { id: 'd5',  name: 'DX推進パッケージ',          company: '株式会社イノベーション',  contact: '佐々木 拓也', amount: 3600000, intent: 'Hot',    owner: '田中太郎', stage: 'PROJECT_PLANNED',  order: 0 },
  { id: 'd6',  name: 'セールスオートメーション導入', company: '有限会社サクセス',       contact: '小林 健太',  amount: 1800000, intent: 'Middle', owner: '鈴木花子', stage: 'POC',              order: 0 },
  { id: 'd7',  name: 'ライトプラン契約',           company: '株式会社ネクスト',        contact: '鈴木 美香',  amount: 720000,  intent: 'Low',    owner: '田中太郎', stage: 'DECISION_MAKER_OK', order: 0 },
  { id: 'd8',  name: 'エンタープライズ契約（2期）', company: '株式会社テクノリード',    contact: '田中 誠',    amount: 4800000, intent: 'Hot',    owner: '田中太郎', stage: 'CLOSED_WON',       order: 0 },
  { id: 'd9',  name: 'スタータープラン再提案',     company: '株式会社スタート',        contact: '吉田 千春',  amount: 600000,  intent: 'Low',    owner: '佐藤次郎', stage: 'NURTURING',        order: 0 },
  { id: 'd10', name: 'データ分析基盤構築',         company: '株式会社アルファ',        contact: '渡辺 健二',  amount: 1500000, intent: 'Middle', owner: '鈴木花子', stage: 'LOST_DEAL',        order: 0 },
  { id: 'd11', name: 'カスタマーサクセス契約',     company: '合同会社ベータ',          contact: '佐藤 良子',  amount: 960000,  intent: 'Middle', owner: '田中太郎', stage: 'CHURN',            order: 0 },
  { id: 'd12', name: 'AI活用コンサルティング',     company: '株式会社デルタ',          contact: '木村 隆',    amount: 2100000, intent: 'Hot',    owner: '佐藤次郎', stage: 'LOST',             order: 0 },
]

// ─── Stage Config ──────────────────────────────────────────────────────────────

interface StageConfig {
  key: StageKey
  label: string
  desc: string
  color: string
  headerBg: string
  dotColor: string
}

const STAGES: StageConfig[] = [
  { key: 'IS',                label: 'IS',              desc: '未商談の企業へアプローチ',                     color: '#6E6E73', headerBg: 'rgba(0,0,0,0.04)',       dotColor: '#AEAEB2' },
  { key: 'MEETING_DONE',      label: '商談済み',        desc: '初回商談が完了した案件',                       color: '#0044DD', headerBg: 'rgba(0,85,255,0.10)',    dotColor: '#3B82F6' },
  { key: 'PROJECT_PLANNED',   label: 'PJ化予定あり',    desc: '具体的なプロジェクト化が見込める案件',         color: '#4B48CC', headerBg: 'rgba(94,92,230,0.10)',   dotColor: '#8B8BE8' },
  { key: 'POC',               label: 'POC実施中',       desc: '検証・トライアルを実施中の案件',               color: '#9B30D9', headerBg: 'rgba(191,90,242,0.10)',  dotColor: '#BF5AF2' },
  { key: 'DECISION_MAKER_OK', label: '決裁者合意済み',  desc: '決裁者の承認を得て契約手続き待ちの案件',       color: '#C07000', headerBg: 'rgba(255,159,10,0.10)',  dotColor: '#FFB82E' },
  { key: 'CLOSED_WON',        label: '受注',            desc: '契約締結が完了した案件',                       color: '#007A30', headerBg: 'rgba(0,200,83,0.14)',    dotColor: '#00C853' },
  { key: 'NURTURING',         label: 'ナーチャリング',  desc: '商談後に再アプローチで商談獲得を目指す',       color: '#5E5CE6', headerBg: 'rgba(94,92,230,0.08)',   dotColor: '#5E5CE6' },
  { key: 'LOST_DEAL',         label: '失注',            desc: 'POC・決裁者合意後に受注に至らなかった案件',    color: '#D92B1A', headerBg: 'rgba(255,59,48,0.10)',   dotColor: '#FF6B62' },
  { key: 'CHURN',             label: 'チャーン',        desc: '契約後に解約となった案件',                     color: '#CF3131', headerBg: 'rgba(255,59,48,0.06)',   dotColor: '#FF3B30' },
  { key: 'LOST',              label: 'ロスト',          desc: '追客を完全に終了した案件',                     color: '#8E8E93', headerBg: 'rgba(0,0,0,0.03)',       dotColor: '#AEAEB2' },
]

// ─── Style Maps ────────────────────────────────────────────────────────────────

type IntentConfig = { gradient: string; glow: string; color: string; label: string }
const INTENT_CONFIG: Record<IntentSignal, IntentConfig> = {
  Hot:    { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff', label: 'Hot' },
  Middle: { gradient: 'linear-gradient(135deg, #6DD400 0%, #34C759 55%, #248A3D 100%)', glow: '0 2px 7px rgba(52,199,89,0.5)',   color: '#fff', label: 'Middle' },
  Low:    { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff', label: 'Low' },
}

const OWNER_COLORS: Record<string, string> = {
  '田中太郎': '#0071E3',
  '鈴木花子': '#FF2D78',
  '佐藤次郎': '#FF9F0A',
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const OWNERS = ['全員', '田中太郎', '鈴木花子', '佐藤次郎']

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [ownerFilter, setOwnerFilter] = useState('全員')
  const [dragOverStage, setDragOverStage] = useState<StageKey | null>(null)
  // ドロップ挿入位置のインデックス（そのカードの前に挿入）。-1 = 末尾
  const [dropIndex, setDropIndex] = useState<number>(-1)
  const dragDealId = useRef<string | null>(null)

  function onCardDragStart(e: DragEvent<HTMLDivElement>, dealId: string) {
    dragDealId.current = dealId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dealId)
    requestAnimationFrame(() => {
      (e.target as HTMLElement).style.opacity = '0.4'
    })
  }

  function onCardDragEnd(e: DragEvent<HTMLDivElement>) {
    (e.target as HTMLElement).style.opacity = '1'
    dragDealId.current = null
    setDragOverStage(null)
    setDropIndex(-1)
  }

  // カード上をホバーした時、マウスのY座標でカードの上半分か下半分かを判定
  function onCardDragOver(e: DragEvent<HTMLDivElement>, stageKey: StageKey, cardIndex: number) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageKey)

    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    if (e.clientY < midY) {
      setDropIndex(cardIndex)
    } else {
      setDropIndex(cardIndex + 1)
    }
  }

  function onColumnDragOver(e: DragEvent<HTMLDivElement>, stageKey: StageKey) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageKey)
    // カラムの空白エリアにドラッグ → 末尾に追加
    setDropIndex(-1)
  }

  function onColumnDragLeave(stageKey: StageKey) {
    setDragOverStage(prev => {
      if (prev === stageKey) {
        setDropIndex(-1)
        return null
      }
      return prev
    })
  }

  function onDrop(e: DragEvent<HTMLDivElement>, targetStage: StageKey) {
    e.preventDefault()
    e.stopPropagation()
    const dealId = dragDealId.current || e.dataTransfer.getData('text/plain')
    if (!dealId) return

    setDeals(prev => {
      const movingDeal = prev.find(d => d.id === dealId)
      if (!movingDeal) return prev

      // 対象ステージのカードを順序通りに取得（移動するカード自身を除く）
      const stageDeals = prev
        .filter(d => d.stage === targetStage && d.id !== dealId)
        .sort((a, b) => a.order - b.order)

      // 挿入位置を決定
      const insertAt = dropIndex === -1 ? stageDeals.length : Math.min(dropIndex, stageDeals.length)

      // 挿入
      stageDeals.splice(insertAt, 0, { ...movingDeal, stage: targetStage })

      // order を振り直す
      const reordered = new Map<string, { stage: StageKey; order: number }>()
      stageDeals.forEach((d, i) => reordered.set(d.id, { stage: targetStage, order: i }))

      // 元のステージからも移動元を除外して order を振り直す
      if (movingDeal.stage !== targetStage) {
        const srcDeals = prev
          .filter(d => d.stage === movingDeal.stage && d.id !== dealId)
          .sort((a, b) => a.order - b.order)
        srcDeals.forEach((d, i) => reordered.set(d.id, { stage: d.stage, order: i }))
      }

      return prev.map(d => {
        const update = reordered.get(d.id)
        if (update) return { ...d, stage: update.stage, order: update.order }
        return d
      })
    })

    dragDealId.current = null
    setDragOverStage(null)
    setDropIndex(-1)
  }

  // Group deals by stage (sorted by order)
  const dealsByStage = STAGES.reduce<Record<StageKey, Deal[]>>((acc, s) => {
    acc[s.key] = deals
      .filter(d => d.stage === s.key)
      .sort((a, b) => a.order - b.order)
    return acc
  }, {} as Record<StageKey, Deal[]>)

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between mb-5 pb-5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
          パイプライン
        </h1>
        <button
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-[8px] hover:brightness-105 active:scale-[0.97] transition-all"
          style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)', boxShadow: '0 1px 3px rgba(0,113,227,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          取引を追加
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div
        className="flex items-center gap-2 flex-wrap mb-4 p-3 rounded-[10px]"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-1">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{
                background: ownerFilter === o ? 'rgba(0,113,227,0.1)' : 'transparent',
                color: ownerFilter === o ? '#0071E3' : '#6E6E73',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
          {STAGES.map(stage => {
            const stageDeals = dealsByStage[stage.key]
            const isOver = dragOverStage === stage.key
            return (
              <div
                key={stage.key}
                className="flex flex-col w-[240px] shrink-0"
                onDragOver={e => onColumnDragOver(e, stage.key)}
                onDragLeave={() => onColumnDragLeave(stage.key)}
                onDrop={e => onDrop(e, stage.key)}
              >
                {/* Column Header */}
                <div
                  className="rounded-[10px] px-3 py-2.5 mb-3 border transition-all duration-150"
                  style={{
                    backgroundColor: isOver ? stage.color + '20' : stage.headerBg,
                    borderColor: isOver ? stage.color + '60' : stage.color + '30',
                    transform: isOver ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.dotColor }} />
                      <span className="text-[12px] font-semibold" style={{ color: stage.color }}>
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight" style={{ color: stage.color + 'AA' }}>
                    {stage.desc}
                  </p>
                </div>

                {/* Drop zone + Cards */}
                <div
                  className="flex flex-col gap-2 flex-1 rounded-[8px] p-1 -m-1 transition-all duration-150"
                  style={{
                    background: isOver ? stage.color + '08' : 'transparent',
                    border: isOver ? `2px dashed ${stage.color}40` : '2px dashed transparent',
                    minHeight: 60,
                  }}
                >
                  {stageDeals.map((deal, cardIdx) => {
                    const intent = INTENT_CONFIG[deal.intent]
                    const ownerColor = OWNER_COLORS[deal.owner] ?? '#6B7280'
                    const dimmed = ownerFilter !== '全員' && deal.owner !== ownerFilter
                    const showDropBefore = isOver && dropIndex === cardIdx && dragDealId.current !== deal.id
                    const showDropAfter = isOver && dropIndex === cardIdx + 1 && cardIdx === stageDeals.length - 1 && dragDealId.current !== deal.id
                    return (
                      <div key={deal.id}>
                        {/* Drop indicator line - before */}
                        {showDropBefore && (
                          <div className="flex items-center gap-1 py-0.5 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                            <div className="flex-1 h-[2px] rounded-full" style={{ background: stage.color }} />
                          </div>
                        )}
                        <div
                          draggable
                          onDragStart={e => onCardDragStart(e, deal.id)}
                          onDragEnd={onCardDragEnd}
                          onDragOver={e => onCardDragOver(e, stage.key, cardIdx)}
                          className="rounded-[10px] p-3.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:-translate-y-0.5"
                          style={{
                            background: 'white',
                            border: '1px solid rgba(0,0,0,0.07)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
                            opacity: dimmed ? 0.35 : 1,
                            pointerEvents: dimmed ? 'none' : 'auto',
                          }}
                        >
                          {/* Handle + Intent */}
                          <div className="flex items-start justify-between mb-2">
                            <GripVertical size={13} className="text-[#D1D5DB] mt-0.5 -ml-0.5 shrink-0" />
                            <span
                              className="inline-flex items-center justify-center rounded-[4px] text-[9px] font-bold px-1.5"
                              style={{ height: 20, background: intent.gradient, boxShadow: intent.glow, color: intent.color, letterSpacing: '0.03em' }}
                            >
                              {intent.label}
                            </span>
                          </div>
                          <p className="text-[13px] font-semibold text-[#1D1D1F] leading-snug mb-3 truncate">
                            {deal.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: ownerColor + '22' }}
                            >
                              <span className="text-[9px] font-bold" style={{ color: ownerColor }}>
                                {deal.owner[0]}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#6E6E73]">{deal.owner}</span>
                          </div>
                        </div>
                        {/* Drop indicator line - after last card */}
                        {showDropAfter && (
                          <div className="flex items-center gap-1 py-0.5 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                            <div className="flex-1 h-[2px] rounded-full" style={{ background: stage.color }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {/* 空のカラムへのドロップ時の末尾インジケーター */}
                  {isOver && stageDeals.length === 0 && (
                    <div className="flex items-center gap-1 py-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                      <div className="flex-1 h-[2px] rounded-full" style={{ background: stage.color }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
