'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  Phone,
  Mail,
  Building2,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Star,
  CalendarClock,
  Pencil,
  X,
  CheckCircle2,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import { RANK_CONFIG as BASE_RANK_CONFIG, STATUS_GAME_STYLES } from '@/types/crm'
import type { ApproachStatus } from '@/types/crm'
import { StatusGameBadge } from '@/components/ui/GameBadge'

// ─── Local RANK_CONFIG (角度 - A/B/C/プラス/設定なし) ────────────────────────

interface RankStyle {
  gradient: string
  glow: string
  color: string
}

const RANK_CONFIG: Record<'A' | 'B' | 'C' | 'プラス' | '設定なし', RankStyle> = {
  A: BASE_RANK_CONFIG.A,
  B: BASE_RANK_CONFIG.B,
  C: BASE_RANK_CONFIG.C,
  'プラス': {
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
  },
  '設定なし': {
    gradient: 'linear-gradient(135deg, #4A4A52 0%, #3A3A42 100%)',
    glow: '0 0 8px rgba(174,174,178,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    color: '#D8DCE6',
  },
}

const RANK_OPTIONS_FULL: ContactRank[] = ['A', 'B', 'C', 'プラス', null]
function rankLabel(r: ContactRank): string {
  return r === null ? '設定なし' : r
}
function rankConfigOf(r: ContactRank): RankStyle {
  return r === null ? RANK_CONFIG['設定なし'] : RANK_CONFIG[r]
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type ActivityType = 'call' | 'email' | 'note' | 'deal_advance'

interface ActivityItem {
  id: string
  type: ActivityType
  timestamp: string
  title: string
  result?: ApproachStatus
  durationSec?: number
  description?: string
}

type NextActionValue = 'メール' | 'コール' | '連絡待ち' | '商談' | 'フォロー' | null
type PersonRole = '決裁者' | '推進者' | '一般'

// 角度 — A / B / C / プラス / 設定なし
type ContactRank = 'A' | 'B' | 'C' | 'プラス' | null
type Signal = 'Hot' | 'Middle' | 'Low'

interface ContactDetail {
  id: string
  name: string
  title: string
  department: string
  company: string
  companyId: string
  email: string
  phone: string
  rank: ContactRank
  signal: Signal
  status: ApproachStatus
  statusMemo: string
  nextAction: NextActionValue
  nextActionMemo: string
  callAttempts: number
  lastCallAt: string | null
  nextActionAt: string | null
  personRole: PersonRole
}

const SIGNAL_OPTIONS: Signal[] = ['Hot', 'Middle', 'Low']
const SIGNAL_LABEL: Record<Signal, string> = { Hot: '高', Middle: '中', Low: '低' }

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Record<string, ContactDetail> = {
  '1': {
    id: '1', name: '田中 誠', title: '営業部長', department: '営業部',
    company: '株式会社テクノリード', companyId: '1',
    email: 'tanaka@techno-lead.co.jp', phone: '03-1234-5678',
    rank: 'A', signal: 'Hot', status: 'アポ獲得', statusMemo: '3/28 14:00 商談設定済み。Google Meet URL送付済み。',
    nextAction: null, nextActionMemo: '',
    callAttempts: 3, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28',
    personRole: '決裁者',
  },
  '2': {
    id: '2', name: '山本 佳子', title: 'マネージャー', department: '購買部',
    company: '合同会社フューチャー', companyId: '2',
    email: 'yamamoto@future-llc.jp', phone: '06-2345-6789',
    rank: 'A', signal: 'Hot', status: '接続済み', statusMemo: '初回コンタクト完了。提案資料の希望あり。',
    nextAction: null, nextActionMemo: '',
    callAttempts: 5, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22',
    personRole: '推進者',
  },
}

// ─── Person Role Style ─────────────────────────────────────────────────────────

interface PersonRoleStyle {
  gradient: string
  glow: string
  color: string
  borderColor: string
  textShadow: string
  iconColor: string
}

const PERSON_ROLE_STYLES: Record<PersonRole, PersonRoleStyle> = {
  '決裁者': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
    iconColor: '#5B2E00',
  },
  '推進者': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
    iconColor: '#FFFFFF',
  },
  '一般': {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
    iconColor: '#2C2C2E',
  },
}

