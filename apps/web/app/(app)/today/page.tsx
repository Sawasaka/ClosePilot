'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Phone, Mail, Briefcase, ChevronRight, ChevronDown, User, Building2, Pencil, X, Check, RotateCcw } from 'lucide-react'

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
const DEFAULT_RANK_BADGE: RankBadgeStyle = { gradient: 'rgba(0,0,0,0.07)', glow: 'none', color: '#6E6E73' }
const TYPE_OPTIONS = [
  { key: 'call', label: 'コール' },
  { key: 'email', label: 'メール' },
  { key: 'other', label: 'その他' },
]

const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ task, isLast, onComplete, onRestore, onEdit }: {
  task: Task; isLast: boolean
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onEdit: (task: Task) => void
}) {
  const router = useRouter()
  const rank = RANK_BADGE_STYLES[task.rank] ?? DEFAULT_RANK_BADGE
  const TypeIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : Briefcase
  const typeColor = task.type === 'call' ? '#0071E3' : task.type === 'email' ? '#5E5CE6' : '#8E8E93'

  return (
    <div
      onClick={() => !task.completed && router.push(task.linkTo)}
      className={`flex items-center gap-3 px-5 py-3 transition-colors ${task.completed ? '' : 'hover:bg-[rgba(0,0,0,0.02)] cursor-pointer'}`}
      style={{ borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.04)' }}
    >
      <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0"
        style={{ background: task.completed ? 'rgba(52,199,89,0.10)' : `${typeColor}14` }}>
        <TypeIcon size={13} style={{ color: task.completed ? '#34C759' : typeColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {task.completed && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[rgba(52,199,89,0.1)] px-1.5 py-0.5 rounded-[4px] shrink-0">
              <Check size={9} strokeWidth={3} />完了
            </span>
          )}
          <span className="text-[13px] font-medium truncate"
            style={{ color: task.completed ? '#AEAEB2' : '#1D1D1F', textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.person || task.company}
          </span>
          {!task.completed && (
            <span className="inline-flex items-center justify-center rounded-[4px] text-[10px] font-bold shrink-0"
              style={{ width: 18, height: 18, background: rank.gradient, boxShadow: rank.glow, color: rank.color }}>
              {task.rank}
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5" style={{ color: task.completed ? '#C7C7CC' : '#8E8E93' }}>{task.company}</p>
      </div>

      {task.completed ? (
        <button
          onClick={e => { e.stopPropagation(); onRestore(task.id) }}
          className="shrink-0 h-[26px] px-2.5 flex items-center gap-1 text-[11px] font-medium text-[#6E6E73] rounded-[6px] hover:bg-[rgba(0,0,0,0.06)] transition-colors"
        >
          <RotateCcw size={11} />
          戻す
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onEdit(task) }}
            className="h-[26px] px-2.5 flex items-center gap-1 text-[11px] font-medium text-[#6E6E73] rounded-[6px] hover:bg-[rgba(0,0,0,0.06)] transition-colors"
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

function EditTaskModal({ task, onClose, onSave }: {
  task: Task; onClose: () => void; onSave: (updated: Task) => void
}) {
  const [type, setType] = useState(task.type)
  const [memo, setMemo] = useState(task.memo)
  const [dueAt, setDueAt] = useState(task.dueAt)
  const [remindAt, setRemindAt] = useState(task.remindAt)

  function handleSave() {
    onSave({ ...task, type, memo, dueAt, remindAt })
    onClose()
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-[440px] rounded-[16px] p-6"
        style={{ background: '#FFF', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">タスク編集</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(0,0,0,0.05)]"><X size={16} style={{ color: '#8E8E93' }} /></button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-[10px] mb-4" style={{ background: 'rgba(0,0,0,0.03)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#1D1D1F]">{task.person || task.company}</p>
            <p className="text-[12px] text-[#8E8E93]">{task.company}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">タスク種別</label>
            <div className="flex gap-2 mt-1.5">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setType(opt.key)}
                  className="h-[32px] px-3 text-[13px] font-medium rounded-[8px] transition-all"
                  style={{ background: type === opt.key ? '#0071E3' : 'rgba(0,0,0,0.04)', color: type === opt.key ? '#FFF' : '#6E6E73' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">期限</label>
            <input type="date" value={dueAt} onChange={e => setDueAt(e.target.value)}
              className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">リマインド日時</label>
            <input type="datetime-local" value={remindAt} onChange={e => setRemindAt(e.target.value)}
              className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">メモ</label>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="タスクに関するメモを入力..."
              className="mt-1.5 w-full h-[72px] px-3 py-2 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none resize-none"
              style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)]">キャンセル</button>
          <button onClick={handleSave} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
            style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}>
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
        <Icon size={11} style={{ color: '#AEAEB2' }} />
        <span className="text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-[0.06em]">{label}</span>
        <span className="text-[10px] text-[#AEAEB2]">{tasks.length}</span>
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
      className="bg-white rounded-[14px] overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[rgba(0,0,0,0.015)] transition-colors"
        style={{ borderBottom: open ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: rep.color }}>
          {rep.name[0]}
        </div>
        <span className="text-[14px] font-semibold text-[#1D1D1F]">{rep.name}</span>
        <span className="text-[12px] tabular-nums font-medium" style={{ color: rep.color }}>{tasks.length + completedTasks.length}件</span>
        {completedTasks.length > 0 && <span className="text-[11px] text-[#34C759]">({completedTasks.length}完了)</span>}
        <motion.div className="ml-auto" animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight size={14} style={{ color: '#AEAEB2' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <CategoryGroup label="コンタクト" icon={User} tasks={contactTasks} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
            {contactTasks.length > 0 && dealTasks.length > 0 && <div className="mx-5 h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />}
            <CategoryGroup label="取引" icon={Building2} tasks={dealTasks} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />

            {/* Completed within this rep */}
            {completedTasks.length > 0 && (
              <>
                <div className="mx-5 h-px mt-1" style={{ background: 'rgba(0,0,0,0.05)' }} />
                <button onClick={e => { e.stopPropagation(); setCompletedOpen(!completedOpen) }}
                  className="w-full flex items-center gap-2 px-5 py-3 hover:bg-[rgba(0,0,0,0.015)] transition-colors">
                  <Check size={12} style={{ color: '#34C759' }} />
                  <span className="text-[12px] font-medium text-[#8E8E93]">完了一覧</span>
                  <span className="text-[11px] tabular-nums text-[#34C759]">{completedTasks.length}</span>
                  <motion.div className="ml-auto" animate={{ rotate: completedOpen ? 90 : 0 }} transition={{ duration: 0.12 }}>
                    <ChevronRight size={11} style={{ color: '#C7C7CC' }} />
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
          <h2 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">今日のタスク</h2>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            本日のタスク <span className="font-semibold text-[#1D1D1F]">{activeTasks.length}件</span>
            {completedTasks.length > 0 && <span className="ml-2 text-[#34C759]">（完了 {completedTasks.length}件）</span>}
          </p>
        </motion.div>

        {REPS.map((rep, i) => {
          const repActive = activeTasks.filter(t => t.owner === rep.id)
          const repCompleted = completedTasks.filter(t => t.owner === rep.id)
          if (repActive.length === 0 && repCompleted.length === 0) return null
          return <RepSection key={rep.id} rep={rep} tasks={repActive} completedTasks={repCompleted} index={i}
            onComplete={handleComplete} onRestore={handleRestore} onEdit={setEditingTask} />
        })}

        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-white rounded-[14px]" style={{ boxShadow: CARD_SHADOW }}>
            <p className="text-[14px] text-[#AEAEB2]">本日のタスクはありません</p>
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
