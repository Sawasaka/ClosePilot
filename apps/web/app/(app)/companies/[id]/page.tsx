'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Building2,
  Phone,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  TrendingUp,
  Edit3,
  Plus,
  X,
  Star,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useCallStore } from '@/lib/stores/callStore'
import { STATUS_STYLES, RANK_CONFIG } from '@/types/crm'
import type { Rank, ApproachStatus } from '@/types/crm'

// ─── Types ─────────────────────────────────────────────────────────────────────

type DealStage =
  | 'NEW_LEAD' | 'QUALIFIED' | 'FIRST_MEETING' | 'SOLUTION_FIT'
  | 'PROPOSAL' | 'NEGOTIATION' | 'VERBAL_COMMIT' | 'CLOSED_WON' | 'CLOSED_LOST'

interface CompanyDetail {
  id: string
  name: string
  domain: string
  rank: Rank
  score: number
  industry: string
  owner: string
  phone: string
  address: string
  employeeCount: number
  foundedYear: number
  lastCallAt: string | null
}

interface RelatedContact {
  id: string
  name: string
  title: string
  status: ApproachStatus
  phone: string
  isDecisionMaker: boolean
}

interface RelatedDeal {
  id: string
  name: string
  stage: DealStage
  amount: number
  probability: number
}

