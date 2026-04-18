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
  | 'MEETING_PLANNED'
  | 'MEETING_DONE'
  | 'PROJECT_PLANNED'
  | 'MULTI_MEETING'
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
  { key: 'IS',                label: 'IS',              desc: '未商談の企業へアプローチ',                                       color: '#5AC8FA', headerBg: 'rgba(50,173,230,0.22)',  dotColor: '#5AC8FA' },
  { key: 'NURTURING',         label: 'ナーチャリング',  desc: '再アプローチで商談獲得を目指す', color: '#EC4899', headerBg: 'rgba(236,72,153,0.22)',  dotColor: '#F9A8D4' },
  { key: 'MEETING_PLANNED',   label: '商談予定',        desc: '初回商談がスケジュール済みの案件',                               color: '#0EA5E9', headerBg: 'rgba(14,165,233,0.22)',  dotColor: '#38BDF8' },
  { key: 'MEETING_DONE',      label: '商談済み',        desc: '初回商談が完了した案件',                                         color: '#3B82F6', headerBg: 'rgba(59,130,246,0.22)',  dotColor: '#60A5FA' },
  { key: 'PROJECT_PLANNED',   label: 'PJ化予定あり',    desc: '具体的なプロジェクト化が見込める案件',                           color: '#8B5CF6', headerBg: 'rgba(139,92,246,0.22)',  dotColor: '#A78BFA' },
  { key: 'MULTI_MEETING',     label: '複数商談済み',    desc: '2回以上の商談を実施済みの案件',                                  color: '#A855F7', headerBg: 'rgba(168,85,247,0.22)',  dotColor: '#C084FC' },
  { key: 'POC',               label: 'POC実施中',       desc: '検証・トライアルを実施中の案件',                                 color: '#D946EF', headerBg: 'rgba(217,70,239,0.22)',  dotColor: '#E879F9' },
  { key: 'LOST_DEAL',         label: '失注',            desc: '商談後に受注に至らなかった案件',                                 color: '#FF3B30', headerBg: 'rgba(255,59,48,0.18)',   dotColor: '#FF6B62' },
  { key: 'CLOSED_WON',        label: '受注',            desc: '契約締結が完了した案件',                                         color: '#34C759', headerBg: 'rgba(52,199,89,0.22)',   dotColor: '#6EE7B7' },
  { key: 'CHURN',             label: 'チャーン',        desc: '契約後に解約となった案件',                                       color: '#FF8A82', headerBg: 'rgba(255,138,130,0.16)', dotColor: '#FF3B30' },
  { key: 'LOST',              label: 'ロスト',          desc: '追客を完全に終了した案件',                                       color: '#94A3B8', headerBg: 'rgba(148,163,184,0.14)', dotColor: '#94A3B8' },
]

// ─── Style Maps ────────────────────────────────────────────────────────────────

