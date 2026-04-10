'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Phone,
  Mail,
  Briefcase,
  ChevronRight,
  Check,
  ChevronDown,
  X,
  Pencil,
  RotateCcw,
  User,
  Building2,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type TaskType = 'call' | 'email' | 'other'
type TaskCategory = 'contact' | 'deal'

interface Task {
  id: string
  type: TaskType
  company: string
  person: string
  rank: string
  owner: string
  ownerName: string
  category: TaskCategory
  memo: string
  dueAt: string
  completed: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const REPS = [
  { id: 'u1', name: '田中太郎', color: '#0071E3' },
  { id: 'u2', name: '鈴木花子', color: '#34C759' },
  { id: 'u3', name: '佐藤次郎', color: '#FF9F0A' },
]

const INITIAL_TASKS: Task[] = [
  { id: 't1', type: 'call',  company: '株式会社テクノリード',    person: '田中 誠',    rank: 'A', owner: 'u1', ownerName: '田中太郎', category: 'contact', memo: '',             dueAt: '2026-03-23', completed: false },
  { id: 't2', type: 'call',  company: '合同会社ビジョン',        person: '加藤 雄介',  rank: 'C', owner: 'u1', ownerName: '田中太郎', category: 'contact', memo: '',             dueAt: '2026-03-23', completed: false },
  { id: 't3', type: 'email', company: '株式会社イノベーション',  person: '佐々木 拓也', rank: 'A', owner: 'u1', ownerName: '田中太郎', category: 'contact', memo: '先日の商談を受けて', dueAt: '2026-03-23', completed: false },
  { id: 't4', type: 'call',  company: '合同会社フューチャー',    person: '山本 佳子',  rank: 'A', owner: 'u2', ownerName: '鈴木花子', category: 'contact', memo: '',             dueAt: '2026-03-23', completed: false },
  { id: 't5', type: 'other', company: '有限会社サクセス',        person: '小林 健太',  rank: 'B', owner: 'u2', ownerName: '鈴木花子', category: 'contact', memo: '商談準備',     dueAt: '2026-03-24', completed: false },
  { id: 't6', type: 'call',  company: '株式会社ネクスト',        person: '鈴木 美香',  rank: 'C', owner: 'u1', ownerName: '田中太郎', category: 'contact', memo: '',             dueAt: '2026-03-20', completed: false },
  { id: 't7', type: 'other', company: '株式会社テクノリード',    person: '',           rank: 'A', owner: 'u1', ownerName: '田中太郎', category: 'deal',    memo: '資料送付',     dueAt: '2026-03-25', completed: false },
  { id: 't8', type: 'email', company: '株式会社グロース',        person: '中村 理恵',  rank: 'B', owner: 'u3', ownerName: '佐藤次郎', category: 'contact', memo: '',             dueAt: '2026-03-21', completed: true  },
  { id: 't9', type: 'other', company: '株式会社グロース',        person: '',           rank: 'A', owner: 'u3', ownerName: '佐藤次郎', category: 'deal',    memo: '提案書作成',   dueAt: '2026-03-22', completed: false },
  { id: 't10', type: 'other', company: '株式会社デルタ',         person: '',           rank: 'B', owner: 'u3', ownerName: '佐藤次郎', category: 'deal',    memo: '見積書送付',   dueAt: '2026-03-23', completed: false },
]

// ─── Style ─────────────────────────────────────────────────────────────────────

type RankBadgeStyle = { gradient: string; glow: string; color: string }
const RANK_BADGE_STYLES: Record<string, RankBadgeStyle> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',   color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',  color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)', color: '#fff' },
}
const DEFAULT_RANK_BADGE: RankBadgeStyle = { gradient: 'rgba(0,0,0,0.07)', glow: 'none', color: '#6E6E73' }

const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

const TYPE_OPTIONS = [
  { key: 'call' as TaskType, label: 'コール' },
  { key: 'email' as TaskType, label: 'メール' },
  { key: 'other' as TaskType, label: 'その他' },
]

const OWNERS_FILTER = ['全員', '田中太郎', '鈴木花子', '佐藤次郎']

// ─── Task Row ──────────────────────────────────────────────────────────────────

