'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Phone,
  Building2,
  User,
  Target,
  Calendar,
  TrendingUp,
  Zap,
  BookOpen,
  CheckCircle2,
  PhoneCall,
  Mail,
  MessageSquare,
  Clock,
  Star,
  Plus,
  Pencil,
  X,
  Briefcase,
  Trash2,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import { RANK_CONFIG } from '@/types/crm'
import type { Rank } from '@/types/crm'

// ─── Types ─────────────────────────────────────────────────────────────────────

type DealStage =
  | 'NEW_LEAD' | 'QUALIFIED' | 'FIRST_MEETING' | 'SOLUTION_FIT'
  | 'PROPOSAL' | 'NEGOTIATION' | 'VERBAL_COMMIT' | 'CLOSED_WON' | 'CLOSED_LOST'

type DealStatus = 'アクティブ' | '優先対応' | '保留'

type ISContactStatus = '未着手' | '不通' | '不在' | '接続済み' | 'コール不可' | 'アポ獲得' | 'Next Action'

interface ISContact {
  id: string
  name: string
  title: string
  status: ISContactStatus
  callAttempts: number
  isDecisionMaker: boolean
}

type ConfidenceLevel = 'High' | 'Medium' | 'Low'

type ActivityType = 'call' | 'email' | 'note' | 'deal_advance'

interface AIField {
  label: string
  value: string | null
  confidence: ConfidenceLevel
}

interface DealDetail {
  id: string
  name: string
  company: string
  companyId: string
  contact: string
  contactId: string
  contactPhone: string
  owner: string
  rank: Rank
  stage: DealStage
  status: DealStatus
  amount: number
  probability: number
  expectedCloseAt: string | null
  updatedAt: string
}

interface StageHistoryItem {
  stage: DealStage
  date: string
  daysAgo: number
  isCurrent: boolean
}

interface ResearchBrief {
  summary: string
  approach: string[]
  questions: string[]
}

interface ActivityItem {
  id: string
  type: ActivityType
  timestamp: string
  title: string
  result?: string
  durationSec?: number
  description?: string
}

// 取引タスク
type DealTaskType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other'

