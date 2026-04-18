'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Phone, Mail, Briefcase, ChevronRight, User, Building2, Pencil, X, Check, RotateCcw, Calendar, CalendarClock, CheckSquare } from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const REPS = [
  { id: 'u1', name: '田中太郎', color: '#0071E3' },
  { id: 'u2', name: '鈴木花子', color: '#34C759' },
  { id: 'u3', name: '佐藤次郎', color: '#FF9F0A' },
]

type TaskCategory = 'contact' | 'deal'

interface Task {
  id: string
  type: string
  company: string
  person: string
  rank: string
  urgent: boolean
  owner: string
  category: TaskCategory
  linkTo: string
  memo: string
  dueAt: string
  remindAt: string
  completed: boolean
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', type: 'call',  company: '株式会社テクノリード',    person: '田中 誠',  rank: 'A', urgent: true,  owner: 'u1', category: 'contact', linkTo: '/contacts/1', memo: '', dueAt: '2026-03-28', remindAt: '2026-03-28T09:00', completed: false },
  { id: 't2', type: 'call',  company: '合同会社ビジョン',        person: '加藤 雄介', rank: 'C', urgent: false, owner: 'u1', category: 'contact', linkTo: '/contacts/7', memo: '', dueAt: '2026-03-28', remindAt: '', completed: false },
  { id: 't3', type: 'call',  company: '合同会社フューチャー',    person: '鈴木 様',  rank: 'A', urgent: true,  owner: 'u2', category: 'contact', linkTo: '/contacts/2', memo: '', dueAt: '2026-03-28', remindAt: '2026-03-28T10:00', completed: false },
  { id: 't4', type: 'call',  company: '有限会社サクセス',        person: '小林 健太', rank: 'B', urgent: false, owner: 'u2', category: 'contact', linkTo: '/contacts/5', memo: '', dueAt: '2026-03-29', remindAt: '', completed: false },
  { id: 't5', type: 'email', company: '株式会社ネクスト',        person: '鈴木 美香', rank: 'C', urgent: false, owner: 'u3', category: 'contact', linkTo: '/contacts/6', memo: '', dueAt: '2026-03-28', remindAt: '', completed: false },
  { id: 't6', type: 'email', company: '株式会社イノベーション',  person: '',         rank: 'B', urgent: false, owner: 'u1', category: 'deal', linkTo: '/deals/d5', memo: '', dueAt: '2026-03-28', remindAt: '2026-03-28T14:00', completed: false },
  { id: 't7', type: 'other', company: '株式会社デジタルフォース', person: '',         rank: 'A', urgent: true,  owner: 'u2', category: 'deal', linkTo: '/deals/d8', memo: '提案書作成', dueAt: '2026-03-28', remindAt: '', completed: false },
  { id: 't8', type: 'other', company: '株式会社グロース',        person: '',         rank: 'A', urgent: true,  owner: 'u3', category: 'deal', linkTo: '/deals/d4', memo: '見積書送付', dueAt: '2026-03-28', remindAt: '2026-03-28T11:00', completed: false },
]

type RankBadgeStyle = { gradient: string; glow: string; color: string }
const RANK_BADGE_STYLES: Record<string, RankBadgeStyle> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
}
const DEFAULT_RANK_BADGE: RankBadgeStyle = { gradient: 'rgba(34,68,170,0.2)', glow: 'none', color: '#CCDDF0' }

// コンタクトのNext Actionと完全連動した5種類
const TYPE_OPTIONS: { key: string; label: string }[] = [
  { key: 'email',    label: 'メール' },
  { key: 'call',     label: 'コール' },
  { key: 'meeting',  label: '商談' },
  { key: 'wait',     label: '連絡待ち' },
  { key: 'followup', label: 'フォロー' },
]

interface TaskTypeGameStyle {
  gradient: string
  glow: string
  color: string
  borderColor: string
  textShadow: string
}