const ALL_PERSON_ROLES: PersonRole[] = ['決裁者', '推進者', '一般']

// ─── Next Action Game Style ────────────────────────────────────────────────────

interface NextActionStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
}

const NEXT_ACTION_STYLES: Record<Exclude<NextActionValue, null>, NextActionStyle> = {
  'メール': {
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E9E5FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  'コール': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#E0F4FF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  '商談': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  '連絡待ち': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', dotColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  'フォロー': {
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', dotColor: '#FCE7F3', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(110,15,60,0.6)',
  },
}

const ALL_NEXT_ACTIONS: Exclude<NextActionValue, null>[] = ['メール', 'コール', '商談', '連絡待ち', 'フォロー']

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1', type: 'call', timestamp: '2026-03-20T14:32',
    title: 'コール', result: 'アポ獲得', durationSec: 154,
    description: '3月28日 14:00 商談設定完了。Google Meet URLを送付済み',
  },
  {
    id: 'a2', type: 'deal_advance', timestamp: '2026-03-20T14:33',
    title: 'Deal が First Meeting ステージへ進行',
  },
  {
    id: 'a3', type: 'call', timestamp: '2026-03-18T11:15',
    title: 'コール', result: '不在', durationSec: 0,
    description: '受付が応答。折返し連絡を依頼。',
  },
  {
    id: 'a4', type: 'email', timestamp: '2026-03-17T09:00',
    title: 'メール送信', description: '会社紹介資料を添付して送付',
  },
  {
    id: 'a5', type: 'call', timestamp: '2026-03-15T10:00',
    title: 'コール', result: '不通', durationSec: 0,
  },
]

// ─── Style Constants ───────────────────────────────────────────────────────────