function TaskRow({ task, isLast, onComplete, onRestore, onEdit }: {
  task: Task; isLast: boolean
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onEdit: (task: Task) => void
}) {
  const rank = RANK_BADGE_STYLES[task.rank] ?? DEFAULT_RANK_BADGE
  const TypeIcon = task.type === 'call' ? Phone : task.type === 'email' ? Mail : Briefcase
  const typeColor = task.type === 'call' ? '#0071E3' : task.type === 'email' ? '#5E5CE6' : '#8E8E93'

  return (
    <div
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
        <p className="text-[12px] mt-0.5" style={{ color: task.completed ? '#C7C7CC' : '#8E8E93' }}>
          {task.company}
          {task.memo && <span> · {task.memo}</span>}
        </p>
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

// ─── Category Group ────────────────────────────────────────────────────────────

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

// ─── Create/Edit Modal ─────────────────────────────────────────────────────────

function TaskModal({ task, onClose, onSave }: {
  task: Task | null; onClose: () => void; onSave: (task: Task) => void
}) {
  const isEdit = !!task
  const [form, setForm] = useState({
    type: (task?.type ?? 'call') as TaskType,
    company: task?.company ?? '',
    person: task?.person ?? '',
    owner: task?.owner ?? 'u1',
    rank: task?.rank ?? 'B',
    category: (task?.category ?? 'contact') as TaskCategory,
    dueAt: task?.dueAt ?? '2026-03-23',
    memo: task?.memo ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company.trim()) return
    const rep = REPS.find(r => r.id === form.owner) ?? REPS[0]
    onSave({
      id: task?.id ?? `t-${Date.now()}`,
      type: form.type,
      company: form.company.trim(),
      person: form.person.trim(),
      rank: form.rank,
      owner: form.owner,
      ownerName: rep.name,
      category: form.category,
      memo: form.memo.trim(),
      dueAt: form.dueAt,
      completed: task?.completed ?? false,
    })
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-[440px] rounded-[16px] p-6 bg-white"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">{isEdit ? 'タスク編集' : 'タスク作成'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(0,0,0,0.05)]"><X size={16} style={{ color: '#8E8E93' }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">タスク種別</label>
            <div className="flex gap-2 mt-1.5">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.key} type="button" onClick={() => setForm(f => ({ ...f, type: opt.key }))}
                  className="h-[32px] px-3 text-[13px] font-medium rounded-[8px] transition-all"
                  style={{ background: form.type === opt.key ? '#0071E3' : 'rgba(0,0,0,0.04)', color: form.type === opt.key ? '#FFF' : '#6E6E73' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">企業名 <span className="text-[#EF4444]">*</span></label>
            <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="例：株式会社テクノリード" required
              className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>

          {/* Person */}
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">担当者名</label>
            <input type="text" value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))}
              placeholder="例：田中 誠"
              className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>

          {/* Owner & Due */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">割り当て先</label>
              <div className="relative mt-1.5">
                <select value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  className="w-full h-[36px] px-3 pr-8 text-[14px] rounded-[8px] text-[#1D1D1F] appearance-none cursor-pointer outline-none" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  {REPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">期日</label>
              <input type="date" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
                className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }} />
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">メモ</label>
            <textarea value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              placeholder="タスクに関するメモを入力..."
              className="mt-1.5 w-full h-[72px] px-3 py-2 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none resize-none"
              style={{ background: 'rgba(0,0,0,0.04)' }} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)]">キャンセル</button>
            <button type="submit" className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
              style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}>
              {isEdit ? '保存' : '作成'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Rep Section ───────────────────────────────────────────────────────────────

function RepSection({ rep, tasks, completedTasks, index, onComplete, onRestore, onEdit }: {
  rep: typeof REPS[0]; tasks: Task[]; completedTasks: Task[]; index: number
  onComplete: (id: string) => void; onRestore: (id: string) => void; onEdit: (task: Task) => void
}) {
  const [open, setOpen] = useState(true)
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

            {tasks.length === 0 && completedTasks.length === 0 && (
              <div className="px-5 py-6 text-center">
                <p className="text-[13px] text-[#AEAEB2]">タスクがありません</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('全員')
  const [modalTask, setModalTask] = useState<Task | null | 'new'>(null)

  const filtered = useMemo(() => {
    let list = tasks
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.company.toLowerCase().includes(q) ||
        t.person.toLowerCase().includes(q) ||
        t.memo.toLowerCase().includes(q)
      )
    }
    if (ownerFilter !== '全員') {
      const rep = REPS.find(r => r.name === ownerFilter)
      if (rep) list = list.filter(t => t.owner === rep.id)
    }
    return list
  }, [tasks, search, ownerFilter])

  function handleComplete(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))
  }
  function handleRestore(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: false } : t))
  }
  function handleSave(task: Task) {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id)
      if (exists) return prev.map(t => t.id === task.id ? task : t)
      return [task, ...prev]
    })
    setModalTask(null)
  }

  // 表示する担当者リスト
  const visibleReps = ownerFilter === '全員'
    ? REPS
    : REPS.filter(r => r.name === ownerFilter)

  return (
    <div className="space-y-5">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="タスク名・会社名で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
          />
        </div>
        <button
          onClick={() => setModalTask('new')}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-[8px] shrink-0 transition-all hover:brightness-105 active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          タスク作成
        </button>
      </div>

      {/* ── Owner Filter ── */}
      <div className="flex items-center gap-1">
        {OWNERS_FILTER.map(o => {
          const rep = REPS.find(r => r.name === o)
          const color = rep?.color
          return (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className="px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{
                background: ownerFilter === o ? (color ? color + '15' : 'rgba(0,113,227,0.1)') : 'transparent',
                color: ownerFilter === o ? (color ?? '#0071E3') : '#6E6E73',
              }}
            >
              {o}
            </button>
          )
        })}
      </div>

      {/* ── Rep Sections ── */}
      <div className="space-y-4">
        {visibleReps.map((rep, i) => {
          const repTasks = filtered.filter(t => t.owner === rep.id && !t.completed)
          const completedTasks = filtered.filter(t => t.owner === rep.id && t.completed)
          return (
            <RepSection
              key={rep.id}
              rep={rep}
              tasks={repTasks}
              completedTasks={completedTasks}
              index={i}
              onComplete={handleComplete}
              onRestore={handleRestore}
              onEdit={task => setModalTask(task)}
            />
          )
        })}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalTask !== null && (
          <TaskModal
            task={modalTask === 'new' ? null : modalTask}
            onClose={() => setModalTask(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
