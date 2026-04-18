'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Mail, Clock, GitBranch, CheckSquare, Play, Pause, X, Users, MailOpen, MousePointerClick, Reply } from 'lucide-react'
import type { Sequence, SequenceStatus } from '@/types/crm'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SEQUENCES: Sequence[] = [
  {
    id: 'seq-1', name: '未着手 → 初回接触', description: '未着手のコンタクトに3日後自動メール＋コールタスク',
    status: 'active', triggerLabel: 'アプローチ = 未着手',
    steps: [
      { type: 'wait', label: '3日待機', detail: '3日後に次ステップ' },
      { type: 'email', label: 'ご挨拶メール', detail: '件名: {{company_name}}様 — ご紹介のご挨拶' },
      { type: 'wait', label: '2日待機', detail: '2日後にコールタスク' },
      { type: 'task', label: 'コールタスク作成', detail: '初回フォローコール' },
    ],
    enrolledCount: 12, completedCount: 5, emailsSent: 18, openRate: 42, clickRate: 12, replyRate: 8,
    createdAt: '2026-03-10', updatedAt: '2026-03-26', createdBy: '田中太郎',
  },
  {
    id: 'seq-2', name: '不通/不在 → フォロー', description: '不通・不在のコンタクトへの段階的フォローアップ',
    status: 'active', triggerLabel: 'アプローチ = 不通 / 不在',
    steps: [
      { type: 'wait', label: '1日待機', detail: '' },
      { type: 'email', label: 'フォローメール①', detail: '件名: ご不在でしたので改めて...' },
      { type: 'wait', label: '3日待機', detail: '' },
      { type: 'email', label: 'フォローメール②', detail: '件名: その後いかがでしょうか' },
      { type: 'wait', label: '5日待機', detail: '' },
      { type: 'task', label: 'コールタスク', detail: '最終フォローコール' },
    ],
    enrolledCount: 8, completedCount: 3, emailsSent: 22, openRate: 35, clickRate: 8, replyRate: 5,
    createdAt: '2026-03-12', updatedAt: '2026-03-25', createdBy: '田中太郎',
  },
  {
    id: 'seq-3', name: '接続済み → 資料送付', description: '接続済みコンタクトへ自動で資料送付＋事例紹介',
    status: 'active', triggerLabel: 'アプローチ = 接続済み',
    steps: [
      { type: 'email', label: 'サービス紹介資料送付', detail: '件名: {{company_name}}様 — 資料をお送りします' },
      { type: 'wait', label: '2日待機', detail: '' },
      { type: 'condition', label: '資料閲覧チェック', detail: '資料を閲覧した場合 → 事例メール' },
      { type: 'email', label: '事例紹介メール', detail: '件名: 同業他社の導入事例のご紹介' },
    ],
    enrolledCount: 6, completedCount: 4, emailsSent: 14, openRate: 55, clickRate: 22, replyRate: 15,
    createdAt: '2026-03-14', updatedAt: '2026-03-24', createdBy: '鈴木花子',
  },
  {
    id: 'seq-4', name: 'アポ獲得 → リマインド', description: 'アポ獲得後の自動リマインド＋準備タスク',
    status: 'active', triggerLabel: 'アプローチ = アポ獲得',
    steps: [
      { type: 'wait', label: '前日待機', detail: 'アポ日の前日' },
      { type: 'email', label: 'リマインドメール', detail: '件名: 明日のお打ち合わせについて' },
      { type: 'task', label: '商談準備タスク', detail: 'リサーチブリーフ確認＋資料準備' },
    ],
    enrolledCount: 4, completedCount: 10, emailsSent: 10, openRate: 78, clickRate: 5, replyRate: 32,
    createdAt: '2026-03-08', updatedAt: '2026-03-26', createdBy: '鈴木花子',
  },
  {
    id: 'seq-5', name: '失注ナーチャリング', description: '失注コンタクトへの長期ナーチャリングシーケンス',
    status: 'active', triggerLabel: 'フェーズ = 失注',
    steps: [
      { type: 'wait', label: '7日待機', detail: '' },
      { type: 'email', label: 'お役立ちコンテンツ', detail: '件名: {{industry}}業界の最新トレンドをお届け' },
      { type: 'wait', label: '30日待機', detail: '' },
      { type: 'email', label: '事例紹介', detail: '件名: 同業他社の成功事例のご紹介' },
      { type: 'wait', label: '60日待機', detail: '' },
      { type: 'email', label: '新機能案内', detail: '件名: 新機能リリースのお知らせ' },
      { type: 'wait', label: '90日待機', detail: '' },
      { type: 'task', label: 'コールタスク', detail: '再アプローチコール' },
    ],
    enrolledCount: 15, completedCount: 2, emailsSent: 35, openRate: 28, clickRate: 6, replyRate: 3,
    createdAt: '2026-03-05', updatedAt: '2026-03-26', createdBy: '田中太郎',
  },
  {
    id: 'seq-6', name: '休眠再活性化', description: '休眠コンタクトの再活性化シーケンス',
    status: 'paused', triggerLabel: 'フェーズ = 休眠',
    steps: [
      { type: 'wait', label: '14日待機', detail: '' },
      { type: 'email', label: '再活性化メール', detail: '件名: お久しぶりです — 最新情報のご案内' },
      { type: 'wait', label: '30日待機', detail: '' },
      { type: 'condition', label: '開封チェック', detail: '開封した場合 → 特別オファー' },
      { type: 'email', label: '特別オファー', detail: '件名: 限定キャンペーンのご案内' },
      { type: 'task', label: 'コールタスク', detail: '最終フォローコール' },
    ],
    enrolledCount: 20, completedCount: 8, emailsSent: 42, openRate: 22, clickRate: 4, replyRate: 2,
    createdAt: '2026-03-01', updatedAt: '2026-03-20', createdBy: '佐藤次郎',
  },
]