interface ScoreBreakdownItem {
  label: string
  detail: string
  points: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_COMPANIES: Record<string, CompanyDetail> = {
  '1': { id: '1', name: '株式会社テクノリード', domain: 'techno-lead.co.jp', rank: 'A', score: 8.5, industry: 'IT・SaaS', owner: '田中太郎', phone: '03-1234-5678', address: '東京都渋谷区', employeeCount: 150, foundedYear: 2015, lastCallAt: '2026-03-20' },
  '2': { id: '2', name: '合同会社フューチャー', domain: 'future-llc.jp', rank: 'A', score: 7.2, industry: '製造業', owner: '鈴木花子', phone: '06-2345-6789', address: '大阪府大阪市', employeeCount: 80, foundedYear: 2012, lastCallAt: '2026-03-19' },
  '3': { id: '3', name: '株式会社イノベーション', domain: 'innovation-corp.jp', rank: 'A', score: 6.8, industry: 'コンサル', owner: '田中太郎', phone: '03-3456-7890', address: '東京都千代田区', employeeCount: 200, foundedYear: 2010, lastCallAt: '2026-03-18' },
}

const MOCK_CONTACTS: Record<string, RelatedContact[]> = {
  '1': [
    { id: '1', name: '田中 誠', title: '営業部長', status: 'アポ獲得', phone: '090-1234-5678', isDecisionMaker: false },
    { id: '9', name: '鈴木 一郎', title: 'CTO', status: '未着手', phone: '090-9876-5432', isDecisionMaker: true },
  ],
  '2': [
    { id: '2', name: '山本 佳子', title: 'マネージャー', status: '接続済み', phone: '090-2345-6789', isDecisionMaker: false },
  ],
  '3': [
    { id: '3', name: '佐々木 拓也', title: '代表取締役', status: 'Next Action', phone: '090-3456-7890', isDecisionMaker: true },
  ],
}

const MOCK_DEALS: Record<string, RelatedDeal[]> = {
  '1': [
    { id: 'd1', name: '株式会社テクノリード - 2026/01/15', stage: 'NEGOTIATION', amount: 4800000, probability: 80 },
  ],
  '2': [
    { id: 'd3', name: '合同会社フューチャー - 2026/02/01', stage: 'QUALIFIED', amount: 2400000, probability: 40 },
  ],
  '3': [
    { id: 'd2', name: '株式会社イノベーション - 大型案件', stage: 'VERBAL_COMMIT', amount: 6000000, probability: 90 },
    { id: 'd5', name: '株式会社イノベーション - 初回', stage: 'FIRST_MEETING', amount: 3600000, probability: 50 },
  ],
}

const MOCK_SCORE_BREAKDOWN: ScoreBreakdownItem[] = [
  { label: '直近コール', detail: '3/20 田中 誠との通話', points: 15 },
  { label: 'メール開封', detail: '会社紹介資料メール', points: 5 },
  { label: '資料DL', detail: '製品カタログPDF', points: 10 },
  { label: '商談進行', detail: '初回商談 → 交渉', points: 20 },
  { label: 'Sランクボーナス', detail: 'スコア自動加算', points: 30 },
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

const RANK_BAR_COLOR: Record<Rank, string> = {
  A: '#FF3B30', B: '#FFD60A', C: '#32ADE6',
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

function StatusBadge({ status }: { status: ApproachStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      {status}
    </span>
  )
}

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <span className="text-[12px] text-[#AEAEB2] font-medium">{label}</span>
      <div className="text-[13px] text-[#1D1D1F]">{children}</div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { startCall } = useCallStore()
  const [companyCategory, setCompanyCategory] = useState<'パートナー企業' | 'ダイレクト企業'>('ダイレクト企業')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddDeal, setShowAddDeal] = useState(false)

  useEffect(() => {
    const handler = () => setShowAddContact(true)
    window.addEventListener('header-action', handler)
    return () => window.removeEventListener('header-action', handler)
  }, [])

  const company = MOCK_COMPANIES[id]
  const contacts = MOCK_CONTACTS[id] ?? []
  const deals = MOCK_DEALS[id] ?? []
  const scoreTotal = MOCK_SCORE_BREAKDOWN.reduce((s, i) => s + i.points, 0)

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#AEAEB2] text-sm">企業が見つかりません</p>
      </div>
    )
  }

  const scorePct = (company.score / 10) * 100

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1 text-[12px] text-[#AEAEB2] hover:text-[#6E6E73] transition-colors"
          >
            <ChevronLeft size={13} />
            企業一覧
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
              {company.name}
            </h1>
            <RankBadge rank={company.rank} />
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[#1D1D1F]">{company.score.toFixed(1)}</span>
              <span className="text-[12px] text-[#AEAEB2]">/ 10</span>
            </div>
          </div>
          <p className="text-[13px] text-[#6E6E73]">{company.industry} · {company.address}</p>
        </div>

      </div>

      {/* ── 2-Column Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Company Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] p-5"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${RANK_BAR_COLOR[company.rank]}22, ${RANK_BAR_COLOR[company.rank]}44)` }}
              >
                <Building2 size={22} style={{ color: RANK_BAR_COLOR[company.rank] }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.02em]">{company.name}</h2>
              </div>
              {/* Score bar + Edit */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: RANK_BAR_COLOR[company.rank] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePct}%` }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-[#1D1D1F] tabular-nums">{company.score.toFixed(1)}</span>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium text-[#6E6E73] hover:bg-[rgba(0,0,0,0.06)] transition-colors"
                  style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <Edit3 size={11} />
                  編集
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-0">
              <InfoRow label="区分">{companyCategory}</InfoRow>
              <div />
              <InfoRow label="業種">{company.industry}</InfoRow>
              <div />
              <InfoRow label="電話番号">
                <span className="flex items-center gap-1">
                  <Phone size={11} className="text-[#AEAEB2]" />
                  {company.phone}
                </span>
              </InfoRow>
              <InfoRow label="所在地">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-[#AEAEB2]" />
                  {company.address}
                </span>
              </InfoRow>
              <InfoRow label="従業員数">
                <span className="flex items-center gap-1">
                  <Users size={11} className="text-[#AEAEB2]" />
                  {company.employeeCount}名
                </span>
              </InfoRow>
              <InfoRow label="設立年">
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-[#AEAEB2]" />
                  {company.foundedYear}年
                </span>
              </InfoRow>
            </div>

          </motion.div>

          {/* Related Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">コンタクト</h3>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.06)', color: '#6E6E73' }}
                >
                  {contacts.length}名
                </span>
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#0071E3] hover:text-[#0060C7] transition-colors"
              >
                <Plus size={12} />
                追加
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {contacts.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[#AEAEB2]">コンタクトなし</div>
              ) : (
                contacts.map(contact => (
                  <motion.div
                    key={contact.id}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-center gap-3 px-5 py-3.5 last:border-0 group"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white"
                      style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}
                    >
                      {contact.name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[13px] font-medium text-[#1D1D1F] tracking-[-0.01em] cursor-pointer hover:text-[#0071E3] transition-colors"
                          onClick={() => router.push(`/contacts/${contact.id}`)}
                        >
                          {contact.name}
                        </span>
                        {contact.isDecisionMaker && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706]">
                            <Star size={9} />
                            決裁者
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#AEAEB2] mt-0.5">{contact.title}</p>
                    </div>

                    {/* Status */}
                    <StatusBadge status={contact.status} />

                    {/* Call CTA */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => startCall({
                        contactId: contact.id,
                        contactName: contact.name,
                        company: company.name,
                        phone: contact.phone,
                      })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0"
                      style={{ background: '#0071E3', boxShadow: '0 1px 3px rgba(0,113,227,0.3)' }}
                    >
                      <Phone size={11} strokeWidth={2.5} />
                      コール
                    </motion.button>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>

          {/* Related Deals */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">取引</h3>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.06)', color: '#6E6E73' }}
                >
                  {deals.length}件
                </span>
              </div>
              <button
                onClick={() => setShowAddDeal(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#0071E3] hover:text-[#0060C7] transition-colors"
              >
                <Plus size={12} />
                追加
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {deals.length === 0 ? (
                <div className="py-8 text-center text-[13px] text-[#AEAEB2]">取引なし</div>
              ) : (
                deals.map(deal => (
                  <motion.div
                    key={deal.id}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="flex items-center gap-3 px-5 py-3.5 last:border-0 cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(0,0,0,0.05)' }}
                    >
                      <Briefcase size={13} className="text-[#6E6E73]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1D1D1F] truncate tracking-[-0.01em]">{deal.name}</p>
                      <p className="text-[11.5px] text-[#AEAEB2] mt-0.5">確度 {deal.probability}%</p>
                    </div>
                    <StageBadge stage={deal.stage} />
                    <span className="text-[13px] font-semibold text-[#1D1D1F] tabular-nums shrink-0">
                      ¥{(deal.amount / 1000000).toFixed(1)}M
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[288px] shrink-0 flex flex-col gap-4">

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <TrendingUp size={14} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#1D1D1F] tracking-[-0.01em]">スコア内訳</h3>
            </div>

            <motion.div
              className="p-4 space-y-0"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {MOCK_SCORE_BREAKDOWN.map((item, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="flex items-center gap-2 py-2"
                  style={{ borderBottom: i < MOCK_SCORE_BREAKDOWN.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1D1D1F]">{item.label}</p>
                    <p className="text-[11px] text-[#AEAEB2] truncate">{item.detail}</p>
                  </div>
                  <span className="text-[12px] font-semibold shrink-0" style={{ color: '#34C759' }}>
                    +{item.points}pts
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.016)' }}
            >
              <span className="text-[12px] text-[#6E6E73]">合計スコア</span>
              <span className="text-[15px] font-bold text-[#1D1D1F] tabular-nums">{scoreTotal}pts</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Edit Company Modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <ModalWrapper onClose={() => setShowEditModal(false)} title="企業情報を編集">
            <div className="space-y-3">
              <ModalField label="企業名" defaultValue={company.name} />
              <ModalField label="業種" defaultValue={company.industry} />
              <ModalField label="電話番号" defaultValue={company.phone} />
              <ModalField label="所在地" defaultValue={company.address} />
              <ModalField label="従業員数" defaultValue={String(company.employeeCount)} />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowEditModal(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)]">キャンセル</button>
              <button onClick={() => setShowEditModal(false)} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}>
                保存
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ── Add Contact Modal ── */}
      <AnimatePresence>
        {showAddContact && (
          <ModalWrapper onClose={() => setShowAddContact(false)} title="コンタクトを追加">
            <div className="space-y-3">
              <ModalField label="氏名" placeholder="田中 誠" required />
              <ModalField label="役職" placeholder="営業部長" />
              <ModalField label="電話番号" placeholder="090-1234-5678" />
              <ModalField label="メールアドレス" placeholder="tanaka@example.com" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAddContact(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)]">キャンセル</button>
              <button onClick={() => setShowAddContact(false)} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}>
                追加
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ── Add Deal Modal ── */}
      <AnimatePresence>
        {showAddDeal && (
          <ModalWrapper onClose={() => setShowAddDeal(false)} title="取引を追加">
            <div className="space-y-3">
              <ModalField label="取引名" placeholder="株式会社テクノリード - 新規案件" required />
              <ModalField label="金額" placeholder="1000000" />
              <ModalField label="確度（%）" placeholder="50" />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAddDeal(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)]">キャンセル</button>
              <button onClick={() => setShowAddDeal(false)} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}>
                追加
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Shared Modal Components ────────────────────────────────────────────────

function ModalWrapper({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative w-[440px] rounded-[16px] p-6 bg-white"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(0,0,0,0.05)]"><X size={16} style={{ color: '#8E8E93' }} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function ModalField({ label, defaultValue, placeholder, required }: { label: string; defaultValue?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">
        {label} {required && <span className="text-[#FF3B30]">*</span>}
      </label>
      <input
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none"
        style={{ background: 'rgba(0,0,0,0.04)' }}
      />
    </div>
  )
}
