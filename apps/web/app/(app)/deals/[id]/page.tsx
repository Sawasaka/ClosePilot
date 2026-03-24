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
  AlertTriangle,
  Zap,
  BookOpen,
  CheckCircle2,
  PhoneCall,
  Mail,
  MessageSquare,
  Clock,
  Star,
  Plus,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import { RANK_CONFIG } from '@/types/crm'
import type { Rank } from '@/types/crm'

// ─── Types ─────────────────────────────────────────────────────────────────────

type DealStage =
  | 'NEW_LEAD' | 'QUALIFIED' | 'FIRST_MEETING' | 'SOLUTION_FIT'
  | 'PROPOSAL' | 'NEGOTIATION' | 'VERBAL_COMMIT' | 'CLOSED_WON' | 'CLOSED_LOST'

type DealStatus = 'アクティブ' | '優先対応' | '停滞中' | '保留'

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
  stalled: boolean
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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DEALS: Record<string, DealDetail> = {
  'd1': {
    id: 'd1', name: '株式会社テクノリード - 2026/01/15',
    company: '株式会社テクノリード', companyId: '1',
    contact: '田中 誠', contactId: '1', contactPhone: '090-1234-5678',
    owner: '田中太郎', rank: 'A', stage: 'NEGOTIATION', status: 'アクティブ',
    amount: 4800000, probability: 80, stalled: false, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22',
  },
  'd2': {
    id: 'd2', name: '株式会社イノベーション - 大型案件',
    company: '株式会社イノベーション', companyId: '3',
    contact: '佐々木 拓也', contactId: '3', contactPhone: '090-3456-7890',
    owner: '田中太郎', rank: 'A', stage: 'VERBAL_COMMIT', status: '優先対応',
    amount: 6000000, probability: 90, stalled: false, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21',
  },
  'd3': {
    id: 'd3', name: '合同会社フューチャー - 2026/02/01',
    company: '合同会社フューチャー', companyId: '2',
    contact: '山本 佳子', contactId: '2', contactPhone: '090-2345-6789',
    owner: '鈴木花子', rank: 'A', stage: 'QUALIFIED', status: 'アクティブ',
    amount: 2400000, probability: 40, stalled: false, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19',
  },
  'd4': {
    id: 'd4', name: '株式会社グロース - HR導入',
    company: '株式会社グロース', companyId: '4',
    contact: '中村 理恵', contactId: '4', contactPhone: '090-4567-8901',
    owner: '佐藤次郎', rank: 'B', stage: 'QUALIFIED', status: '停滞中',
    amount: 900000, probability: 30, stalled: true, expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10',
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
  '停滞中':     { bg: 'rgba(255,159,10,0.1)', text: '#C07000', dot: '#FF9F0A' },
  '保留':       { bg: 'rgba(0,0,0,0.06)',     text: '#6E6E73', dot: '#AEAEB2' },
}

const IS_STATUS_STYLE: Record<ISContactStatus, { bg: string; text: string; dot: string }> = {
  '未着手':    { bg: 'rgba(0,0,0,0.05)',     text: '#6E6E73', dot: '#AEAEB2' },
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

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'call',  timestamp: '2026-03-20T14:32', title: 'コール — アポ獲得', result: 'アポ獲得', durationSec: 154, description: '3/28 14:00 デモ商談を設定' },
  { id: '2', type: 'deal_advance', timestamp: '2026-03-20T14:33', title: 'PROPOSAL → NEGOTIATION に進行' },
  { id: '3', type: 'email', timestamp: '2026-03-17T09:00', title: 'メール送信', description: '会社紹介資料・比較表を添付' },
  { id: '4', type: 'call',  timestamp: '2026-03-15T11:15', title: 'コール — 不在', result: '不在', durationSec: 0 },
  { id: '5', type: 'note',  timestamp: '2026-03-10T16:00', title: 'メモ', description: 'CTOが4月以降のロードマップを検討中との情報あり' },
]