// ─── Trigger options ─────────────────────────────────────────────────────────

type TriggerType = 'approach' | 'phase' | 'pipeline' | 'manual'
const TRIGGER_OPTIONS: { key: TriggerType; label: string; description: string }[] = [
  { key: 'approach', label: 'アプローチステータス変更', description: 'IS側のコール結果に応じて発動' },
  { key: 'phase',    label: 'フェーズ変更',             description: 'コンタクトのフェーズ変更時に発動' },
  { key: 'pipeline', label: 'パイプラインステージ変更', description: '取引のステージ変更時に発動' },
  { key: 'manual',   label: '手動登録',                 description: 'コンタクトを手動で登録' },
]

const APPROACH_OPTIONS = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'Next Action']
const PHASE_OPTIONS = ['リード', '商談中', '顧客', '休眠', '失注']
const PIPELINE_OPTIONS = ['IS', '商談済み', 'PJ化予定あり', 'POC実施中', '決裁者合意済み', '受注', 'ナーチャリング', '失注', 'チャーン', 'ロスト']

interface SeqGameStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
  label: string
}

const STATUS_STYLES: Record<SequenceStatus, SeqGameStyle> = {
  active: {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
    label: 'アクティブ',
  },
  paused: {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
    label: '一時停止',
  },
  draft: {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', dotColor: '#48484A', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
    label: '下書き',
  },
}
const STEP_ICONS: Record<string, React.ElementType> = { wait: Clock, email: Mail, condition: GitBranch, task: CheckSquare }
const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AutomationPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SequenceStatus | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [sequences, setSequences] = useState(MOCK_SEQUENCES)

  const filtered = useMemo(() => {
    let list = sequences
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(q)) }
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter)
    return list
  }, [sequences, search, statusFilter])

  const activeCount = sequences.filter(s => s.status === 'active').length
  const totalEnrolled = sequences.reduce((s, seq) => s + seq.enrolledCount, 0)
  const totalSent = sequences.reduce((s, seq) => s + seq.emailsSent, 0)
  const avgOpen = sequences.length > 0 ? Math.round(sequences.reduce((s, seq) => s + seq.openRate, 0) / sequences.length) : 0

  function handleCreateSequence(name: string, description: string, triggerLabel: string) {
    const newSeq: Sequence = {
      id: `seq-${Date.now()}`, name, description, status: 'draft', triggerLabel,
      steps: [], enrolledCount: 0, completedCount: 0, emailsSent: 0,
      openRate: 0, clickRate: 0, replyRate: 0,
      createdAt: '2026-03-28', updatedAt: '2026-03-28', createdBy: '田中太郎',
    }
    setSequences(prev => [newSeq, ...prev])
    setShowCreate(false)
    router.push(`/automation/${newSeq.id}`)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">オートメーション</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">シーケンスによるメール自動配信・タスク自動生成</p>
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'アクティブ', value: activeCount, color: '#34C759', icon: Play },
          { label: '登録中コンタクト', value: totalEnrolled, color: '#0071E3', icon: Users },
          { label: 'メール送信数', value: totalSent, color: '#5E5CE6', icon: Mail },
          { label: '平均開封率', value: `${avgOpen}%`, color: '#FF9F0A', icon: MailOpen },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] p-4 relative overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${kpi.color}25 0%, transparent 70%)` }} />
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={14} style={{ color: kpi.color }} />
              <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">{kpi.label}</span>
            </div>
            <p className="text-[24px] font-bold tracking-[-0.04em]" style={{ color: kpi.color }}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#99AACC' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="シーケンス名で検索..."
            className="h-[32px] w-full pl-8 pr-3 text-[13px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
            style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }} />
        </div>
        <div className="flex items-center gap-1.5">
          {[{ key: 'all' as const, label: '全て' }, { key: 'active' as const, label: 'アクティブ' }, { key: 'paused' as const, label: '一時停止' }, { key: 'draft' as const, label: '下書き' }].map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
              style={{ background: statusFilter === f.key ? '#2244AA' : 'rgba(136,187,255,0.06)', color: statusFilter === f.key ? '#FFF' : '#88BBFF' }}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="h-[32px] px-3 flex items-center gap-1.5 text-[13px] font-medium text-white rounded-[8px] ml-auto"
          style={{ background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)', boxShadow: '0 2px 8px rgba(34,68,170,0.4)' }}>
          <Plus size={13} />新規シーケンス
        </button>
      </div>

      {/* Sequence cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((seq, i) => {
          const st = STATUS_STYLES[seq.status]
          return (
            <motion.div key={seq.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0c1028] rounded-[8px] p-5 cursor-pointer" style={{ boxShadow: CARD_SHADOW }}
              onClick={() => router.push(`/automation/${seq.id}`)}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#EEEEFF] truncate">{seq.name}</h3>
                  <p className="text-[12px] text-[#CCDDF0] mt-0.5 truncate">{seq.description}</p>
                </div>
                <span
                  className="shrink-0 ml-3 inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold"
                  style={{
                    background: st.gradient,
                    boxShadow: st.glow,
                    color: st.color,
                    border: `1px solid ${st.borderColor}`,
                    textShadow: st.textShadow,
                    letterSpacing: '0.01em',
                  }}>
                  <span className="rounded-full" style={{ width: 6, height: 6, background: st.dotColor, boxShadow: `0 0 4px ${st.dotColor}cc` }} />
                  {st.label}
                </span>
              </div>

              {/* Trigger */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[11px] font-medium text-[#99AACC]">トリガー:</span>
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-[rgba(0,85,255,0.08)] text-[#0055FF]">{seq.triggerLabel}</span>
              </div>

              {/* Steps preview */}
              <div className="flex items-center gap-1 mb-4">
                {seq.steps.map((step, si) => {
                  const StepIcon = STEP_ICONS[step.type] || Clock
                  return (
                    <div key={si} className="flex items-center gap-1">
                      {si > 0 && <div className="w-3 h-px bg-[rgba(0,0,0,0.1)]" />}
                      <div className="w-[24px] h-[24px] rounded-[6px] flex items-center justify-center" style={{
                        background: step.type === 'email' ? 'rgba(94,92,230,0.1)' : step.type === 'condition' ? 'rgba(255,159,10,0.1)' : step.type === 'task' ? 'rgba(52,199,89,0.1)' : 'rgba(0,0,0,0.04)',
                      }}>
                        <StepIcon size={11} style={{
                          color: step.type === 'email' ? '#AA88FF' : step.type === 'condition' ? '#FFDD44' : step.type === 'task' ? '#44FF88' : '#7788AA',
                        }} />
                      </div>
                    </div>
                  )
                })}
                <span className="text-[11px] text-[#99AACC] ml-1">{seq.steps.length}ステップ</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-1"><Users size={11} style={{ color: '#0071E3' }} /><span className="text-[12px] text-[#CCDDF0]">{seq.enrolledCount}名</span></div>
                <div className="flex items-center gap-1"><MailOpen size={11} style={{ color: '#5E5CE6' }} /><span className="text-[12px] text-[#CCDDF0]">開封{seq.openRate}%</span></div>
                <div className="flex items-center gap-1"><MousePointerClick size={11} style={{ color: '#FF9F0A' }} /><span className="text-[12px] text-[#CCDDF0]">クリック{seq.clickRate}%</span></div>
                <div className="flex items-center gap-1"><Reply size={11} style={{ color: '#34C759' }} /><span className="text-[12px] text-[#CCDDF0]">返信{seq.replyRate}%</span></div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16"><p className="text-[14px] text-[#99AACC]">シーケンスが見つかりません</p></div>
      )}

      {/* Create Sequence Modal */}
      <CreateSequenceModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreateSequence} />
    </div>
  )
}

// ─── Create Sequence Modal ──────────────────────────────────────────────────

function CreateSequenceModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void
  onCreate: (name: string, description: string, triggerLabel: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState<TriggerType>('approach')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  const conditionOptions = triggerType === 'approach' ? APPROACH_OPTIONS
    : triggerType === 'phase' ? PHASE_OPTIONS
    : triggerType === 'pipeline' ? PIPELINE_OPTIONS
    : []

  function toggleCondition(c: string) {
    setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  function handleSubmit() {
    if (!name.trim()) return
    const triggerTypeLabel = TRIGGER_OPTIONS.find(t => t.key === triggerType)?.label || ''
    const condLabel = selectedConditions.length > 0 ? selectedConditions.join(' / ') : '全て'
    const triggerLabel = triggerType === 'manual' ? '手動登録' : `${triggerTypeLabel} = ${condLabel}`
    onCreate(name.trim(), description.trim(), triggerLabel)
    setName(''); setDescription(''); setTriggerType('approach'); setSelectedConditions([])
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div className="relative w-[520px] max-h-[85vh] overflow-y-auto rounded-[16px] p-6"
            style={{ background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)', boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold text-[#EEEEFF]">新規シーケンス作成</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.06)]"><X size={16} style={{ color: '#CCDDF0' }} /></button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em]">シーケンス名 *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="例: 未着手 → 初回接触"
                  className="mt-1.5 w-full h-[38px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
                  style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,85,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none' }} />
              </div>

              {/* Description */}
              <div>
                <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em]">説明</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="このシーケンスの目的を入力"
                  className="mt-1.5 w-full h-[38px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
                  style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(0,85,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none' }} />
              </div>

              {/* Trigger type */}
              <div>
                <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em] mb-2 block">トリガー条件</label>
                <div className="space-y-2">
                  {TRIGGER_OPTIONS.map(opt => (
                    <button key={opt.key} onClick={() => { setTriggerType(opt.key); setSelectedConditions([]) }}
                      className="w-full flex items-start gap-3 p-3 rounded-[10px] text-left transition-all"
                      style={{
                        background: triggerType === opt.key ? 'rgba(0,85,255,0.06)' : 'rgba(0,0,0,0.02)',
                        border: triggerType === opt.key ? '1px solid rgba(0,85,255,0.25)' : '1px solid #2244AA',
                      }}>
                      <div className="w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                        style={{ borderColor: triggerType === opt.key ? '#2244AA' : '#2244AA' }}>
                        {triggerType === opt.key && <div className="w-[8px] h-[8px] rounded-full bg-[#0071E3]" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: triggerType === opt.key ? '#88BBFF' : '#EEEEFF' }}>{opt.label}</p>
                        <p className="text-[11px] text-[#CCDDF0] mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition values */}
              {triggerType !== 'manual' && conditionOptions.length > 0 && (
                <div>
                  <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em] mb-2 block">
                    対象ステータス（複数選択可）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {conditionOptions.map(c => {
                      const selected = selectedConditions.includes(c)
                      return (
                        <button key={c} onClick={() => toggleCondition(c)}
                          className="h-[30px] px-3 text-[12px] font-medium rounded-full transition-all"
                          style={{
                            background: selected ? '#0071E3' : 'rgba(0,0,0,0.04)',
                            color: selected ? '#FFF' : '#88BBFF',
                            boxShadow: selected ? '0 1px 4px rgba(0,113,227,0.3)' : 'none',
                          }}>
                          {c}
                        </button>
                      )
                    })}
                  </div>
                  {selectedConditions.length === 0 && (
                    <p className="text-[11px] text-[#99AACC] mt-1.5">選択なしの場合、すべての変更で発動します</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 mt-6 pt-4" style={{ borderTop: '1px solid #2244AA' }}>
              <button onClick={onClose} className="h-[34px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)]">
                キャンセル
              </button>
              <button onClick={handleSubmit} disabled={!name.trim()}
                className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px] transition-all"
                style={{
                  background: name.trim() ? 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)' : 'rgba(34,68,170,0.3)',
                  boxShadow: name.trim() ? '0 2px 8px rgba(255,59,48,0.35)' : 'none',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}>
                作成してビルダーへ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