const CARD_STYLE = {
  background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(ts: string): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatDuration(sec: number): string {
  if (sec === 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

// ─── Activity Icon ─────────────────────────────────────────────────────────────

interface ActivityIconStyle {
  Icon: React.ElementType
  gradient: string
  glow: string
  iconColor: string
  border: string
  isContact: boolean // 接点ありかどうか(明暗判定)
}

// 接点あり = コール/メール/商談 (実施したアクティビティ)
const CONTACT_TYPES: ActivityType[] = ['call', 'email', 'note']

function getActivityIconStyle(type: ActivityType): ActivityIconStyle {
  const isContact = CONTACT_TYPES.includes(type)

  if (type === 'call') {
    return {
      Icon: PhoneCall,
      gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
      glow: '0 0 16px rgba(50,173,230,0.85), 0 0 6px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
      iconColor: '#FFFFFF',
      border: '1.5px solid rgba(255,255,255,0.4)',
      isContact: true,
    }
  }
  if (type === 'email') {
    return {
      Icon: Mail,
      gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
      glow: '0 0 16px rgba(139,92,246,0.85), 0 0 6px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
      iconColor: '#FFFFFF',
      border: '1.5px solid rgba(255,255,255,0.4)',
      isContact: true,
    }
  }
  if (type === 'note') {
    // 商談メモなど
    return {
      Icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
      glow: '0 0 16px rgba(52,199,89,0.85), 0 0 6px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
      iconColor: '#FFFFFF',
      border: '1.5px solid rgba(255,255,255,0.4)',
      isContact: true,
    }
  }
  // deal_advance などのシステムイベントは暗めに
  return {
    Icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #3A4058 0%, #2A3048 35%, #1E2438 70%, #141828 100%)',
    glow: '0 0 8px rgba(85,119,221,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
    iconColor: '#7799CC',
    border: '1px solid rgba(85,119,221,0.35)',
    isContact: false,
  }
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const s = getActivityIconStyle(type)
  const Icon = s.Icon
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: s.gradient,
        boxShadow: s.glow,
        border: s.border,
        opacity: s.isContact ? 1 : 0.65,
      }}
    >
      <Icon
        size={17}
        style={{ color: s.iconColor, filter: s.isContact ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' : 'none' }}
        strokeWidth={s.isContact ? 2.5 : 2}
      />
    </div>
  )
}

// ─── Inline Selectors (クリックでドロップダウン編集) ──────────────────────────

const STATUS_OPTIONS: ApproachStatus[] = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得']

function StatusSelector({ value, onChange }: {
  value: ApproachStatus
  onChange: (v: ApproachStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
        style={{
          background: hover || open ? 'rgba(136,187,255,0.10)' : 'transparent',
          border: hover || open ? '1px dashed rgba(136,187,255,0.5)' : '1px dashed transparent',
        }}
        title="クリックして変更"
      >
        <StatusGameBadge status={value} />
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{
            color: hover || open ? '#88BBFF' : '#7799CC',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[160px]"
              style={{
                background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
                border: '1px solid #2244AA',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(85,119,221,0.2)',
              }}
            >
              {STATUS_OPTIONS.map(s => {
                const style = STATUS_GAME_STYLES[s]
                const selected = s === value
                return (
                  <button
                    key={s}
                    onClick={e => { e.stopPropagation(); onChange(s); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors"
                    style={{ color: '#CCDDF0', fontWeight: selected ? 700 : 500 }}
                  >
                    <span
                      className="rounded-full shrink-0"
                      style={{ width: 7, height: 7, background: style.dotColor, boxShadow: `0 0 6px ${style.dotColor}` }}
                    />
                    {s}
                    {selected && <span className="ml-auto text-[#88BBFF]">✓</span>}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function NextActionSelector({ value, onChange }: {
  value: NextActionValue
  onChange: (v: NextActionValue) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  const renderBadge = () => {
    if (!value) {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, rgba(136,187,255,0.18) 0%, rgba(85,119,221,0.12) 100%)',
            boxShadow: '0 0 10px rgba(136,187,255,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
            color: '#88BBFF',
            border: '1px dashed rgba(136,187,255,0.5)',
            letterSpacing: '0.01em',
          }}
        >
          <span className="rounded-full" style={{ width: 6, height: 6, background: '#88BBFF', boxShadow: '0 0 4px #88BBFF' }} />
          未設定
        </span>
      )
    }
    const s = NEXT_ACTION_STYLES[value]
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{
          background: s.gradient,
          boxShadow: s.glow,
          color: s.color,
          border: `1px solid ${s.borderColor}`,
          textShadow: s.textShadow,
          letterSpacing: '0.01em',
        }}
      >
        <span className="rounded-full" style={{ width: 6, height: 6, background: s.dotColor, boxShadow: `0 0 4px ${s.dotColor}cc` }} />
        {value}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
        style={{
          background: hover || open ? 'rgba(136,187,255,0.10)' : 'transparent',
          border: hover || open ? '1px dashed rgba(136,187,255,0.5)' : '1px dashed transparent',
        }}
        title="クリックして変更"
      >
        {renderBadge()}
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{
            color: hover || open ? '#88BBFF' : '#7799CC',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[160px]"
              style={{
                background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
                border: '1px solid #2244AA',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(85,119,221,0.2)',
              }}
            >
              {ALL_NEXT_ACTIONS.map(a => {
                const style = NEXT_ACTION_STYLES[a]
                const selected = a === value
                return (
                  <button
                    key={a}
                    onClick={e => { e.stopPropagation(); onChange(a); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors"
                    style={{ color: '#CCDDF0', fontWeight: selected ? 700 : 500 }}
                  >
                    <span
                      className="rounded-full shrink-0"
                      style={{ width: 7, height: 7, background: style.dotColor, boxShadow: `0 0 6px ${style.dotColor}` }}
                    />
                    {a}
                    {selected && <span className="ml-auto text-[#88BBFF]">✓</span>}
                  </button>
                )
              })}
              <div className="mx-2 my-1 h-px" style={{ background: 'rgba(34,68,170,0.3)' }} />
              <button
                onClick={e => { e.stopPropagation(); onChange(null); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors"
                style={{ color: value === null ? '#88BBFF' : '#99AACC', fontWeight: value === null ? 700 : 500 }}
              >
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: '#88BBFF', boxShadow: '0 0 4px #88BBFF' }} />
                未設定
                {value === null && <span className="ml-auto text-[#88BBFF]">✓</span>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── PersonRoleSelector (職位) ────────────────────────────────────────────

function PersonRoleSelector({ value, onChange }: {
  value: PersonRole
  onChange: (v: PersonRole) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const s = PERSON_ROLE_STYLES[value]

  return (
    <div className="relative inline-block">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer"
        style={{
          background: s.gradient,
          boxShadow: hover || open ? `${s.glow}, 0 0 0 2px rgba(136,187,255,0.4)` : s.glow,
          color: s.color,
          border: `1px solid ${s.borderColor}`,
          textShadow: s.textShadow,
          letterSpacing: '0.01em',
        }}
        title="クリックして変更"
      >
        <Star size={10} fill={s.iconColor} />
        {value}
        <ChevronDown size={11} style={{ color: s.color, opacity: 0.7 }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[140px]"
              style={{
                background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
                border: '1px solid #2244AA',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 16px rgba(85,119,221,0.2)',
              }}
            >
              {ALL_PERSON_ROLES.map(r => {
                const style = PERSON_ROLE_STYLES[r]
                const selected = r === value
                return (
                  <button
                    key={r}
                    onClick={e => { e.stopPropagation(); onChange(r); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(136,187,255,0.06)] transition-colors"
                    style={{ color: '#CCDDF0', fontWeight: selected ? 700 : 500 }}
                  >
                    <Star size={11} style={{ color: r === '決裁者' ? '#FFC266' : r === '推進者' ? '#A78BFA' : '#AEAEB2' }} />
                    {r}
                    {selected && <span className="ml-auto text-[#88BBFF]">✓</span>}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Edit Contact Modal ───────────────────────────────────────────────────────

function EditContactModal({ contact, onClose, onSave }: {
  contact: ContactDetail
  onClose: () => void
  onSave: (updated: ContactDetail) => void
}) {
  const [form, setForm] = useState<ContactDetail>(contact)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      title: form.title.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[480px] rounded-[14px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
          border: '1px solid #2244AA',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(85,119,221,0.2), inset 0 1px 0 rgba(136,187,255,0.08)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,68,170,0.3)' }}>
          <h2 className="text-[16px] font-bold text-[#EEEEFF]">コンタクト編集</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.08)] transition-colors"
          >
            <X size={16} className="text-[#CCDDF0]" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 氏名 */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                氏名 <span className="text-[#FF8A82]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none transition-all"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
              />
            </div>

            {/* 部署 + 役職 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                  部署
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none"
                  style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                  役職
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none"
                  style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
                />
              </div>
            </div>

            {/* メール */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                メールアドレス
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
              />
            </div>

            {/* 電話 */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                電話番号
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
              />
            </div>

            {/* 角度 */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                角度
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RANK_OPTIONS_FULL.map(r => {
                  const cfg = rankConfigOf(r)
                  const label = rankLabel(r)
                  const active = form.rank === r
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, rank: r }))}
                      className="px-3 h-[36px] rounded-[8px] text-[12px] font-black transition-all"
                      style={active ? {
                        background: cfg.gradient,
                        boxShadow: cfg.glow,
                        color: cfg.color,
                        border: '1px solid rgba(255,255,255,0.4)',
                        textShadow: cfg.color === '#fff' || cfg.color === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                      } : {
                        background: 'rgba(16,16,40,0.8)',
                        border: '1px solid #2244AA',
                        color: '#7799CC',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ステータス */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                ステータス
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as ApproachStatus }))}
                  className="w-full h-[36px] px-3 pr-8 text-[13px] rounded-[8px] text-[#EEEEFF] appearance-none cursor-pointer outline-none"
                  style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7799CC] pointer-events-none" />
              </div>
            </div>

            {/* 職位 */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                職位
              </label>
              <div className="flex gap-1.5">
                {ALL_PERSON_ROLES.map(r => {
                  const style = PERSON_ROLE_STYLES[r]
                  const active = form.personRole === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, personRole: r }))}
                      className="flex-1 inline-flex items-center justify-center gap-1 h-[36px] rounded-[8px] text-[12px] font-bold transition-all"
                      style={active ? {
                        background: style.gradient,
                        boxShadow: style.glow,
                        color: style.color,
                        border: `1px solid ${style.borderColor}`,
                        textShadow: style.textShadow,
                      } : {
                        background: 'rgba(16,16,40,0.8)',
                        border: '1px solid #2244AA',
                        color: '#7799CC',
                      }}
                    >
                      <Star size={11} fill={active ? style.iconColor : 'none'} />
                      {r}
                    </button>
                  )
                })}
              </div>
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
              type="submit"
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
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── IS Field Row ──────────────────────────────────────────────────────────────

function ISFieldRow({ label, children, editable }: { label: string; children: React.ReactNode; editable?: boolean }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
      }}
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}
    >
      <span
        className="text-xs shrink-0 w-28 inline-flex items-center gap-1"
        style={{ color: editable ? '#88BBFF' : '#99AACC' }}
      >
        {label}
        {editable && <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />}
      </span>
      <div className="text-right">{children}</div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { startCall } = useCallStore()

  const initialContact = MOCK_CONTACTS[id] ?? MOCK_CONTACTS['1']!
  const [contact, setContact] = useState<ContactDetail>(initialContact)
  const rankConfig  = rankConfigOf(contact.rank)
  const rankLabelStr = rankLabel(contact.rank)

  const [activityTab, setActivityTab] = useState<'all' | 'call' | 'email' | 'note'>('all')
  const [showEditModal, setShowEditModal] = useState(false)

  const filteredActivities = useMemo(() => {
    if (activityTab === 'all') return MOCK_ACTIVITIES
    if (activityTab === 'call') return MOCK_ACTIVITIES.filter(a => a.type === 'call')
    if (activityTab === 'email') return MOCK_ACTIVITIES.filter(a => a.type === 'email')
    return MOCK_ACTIVITIES.filter(a => a.type === 'note')
  }, [activityTab])

  function handleCall() {
    startCall({
      contactId: contact.id,
      contactName: contact.name,
      company: contact.company,
      phone: contact.phone,
    })
  }

  return (
    <div className="space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/contacts"
          className="flex items-center gap-1 text-sm text-[#CCDDF0] hover:text-[#EEEEFF] transition-colors"
        >
          <ChevronLeft size={15} />
          コンタクト一覧
        </Link>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ filter: 'brightness(1.06)' }}
          onClick={handleCall}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-[9px] transition-all"
          style={{
            background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
            border: '1px solid #3355CC',
            boxShadow: '0 2px 8px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.15)',
          }}
        >
          <Phone size={15} strokeWidth={2.5} />
          今すぐコール
        </motion.button>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] p-5"
            style={CARD_STYLE}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(145deg, #3355CC, #5E5CE6)',
                  boxShadow: '0 2px 12px rgba(94,92,230,0.4), inset 0 1px 0 rgba(200,220,255,0.2)',
                  border: '1px solid #5577DD',
                }}
              >
                <span className="text-xl font-semibold text-white">{contact.name[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-[#EEEEFF] tracking-[-0.02em]">
                    {contact.name}
                  </h1>
                  <span
                    className="inline-flex items-center justify-center rounded-[6px] text-[11px] font-black px-2"
                    style={{
                      minWidth: 26,
                      height: 26,
                      background: rankConfig.gradient,
                      boxShadow: rankConfig.glow,
                      color: rankConfig.color,
                      border: '1px solid rgba(255,255,255,0.25)',
                      textShadow: rankConfig.color === '#fff' || rankConfig.color === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                      letterSpacing: '0.04em',
                    }}
                    title="角度"
                  >
                    {rankLabelStr}
                  </span>
                  <PersonRoleSelector
                    value={contact.personRole}
                    onChange={v => setContact(c => ({ ...c, personRole: v }))}
                  />
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm text-[#CCDDF0]">{contact.title}</span>
                  <span className="text-[#99AACC]">·</span>
                  <span className="text-sm text-[#CCDDF0]">{contact.department}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <Building2 size={12} className="text-[#99AACC]" />
                  <Link href={`/companies/${contact.companyId}`} className="text-sm text-[#CCDDF0] font-medium hover:text-[#88BBFF] transition-colors">
                    {contact.company}
                  </Link>
                </div>
              </div>

              {/* 編集ボタン */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ filter: 'brightness(1.15)' }}
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-[8px] shrink-0 transition-all"
                style={{
                  background: 'rgba(136,187,255,0.10)',
                  border: '1px solid rgba(136,187,255,0.4)',
                  color: '#88BBFF',
                  boxShadow: '0 0 8px rgba(136,187,255,0.15)',
                }}
                title="コンタクトを編集"
              >
                <Pencil size={12} strokeWidth={2.5} />
                編集
              </motion.button>
            </div>

            {/* Contact Details */}
            <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(34,68,170,0.25)' }}>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-sm text-[#CCDDF0] hover:text-[#88BBFF] transition-colors"
              >
                <Mail size={13} />
                {contact.email}
              </a>
              <span className="w-px h-3" style={{ background: '#2244AA' }} />
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-sm text-[#CCDDF0] hover:text-[#88BBFF] transition-colors"
              >
                <Phone size={13} />
                {contact.phone}
              </a>
            </div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] overflow-hidden"
            style={CARD_STYLE}
          >
            {/* Tab Header */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(34,68,170,0.25)' }}>
              <h2 className="text-sm font-semibold text-[#EEEEFF]">アクティビティ</h2>
              <div className="flex items-center gap-1 rounded-[8px] p-0.5" style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}>
                {(['all', 'call', 'email', 'note'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivityTab(tab)}
                    className="px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all duration-100"
                    style={
                      activityTab === tab
                        ? {
                            background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
                            color: '#FFFFFF',
                            boxShadow: '0 1px 4px rgba(34,68,170,0.4)',
                          }
                        : { color: '#99AACC' }
                    }
                  >
                    {{ all: '全件', call: 'コール', email: 'メール', note: 'ノート' }[tab]}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="px-5 py-3">
              <motion.div
                initial="hidden"
                animate="visible"
                key={activityTab}
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-2"
              >
                {filteredActivities.map(activity => (
                  <motion.div
                    key={activity.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors hover:bg-[rgba(136,187,255,0.04)]"
                  >
                    {/* Icon */}
                    <ActivityIcon type={activity.type} />

                    {/* Content (1行) */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {activity.description ? (
                        <p className="text-[13px] text-[#EEEEFF] truncate">{activity.description}</p>
                      ) : (
                        <p className="text-[13px] text-[#CCDDF0] truncate">{activity.title}</p>
                      )}
                      {activity.result && (
                        <span className="shrink-0">
                          <StatusGameBadge status={activity.result} size="sm" />
                        </span>
                      )}
                      {activity.durationSec !== undefined && activity.durationSec > 0 && (
                        <span className="text-[11px] text-[#99AACC] tabular-nums shrink-0">{formatDuration(activity.durationSec)}</span>
                      )}
                    </div>

                    {/* 日時 */}
                    <span className="text-[11px] text-[#99AACC] tabular-nums shrink-0">{formatDateTime(activity.timestamp)}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[300px] shrink-0 space-y-4">

          {/* ステータスカード */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] p-5"
            style={CARD_STYLE}
          >
            <h3 className="text-xs font-semibold text-[#99AACC] uppercase tracking-[0.06em] mb-3">
              ステータス
            </h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              <ISFieldRow label="ステータス" editable>
                <StatusSelector
                  value={contact.status}
                  onChange={v => setContact(c => ({ ...c, status: v }))}
                />
              </ISFieldRow>

              <ISFieldRow label="温度感" editable>
                <div className="relative">
                  <select
                    value={contact.signal}
                    onChange={e => setContact(c => ({ ...c, signal: e.target.value as Signal }))}
                    className="h-[28px] px-2 pr-6 text-[12px] font-bold rounded-[6px] text-[#EEEEFF] appearance-none cursor-pointer outline-none"
                    style={{ background: 'rgba(16,16,40,0.8)', border: '1px dashed rgba(136,187,255,0.4)' }}
                  >
                    {SIGNAL_OPTIONS.map(s => (
                      <option key={s} value={s}>{SIGNAL_LABEL[s]}（{s}）</option>
                    ))}
                  </select>
                </div>
              </ISFieldRow>

              <ISFieldRow label="職位" editable>
                <PersonRoleSelector
                  value={contact.personRole}
                  onChange={v => setContact(c => ({ ...c, personRole: v }))}
                />
              </ISFieldRow>

              <ISFieldRow label="部門">
                <span className="text-sm text-[#EEEEFF]">{contact.department || '—'}</span>
              </ISFieldRow>

              <ISFieldRow label="役職">
                <span className="text-sm text-[#EEEEFF]">{contact.title || '—'}</span>
              </ISFieldRow>

              <ISFieldRow label="コール試行">
                <div className="flex items-center gap-1.5 justify-end">
                  <PhoneCall size={12} className="text-[#99AACC]" />
                  <span className="text-sm font-medium text-[#EEEEFF]">{contact.callAttempts}回</span>
                </div>
              </ISFieldRow>
            </motion.div>

            {/* メモ */}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(34,68,170,0.25)' }}>
              <label className="text-[10px] font-bold text-[#88BBFF] uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1">
                メモ
                <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
              </label>
              <textarea
                value={contact.statusMemo}
                onChange={e => setContact(c => ({ ...c, statusMemo: e.target.value }))}
                placeholder="ステータスに関するメモを入力..."
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
          </motion.div>

          {/* ネクストアクション統合カード = タスクと連動 */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] p-5"
            style={CARD_STYLE}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#99AACC] uppercase tracking-[0.06em] flex items-center gap-1.5">
                <CalendarClock size={12} style={{ color: '#88BBFF' }} />
                ネクストアクション
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[9px] font-bold whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(136,187,255,0.18) 0%, rgba(85,119,221,0.12) 100%)',
                  color: '#88BBFF',
                  border: '1px solid rgba(136,187,255,0.35)',
                  boxShadow: '0 0 8px rgba(136,187,255,0.2)',
                }}
                title="このネクストアクションは自動的にタスクとして登録されます"
              >
                <CheckCircle2 size={9} />
                タスク連動
              </span>
            </div>

            {/* アクション種別 */}
            <div className="mb-3">
              <label className="text-[10px] font-bold text-[#88BBFF] uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1">
                種別
                <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
              </label>
              <NextActionSelector
                value={contact.nextAction}
                onChange={v => setContact(c => ({ ...c, nextAction: v }))}
              />
            </div>

            {/* 実施予定日 */}
            <div>
              <label className="text-[10px] font-bold text-[#88BBFF] uppercase tracking-[0.04em] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  実施予定日
                  <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
                </span>
                {contact.nextActionAt && (
                  <button
                    type="button"
                    onClick={() => setContact(c => ({ ...c, nextActionAt: null }))}
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
                  value={contact.nextActionAt ?? ''}
                  onChange={e => setContact(c => ({ ...c, nextActionAt: e.target.value || null }))}
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
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(34,68,170,0.25)' }}>
              <label className="text-[10px] font-bold text-[#88BBFF] uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1">
                メモ
                <Pencil size={9} style={{ color: '#88BBFF', opacity: 0.7 }} />
              </label>
              <textarea
                value={contact.nextActionMemo}
                onChange={e => setContact(c => ({ ...c, nextActionMemo: e.target.value }))}
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
          </motion.div>

        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <EditContactModal
            contact={contact}
            onClose={() => setShowEditModal(false)}
            onSave={updated => setContact(updated)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