type IntentConfig = { gradient: string; glow: string; color: string; label: string; borderColor: string; textShadow: string }
// 確度: 高(Hot) / 中(Middle) / 低(Low)
const INTENT_CONFIG: Record<IntentSignal, IntentConfig> = {
  Hot: {
    label: '高',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  Middle: {
    label: '中',
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  Low: {
    label: '低',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
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
        style={{ borderBottom: '1px solid #2244AA' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">
            パイプライン
          </h1>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[12px] font-bold tabular-nums"
            style={{
              background: 'linear-gradient(135deg, rgba(136,187,255,0.22) 0%, rgba(85,119,221,0.16) 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(136,187,255,0.45)',
              boxShadow: '0 0 10px rgba(136,187,255,0.25)',
              textShadow: '0 0 6px rgba(136,187,255,0.5)',
            }}
          >
            {deals.length}件
          </span>
        </div>
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
        style={{ background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)', border: '1px solid #2244AA', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center gap-1">
          {OWNERS.map(o => (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{
                background: ownerFilter === o ? 'rgba(136,187,255,0.12)' : 'transparent', color: ownerFilter === o ? '#88BBFF' : '#7788AA',
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
                  className="rounded-[10px] px-3 py-3 mb-3 border-2 transition-all duration-150 relative overflow-hidden"
                  style={{
                    background: isOver
                      ? `linear-gradient(180deg, ${stage.color}55 0%, ${stage.color}25 100%)`
                      : `linear-gradient(180deg, ${stage.color}40 0%, ${stage.color}18 100%)`,
                    borderColor: isOver ? stage.color : stage.color,
                    boxShadow: isOver
                      ? `0 0 28px ${stage.color}88, 0 0 8px ${stage.color}cc, inset 0 1px 0 ${stage.color}60`
                      : `0 0 18px ${stage.color}55, 0 0 4px ${stage.color}80, inset 0 1px 0 ${stage.color}50`,
                    transform: isOver ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* 上部のグローライン */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: `linear-gradient(90deg, transparent 0%, ${stage.color} 50%, transparent 100%)`,
                    boxShadow: `0 0 12px ${stage.color}, 0 0 4px ${stage.color}`,
                  }} />
                  {/* 背景の放射グロー */}
                  <div style={{
                    position: 'absolute', top: '-30%', left: '-10%', width: '120%', height: '160%',
                    background: `radial-gradient(ellipse at top, ${stage.color}30 0%, transparent 60%)`,
                    pointerEvents: 'none',
                  }} />

                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: `radial-gradient(circle, #FFFFFF 0%, ${stage.color} 60%, ${stage.color} 100%)`,
                          boxShadow: `0 0 10px ${stage.color}, 0 0 20px ${stage.color}cc, 0 0 4px #FFFFFF`,
                          border: `1px solid ${stage.color}`,
                        }}
                      />
                      <span
                        className="text-[13px] font-black tracking-[0.02em]"
                        style={{
                          color: '#FFFFFF',
                          textShadow: `0 0 12px ${stage.color}, 0 0 4px ${stage.color}, 0 1px 2px rgba(0,0,0,0.5)`,
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className="min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                      style={{
                        background: `linear-gradient(180deg, ${stage.color}, ${stage.color}cc)`,
                        boxShadow: `0 0 12px ${stage.color}cc, 0 0 4px ${stage.color}, inset 0 1px 0 rgba(255,255,255,0.5)`,
                        border: `1px solid rgba(255,255,255,0.5)`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      }}
                    >
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 leading-tight font-medium relative" style={{ color: '#EEEEFF' }}>
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
                            background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
                            border: '1px solid #2244AA',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
                            opacity: dimmed ? 0.35 : 1,
                            pointerEvents: dimmed ? 'none' : 'auto',
                          }}
                        >
                          {/* Handle + Intent (確度) */}
                          <div className="flex items-start justify-between mb-2">
                            <GripVertical size={13} className="text-[#88BBFF] mt-0.5 -ml-0.5 shrink-0" />
                            <span
                              className="inline-flex items-center justify-center rounded-full text-[10px] font-black"
                              style={{
                                width: 22,
                                height: 22,
                                background: intent.gradient,
                                boxShadow: intent.glow,
                                color: intent.color,
                                border: `1px solid ${intent.borderColor}`,
                                textShadow: intent.textShadow,
                                letterSpacing: '0.04em',
                              }}
                              title={`確度: ${intent.label}`}
                            >
                              {intent.label}
                            </span>
                          </div>
                          <p className="text-[13px] font-semibold text-[#EEEEFF] leading-snug mb-3 truncate">
                            {deal.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                background: ownerColor,
                                boxShadow: `0 0 8px ${ownerColor}aa, inset 0 1px 0 rgba(255,255,255,0.4)`,
                                border: '1px solid rgba(255,255,255,0.35)',
                              }}
                            >
                              <span className="text-[9px] font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                                {deal.owner[0]}
                              </span>
                            </div>
                            <span className="text-[12px] font-medium text-[#EEEEFF]">{deal.owner}</span>
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
