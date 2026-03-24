'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Phone,
  Mail,
  FileText,
  CheckSquare,
  Calendar,
  BookOpen,
  AlertCircle,
  Check,
  ChevronDown,
  X,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type TaskType = 'CALL' | 'EMAIL' | 'DOCUMENT' | 'MEETING_PREP' | 'PROPOSAL' | 'OTHER'
type TaskSource = 'SEQUENCE_AUTO' | 'MODAL_MANUAL' | 'MEETING_NOTES' | 'MANUAL'

interface Task {
  id: string
  type: TaskType
  title: string
  company: string
  contact: string | null
  owner: string
  dueAt: string
  completedAt: string | null
  source: TaskSource
  memo: string | null
  overdue: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_TASKS: Task[] = [
  { id: 't1', type: 'CALL',         title: '株式会社テクノリード コール',         company: '株式会社テクノリード',    contact: '田中 誠',    owner: '田中太郎', dueAt: '2026-03-23', completedAt: null,           source: 'SEQUENCE_AUTO', memo: null,                 overdue: false },
  { id: 't2', type: 'CALL',         title: '合同会社フューチャー コール',         company: '合同会社フューチャー',    contact: '山本 佳子',  owner: '鈴木花子', dueAt: '2026-03-23', completedAt: null,           source: 'SEQUENCE_AUTO', memo: null,                 overdue: false },
  { id: 't3', type: 'EMAIL',        title: '株式会社イノベーション 提案書送付',   company: '株式会社イノベーション',  contact: '佐々木 拓也', owner: '田中太郎', dueAt: '2026-03-23', completedAt: null,           source: 'MODAL_MANUAL',  memo: '先日の商談を受けて',   overdue: false },
  { id: 't4', type: 'PROPOSAL',     title: '株式会社グロース 提案書作成',         company: '株式会社グロース',        contact: null,         owner: '佐藤次郎', dueAt: '2026-03-22', completedAt: null,           source: 'MEETING_NOTES', memo: null,                 overdue: true  },
  { id: 't5', type: 'MEETING_PREP', title: '有限会社サクセス 商談準備',           company: '有限会社サクセス',        contact: '小林 健太',  owner: '鈴木花子', dueAt: '2026-03-24', completedAt: null,           source: 'MANUAL',        memo: '明日14:00の商談前に',  overdue: false },
  { id: 't6', type: 'CALL',         title: '株式会社ネクスト フォローコール',     company: '株式会社ネクスト',        contact: '鈴木 美香',  owner: '田中太郎', dueAt: '2026-03-20', completedAt: null,           source: 'MODAL_MANUAL',  memo: null,                 overdue: true  },
  { id: 't7', type: 'DOCUMENT',     title: '株式会社テクノリード 資料送付',       company: '株式会社テクノリード',    contact: '田中 誠',    owner: '田中太郎', dueAt: '2026-03-25', completedAt: null,           source: 'MANUAL',        memo: null,                 overdue: false },
  { id: 't8', type: 'EMAIL',        title: '株式会社グロース フォローメール',     company: '株式会社グロース',        contact: '中村 理恵',  owner: '佐藤次郎', dueAt: '2026-03-21', completedAt: '2026-03-21', source: 'SEQUENCE_AUTO', memo: null,                 overdue: false },
]

// ─── Config ────────────────────────────────────────────────────────────────────

const TASK_CONFIG: Record<TaskType, { label: string; icon: React.ElementType; color: string; bg: string; iconColor: string }> = {
  CALL:         { label: 'コール',    icon: Phone,       color: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', iconColor: '#3B82F6' },
  EMAIL:        { label: 'メール',    icon: Mail,        color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]', iconColor: '#8B5CF6' },
  DOCUMENT:     { label: '資料送付',  icon: FileText,    color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', iconColor: '#F59E0B' },
  MEETING_PREP: { label: '商談準備',  icon: BookOpen,    color: 'text-[#059669]', bg: 'bg-[#ECFDF5]', iconColor: '#10B981' },
  PROPOSAL:     { label: '提案書',    icon: CheckSquare, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', iconColor: '#F97316' },
  OTHER:        { label: 'その他',    icon: Calendar,    color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]', iconColor: '#9CA3AF' },
}

const SOURCE_LABEL: Record<TaskSource, string> = {
  SEQUENCE_AUTO: '自動',
  MODAL_MANUAL:  'コール後',
  MEETING_NOTES: '議事録',
  MANUAL:        '手動',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDueDate(dueAt: string, overdue: boolean): { text: string; color: string } {
  const d = new Date(dueAt)
  const today = new Date('2026-03-23')
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)

  if (overdue)  return { text: `${Math.abs(diff)}日超過`,  color: 'text-[#EF4444]' }
  if (diff === 0) return { text: '今日',   color: 'text-[#4F46E5]' }
  if (diff === 1) return { text: '明日',   color: 'text-[#D97706]' }
  return { text: `${d.getMonth() + 1}/${d.getDate()}`, color: 'text-[#6B7280]' }
}

type FilterTab = 'all' | 'today' | 'overdue' | 'completed'

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [search, setSearch]           = useState('')
  const [filterTab, setFilterTab]     = useState<FilterTab>('today')
  const [filterType, setFilterType]   = useState<TaskType | ''>('')
  const [showTypeFilter, setShowTypeFilter] = useState(false)

  const counts = useMemo(() => ({
    all:       MOCK_TASKS.filter(t => !t.completedAt).length,
    today:     MOCK_TASKS.filter(t => !t.completedAt && !t.overdue && t.dueAt === '2026-03-23').length,
    overdue:   MOCK_TASKS.filter(t => !t.completedAt && t.overdue).length,
    completed: MOCK_TASKS.filter(t => !!t.completedAt).length,
  }), [])

  const filtered = useMemo(() => {
    let list = MOCK_TASKS
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        (t.contact?.toLowerCase().includes(q) ?? false)
      )
    }
    if (filterType) list = list.filter(t => t.type === filterType)

    switch (filterTab) {
      case 'today':     list = list.filter(t => !t.completedAt && !t.overdue && t.dueAt === '2026-03-23'); break
      case 'overdue':   list = list.filter(t => !t.completedAt && t.overdue); break
      case 'completed': list = list.filter(t => !!t.completedAt); break
      default:          list = list.filter(t => !t.completedAt); break
    }
    return list
  }, [search, filterTab, filterType])

  const TABS: { key: FilterTab; label: string; count: number; alert?: boolean }[] = [
    { key: 'today',     label: '今日',          count: counts.today },
    { key: 'overdue',   label: '期限超過',       count: counts.overdue, alert: counts.overdue > 0 },
    { key: 'all',       label: '全タスク',       count: counts.all },
    { key: 'completed', label: '完了済み',       count: counts.completed },
  ]

  return (
    <div className="space-y-4" onClick={() => setShowTypeFilter(false)}>

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="タスク名・会社名で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTypeFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[8px] border transition-all ${
                filterType ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]' : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
              }`}
            >
              種別{filterType ? `: ${TASK_CONFIG[filterType].label}` : ''}
              <ChevronDown size={13} />
            </button>
            <AnimatePresence>
              {showTypeFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 bg-white rounded-[10px] border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-2 min-w-[140px] flex flex-col gap-0.5"
                >
                  <button
                    onClick={() => setFilterType('')}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-sm transition-colors text-left ${
                      !filterType ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'hover:bg-[#F3F4F6] text-[#374151]'
                    }`}
                  >
                    すべて
                  </button>
                  {(Object.keys(TASK_CONFIG) as TaskType[]).map(type => {
                    const cfg = TASK_CONFIG[type]
                    const Icon = cfg.icon
                    return (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-sm transition-colors text-left ${
                          filterType === type ? `${cfg.bg} ${cfg.color}` : 'hover:bg-[#F3F4F6] text-[#374151]'
                        }`}
                      >
                        <Icon size={13} />
                        {cfg.label}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {filterType && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setFilterType('')}
                className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#374151] whitespace-nowrap overflow-hidden"
              >
                <X size={12} />クリア
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-[8px] transition-colors shrink-0">
          <Plus size={15} strokeWidth={2.5} />
          タスクを追加
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-[10px] p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-sm font-medium transition-all duration-150 ${
              filterTab === tab.key
                ? 'bg-white text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            {tab.alert && (
              <AlertCircle size={12} className="text-[#EF4444]" />
            )}
            {tab.label}
            <span className={`text-[11px] font-semibold rounded-full px-1.5 min-w-[18px] text-center ${
              filterTab === tab.key
                ? tab.alert ? 'text-[#EF4444]' : 'text-[#4F46E5]'
                : 'text-[#9CA3AF]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Task List ── */}
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          key={filterTab + filterType}
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <CheckSquare size={22} className="text-[#D1D5DB]" />
              </div>
              <p className="text-sm text-[#6B7280]">
                {filterTab === 'today' ? '今日のタスクはすべて完了しました 🎉' : 'タスクがありません'}
              </p>
            </div>
          ) : (
            filtered.map(task => {
              const cfg = TASK_CONFIG[task.type]
              const Icon = cfg.icon
              const due = formatDueDate(task.dueAt, task.overdue)
              const isCompleted = !!task.completedAt

              return (
                <motion.div
                  key={task.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-[#F9FAFB] last:border-0 group transition-colors duration-100 hover:bg-[#FAFAFA] ${
                    task.overdue && !isCompleted ? 'bg-[#FFFAFA]' : ''
                  } ${isCompleted ? 'opacity-50' : ''}`}
                >
                  {/* Complete Button */}
                  <button
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                      isCompleted
                        ? 'bg-[#10B981] border-[#10B981]'
                        : 'border-[#D1D5DB] hover:border-[#4F46E5]'
                    }`}
                  >
                    {isCompleted && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>

                  {/* Task Type Icon */}
                  <div className={`w-7 h-7 rounded-[7px] ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={13} style={{ color: cfg.iconColor }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium text-[#111827] truncate ${isCompleted ? 'line-through' : ''}`}>
                        {task.company}
                        {task.contact && (
                          <span className="text-[#6B7280] font-normal"> / {task.contact}</span>
                        )}
                      </p>
                      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#9CA3AF] bg-[#F9FAFB] px-1.5 py-0.5 rounded-[4px]">
                        {SOURCE_LABEL[task.source]}
                      </span>
                    </div>
                    {task.memo && (
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">{task.memo}</p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center gap-1 shrink-0">
                    {task.overdue && !isCompleted && (
                      <AlertCircle size={12} className="text-[#EF4444]" />
                    )}
                    <span className={`text-sm font-medium tabular-nums ${due.color}`}>
                      {due.text}
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center gap-1.5 shrink-0 w-20">
                    <div className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-[#4F46E5]">{task.owner[0]}</span>
                    </div>
                    <span className="text-xs text-[#6B7280] truncate">{task.owner}</span>
                  </div>

                  {/* CTA */}
                  {!isCompleted && (
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.type === 'CALL' ? (
                        <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[7px] transition-colors">
                          <Phone size={11} strokeWidth={2.5} />
                          コール
                        </button>
                      ) : task.type === 'EMAIL' ? (
                        <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-[7px] transition-colors">
                          <Mail size={11} />
                          作成
                        </button>
                      ) : (
                        <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-[7px] transition-colors">
                          <CheckSquare size={11} />
                          完了
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </motion.div>
      </div>
    </div>
  )
}