// ─── Config ─────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string }> = {
  NEW_LEAD:      { label: '新規リード', color: 'text-[#6E6E73]', bg: 'bg-[#F5F5F7]' },
  QUALIFIED:     { label: '有資格',     color: 'text-[#0071E3]', bg: 'bg-[#EBF4FF]' },
  FIRST_MEETING: { label: '初回商談',   color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]' },
  SOLUTION_FIT:  { label: '課題適合',   color: 'text-[#BE185D]', bg: 'bg-[#FDF2F8]' },
  PROPOSAL:      { label: '提案',       color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]' },
  NEGOTIATION:   { label: '交渉',       color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' },
  VERBAL_COMMIT: { label: '口頭合意',   color: 'text-[#059669]', bg: 'bg-[#ECFDF5]' },
  CLOSED_WON:    { label: '受注',       color: 'text-[#059669]', bg: 'bg-[#D1FAE5]' },
  CLOSED_LOST:   { label: '失注',       color: 'text-[#6E6E73]', bg: 'bg-[#F5F5F7]' },
}

const CONFIDENCE_STYLES: Record<ConfidenceLevel, { bg: string; text: string; label: string }> = {
  High:   { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', label: 'High'   },
  Medium: { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', label: 'Medium' },
  Low:    { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]', label: 'Low'    },
}

const ACTIVITY_ICON: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  call:         { icon: PhoneCall,    color: '#0071E3', bg: '#EBF4FF' },
  email:        { icon: Mail,         color: '#7C3AED', bg: '#F5F3FF' },
  note:         { icon: MessageSquare, color: '#6E6E73', bg: '#F5F5F7' },
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
    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <span className="text-[12px] text-[#AEAEB2] font-medium w-28 shrink-0">{label}</span>
      <div className="flex-1 text-right text-[13px] text-[#1D1D1F]">{children}</div>
    </div>
  )
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
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
          className="inline-flex items-center gap-1 text-[12px] text-[#AEAEB2] hover:text-[#6E6E73] transition-colors mb-1.5"
        >
          <ChevronLeft size={13} />
          取引一覧
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em] truncate">
                {deal.name}
              </h1>
              <RankBadge rank={deal.rank} />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <StageBadge stage={deal.stage} />
              <StatusBadge status={deal.status} />
              <span className="text-[15px] font-bold text-[#1D1D1F] tabular-nums">
                ¥{(deal.amount / 1000000).toFixed(1)}M
              </span>
              <span className="text-[12px] text-[#AEAEB2]">確度 {deal.probability}%</span>
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

        {/* Stalled banner */}
        <AnimatePresence>
          {deal.stalled && (
            <motion.div
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 flex items-center gap-2.5 px-4 py-3 rounded-[8px]"
              style={{ background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.25)' }}
            >
              <AlertTriangle size={14} style={{ color: '#FF9F0A' }} className="shrink-0" />
              <p className="text-[13px] font-medium" style={{ color: '#D97706' }}>
                この商談は停滞中です — 14日以上活動がありません
              </p>
            </motion.div>
          )}
        </AnimatePresence>
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
            className="bg-white rounded-[12px] p-5"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <h3 className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-[0.06em] mb-1">基本情報</h3>

            <div>
              <InfoRow label="会社">
                <span
                  className="cursor-pointer hover:text-[#0071E3] transition-colors"
                  onClick={() => router.push(`/companies/${deal.companyId}`)}
                >
                  <Building2 size={11} className="inline mr-1 text-[#AEAEB2]" />
                  {deal.company}
                </span>
              </InfoRow>
              <InfoRow label="担当者">
                <span
                  className="cursor-pointer hover:text-[#0071E3] transition-colors"
                  onClick={() => router.push(`/contacts/${deal.contactId}`)}
                >
                  <User size={11} className="inline mr-1 text-[#AEAEB2]" />
                  {deal.contact}
                </span>
              </InfoRow>
              <InfoRow label="担当営業">
                <span className="flex items-center justify-end gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}
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
                  <div className="w-20 h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: probPct >= 70 ? '#34C759' : probPct >= 40 ? '#FF9F0A' : '#FF3B30' }}
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
                  <Calendar size={11} className="text-[#AEAEB2]" />
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
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Zap size={13} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">AIフィールド</h3>
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
                  style={{ borderBottom: i < MOCK_AI_FIELDS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  <span className="text-[12px] text-[#AEAEB2] w-[100px] shrink-0 pt-0.5 leading-tight">
                    {field.label}
                  </span>
                  <span className="flex-1 text-[13px] text-[#1D1D1F] leading-relaxed">
                    {field.value ?? <span className="text-[#AEAEB2]">— AI未収集</span>}
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
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-0 px-5 py-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
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
                    activeTab === tab.key ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
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
                <p className="text-center text-[13px] text-[#AEAEB2] py-6">活動記録がありません</p>
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
                    style={{ background: 'rgba(0,0,0,0.06)' }}
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
                              <span className="text-[13px] font-medium text-[#1D1D1F] tracking-[-0.01em]">
                                {activity.title}
                              </span>
                              {activity.result && (
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                                  style={{ background: 'rgba(0,0,0,0.06)', color: '#6E6E73' }}
                                >
                                  {activity.result}
                                </span>
                              )}
                              {activity.durationSec !== undefined && activity.durationSec > 0 && (
                                <span className="flex items-center gap-0.5 text-[11px] text-[#AEAEB2]">
                                  <Clock size={10} />
                                  {formatDuration(activity.durationSec)}
                                </span>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-[12px] text-[#6E6E73] mt-0.5">{activity.description}</p>
                            )}
                            <p className="text-[11px] text-[#AEAEB2] mt-1">{formatTimestamp(activity.timestamp)}</p>
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
              className="bg-white rounded-[12px] overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Phone size={13} className="text-[#0071E3] shrink-0" />
                <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">コンタクト（IS）</h3>
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
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[rgba(0,0,0,0.02)] transition-colors"
                      style={{ borderBottom: i < (DEAL_CONTACTS[id] ?? []).length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                      onClick={() => router.push(`/contacts/${contact.id}`)}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}
                      >
                        {contact.name[0]}
                      </div>

                      {/* Name & title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13px] font-medium text-[#1D1D1F] tracking-[-0.01em]">{contact.name}</span>
                          {contact.isDecisionMaker && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold"
                              style={{ background: 'rgba(255,159,10,0.12)', color: '#C07000' }}
                            >
                              <Star size={8} strokeWidth={2.5} />
                              決裁者
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#AEAEB2] mt-0.5">{contact.title}</p>
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
                      <span className="flex items-center gap-1 text-[11px] text-[#AEAEB2] shrink-0">
                        <Phone size={10} />
                        {contact.callAttempts}回
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Add contact link */}
              <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <button className="flex items-center gap-1.5 text-[12px] text-[#0071E3] hover:text-[#0060C7] transition-colors font-medium">
                  <Plus size={12} strokeWidth={2.5} />
                  コンタクトを追加
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[288px] shrink-0 flex flex-col gap-4">

          {/* Research Brief */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <BookOpen size={13} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">リサーチ Brief</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-[0.04em] mb-1.5">企業サマリー</p>
                <p className="text-[12.5px] text-[#1D1D1F] leading-relaxed">{MOCK_RESEARCH_BRIEF.summary}</p>
              </div>

              {/* Approach */}
              <div>
                <p className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-[0.04em] mb-1.5">推奨アプローチ</p>
                <div className="space-y-1.5">
                  {MOCK_RESEARCH_BRIEF.approach.map((item, i) => (
                    <div key={i} className="flex gap-2 text-[12.5px] text-[#1D1D1F]">
                      <span className="text-[#0071E3] shrink-0 font-semibold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div>
                <p className="text-[12px] font-semibold text-[#AEAEB2] uppercase tracking-[0.04em] mb-1.5">ヒアリング質問</p>
                <div className="space-y-2">
                  {MOCK_RESEARCH_BRIEF.questions.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <span
                        className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'rgba(0,113,227,0.1)', color: '#0071E3' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-[12px] text-[#1D1D1F] leading-relaxed flex-1">{q}</p>
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
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Target size={13} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">ステージ履歴</h3>
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
                    <span className={`text-[12px] flex-1 ${item.isCurrent ? 'font-semibold text-[#0071E3]' : 'text-[#6E6E73]'}`}>
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <p className="text-[11px] text-[#AEAEB2]">{item.daysAgo}日前</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