interface DealTask {
  id: string
  type: DealTaskType
  title: string
  dueAt: string | null
  memo: string
  done: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DEALS: Record<string, DealDetail> = {
  'd1': {
    id: 'd1', name: '株式会社テクノリード - 2026/01/15',
    company: '株式会社テクノリード', companyId: '1',
    contact: '田中 誠', contactId: '1', contactPhone: '090-1234-5678',
    owner: '田中太郎', rank: 'A', stage: 'NEGOTIATION', status: 'アクティブ',
    amount: 4800000, probability: 80, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22',
  },
  'd2': {
    id: 'd2', name: '株式会社イノベーション - 大型案件',
    company: '株式会社イノベーション', companyId: '3',
    contact: '佐々木 拓也', contactId: '3', contactPhone: '090-3456-7890',
    owner: '田中太郎', rank: 'A', stage: 'VERBAL_COMMIT', status: '優先対応',
    amount: 6000000, probability: 90, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21',
  },
  'd3': {
    id: 'd3', name: '合同会社フューチャー - 2026/02/01',
    company: '合同会社フューチャー', companyId: '2',
    contact: '山本 佳子', contactId: '2', contactPhone: '090-2345-6789',
    owner: '鈴木花子', rank: 'A', stage: 'QUALIFIED', status: 'アクティブ',
    amount: 2400000, probability: 40, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19',
  },
  'd4': {
    id: 'd4', name: '株式会社グロース - HR導入',
    company: '株式会社グロース', companyId: '4',
    contact: '中村 理恵', contactId: '4', contactPhone: '090-4567-8901',
    owner: '佐藤次郎', rank: 'B', stage: 'QUALIFIED', status: 'アクティブ',
    amount: 900000, probability: 30, expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10',
  },
}

const DEAL_CONTACTS: Record<string, ISContact[]> = {
  'd1': [
    { id: '1', name: '田中 誠',   title: '営業部長', status: 'アポ獲得', callAttempts: 3, isDecisionMaker: false },
    { id: '9', name: '鈴木 一郎', title: 'CTO',      status: '未着手',   callAttempts: 0, isDecisionMaker: true  },
  ],
  'd2': [
    { id: '3', name: '佐々木 拓也', title: '代表取締役', status: 'Next Action', callAttempts: 2, isDecisionMaker: true },
  ],
  'd3': [
    { id: '2', name: '山本 佳子', title: 'マネージャー', status: '接続済み', callAttempts: 5, isDecisionMaker: false },
  ],
  'd4': [
    { id: '4', name: '中村 理恵', title: '購買担当', status: '不在', callAttempts: 4, isDecisionMaker: false },
  ],
}

const DEAL_STATUS_STYLE: Record<DealStatus, { bg: string; text: string; dot: string }> = {
  'アクティブ': { bg: 'rgba(52,199,89,0.1)',  text: '#1A7A35', dot: '#34C759' },
  '優先対応':   { bg: 'rgba(0,113,227,0.1)',  text: '#0060C7', dot: '#0071E3' },
  '保留':       { bg: 'rgba(34,68,170,0.15)',  text: '#88BBFF', dot: '#4466AA' },
}

const IS_STATUS_STYLE: Record<ISContactStatus, { bg: string; text: string; dot: string }> = {
  '未着手':    { bg: 'rgba(34,68,170,0.1)',   text: '#88BBFF', dot: '#4466AA' },
  '不通':      { bg: 'rgba(255,59,48,0.1)',  text: '#CF3131', dot: '#FF3B30' },
  '不在':      { bg: 'rgba(255,159,10,0.1)', text: '#C07000', dot: '#FF9F0A' },
  '接続済み':  { bg: 'rgba(0,113,227,0.1)',  text: '#0060C7', dot: '#0071E3' },
  'コール不可': { bg: 'rgba(255,59,48,0.1)', text: '#CF3131', dot: '#FF3B30' },
  'アポ獲得':  { bg: 'rgba(52,199,89,0.1)',  text: '#1A7A35', dot: '#34C759' },
  'Next Action': { bg: 'rgba(94,92,230,0.1)', text: '#4B48CC', dot: '#5E5CE6' },
}

const MOCK_AI_FIELDS: AIField[] = [
  { label: '課題',           value: 'CRM未導入による商談管理の属人化',          confidence: 'High'   },
  { label: '予算',           value: '年間500万円以内',                           confidence: 'Medium' },
  { label: '希望サービス',   value: 'CRM基本機能 + AI商談サポート',             confidence: 'High'   },
  { label: 'タイムライン',   value: '2026年4月導入希望',                         confidence: 'High'   },
  { label: '決裁者',         value: '鈴木 一郎（CTO）',                          confidence: 'Medium' },
  { label: '競合',           value: 'Salesforce, HubSpot を検討中',             confidence: 'Low'    },
  { label: '障壁',           value: '導入コストと既存システムとの連携',           confidence: 'Medium' },
  { label: '現状システム',   value: 'スプレッドシート + Slack',                  confidence: 'High'   },
  { label: '当社Next Action', value: '3/28 デモ実施 → 提案書送付',              confidence: 'High'   },
  { label: '顧客Next Action', value: '社内稟議書を4/1までに提出',                confidence: 'Medium' },
]

const MOCK_STAGE_HISTORY: StageHistoryItem[] = [
  { stage: 'NEW_LEAD',      date: '2026-01-15', daysAgo: 67, isCurrent: false },
  { stage: 'QUALIFIED',     date: '2026-01-22', daysAgo: 60, isCurrent: false },
  { stage: 'FIRST_MEETING', date: '2026-02-03', daysAgo: 48, isCurrent: false },
  { stage: 'SOLUTION_FIT',  date: '2026-02-20', daysAgo: 31, isCurrent: false },
  { stage: 'PROPOSAL',      date: '2026-03-05', daysAgo: 18, isCurrent: false },
  { stage: 'NEGOTIATION',   date: '2026-03-15', daysAgo:  8, isCurrent: true  },
]

const MOCK_RESEARCH_BRIEF: ResearchBrief = {
  summary: '株式会社テクノリードはIT・SaaS業界で150名規模の成長企業。2015年創業、近年急拡大しており営業組織の管理体制強化が急務。CFOが主導するDX推進プロジェクトの一環として営業ツール刷新を検討中。',
  approach: [
    'CTO（鈴木 一郎）を最終決裁者として早期巻き込む',
    'Salesforce比の費用対効果を具体的な数値で示す',
    '4月導入に向けた移行プランと初期サポートを提示する',
  ],
  questions: [
    '現状のスプレッドシート管理で最も困っていることは何ですか？',
    '社内稟議を通すにあたり、どんな数字やエビデンスが必要ですか？',
    'Salesforceとの比較でどのような懸念点がありますか？',
  ],
}

// ─── タスク初期モックデータ ────────────────────────────────────────────────

const INITIAL_DEAL_TASKS: Record<string, DealTask[]> = {
  'd1': [
    { id: 't-d1-1', type: 'meeting',  title: 'デモ商談実施',         dueAt: '2026-04-15', memo: '製品デモと質疑応答',          done: false },
    { id: 't-d1-2', type: 'proposal', title: '提案書送付',           dueAt: '2026-04-18', memo: '比較表と見積書を含める',        done: false },
    { id: 't-d1-3', type: 'followup', title: '導入後フォロー設計',   dueAt: '2026-04-25', memo: '初期サポート計画を準備',        done: false },
  ],
  'd2': [
    { id: 't-d2-1', type: 'call', title: '最終確認コール', dueAt: '2026-04-14', memo: '契約書ドラフト確認', done: false },
  ],
  'd3': [],
  'd4': [],
}

interface DealTaskTypeStyle {
  Icon: React.ElementType
  label: string
  gradient: string
  glow: string
}

const DEAL_TASK_TYPE_STYLES: Record<DealTaskType, DealTaskTypeStyle> = {
  call: {
    Icon: Phone, label: 'コール',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  email: {
    Icon: Mail, label: 'メール',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  meeting: {
    Icon: Briefcase, label: '商談',
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  proposal: {
    Icon: BookOpen, label: '提案書',
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  followup: {
    Icon: TrendingUp, label: 'フォロー',
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  other: {
    Icon: CheckCircle2, label: 'その他',
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
  },
}

const ALL_DEAL_TASK_TYPES: DealTaskType[] = ['call', 'email', 'meeting', 'proposal', 'followup', 'other']

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'call',  timestamp: '2026-03-20T14:32', title: 'コール — アポ獲得', result: 'アポ獲得', durationSec: 154, description: '3/28 14:00 デモ商談を設定' },
  { id: '2', type: 'deal_advance', timestamp: '2026-03-20T14:33', title: 'PROPOSAL → NEGOTIATION に進行' },
  { id: '3', type: 'email', timestamp: '2026-03-17T09:00', title: 'メール送信', description: '会社紹介資料・比較表を添付' },
  { id: '4', type: 'call',  timestamp: '2026-03-15T11:15', title: 'コール — 不在', result: '不在', durationSec: 0 },
  { id: '5', type: 'note',  timestamp: '2026-03-10T16:00', title: 'メモ', description: 'CTOが4月以降のロードマップを検討中との情報あり' },
]

// ─── Config ─────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string }> = {
  NEW_LEAD:      { label: '新規リード', color: 'text-[#CCDDF0]', bg: 'bg-[rgba(34,68,170,0.1)]' },
  QUALIFIED:     { label: '有資格',     color: 'text-[#0071E3]', bg: 'bg-[#EBF4FF]' },
  FIRST_MEETING: { label: '初回商談',   color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]' },
  SOLUTION_FIT:  { label: '課題適合',   color: 'text-[#BE185D]', bg: 'bg-[#FDF2F8]' },
  PROPOSAL:      { label: '提案',       color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]' },
  NEGOTIATION:   { label: '交渉',       color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' },
  VERBAL_COMMIT: { label: '口頭合意',   color: 'text-[#059669]', bg: 'bg-[#ECFDF5]' },
  CLOSED_WON:    { label: '受注',       color: 'text-[#059669]', bg: 'bg-[#D1FAE5]' },
  CLOSED_LOST:   { label: '失注',       color: 'text-[#CCDDF0]', bg: 'bg-[rgba(34,68,170,0.1)]' },
}

const CONFIDENCE_STYLES: Record<ConfidenceLevel, { bg: string; text: string; label: string }> = {
  High:   { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', label: 'High'   },
  Medium: { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', label: 'Medium' },
  Low:    { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]', label: 'Low'    },
}

const ACTIVITY_ICON: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  call:         { icon: PhoneCall,    color: '#0071E3', bg: '#EBF4FF' },
  email:        { icon: Mail,         color: '#7C3AED', bg: '#F5F3FF' },
  note:         { icon: MessageSquare, color: '#CCDDF0', bg: '#F5F5F7' },
  deal_advance: { icon: TrendingUp,   color: '#059669', bg: '#ECFDF5' },
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: Rank }) {
  const r = RANK_CONFIG[rank]
  return (
    <span
      className="inline-flex items-center justify-center rounded-[5px] text-[10px] font-bold shrink-0"
      style={{ width: 22, height: 22, background: r.gradient, boxShadow: r.glow, color: r.color, letterSpacing: '0.03em' }}
    >
      {rank}
    </span>
  )
}

function StatusBadge({ status }: { status: DealStatus }) {
  const s = DEAL_STATUS_STYLE[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  )
}

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage]
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const s = CONFIDENCE_STYLES[level]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
      <span className="text-[12px] text-[#99AACC] font-medium w-28 shrink-0">{label}</span>
      <div className="flex-1 text-right text-[13px] text-[#EEEEFF]">{children}</div>
    </div>
  )
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

// ─── Deal Task Modal ──────────────────────────────────────────────────────────

function DealTaskModal({ task, onClose, onSave }: {
  task: DealTask | null
  onClose: () => void
  onSave: (t: DealTask) => void
}) {
  const isEdit = !!task
  const [form, setForm] = useState<DealTask>(task ?? {
    id: `t-${Date.now()}`,
    type: 'call',
    title: '',
    dueAt: null,
    memo: '',
    done: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim(), memo: form.memo.trim() })
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
        className="relative w-full max-w-[460px] rounded-[14px] overflow-hidden"
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
          <h2 className="text-[16px] font-bold text-[#EEEEFF]">{isEdit ? 'タスク編集' : 'タスク作成'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.08)] transition-colors">
            <X size={16} className="text-[#CCDDF0]" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4">
            {/* タスク種別 */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">タスク種別</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEAL_TASK_TYPES.map(t => {
                  const s = DEAL_TASK_TYPE_STYLES[t]
                  const active = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="inline-flex items-center gap-1 px-3 h-[32px] rounded-[8px] text-[11px] font-bold transition-all"
                      style={active ? {
                        background: s.gradient,
                        boxShadow: s.glow,
                        color: '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.4)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      } : {
                        background: 'rgba(16,16,40,0.8)',
                        border: '1px solid #2244AA',
                        color: '#7799CC',
                      }}
                    >
                      <s.Icon size={11} strokeWidth={2.5} />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">
                タイトル <span className="text-[#FF8A82]">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="例: デモ商談実施"
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
              />
            </div>

            {/* 期日 */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 flex items-center justify-between">
                <span>期日</span>
                {form.dueAt && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, dueAt: null }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#99AACC] hover:text-[#FF8A82] transition-colors normal-case tracking-normal"
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <input
                type="date"
                value={form.dueAt ?? ''}
                onChange={e => setForm(f => ({ ...f, dueAt: e.target.value || null }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] outline-none cursor-pointer"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA', colorScheme: 'dark' }}
              />
            </div>

            {/* メモ */}
            <div>
              <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">メモ</label>
              <textarea
                value={form.memo}
                onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                placeholder="タスクに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[13px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none rounded-[8px] resize-none"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA' }}
              />
            </div>
          </div>

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
              {isEdit ? '保存' : '作成'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function formatDuration(sec: number): string {
  if (sec === 0) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type TabType = 'all' | 'call' | 'email' | 'note'

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { startCall } = useCallStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const deal = (MOCK_DEALS[id] ?? MOCK_DEALS['d1'])!

  // タスクの state 管理
  const [tasks, setTasks] = useState<DealTask[]>(INITIAL_DEAL_TASKS[id] ?? [])
  const [taskModal, setTaskModal] = useState<DealTask | null | 'new'>(null)

  function handleTaskSave(t: DealTask) {
    setTasks(prev => {
      const exists = prev.find(x => x.id === t.id)
      if (exists) return prev.map(x => x.id === t.id ? t : x)
      return [t, ...prev]
    })
  }
  function handleTaskDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }
  function handleTaskToggle(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const filteredActivities = activeTab === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(a => a.type === activeTab)

  const probPct = deal.probability

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div>
        <Link
          href="/deals"
          className="inline-flex items-center gap-1 text-[12px] text-[#99AACC] hover:text-[#CCDDF0] transition-colors mb-1.5"
        >
          <ChevronLeft size={13} />
          取引一覧
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em] truncate">
                {deal.name}
              </h1>
              <RankBadge rank={deal.rank} />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <StageBadge stage={deal.stage} />
              <StatusBadge status={deal.status} />
              <span className="text-[15px] font-bold text-[#EEEEFF] tabular-nums">
                ¥{(deal.amount / 1000000).toFixed(1)}M
              </span>
              <span className="text-[12px] text-[#99AACC]">確度 {deal.probability}%</span>
            </div>
          </div>

          <motion.button
            whileHover={{ filter: 'brightness(1.05)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={() => startCall({
              contactId: deal.contactId,
              contactName: deal.contact,
              company: deal.company,
              phone: deal.contactPhone,
            })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[13px] font-semibold text-white shrink-0"
            style={{
              background: '#0071E3',
              boxShadow: '0 1px 3px rgba(0,113,227,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            <Phone size={13} strokeWidth={2.5} />
            コールする
          </motion.button>
        </div>

      </div>

      {/* ── 2-Column Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Basic Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] p-5"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <h3 className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.06em] mb-1">基本情報</h3>

            <div>
              <InfoRow label="会社">
                <span
                  className="cursor-pointer hover:text-[#0071E3] transition-colors"
                  onClick={() => router.push(`/companies/${deal.companyId}`)}
                >
                  <Building2 size={11} className="inline mr-1 text-[#99AACC]" />
                  {deal.company}
                </span>
              </InfoRow>
              <InfoRow label="担当者">
                <span
                  className="cursor-pointer hover:text-[#0071E3] transition-colors"
                  onClick={() => router.push(`/contacts/${deal.contactId}`)}
                >
                  <User size={11} className="inline mr-1 text-[#99AACC]" />
                  {deal.contact}
                </span>
              </InfoRow>
              <InfoRow label="担当営業">
                <span className="flex items-center justify-end gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)', boxShadow: '0 0 14px rgba(94,92,230,0.7), 0 0 5px rgba(125,211,252,0.9), inset 0 1px 0 rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}
                  >
                    {deal.owner[0]}
                  </div>
                  {deal.owner}
                </span>
              </InfoRow>
              <InfoRow label="金額">
                <span className="font-semibold">¥{deal.amount.toLocaleString()}</span>
              </InfoRow>
              <InfoRow label="確度">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-[rgba(34,68,170,0.1)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: probPct >= 70 ? '#44FF88' : probPct >= 40 ? '#FF9F0A' : '#FF4444' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${probPct}%` }}
                      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="font-semibold tabular-nums">{deal.probability}%</span>
                </div>
              </InfoRow>
              <InfoRow label="想定クローズ">
                <span className="flex items-center justify-end gap-1">
                  <Calendar size={11} className="text-[#99AACC]" />
                  {formatDate(deal.expectedCloseAt)}
                </span>
              </InfoRow>
              <InfoRow label="ステータス">
                <div className="flex justify-end">
                  <StatusBadge status={deal.status} />
                </div>
              </InfoRow>
            </div>
          </motion.div>

          {/* AI Fields Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <Zap size={13} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">AIフィールド</h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'rgba(0,113,227,0.1)', color: '#0071E3' }}
              >
                <Zap size={9} />
                AI Generated
              </span>
            </div>

            <motion.div
              className="divide-y"
              style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {MOCK_AI_FIELDS.map((field, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 5 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="flex items-start gap-3 px-5 py-3"
                  style={{ borderBottom: i < MOCK_AI_FIELDS.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                >
                  <span className="text-[12px] text-[#99AACC] w-[100px] shrink-0 pt-0.5 leading-tight">
                    {field.label}
                  </span>
                  <span className="flex-1 text-[13px] text-[#EEEEFF] leading-relaxed">
                    {field.value ?? <span className="text-[#99AACC]">— AI未収集</span>}
                  </span>
                  <div className="shrink-0 pt-0.5">
                    <ConfidenceBadge level={field.confidence} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-0 px-5 py-0" style={{ borderBottom: '1px solid #2244AA' }}>
              {([
                { key: 'all', label: '全件' },
                { key: 'call', label: 'コール' },
                { key: 'email', label: 'メール' },
                { key: 'note', label: 'ノート' },
              ] as { key: TabType; label: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-3 py-3 text-[13px] font-medium transition-colors duration-100 ${
                    activeTab === tab.key ? 'text-[#0071E3]' : 'text-[#CCDDF0] hover:text-[#EEEEFF]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="deal-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: '#0071E3' }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div className="p-5">
              {filteredActivities.length === 0 ? (
                <p className="text-center text-[13px] text-[#99AACC] py-6">活動記録がありません</p>
              ) : (
                <motion.div
                  className="relative"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                  {/* Vertical line */}
                  <div
                    className="absolute left-[14px] top-4 bottom-4 w-px"
                    style={{ background: 'rgba(34,68,170,0.15)' }}
                  />

                  <div className="space-y-4">
                    {filteredActivities.map((activity) => {
                      const cfg = ACTIVITY_ICON[activity.type]
                      const Icon = cfg.icon
                      return (
                        <motion.div
                          key={activity.id}
                          variants={{
                            hidden: { opacity: 0, x: -8 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          className="flex gap-3 pl-1"
                        >
                          {/* Icon dot */}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 relative z-10"
                            style={{ background: cfg.bg }}
                          >
                            <Icon size={13} style={{ color: cfg.color }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-medium text-[#EEEEFF] tracking-[-0.01em]">
                                {activity.title}
                              </span>
                              {activity.result && (
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                                  style={{ background: 'rgba(34,68,170,0.15)', color: '#CCDDF0' }}
                                >
                                  {activity.result}
                                </span>
                              )}
                              {activity.durationSec !== undefined && activity.durationSec > 0 && (
                                <span className="flex items-center gap-0.5 text-[11px] text-[#99AACC]">
                                  <Clock size={10} />
                                  {formatDuration(activity.durationSec)}
                                </span>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-[12px] text-[#CCDDF0] mt-0.5">{activity.description}</p>
                            )}
                            <p className="text-[11px] text-[#99AACC] mt-1">{formatTimestamp(activity.timestamp)}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* IS Contact List Card */}
          {(DEAL_CONTACTS[id] ?? []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0c1028] rounded-[8px] overflow-hidden"
              style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
                <Phone size={13} className="text-[#0071E3] shrink-0" />
                <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">コンタクト（IS）</h3>
                <span
                  className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(0,113,227,0.1)', color: '#0071E3' }}
                >
                  {(DEAL_CONTACTS[id] ?? []).length}
                </span>
              </div>

              {/* Contact rows */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {(DEAL_CONTACTS[id] ?? []).map((contact, i) => {
                  const ss = IS_STATUS_STYLE[contact.status]
                  return (
                    <motion.div
                      key={contact.id}
                      variants={{
                        hidden: { opacity: 0, y: 5 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[rgba(136,187,255,0.04)] transition-colors"
                      style={{ borderBottom: i < (DEAL_CONTACTS[id] ?? []).length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                      onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)', boxShadow: '0 0 14px rgba(94,92,230,0.7), 0 0 5px rgba(125,211,252,0.9), inset 0 1px 0 rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}
                      >
                        {contact.name[0]}
                      </div>

                      {/* Name & title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13px] font-medium text-[#EEEEFF] tracking-[-0.01em]">{contact.name}</span>
                          {contact.isDecisionMaker && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold"
                              style={{ background: 'rgba(255,159,10,0.12)', color: '#FFC266' }}
                            >
                              <Star size={8} strokeWidth={2.5} />
                              決裁者
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#99AACC] mt-0.5">{contact.title}</p>
                      </div>

                      {/* Status badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                        style={{ background: ss.bg, color: ss.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ss.dot }} />
                        {contact.status}
                      </span>

                      {/* Call attempts */}
                      <span className="flex items-center gap-1 text-[11px] text-[#99AACC] shrink-0">
                        <Phone size={10} />
                        {contact.callAttempts}回
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Add contact link */}
              <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(34,68,170,0.2)' }}>
                <button className="flex items-center gap-1.5 text-[12px] text-[#0071E3] hover:text-[#7AB4FF] transition-colors font-medium">
                  <Plus size={12} strokeWidth={2.5} />
                  コンタクトを追加
                </button>
              </div>
            </motion.div>
          )}

          {/* タスクカード */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <CheckCircle2 size={13} className="text-[#88BBFF] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">タスク</h3>
              <span
                className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(136,187,255,0.15)', color: '#88BBFF' }}
              >
                {tasks.length}
              </span>
              <button
                onClick={() => setTaskModal('new')}
                className="ml-auto inline-flex items-center gap-1 px-3 h-[28px] rounded-[8px] text-[11px] font-bold transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
                  color: '#FFFFFF',
                  border: '1px solid #3355CC',
                  boxShadow: '0 2px 6px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.2)',
                }}
              >
                <Plus size={11} strokeWidth={2.5} />
                タスク作成
              </button>
            </div>

            {/* Task rows */}
            {tasks.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12px] text-[#99AACC]">タスクが登録されていません</p>
                <button
                  onClick={() => setTaskModal('new')}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#88BBFF] hover:text-[#7AB4FF] transition-colors"
                >
                  <Plus size={11} strokeWidth={2.5} />
                  最初のタスクを作成
                </button>
              </div>
            ) : (
              <div>
                {tasks.map((task, i) => {
                  const cfg = DEAL_TASK_TYPE_STYLES[task.type]
                  const Icon = cfg.Icon
                  const dueDate = task.dueAt ? new Date(task.dueAt) : null
                  const isOverdue = dueDate && !task.done && dueDate < new Date('2026-04-12')
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgba(136,187,255,0.04)] group"
                      style={{ borderBottom: i < tasks.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                    >
                      {/* チェックボックス */}
                      <button
                        onClick={() => handleTaskToggle(task.id)}
                        className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: task.done ? 'linear-gradient(135deg, #6EE7B7, #34C759)' : 'rgba(16,16,40,0.8)',
                          border: task.done ? '1px solid rgba(255,255,255,0.4)' : '1px solid #3355AA',
                          boxShadow: task.done ? '0 0 8px rgba(52,199,89,0.5)' : 'none',
                        }}
                      >
                        {task.done && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                      </button>

                      {/* タイプアイコン */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: cfg.gradient,
                          boxShadow: cfg.glow,
                          border: '1.5px solid rgba(255,255,255,0.4)',
                          opacity: task.done ? 0.45 : 1,
                        }}
                      >
                        <Icon
                          size={14}
                          style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
                          strokeWidth={2.5}
                        />
                      </div>

                      {/* タイトル + メモ */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-[13px] font-medium truncate"
                            style={{
                              color: task.done ? '#7799CC' : '#EEEEFF',
                              textDecoration: task.done ? 'line-through' : 'none',
                            }}
                          >
                            {task.title}
                          </p>
                          {task.dueAt && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[4px] text-[10px] font-bold tabular-nums whitespace-nowrap shrink-0"
                              style={{
                                background: isOverdue ? 'rgba(255,59,48,0.18)' : 'rgba(136,187,255,0.10)',
                                color: isOverdue ? '#FF8A82' : '#88BBFF',
                                border: isOverdue ? '1px solid rgba(255,59,48,0.4)' : '1px solid rgba(136,187,255,0.25)',
                                boxShadow: isOverdue ? '0 0 8px rgba(255,59,48,0.3)' : 'none',
                              }}
                            >
                              <Calendar size={9} strokeWidth={2.5} />
                              {formatDate(task.dueAt)}
                            </span>
                          )}
                        </div>
                        {task.memo && (
                          <p className="text-[11px] text-[#99AACC] truncate mt-0.5">{task.memo}</p>
                        )}
                      </div>

                      {/* 操作ボタン */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setTaskModal(task)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[rgba(136,187,255,0.10)] transition-colors"
                          title="編集"
                        >
                          <Pencil size={12} className="text-[#88BBFF]" />
                        </button>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[rgba(255,59,48,0.12)] transition-colors"
                          title="削除"
                        >
                          <Trash2 size={12} className="text-[#FF8A82]" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[288px] shrink-0 flex flex-col gap-4">

          {/* Research Brief */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <BookOpen size={13} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">リサーチ Brief</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.04em] mb-1.5">企業サマリー</p>
                <p className="text-[12.5px] text-[#EEEEFF] leading-relaxed">{MOCK_RESEARCH_BRIEF.summary}</p>
              </div>

              {/* Approach */}
              <div>
                <p className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.04em] mb-1.5">推奨アプローチ</p>
                <div className="space-y-1.5">
                  {MOCK_RESEARCH_BRIEF.approach.map((item, i) => (
                    <div key={i} className="flex gap-2 text-[12.5px] text-[#EEEEFF]">
                      <span className="text-[#0071E3] shrink-0 font-semibold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div>
                <p className="text-[12px] font-semibold text-[#99AACC] uppercase tracking-[0.04em] mb-1.5">ヒアリング質問</p>
                <div className="space-y-2">
                  {MOCK_RESEARCH_BRIEF.questions.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <span
                        className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(0,113,227,0.1)', color: '#0071E3' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-[12px] text-[#EEEEFF] leading-relaxed flex-1">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stage History */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <Target size={13} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">ステージ履歴</h3>
            </div>

            <motion.div
              className="p-3 space-y-0.5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {MOCK_STAGE_HISTORY.map((item, i) => {
                const cfg = STAGE_CONFIG[item.stage]
                return (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -8 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-[7px]"
                    style={item.isCurrent ? {
                      background: 'rgba(0,113,227,0.06)',
                      borderLeft: '2px solid #0071E3',
                    } : {}}
                  >
                    {item.isCurrent
                      ? <CheckCircle2 size={13} style={{ color: '#0071E3' }} className="shrink-0" />
                      : <div className="w-[13px] h-[13px] rounded-full border border-[rgba(0,0,0,0.12)] shrink-0" />
                    }
                    <span className={`text-[12px] flex-1 ${item.isCurrent ? 'font-semibold text-[#0071E3]' : 'text-[#CCDDF0]'}`}>
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <p className="text-[11px] text-[#99AACC]">{item.daysAgo}日前</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {taskModal !== null && (
          <DealTaskModal
            task={taskModal === 'new' ? null : taskModal}
            onClose={() => setTaskModal(null)}
            onSave={handleTaskSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