const TASK_TYPE_GAME_STYLES: Record<string, TaskTypeGameStyle> = {
  email: {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  call: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  meeting: {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  wait: {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  followup: {
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(110,15,60,0.6)',
  },
  other: {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
  },
}

const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

function formatDueDate(d: string): string {
  if (!d) return ''
  const [, m, day] = d.split('-')
  return `${parseInt(m ?? '0', 10)}/${parseInt(day ?? '0', 10)}`
}

// ─── タスク種別ごとの派手なアイコンスタイル ──────────────────────────────────

interface TaskTypeStyle {
  Icon: React.ElementType
  gradient: string
  glow: string
}

const TASK_TYPE_STYLES: Record<string, TaskTypeStyle> = {
  call: {
    Icon: Phone,
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 16px rgba(50,173,230,0.85), 0 0 6px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  email: {
    Icon: Mail,
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 16px rgba(139,92,246,0.85), 0 0 6px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  meeting: {
    Icon: Briefcase,
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 16px rgba(52,199,89,0.85), 0 0 6px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  wait: {
    Icon: Briefcase,
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 16px rgba(255,159,10,0.85), 0 0 6px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  followup: {
    Icon: Briefcase,
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 16px rgba(236,72,153,0.85), 0 0 6px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  other: {
    Icon: Briefcase,
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
  },
}

const COMPLETED_TASK_STYLE: TaskTypeStyle = {
  Icon: Check,
  gradient: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)',
  glow: '0 0 8px rgba(52,199,89,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ task, isLast, onComplete, onRestore, onEdit }: {
  task: Task; isLast: boolean
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onEdit: (task: Task) => void
}) {
  const router = useRouter()
  const rank = RANK_BADGE_STYLES[task.rank] ?? DEFAULT_RANK_BADGE
  const taskStyle = task.completed ? COMPLETED_TASK_STYLE : (TASK_TYPE_STYLES[task.type] ?? TASK_TYPE_STYLES.other!)
  const TypeIcon = taskStyle.Icon

  return (
    <div
      onClick={() => !task.completed && router.push(task.linkTo)}
      className={`flex items-center gap-3 px-5 py-3 transition-colors ${task.completed ? '' : 'hover:bg-[rgba(136,187,255,0.04)] cursor-pointer'}`}
      style={{ borderBottom: isLast ? 'none' : '1px solid rgba(34,68,170,0.2)' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: taskStyle.gradient,
          boxShadow: taskStyle.glow,
          border: '1.5px solid rgba(255,255,255,0.4)',
          opacity: task.completed ? 0.55 : 1,
        }}
      >
        <TypeIcon
          size={15}
          style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
          strokeWidth={2.5}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {task.completed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[rgba(52,199,89,0.1)] px-1.5 py-0.5 rounded-[4px] shrink-0">
              <Check size={9} strokeWidth={3} />完了
            </span>
          )}
          <span className="text-[13px] font-medium truncate"
            style={{ color: task.completed ? '#4466AA' : '#EEEEFF', textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.person || task.company}
          </span>
          {!task.completed && (
            <span className="inline-flex items-center justify-center rounded-[4px] text-[10px] font-bold shrink-0"
              style={{ width: 18, height: 18, background: rank.gradient, boxShadow: rank.glow, color: rank.color }}>
              {task.rank}
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5" style={{ color: task.completed ? '#4466AA' : '#7788AA' }}>
          {task.company}
          {task.memo && <span className="ml-1.5" style={{ color: '#AABBDD' }}>· {task.memo}</span>}
        </p>
      </div>

      {/* 期日バッジ（右寄り） */}
      {!task.completed && task.dueAt && (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#88BBFF] bg-[rgba(136,187,255,0.12)] px-2.5 py-1 rounded-[6px] shrink-0 tabular-nums"
          style={{ border: '1px solid rgba(136,187,255,0.3)', boxShadow: '0 0 8px rgba(136,187,255,0.15)' }}>
          <Calendar size={10} strokeWidth={2.5} />
          {formatDueDate(task.dueAt)}
        </span>
      )}

      {task.completed ? (
        <button
          onClick={e => { e.stopPropagation(); onRestore(task.id) }}
          className="shrink-0 h-[26px] px-2.5 flex items-center gap-1 text-[11px] font-medium text-[#CCDDF0] rounded-[6px] hover:bg-[rgba(136,187,255,0.06)] transition-colors"
        >
          <RotateCcw size={11} />
          戻す
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(task) }}
            className="h-[26px] px-2.5 flex items-center gap-1 text-[11px] font-medium text-[#CCDDF0] rounded-[6px] hover:bg-[rgba(136,187,255,0.06)] transition-colors"
          >
            <Pencil size={11} />
            編集
          </button>
          <button
            onClick={e => { e.stopPropagation(); onComplete(task.id) }}
            className="h-[26px] px-2.5 text-[11px] font-semibold text-[#34C759] rounded-[6px] hover:bg-[rgba(52,199,89,0.1)] transition-colors"
            style={{ border: '1px solid rgba(52,199,89,0.3)' }}
          >
            完了
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Edit Task Modal ─────────────────────────────────────────────────────────
// コンタクトのNext Actionと完全に連動した編集UI

function EditTaskModal({ task, onClose, onSave }: {
  task: Task; onClose: () => void; onSave: (updated: Task) => void
}) {
  const [type, setType] = useState(task.type)
  const [memo, setMemo] = useState(task.memo)
  const [dueAt, setDueAt] = useState(task.dueAt)

  // コンタクトに紐づくタスクかどうか
  const isContactLinked = task.category === 'contact'

  function handleSave() {
    onSave({ ...task, type, memo, dueAt })
    onClose()
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] rounded-[14px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
          border: '1px solid #2244AA',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(85,119,221,0.2), inset 0 1px 0 rgba(136,187,255,0.08)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,68,170,0.3)' }}>
          <div className="flex items-center gap-2">
            <CalendarClock size={14} style={{ color: '#88BBFF' }} />
            <h2 className="text-[16px] font-bold text-[#EEEEFF]">
              {isContactLinked ? 'ネクストアクション編集' : 'タスク編集'}
            </h2>
            {isContactLinked && (
              <span
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[9px] font-bold whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(136,187,255,0.18) 0%, rgba(85,119,221,0.12) 100%)',
                  color: '#88BBFF',
                  border: '1px solid rgba(136,187,255,0.35)',
                  boxShadow: '0 0 8px rgba(136,187,255,0.2)',
                }}
                title="このタスクはコンタクトのネクストアクションと連動しています"
              >
                <CheckSquare size={9} />
                コンタクト連動
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.08)] transition-colors">
            <X size={16} className="text-[#CCDDF0]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 紐付け先 */}
          <div
            className="rounded-[8px] px-3 py-2.5 flex items-center gap-2"
            style={{
              background: 'rgba(16,16,40,0.6)',
              border: '1px solid rgba(34,68,170,0.4)',
            }}
          >
            <User size={12} className="text-[#88BBFF] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#88BBFF] uppercase tracking-[0.04em]">紐付け先</p>
              <p className="text-[12px] font-medium text-[#EEEEFF] truncate">
                {task.person ? `${task.person} · ` : ''}{task.company}
              </p>
            </div>
          </div>

          {/* 種別 */}
          <div>
            <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 flex items-center gap-1">
              種別
              <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map(opt => {
                const s = TASK_TYPE_GAME_STYLES[opt.key]!
                const active = type === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setType(opt.key)}
                    className="px-3 h-[32px] rounded-full text-[11px] font-bold transition-all"
                    style={active ? {
                      background: s.gradient,
                      boxShadow: s.glow,
                      color: s.color,
                      border: `1px solid ${s.borderColor}`,
                      textShadow: s.textShadow,
                    } : {
                      background: 'rgba(16,16,40,0.8)',
                      border: '1px solid #2244AA',
                      color: '#7799CC',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 実施予定日 */}
          <div>
            <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                実施予定日
                <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
              </span>
              {dueAt && (
                <button
                  type="button"
                  onClick={() => setDueAt('')}
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#99AACC] hover:text-[#FF8A82] transition-colors normal-case tracking-normal"
                  title="日付をクリア"
                >
                  <X size={10} />
                  クリア
                </button>
              )}
            </label>
            <div
              className="relative rounded-[8px] transition-all"
              style={{
                background: 'rgba(16,16,40,0.8)',
                border: '1px dashed rgba(136,187,255,0.4)',
              }}
            >
              <input
                type="date"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="w-full h-[36px] px-3 pr-9 text-[13px] font-medium text-[#EEEEFF] outline-none bg-transparent cursor-pointer"
                style={{ colorScheme: 'dark' }}
                onFocus={e => {
                  e.currentTarget.parentElement!.style.border = '1px solid #5577DD'
                  e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(85,119,221,0.2)'
                }}
                onBlur={e => {
                  e.currentTarget.parentElement!.style.border = '1px dashed rgba(136,187,255,0.4)'
                  e.currentTarget.parentElement!.style.boxShadow = 'none'
                }}
              />
              <Pencil
                size={11}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#7799CC' }}
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 flex items-center gap-1">
              メモ
              <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
            </label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="次回アクションに関するメモを入力..."
              rows={3}
              className="w-full px-3 py-2 text-[12px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none rounded-[8px] resize-none transition-all"
              style={{
                background: 'rgba(16,16,40,0.8)',
                border: '1px dashed rgba(136,187,255,0.4)',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid #5577DD'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(85,119,221,0.2)'
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px dashed rgba(136,187,255,0.4)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid rgba(34,68,170,0.3)' }}>
          <button
            type="button"
            onClick={onClose}
            className="h-[36px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)] transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-[36px] px-5 text-[13px] font-bold text-white rounded-[8px] transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
              border: '1px solid #3355CC',
              boxShadow: '0 2px 8px rgba(34,68,170,0.5), inset 0 1px 0 rgba(200,220,255,0.2)',
            }}
          >
            保存
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Category Group ──────────────────────────────────────────────────────────

function CategoryGroup({ label, icon: Icon, tasks, onComplete, onRestore, onEdit }: {
  label: string; icon: React.ElementType; tasks: Task[]
  onComplete: (id: string) => void; onRestore: (id: string) => void; onEdit: (task: Task) => void
}) {
  if (tasks.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-1.5 px-5 pt-3 pb-1.5">
        <Icon size={11} style={{ color: '#99AACC' }} />
        <span className="text-[10px] font-semibold text-[#99AACC] uppercase tracking-[0.06em]">{label}</span>
        <span className="text-[10px] text-[#99AACC]">{tasks.length}</span>
      </div>
      {tasks.map((task, i) => (
        <TaskRow key={task.id} task={task} isLast={i === tasks.length - 1} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
      ))}
    </div>
  )
}

// ─── Rep Section ─────────────────────────────────────────────────────────────

function RepSection({ rep, tasks, completedTasks, index, onComplete, onRestore, onEdit }: {
  rep: typeof REPS[0]; tasks: Task[]; completedTasks: Task[]; index: number
  onComplete: (id: string) => void; onRestore: (id: string) => void; onEdit: (task: Task) => void
}) {
  const [open, setOpen] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)
  const contactTasks = tasks.filter(t => t.category === 'contact')
  const dealTasks = tasks.filter(t => t.category === 'deal')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0c1028] rounded-[8px] overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[rgba(136,187,255,0.04)] transition-colors"
        style={{ borderBottom: open ? '1px solid #2244AA' : 'none' }}>
        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: rep.color, boxShadow: `0 0 12px ${rep.color}aa, 0 0 4px ${rep.color}, inset 0 1px 0 rgba(255,255,255,0.4)`, border: "1px solid rgba(255,255,255,0.3)" }}>
          {rep.name[0]}
        </div>
        <span className="text-[14px] font-semibold text-[#EEEEFF]">{rep.name}</span>
        <span className="text-[12px] tabular-nums font-medium" style={{ color: rep.color }}>{tasks.length + completedTasks.length}件</span>
        {completedTasks.length > 0 && <span className="text-[11px] text-[#34C759]">({completedTasks.length}完了)</span>}
        <motion.div className="ml-auto" animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={14} style={{ color: '#99AACC' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <CategoryGroup label="コンタクト" icon={User} tasks={contactTasks} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
            {contactTasks.length > 0 && dealTasks.length > 0 && <div className="mx-5 h-px" style={{ background: 'rgba(136,187,255,0.06)' }} />}
            <CategoryGroup label="取引" icon={Building2} tasks={dealTasks} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />

            {/* Completed within this rep */}
            {completedTasks.length > 0 && (
              <>
                <div className="mx-5 h-px mt-1" style={{ background: 'rgba(136,187,255,0.06)' }} />
                <button onClick={e => { e.stopPropagation(); setCompletedOpen(!completedOpen) }}
                  className="w-full flex items-center gap-2 px-5 py-3 hover:bg-[rgba(136,187,255,0.04)] transition-colors">
                  <Check size={12} style={{ color: '#34C759' }} />
                  <span className="text-[12px] font-medium text-[#CCDDF0]">完了一覧</span>
                  <span className="text-[11px] tabular-nums text-[#34C759]">{completedTasks.length}</span>
                  <motion.div className="ml-auto" animate={{ rotate: completedOpen ? 90 : 0 }} transition={{ duration: 0.12 }}>
                    <ChevronRight size={11} style={{ color: '#99AACC' }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {completedOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      {completedTasks.map((task, i) => (
                        <TaskRow key={task.id} task={task} isLast={i === completedTasks.length - 1}
                          onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  function handleComplete(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))
  }
  function handleRestore(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: false } : t))
  }
  function handleSave(updated: Task) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  return (
    <div className="space-y-6">

      {/* ── 今日のタスク ── */}
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">今日のタスク</h2>
            {activeTasks.length > 0 && (
              <span className="text-[12px] font-semibold text-white bg-[#3355CC] px-2 py-0.5 rounded-full">{activeTasks.length}件</span>
            )}
            {completedTasks.length > 0 && (
              <span className="text-[12px] font-semibold text-white bg-[#34C759] px-2 py-0.5 rounded-full">完了 {completedTasks.length}件</span>
            )}
          </div>
        </motion.div>

        {REPS.map((rep, i) => {
          const repActive = activeTasks.filter(t => t.owner === rep.id)
          const repCompleted = completedTasks.filter(t => t.owner === rep.id)
          if (repActive.length === 0 && repCompleted.length === 0) return null
          return <RepSection key={rep.id} rep={rep} tasks={repActive} completedTasks={repCompleted} index={i}
            onComplete={handleComplete} onRestore={handleRestore} onEdit={setEditingTask} />
        })}

        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0c1028] rounded-[8px]" style={{ boxShadow: CARD_SHADOW }}>
            <p className="text-[14px] text-[#99AACC]">本日のタスクはありません</p>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  )
}
