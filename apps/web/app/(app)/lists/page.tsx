'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Phone, Users, CalendarCheck, X } from 'lucide-react'
import type { CallList } from '@/types/crm'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LISTS: CallList[] = [
  {
    id: 'list-1', name: '今週のコール対象', description: '今週中にコールすべきターゲット',
    ownerName: '田中太郎', contactCount: 12, completedCount: 5, appointmentCount: 2,
    color: '#0071E3', createdAt: '2026-03-24', updatedAt: '2026-03-26',
  },
  {
    id: 'list-2', name: '再フォローリスト', description: '不在/不通で再コールが必要',
    ownerName: '田中太郎', contactCount: 8, completedCount: 1, appointmentCount: 0,
    color: '#FF9F0A', createdAt: '2026-03-20', updatedAt: '2026-03-25',
  },
  {
    id: 'list-3', name: 'セミナー参加者リスト', description: '3/15セミナー参加者へのフォローアップ',
    ownerName: '鈴木花子', contactCount: 20, completedCount: 14, appointmentCount: 5,
    color: '#34C759', createdAt: '2026-03-16', updatedAt: '2026-03-22',
  },
  {
    id: 'list-4', name: 'Aランク未着手', description: 'Aランクでまだ未アプローチの企業',
    ownerName: '田中太郎', contactCount: 6, completedCount: 0, appointmentCount: 0,
    color: '#FF3B30', createdAt: '2026-03-18', updatedAt: '2026-03-26',
  },
]

// ─── Card animation ──────────────────────────────────────────────────────────

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
}

// ─── ListCard ────────────────────────────────────────────────────────────────

function ListCard({ list, index }: { list: CallList; index: number }) {
  const router = useRouter()
  const progress = list.contactCount > 0 ? (list.completedCount / list.contactCount) * 100 : 0
  const [isMounted, setIsMounted] = useState(false)
  useState(() => { setTimeout(() => setIsMounted(true), 100) })

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className="rounded-[14px] p-5 cursor-pointer"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)',
      }}
      whileHover={{ y: -2, boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1), 0 12px 36px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => router.push(`/lists/${list.id}`)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-[10px] h-[10px] rounded-full mt-1.5 shrink-0"
          style={{ background: list.color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.02em] truncate">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-[12px] text-[#8E8E93] mt-0.5 truncate">{list.description}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: isMounted ? `${progress}%` : '0%',
              background: list.color,
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Users size={12} style={{ color: '#8E8E93' }} />
          <span className="text-[12px] text-[#6E6E73]">
            {list.completedCount}/{list.contactCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarCheck size={12} style={{ color: '#34C759' }} />
          <span className="text-[12px] text-[#1A7A35] font-medium">
            {list.appointmentCount}
          </span>
        </div>
        <span className="text-[11px] text-[#AEAEB2] ml-auto">{list.ownerName}</span>
      </div>
    </motion.div>
  )
}

// ─── CreateListModal ─────────────────────────────────────────────────────────

function CreateListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative w-[440px] rounded-[16px] p-6"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold text-[#1D1D1F]">新規リスト作成</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(0,0,0,0.05)] transition-colors">
                <X size={16} style={{ color: '#8E8E93' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">リスト名 *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例: 今週のコール対象"
                  className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid transparent' }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.border = '1px solid rgba(0,85,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)' }}
                  onBlur={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">説明</label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="リストの目的や対象を入力"
                  className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid transparent' }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.border = '1px solid rgba(0,85,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)' }}
                  onBlur={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
              >
                キャンセル
              </button>
              <button
                disabled={!name.trim()}
                className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px] transition-all"
                style={{
                  background: name.trim() ? 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)' : 'rgba(0,0,0,0.12)',
                  boxShadow: name.trim() ? '0 2px 8px rgba(255,59,48,0.35)' : 'none',
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}
                onClick={onClose}
              >
                作成
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ListsPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_LISTS
    const q = search.toLowerCase()
    return MOCK_LISTS.filter(l =>
      l.name.toLowerCase().includes(q) || l.ownerName.toLowerCase().includes(q)
    )
  }, [search])

  const totalContacts = MOCK_LISTS.reduce((s, l) => s + l.contactCount, 0)
  const totalCompleted = MOCK_LISTS.reduce((s, l) => s + l.completedCount, 0)
  const totalAppointments = MOCK_LISTS.reduce((s, l) => s + l.appointmentCount, 0)

  return (
    <>
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
          リスト
        </h1>
        <p className="text-[13px] text-[#8E8E93] mt-0.5">
          コール対象リストを管理
        </p>
      </motion.div>

      {/* Summary KPI */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      >
        {[
          { label: '総コンタクト数', value: totalContacts, icon: Users, color: '#0071E3' },
          { label: 'コール完了', value: totalCompleted, icon: Phone, color: '#34C759' },
          { label: 'アポ獲得', value: totalAppointments, icon: CalendarCheck, color: '#FF9F0A' },
        ].map((kpi, i) => (
          <div
            key={i}
            className="rounded-[12px] px-4 py-3 flex items-center gap-3"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div
              className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center"
              style={{ background: `${kpi.color}14` }}
            >
              <kpi.icon size={15} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-[#1D1D1F] tracking-[-0.02em]">{kpi.value}</p>
              <p className="text-[11px] text-[#8E8E93]">{kpi.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#AEAEB2' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="リスト名で検索..."
            className="h-[32px] w-full pl-8 pr-3 text-[13px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none transition-all"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid transparent' }}
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-[32px] px-3 flex items-center gap-1.5 text-[13px] font-medium text-white rounded-[8px]"
          style={{
            background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)',
            boxShadow: '0 2px 8px rgba(255,59,48,0.35)',
          }}
        >
          <Plus size={13} />
          新規リスト
        </button>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((list, i) => (
          <ListCard key={list.id} list={list} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#AEAEB2]">リストが見つかりません</p>
        </div>
      )}

      <CreateListModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}
