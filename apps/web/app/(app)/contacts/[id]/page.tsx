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
  FileEdit,
  Search,
  Megaphone,
  Share2,
  Calendar,
  UserCheck,
  PhoneOutgoing,
  Send,
  Handshake,
  Inbox,
  HelpCircle,
  PencilLine,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import type { ApproachStatus } from '@/types/crm'
import { GoogleTimeline } from '@/components/google/google-timeline'

// ─── Liquid Obsidian Status Chip ───────────────────────────────────────────────
// 全ステータスバッジは「薄い同色背景 + ●ドット + 同色文字」の統一フォーマット。
// グラデや glow / borderColor / textShadow は使わない。

interface ObsChipStyle {
  bg: string
  fg: string
}

const STATUS_OBS_STYLES: Record<ApproachStatus, ObsChipStyle> = {
  '未着手':     { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
  '不通':       { bg: 'rgba(255,107,107,0.14)', fg: 'var(--color-obs-hot)' },
  '不在':       { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  '接続済み':   { bg: 'rgba(126,198,255,0.14)', fg: 'var(--color-obs-low)' },
  'コール不可': { bg: 'rgba(255,107,107,0.14)', fg: 'var(--color-obs-hot)' },
  'アポ獲得':   { bg: 'rgba(74,217,138,0.14)',  fg: '#4ad98a' },
}

function StatusObsBadge({ status, size = 'md' }: { status: ApproachStatus; size?: 'sm' | 'md' }) {
  const s = STATUS_OBS_STYLES[status] ?? STATUS_OBS_STYLES['未着手']
  const fontSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 h-5 rounded-full font-medium tracking-[-0.005em] whitespace-nowrap ${fontSize}`}
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.fg }} />
      {status}
    </span>
  )
}

// ─── Local RANK_CONFIG (角度 - A/B/C/プラス/設定なし) ────────────────────────
// Liquid Obsidian: グラデ・発光は廃止、フラットチップ(背景α=0.14 + 同色文字)
// A → primary系 / B → low系 / C → muted neutral / プラス → middle系 / 設定なし → neutral

interface RankStyle {
  bg: string
  fg: string
}

const RANK_CONFIG: Record<'A' | 'B' | 'C' | 'プラス' | '設定なし', RankStyle> = {
  A:        { bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
  B:        { bg: 'rgba(126,198,255,0.14)', fg: 'var(--color-obs-low)' },
  C:        { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
  'プラス': { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  '設定なし': { bg: 'rgba(143,140,144,0.10)', fg: 'var(--color-obs-text-subtle)' },
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

type NextActionValue = 'メール' | 'コール' | '連絡待ち' | 'ナーチャリング' | '除外' | 'その他' | null
type PersonRole = '決裁者' | '推進者' | '一般'

// 角度 — A / B / C / プラス / 設定なし
type ContactRank = 'A' | 'B' | 'C' | 'プラス' | null

// リード経由元（チャネル種別）
type LeadSourceType =
  | 'manual'
  | 'web_form'
  | 'organic_search'
  | 'paid_ads'
  | 'sns'
  | 'event'
  | 'referral'
  | 'cold_call'
  | 'cold_mail'
  | 'partner'
  | 'inbound'
  | 'other'

interface LeadSource {
  type: LeadSourceType
  detail: string
}

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
  status: ApproachStatus
  statusMemo: string
  nextAction: NextActionValue
  nextActionMemo: string
  callAttempts: number
  lastCallAt: string | null
  nextActionAt: string | null
  personRole: PersonRole
  leadSource: LeadSource
}

// ─── Lead Source Style ─────────────────────────────────────────────────────────
// Liquid Obsidian: 全タイプ共通の薄い neutral surface 下地 + アイコンの色のみ意味で変化。
// テキストは text-muted、ゴーストアウトラインなし。

interface LeadSourceStyle {
  Icon: React.ElementType
  label: string
  // チップ背景 (全タイプ共通: 薄い neutral)
  chipBg: string
  // アイコンの色 (種別判別)
  iconFg: string
  // テキスト色 (全タイプ共通: muted)
  fg: string
}

// 全タイプ共通: surface-high 相当の薄い neutral 下地 + ラベルは muted 統一
const LEAD_SOURCE_CHIP_BG = 'rgba(143,140,144,0.10)'
const LEAD_SOURCE_FG = 'var(--color-obs-text-muted)'

const LEAD_SOURCE_STYLES: Record<LeadSourceType, LeadSourceStyle> = {
  manual:         { Icon: PencilLine,    label: '手動作成',         chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-muted)',  fg: LEAD_SOURCE_FG },
  web_form:       { Icon: FileEdit,      label: 'Webフォーム',      chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
  organic_search: { Icon: Search,        label: '自然検索',         chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
  paid_ads:       { Icon: Megaphone,     label: '広告経由',         chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-primary)',     fg: LEAD_SOURCE_FG },
  sns:            { Icon: Share2,        label: 'SNS',              chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
  event:          { Icon: Calendar,      label: '展示会・イベント', chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-middle)',      fg: LEAD_SOURCE_FG },
  referral:       { Icon: UserCheck,     label: '紹介',             chipBg: LEAD_SOURCE_CHIP_BG, iconFg: '#4ad98a',                      fg: LEAD_SOURCE_FG },
  cold_call:      { Icon: PhoneOutgoing, label: '新規コール',       chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
  cold_mail:      { Icon: Send,          label: '新規メール',       chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
  partner:        { Icon: Handshake,     label: 'パートナー',       chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
  inbound:        { Icon: Inbox,         label: '問い合わせ',       chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-low)',         fg: LEAD_SOURCE_FG },
  other:          { Icon: HelpCircle,    label: 'その他',           chipBg: LEAD_SOURCE_CHIP_BG, iconFg: 'var(--color-obs-text-subtle)', fg: LEAD_SOURCE_FG },
}

const ALL_LEAD_SOURCE_TYPES: LeadSourceType[] = [
  'manual',
  'web_form',
  'organic_search',
  'paid_ads',
  'sns',
  'event',
  'referral',
  'cold_call',
  'cold_mail',
  'partner',
  'inbound',
  'other',
]

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Record<string, ContactDetail> = {
  '1': {
    id: '1', name: '田中 誠', title: '営業部長', department: '営業部',
    company: '株式会社テクノリード', companyId: '1',
    email: 'tanaka@techno-lead.co.jp', phone: '03-1234-5678',
    rank: 'A', status: 'アポ獲得', statusMemo: '3/28 14:00 商談設定済み。Google Meet URL送付済み。',
    nextAction: null, nextActionMemo: '',
    callAttempts: 3, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28',
    personRole: '決裁者',
    leadSource: { type: 'manual', detail: '' },
  },
  '2': {
    id: '2', name: '山本 佳子', title: 'マネージャー', department: '購買部',
    company: '合同会社フューチャー', companyId: '2',
    email: 'yamamoto@future-llc.jp', phone: '06-2345-6789',
    rank: 'A', status: '接続済み', statusMemo: '初回コンタクト完了。提案資料の希望あり。',
    nextAction: null, nextActionMemo: '',
    callAttempts: 5, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22',
    personRole: '推進者',
    leadSource: { type: 'event', detail: '2026年Q1 SaaSWORLD出展時に名刺交換' },
  },
  '3': {
    id: '3', name: '佐々木 拓也', title: '事業企画 部長', department: '経営企画部',
    company: '株式会社ノヴァソリューションズ', companyId: '3',
    email: 'sasaki@nova-solutions.jp', phone: '03-3456-7890',
    rank: 'B', status: '未着手', statusMemo: '紹介元(株式会社グロース)から「決裁ライン直結」と聞いている。',
    nextAction: 'コール', nextActionMemo: '',
    callAttempts: 0, lastCallAt: null, nextActionAt: '2026-04-25',
    personRole: '決裁者',
    leadSource: { type: 'referral', detail: '既存顧客（株式会社グロース）からの紹介' },
  },
  '4': {
    id: '4', name: '中村 理恵', title: 'マーケティング マネージャー', department: 'マーケティング部',
    company: '株式会社ブライトワークス', companyId: '4',
    email: 'nakamura@brightworks.co.jp', phone: '03-4567-8901',
    rank: 'A', status: '接続済み', statusMemo: 'SFA切り替え検討中。現行はSalesforce、Q2中の比較検討と明言。',
    nextAction: 'メール', nextActionMemo: '比較資料(機能差分 + 料金)を送付予定',
    callAttempts: 2, lastCallAt: '2026-04-18', nextActionAt: '2026-04-23',
    personRole: '推進者',
    leadSource: { type: 'paid_ads', detail: 'Google広告 (キーワード: SFA 切替)' },
  },
}

// ─── Person Role Style (Liquid Obsidian flat chip) ────────────────────────────

const PERSON_ROLE_STYLES: Record<PersonRole, ObsChipStyle> = {
  '決裁者': { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  '推進者': { bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
  '一般':   { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
}

const ALL_PERSON_ROLES: PersonRole[] = ['決裁者', '推進者', '一般']

// ─── Next Action Style (Liquid Obsidian flat chip) ────────────────────────────

const NEXT_ACTION_STYLES: Record<Exclude<NextActionValue, null>, ObsChipStyle> = {
  'メール':       { bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
  'コール':       { bg: 'rgba(126,198,255,0.14)', fg: 'var(--color-obs-low)' },
  '連絡待ち':     { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  'ナーチャリング': { bg: 'rgba(74,217,138,0.14)',  fg: '#4ad98a' },
  '除外':         { bg: 'rgba(255,107,107,0.14)', fg: 'var(--color-obs-hot)' },
  'その他':       { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
}

const ALL_NEXT_ACTIONS: Exclude<NextActionValue, null>[] = ['メール', 'コール', '連絡待ち', 'ナーチャリング', '除外', 'その他']

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

// ─── Style Constants (Liquid Obsidian) ─────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-obs-surface-high)',
  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12), 0 2px 12px rgba(0,0,0,0.35)',
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
// Liquid Obsidian: 単色フラット背景 + lucide アイコン1色。グラデ・発光・borderはなし。
// 種別判別はアイコン形状とアイコン色 (意味色) の差で確保。

interface ActivityIconStyle {
  Icon: React.ElementType
  bg: string
  iconColor: string
}

function getActivityIconStyle(type: ActivityType): ActivityIconStyle {
  if (type === 'call') {
    return {
      Icon: PhoneCall,
      bg: 'rgba(126,198,255,0.14)',
      iconColor: 'var(--color-obs-low)',
    }
  }
  if (type === 'email') {
    return {
      Icon: Mail,
      bg: 'rgba(171,199,255,0.14)',
      iconColor: 'var(--color-obs-primary)',
    }
  }
  if (type === 'note') {
    return {
      Icon: MessageSquare,
      bg: 'rgba(143,140,144,0.14)',
      iconColor: 'var(--color-obs-text-muted)',
    }
  }
  // deal_advance などのシステムイベント
  return {
    Icon: TrendingUp,
    bg: 'var(--color-obs-surface-high)',
    iconColor: 'var(--color-obs-text-subtle)',
  }
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const s = getActivityIconStyle(type)
  const Icon = s.Icon
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: s.bg }}
    >
      <Icon size={15} style={{ color: s.iconColor }} strokeWidth={2} />
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
  const active = hover || open

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
        style={{
          background: active ? 'rgba(171,199,255,0.10)' : 'var(--color-obs-surface-high)',
          boxShadow: active ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
        }}
        title="クリックして変更"
      >
        <StatusObsBadge status={value} />
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{
            color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
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
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {STATUS_OPTIONS.map(s => {
                const style = STATUS_OBS_STYLES[s]
                const selected = s === value
                return (
                  <button
                    key={s}
                    onClick={e => { e.stopPropagation(); onChange(s); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                    style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                  >
                    <span
                      className="rounded-full shrink-0"
                      style={{ width: 6, height: 6, backgroundColor: style.fg }}
                    />
                    {s}
                    {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
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
  const active = hover || open

  const renderBadge = () => {
    if (!value) {
      const fg = 'var(--color-obs-primary)'
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap"
          style={{ backgroundColor: 'rgba(171,199,255,0.14)', color: fg }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fg }} />
          未設定
        </span>
      )
    }
    const s = NEXT_ACTION_STYLES[value]
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap"
        style={{ backgroundColor: s.bg, color: s.fg }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.fg }} />
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
          background: active ? 'rgba(171,199,255,0.10)' : 'transparent',
          boxShadow: active ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
        }}
        title="クリックして変更"
      >
        {renderBadge()}
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{
            color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
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
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {ALL_NEXT_ACTIONS.map(a => {
                const style = NEXT_ACTION_STYLES[a]
                const selected = a === value
                return (
                  <button
                    key={a}
                    onClick={e => { e.stopPropagation(); onChange(a); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                    style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                  >
                    <span
                      className="rounded-full shrink-0"
                      style={{ width: 6, height: 6, backgroundColor: style.fg }}
                    />
                    {a}
                    {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
                  </button>
                )
              })}
              <div className="mx-2 my-1 h-px" style={{ background: 'var(--color-obs-surface-low)' }} />
              <button
                onClick={e => { e.stopPropagation(); onChange(null); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                style={{ color: value === null ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)', fontWeight: value === null ? 600 : 500 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-obs-primary)' }}
                />
                未設定
                {value === null && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── LeadSourceSelector (リード経由元) ────────────────────────────────────────
// チップ(タイプ) + フリーテキスト(detail) の 2 段構成。
// チップをクリックすると種別ドロップダウン、テキストをクリックするとインライン編集。

function LeadSourceTypeChip({ type }: { type: LeadSourceType }) {
  const s = LEAD_SOURCE_STYLES[type]
  const Icon = s.Icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap"
      style={{
        backgroundColor: s.chipBg,
        color: s.fg,
      }}
    >
      <Icon size={11} strokeWidth={2.2} style={{ color: s.iconFg }} />
      {s.label}
    </span>
  )
}

function LeadSourceSelector({ value, onChange }: {
  value: LeadSource
  onChange: (v: LeadSource) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  const active = hover || open

  return (
    <div className="flex items-start max-w-full">
      {/* タイプチップ + ドロップダウン（detail表示は廃止） */}
      <div className="relative">
        <button
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="inline-flex items-center gap-1 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
          style={{
            background: active ? 'rgba(171,199,255,0.10)' : 'transparent',
            boxShadow: active ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
          }}
          title="クリックして経由元の種別を変更"
        >
          <LeadSourceTypeChip type={value.type} />
          <ChevronDown
            size={12}
            className="transition-transform"
            style={{
              color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
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
                className="absolute top-full left-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[200px]"
                style={{
                  background: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
                }}
              >
                {ALL_LEAD_SOURCE_TYPES.map(t => {
                  const s = LEAD_SOURCE_STYLES[t]
                  const Icon = s.Icon
                  const selected = t === value.type
                  return (
                    <button
                      key={t}
                      onClick={e => { e.stopPropagation(); onChange({ ...value, type: t }); setOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                      style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                    >
                      <Icon size={12} style={{ color: s.iconFg }} strokeWidth={2.2} />
                      {s.label}
                      {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
                    </button>
                  )
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
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
  const active = hover || open

  return (
    <div className="relative inline-block">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap transition-all cursor-pointer"
        style={{
          backgroundColor: s.bg,
          color: s.fg,
          boxShadow: active ? 'inset 0 0 0 1px rgba(109,106,111,0.18)' : 'none',
        }}
        title="クリックして変更"
      >
        <Star size={10} style={{ color: s.fg, opacity: 0.85 }} fill="currentColor" />
        {value}
        <ChevronDown size={11} style={{ color: s.fg, opacity: 0.7 }} />
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
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {ALL_PERSON_ROLES.map(r => {
                const selected = r === value
                const rs = PERSON_ROLE_STYLES[r]
                return (
                  <button
                    key={r}
                    onClick={e => { e.stopPropagation(); onChange(r); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                    style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                  >
                    <Star size={11} style={{ color: rs.fg, opacity: 0.85 }} fill="currentColor" />
                    {r}
                    {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
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

  const inputBaseStyle: React.CSSProperties = {
    background: 'var(--color-obs-surface-low)',
    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
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
          background: 'var(--color-obs-surface-highest)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.12)' }}
        >
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>コンタクト編集</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-[rgba(171,199,255,0.08)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 氏名 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                氏名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none transition-all"
                style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
              />
            </div>

            {/* 部署 + 役職 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  部署
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                  style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
                />
              </div>
              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  役職
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                  style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
                />
              </div>
            </div>

            {/* メール */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                メールアドレス
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
              />
            </div>

            {/* 電話 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                電話番号
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
              />
            </div>

            {/* 角度 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
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
                      className="inline-flex items-center gap-1.5 px-3 h-[36px] rounded-[8px] text-[12px] font-medium transition-all"
                      style={active ? {
                        backgroundColor: cfg.bg,
                        color: cfg.fg,
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      } : {
                        background: 'var(--color-obs-surface-low)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? cfg.fg : 'var(--color-obs-text-subtle)' }} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ステータス */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                ステータス
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as ApproachStatus }))}
                  className="w-full h-[36px] px-3 pr-8 text-[13px] rounded-[8px] appearance-none cursor-pointer outline-none"
                  style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                />
              </div>
            </div>

            {/* 職位 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
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
                      className="flex-1 inline-flex items-center justify-center gap-1 h-[36px] rounded-[8px] text-[12px] font-medium transition-all"
                      style={active ? {
                        backgroundColor: style.bg,
                        color: style.fg,
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      } : {
                        background: 'var(--color-obs-surface-low)',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      <Star size={11} style={{ color: active ? style.fg : 'currentColor', opacity: active ? 0.85 : 0.6 }} fill={active ? 'currentColor' : 'none'} />
                      {r}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-2 px-5 py-4"
            style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.12)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 text-[13px] font-medium rounded-[8px] transition-colors hover:bg-[var(--color-obs-surface-high)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="h-[36px] px-5 text-[13px] font-semibold rounded-[8px] transition-all hover:brightness-106"
              style={{
                background: 'var(--color-obs-primary-container)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
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

function ISFieldRow({
  label,
  children,
  editable,
  vertical,
}: {
  label: string
  children: React.ReactNode
  editable?: boolean
  vertical?: boolean
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={
        vertical
          ? 'flex flex-col gap-1.5 py-2.5'
          : 'flex items-center justify-between gap-3 py-2.5'
      }
      style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}
    >
      <span
        className={`text-[11px] inline-flex items-center gap-1 ${vertical ? '' : 'shrink-0 w-24'}`}
        style={{
          color: editable ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
        {editable && <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />}
      </span>
      <div className={vertical ? 'w-full' : 'text-right min-w-0 flex-1'}>{children}</div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { startCall } = useCallStore()

  const initialContact = MOCK_CONTACTS[id] ?? MOCK_CONTACTS['1']!
  const [contact, setContact] = useState<ContactDetail>(initialContact)
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

  const nestedInputStyle: React.CSSProperties = {
    background: 'var(--color-obs-surface-low)',
    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
  }

  return (
    <div className="space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/contacts"
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          <ChevronLeft size={15} />
          コンタクト一覧
        </Link>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ filter: 'brightness(1.06)' }}
          onClick={handleCall}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-[9px] transition-all"
          style={{
            background: 'var(--color-obs-primary-container)',
            color: 'var(--color-obs-on-primary)',
            boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
          }}
        >
          <Phone size={15} strokeWidth={2.4} />
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
            <div className="flex items-center gap-4">
              {/* Avatar — primary→primary_container グラデ1種のみ、シャドウ・グロウなし */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                }}
              >
                <span className="text-[17px] font-semibold" style={{ color: 'var(--color-obs-on-primary)' }}>{contact.name[0]}</span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {/* 1行目: 氏名 + 職位チップ */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className="text-[20px] font-semibold tracking-[-0.02em] leading-none"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {contact.name}
                  </h1>
                  <PersonRoleSelector
                    value={contact.personRole}
                    onChange={v => setContact(c => ({ ...c, personRole: v }))}
                  />
                </div>

                {/* 2行目: 会社 → 部門 → 役職（軽い区切りで横整列） */}
                <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
                  <Link
                    href={`/companies/${contact.companyId}`}
                    className="inline-flex items-center gap-1.5 font-medium transition-colors hover:!text-[color:var(--color-obs-primary)]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    <Building2 size={12} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    {contact.company}
                  </Link>
                  {(contact.department || contact.title) && (
                    <span style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.6 }}>·</span>
                  )}
                  {contact.department && (
                    <span style={{ color: 'var(--color-obs-text-muted)' }}>{contact.department}</span>
                  )}
                  {contact.department && contact.title && (
                    <span style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.5 }}>/</span>
                  )}
                  {contact.title && (
                    <span style={{ color: 'var(--color-obs-text-muted)' }}>{contact.title}</span>
                  )}
                </div>
              </div>

              {/* 編集ボタン (Ghost) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-[8px] shrink-0 transition-colors hover:bg-[var(--color-obs-surface-high)]"
                style={{
                  background: 'transparent',
                  color: 'var(--color-obs-text-muted)',
                }}
                title="コンタクトを編集"
              >
                <Pencil size={12} strokeWidth={2.2} />
                編集
              </motion.button>
            </div>

            {/* Contact Details */}
            <div
              className="flex items-center gap-4 mt-4 pt-4"
              style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.15)' }}
            >
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-sm transition-colors hover:!text-[color:var(--color-obs-primary)]"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <Mail size={13} />
                {contact.email}
              </a>
              <span className="w-px h-3" style={{ background: 'rgba(109,106,111,0.25)' }} />
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-sm transition-colors hover:!text-[color:var(--color-obs-primary)]"
                style={{ color: 'var(--color-obs-text-muted)' }}
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
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.15)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-obs-text)' }}>アクティビティ</h2>
              <div
                className="flex items-center gap-1 rounded-[8px] p-0.5"
                style={{
                  background: 'var(--color-obs-surface-low)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              >
                {(['all', 'call', 'email', 'note'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivityTab(tab)}
                    className="px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all duration-100"
                    style={
                      activityTab === tab
                        ? {
                            background: 'var(--color-obs-surface-highest)',
                            color: 'var(--color-obs-text)',
                          }
                        : { color: 'var(--color-obs-text-muted)' }
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors hover:bg-[rgba(171,199,255,0.05)]"
                  >
                    {/* Icon */}
                    <ActivityIcon type={activity.type} />

                    {/* Content (1行) */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {activity.description ? (
                        <p className="text-[13px] truncate" style={{ color: 'var(--color-obs-text)' }}>{activity.description}</p>
                      ) : (
                        <p className="text-[13px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>{activity.title}</p>
                      )}
                      {activity.result && (
                        <span className="shrink-0">
                          <StatusObsBadge status={activity.result} size="sm" />
                        </span>
                      )}
                      {activity.durationSec !== undefined && activity.durationSec > 0 && (
                        <span
                          className="text-[11px] tabular-nums shrink-0"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {formatDuration(activity.durationSec)}
                        </span>
                      )}
                    </div>

                    {/* 日時 */}
                    <span
                      className="text-[11px] tabular-nums shrink-0"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* ─── Google 連携タイムライン（メール/会議） ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] overflow-hidden"
            style={CARD_STYLE}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.15)' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                Gmail / Meet 履歴
              </h2>
            </div>
            <div className="px-5 py-4">
              <GoogleTimeline scope="contact" id={id} />
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
            <h3
              className="text-xs font-semibold uppercase tracking-[0.06em] mb-3"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
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

              <ISFieldRow label="リード経由元" editable vertical>
                <LeadSourceSelector
                  value={contact.leadSource}
                  onChange={v => setContact(c => ({ ...c, leadSource: v }))}
                />
              </ISFieldRow>

              <ISFieldRow label="コール試行">
                <div className="flex items-center gap-1.5 justify-end">
                  <PhoneCall size={12} style={{ color: 'var(--color-obs-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-obs-text)' }}>{contact.callAttempts}回</span>
                </div>
              </ISFieldRow>
            </motion.div>

            {/* メモ */}
            <div
              className="mt-4 pt-3"
              style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.15)' }}
            >
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                メモ
                <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
              </label>
              <textarea
                value={contact.statusMemo}
                onChange={e => setContact(c => ({ ...c, statusMemo: e.target.value }))}
                placeholder="ステータスに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[12px] outline-none rounded-[8px] resize-none transition-all"
                style={{ ...nestedInputStyle, color: 'var(--color-obs-text)' }}
                onFocus={e => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
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
              <h3
                className="text-xs font-semibold uppercase tracking-[0.06em] flex items-center gap-1.5"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <CalendarClock size={12} style={{ color: 'var(--color-obs-primary)' }} />
                ネクストアクション
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[9px] font-semibold whitespace-nowrap"
                style={{
                  background: 'rgba(171,199,255,0.12)',
                  color: 'var(--color-obs-primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.3)',
                }}
                title="このネクストアクションは自動的にタスクとして登録されます"
              >
                <CheckCircle2 size={9} />
                タスク連動
              </span>
            </div>

            {/* アクション種別 */}
            <div className="mb-3">
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                種別
                <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
              </label>
              <NextActionSelector
                value={contact.nextAction}
                onChange={v => setContact(c => ({ ...c, nextAction: v }))}
              />
            </div>

            {/* 実施予定日 */}
            <div>
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center justify-between"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                <span className="flex items-center gap-1">
                  実施予定日
                  <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
                </span>
                {contact.nextActionAt && (
                  <button
                    type="button"
                    onClick={() => setContact(c => ({ ...c, nextActionAt: null }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold transition-colors normal-case tracking-normal hover:!text-[color:var(--color-obs-hot)]"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                    title="日付をクリア"
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <div
                className="relative rounded-[8px] transition-all"
                style={nestedInputStyle}
              >
                <input
                  type="date"
                  value={contact.nextActionAt ?? ''}
                  onChange={e => setContact(c => ({ ...c, nextActionAt: e.target.value || null }))}
                  className="w-full h-[36px] px-3 pr-9 text-[13px] font-medium outline-none bg-transparent cursor-pointer"
                  style={{ colorScheme: 'dark', color: 'var(--color-obs-text)' }}
                  onFocus={e => {
                    e.currentTarget.parentElement!.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.parentElement!.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                  }}
                />
                <Pencil
                  size={11}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                />
              </div>
            </div>

            {/* メモ */}
            <div
              className="mt-3 pt-3"
              style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.15)' }}
            >
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                メモ
                <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
              </label>
              <textarea
                value={contact.nextActionMemo}
                onChange={e => setContact(c => ({ ...c, nextActionMemo: e.target.value }))}
                placeholder="次回アクションに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[12px] outline-none rounded-[8px] resize-none transition-all"
                style={{ ...nestedInputStyle, color: 'var(--color-obs-text)' }}
                onFocus={e => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
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
