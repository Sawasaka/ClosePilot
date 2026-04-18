'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Users, CalendarCheck, X, ChevronDown } from 'lucide-react'
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

// ─── Color Themes (FF風グラデーション+グロー) ───────────────────────────────

interface ColorTheme {
  gradient: string
  glow: string
  barShadow: string
  rgb: string
}

const COLOR_THEMES: Record<string, ColorTheme> = {
  '#0071E3': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 16px rgba(50,173,230,0.95), 0 0 6px rgba(125,211,252,1), inset 0 1px 0 rgba(255,255,255,0.5)',
    barShadow: '0 0 12px rgba(50,173,230,0.7), 0 0 4px rgba(125,211,252,0.9)',
    rgb: '50,173,230',
  },
  '#FF9F0A': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 16px rgba(255,159,10,0.95), 0 0 6px rgba(255,204,102,1), inset 0 1px 0 rgba(255,255,255,0.5)',
    barShadow: '0 0 12px rgba(255,159,10,0.7), 0 0 4px rgba(255,204,102,0.9)',
    rgb: '255,159,10',
  },
  '#34C759': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 16px rgba(52,199,89,0.95), 0 0 6px rgba(167,243,208,1), inset 0 1px 0 rgba(255,255,255,0.5)',
    barShadow: '0 0 12px rgba(52,199,89,0.7), 0 0 4px rgba(167,243,208,0.9)',
    rgb: '52,199,89',
  },
  '#FF3B30': {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 16px rgba(255,59,48,0.95), 0 0 6px rgba(255,107,53,1), inset 0 1px 0 rgba(255,255,255,0.5)',
    barShadow: '0 0 12px rgba(255,59,48,0.7), 0 0 4px rgba(255,107,53,0.9)',
    rgb: '255,59,48',
  },
}

const DEFAULT_THEME: ColorTheme = COLOR_THEMES['#0071E3']!

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
  const theme = COLOR_THEMES[list.color] ?? DEFAULT_THEME

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      className="rounded-[8px] p-5 cursor-pointer relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
        boxShadow: `0 2px 12px rgba(0,0,0,0.4), 0 0 18px rgba(${theme.rgb},0.18), inset 0 1px 0 rgba(255,255,255,0.06)`,
        border: `1px solid rgba(${theme.rgb},0.4)`,
      }}
      whileHover={{ y: -3, boxShadow: `0 6px 24px rgba(0,0,0,0.55), 0 0 28px rgba(${theme.rgb},0.35), inset 0 1px 0 rgba(255,255,255,0.1)` }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => router.push(`/lists/${list.id}`)}
    >
      {/* グロー光線 (上端) */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '3px',
          background: theme.gradient,
          boxShadow: theme.glow,
        }}
      />
      {/* 背景フェード */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, right: 0, width: '160px', height: '160px',
          background: `radial-gradient(circle at top right, rgba(${theme.rgb},0.18) 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 relative">
        <div
          className="w-[14px] h-[14px] rounded-full mt-1 shrink-0"
          style={{
            background: theme.gradient,
            boxShadow: theme.glow,
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[#EEEEFF] tracking-[-0.02em] truncate">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-[12px] text-[#CCDDF0] mt-0.5 truncate">{list.description}</p>
          )}
        </div>

        {/* 担当者バッジ(右上) */}
        <span
          className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-bold whitespace-nowrap shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(136,187,255,0.22) 0%, rgba(85,119,221,0.16) 100%)',
            color: '#CCDDF0',
            border: '1px solid rgba(136,187,255,0.45)',
            boxShadow: '0 0 8px rgba(136,187,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <Users size={9} strokeWidth={2.5} />
          {list.ownerName}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 relative">
        {/* リスト件数 */}
        <div className="flex items-center gap-1.5">
          <Users size={12} style={{ color: '#88BBFF', filter: 'drop-shadow(0 0 4px rgba(136,187,255,0.6))' }} />
          <span className="text-[11px] text-[#99AACC] font-medium">件数</span>
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(136,187,255,0.5)' }}
          >
            {list.contactCount}
          </span>
        </div>

        <span className="w-px h-3.5" style={{ background: 'rgba(136,187,255,0.25)' }} />

        {/* アポイント獲得数 */}
        <div className="flex items-center gap-1.5">
          <CalendarCheck size={12} style={{ color: '#34C759', filter: 'drop-shadow(0 0 4px rgba(52,199,89,0.8))' }} />
          <span className="text-[11px] text-[#99AACC] font-medium">アポ</span>
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: '#7EE6A1', textShadow: '0 0 6px rgba(52,199,89,0.7)' }}
          >
            {list.appointmentCount}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── CreateListModal ─────────────────────────────────────────────────────────

const OWNERS = ['田中太郎', '鈴木花子', '佐藤次郎']

function CreateListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState(OWNERS[0])

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
              background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold text-[#EEEEFF]">新規リスト作成</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.06)] transition-colors">
                <X size={16} style={{ color: '#CCDDF0' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em]">リスト名 *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例: 今週のコール対象"
                  className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
                  style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.border = '1px solid rgba(0,85,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)' }}
                  onBlur={e => { e.currentTarget.style.background = 'rgba(16,16,40,0.6)'; e.currentTarget.style.border = '1px solid #2244AA'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em]">説明</label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="リストの目的や対象を入力"
                  className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
                  style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.border = '1px solid rgba(0,85,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,85,255,0.1)' }}
                  onBlur={e => { e.currentTarget.style.background = 'rgba(16,16,40,0.6)'; e.currentTarget.style.border = '1px solid #2244AA'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em]">担当者</label>
                <div className="relative mt-1.5">
                  <select
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    className="w-full h-[36px] px-3 pr-8 text-[14px] rounded-[8px] text-[#EEEEFF] appearance-none cursor-pointer outline-none"
                    style={{ background: 'rgba(16,16,40,0.6)' }}
                  >
                    {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#CCDDF0] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="h-[34px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)] transition-colors"
              >
                キャンセル
              </button>
              <button
                disabled={!name.trim()}
                className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px] transition-all"
                style={{
                  background: name.trim() ? 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)' : 'rgba(34,68,170,0.3)',
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
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_LISTS
    const q = search.toLowerCase()
    return MOCK_LISTS.filter(l =>
      l.name.toLowerCase().includes(q) || l.ownerName.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <>
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">
          ISリスト
        </h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">
          コール対象リストを管理
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="flex items-center gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#99AACC' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="リスト名で検索..."
            className="h-[32px] w-full pl-8 pr-3 text-[13px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none transition-all"
            style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
          />
        </div>
        <button
          onClick={() => router.push('/companies?mode=list-create')}
          className="h-[32px] px-3 flex items-center gap-1.5 text-[13px] font-medium text-white rounded-[8px]"
          style={{
            background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
            boxShadow: '0 2px 8px rgba(34,68,170,0.4)',
            border: '1px solid #3355CC',
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
          <p className="text-[14px] text-[#99AACC]">リストが見つかりません</p>
        </div>
      )}

      <CreateListModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}
