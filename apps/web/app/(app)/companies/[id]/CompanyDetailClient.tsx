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
import { RANK_CONFIG } from '@/types/crm'
import type { Rank, ApproachStatus } from '@/types/crm'
import { StatusGameBadge } from '@/components/ui/GameBadge'

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

interface StageGameStyle {
  label: string
  gradient: string
  glow: string
  color: string
  borderColor: string
  textShadow: string
}

const STAGE_CONFIG: Record<DealStage, StageGameStyle> = {
  NEW_LEAD: {
    label: '新規リード',
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E', borderColor: 'rgba(255,255,255,0.35)', textShadow: 'none',
  },
  QUALIFIED: {
    label: '有資格',
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  FIRST_MEETING: {
    label: '初回商談',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(50,20,100,0.6)',
  },
  SOLUTION_FIT: {
    label: '課題適合',
    gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 35%, #EC4899 70%, #BE185D 100%)',
    glow: '0 0 14px rgba(236,72,153,0.85), 0 0 5px rgba(251,207,232,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(110,15,60,0.6)',
  },
  PROPOSAL: {
    label: '提案',
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  NEGOTIATION: {
    label: '交渉',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  VERBAL_COMMIT: {
    label: '口頭合意',
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  CLOSED_WON: {
    label: '受注',
    gradient: 'linear-gradient(135deg, #FDE68A 0%, #FBBF24 30%, #F59E0B 65%, #D97706 100%)',
    glow: '0 0 18px rgba(245,158,11,0.95), 0 0 6px rgba(253,230,138,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00', borderColor: 'rgba(255,255,255,0.4)', textShadow: 'none',
  },
  CLOSED_LOST: {
    label: '失注',
    gradient: 'linear-gradient(135deg, #6B6B70 0%, #48484A 35%, #2C2C2E 70%, #1C1C1E 100%)',
    glow: '0 0 12px rgba(174,174,178,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    color: '#AABBDD', borderColor: 'rgba(174,174,178,0.4)', textShadow: 'none',
  },
}

const RANK_BAR_COLOR: Record<Rank, string> = {
  A: '#FF3B30', B: '#FFD60A', C: '#32ADE6',
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: Rank }) {
  const r = RANK_CONFIG[rank]
  return (
    <span
      className="inline-flex items-center justify-center rounded-[6px] text-[11px] font-black shrink-0"
      style={{
        width: 26,
        height: 26,
        background: r.gradient,
        boxShadow: r.glow,
        color: r.color,
        border: '1px solid rgba(255,255,255,0.25)',
        textShadow: r.color === '#fff' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
        letterSpacing: '0.04em',
      }}
    >
      {rank}
    </span>
  )
}

function StatusBadge({ status }: { status: ApproachStatus }) {
  return <StatusGameBadge status={status} />
}

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage]
  return (
    <span
      className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{
        background: cfg.gradient,
        boxShadow: cfg.glow,
        color: cfg.color,
        border: `1px solid ${cfg.borderColor}`,
        textShadow: cfg.textShadow,
        letterSpacing: '0.01em',
      }}
    >
      {cfg.label}
    </span>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
      <span className="text-[12px] text-[#99AACC] font-medium">{label}</span>
      <div className="text-[13px] text-[#EEEEFF]">{children}</div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InitialCompanyData = Record<string, any> | null

export default function CompanyDetailClient({
  id,
  initialData,
}: {
  id: string
  initialData: InitialCompanyData
}) {
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

  // ── 初期データからマッピング（SSRで渡される） ──
  function mapToCompanyDetail(data: Record<string, unknown> | null): CompanyDetail | null {
    if (!data) return null
    const companyIntents = (data.companyIntents as Array<{ intentLevel: string; latestSignalAt: string | null }> | undefined) ?? []
    const topIntent = companyIntents[0]
    const rank: Rank =
      topIntent?.intentLevel === 'HOT' ? 'A' :
      topIntent?.intentLevel === 'MIDDLE' ? 'B' :
      topIntent?.intentLevel === 'LOW' ? 'C' : 'D'
    const score =
      topIntent?.intentLevel === 'HOT' ? 8.5 :
      topIntent?.intentLevel === 'MIDDLE' ? 6.0 :
      topIntent?.intentLevel === 'LOW' ? 4.0 : 2.0
    let domain = ''
    const websiteUrl = data.websiteUrl as string | null
    if (websiteUrl) {
      try {
        const u = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
        domain = u.hostname.replace(/^www\./, '')
      } catch {
        domain = websiteUrl
      }
    }
    const addrParts = [data.prefecture, data.city, data.address].filter(Boolean)
    return {
      id,
      name: String(data.name ?? ''),
      domain,
      rank,
      score,
      industry: (data.industry as { name?: string } | null)?.name ?? 'その他',
      owner: '未割当',
      phone: (data.representativePhone as string | null) ?? '-',
      address: addrParts.join('') || '-',
      employeeCount: parseInt(String(data.employeeCount ?? '').replace(/[^\d]/g, '') || '0', 10),
      foundedYear: 0,
      lastCallAt: topIntent?.latestSignalAt ?? null,
    }
  }

  // 初期データ（SSR）でStateを埋める → ローディング状態ゼロで即描画
  const [realCompany, setRealCompany] = useState<CompanyDetail | null>(() => mapToCompanyDetail(initialData))
  const [realRaw, setRealRaw] = useState<Record<string, unknown> | null>(() => initialData)
  const [realOffices, setRealOffices] = useState<Array<{ name: string; officeType: string; prefecture: string | null; city: string | null; address: string | null; phone: string | null; isPrimary: boolean }>>(() => (initialData?.offices as never) ?? [])
  const [realDepartments, setRealDepartments] = useState<Array<{ name: string; departmentType: string | null; phone: string | null; email: string | null; contactPersonName: string | null; contactPersonTitle: string | null; headcount: string | null }>>(() => (initialData?.departments as never) ?? [])
  const [realIntentSignals, setRealIntentSignals] = useState<Array<{ id: string; title: string; signalType: string; source: string; sourceUrl: string; publishedAt: string | null; departmentType: string | null }>>(() => (initialData?.intentSignals as never) ?? [])
  const [realCompanyIntents, setRealCompanyIntents] = useState<Array<{ intentLevel: string; departmentType: string; signalCount: number; latestSignalAt: string | null }>>(() => (initialData?.companyIntents as never) ?? [])
  const [realLoading, setRealLoading] = useState(!initialData)

  // 初期データが無い場合のみクライアント側でfetch（フォールバック）
  useEffect(() => {
    if (initialData) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/company-master/${id}`)
        if (!res.ok) {
          if (!cancelled) setRealLoading(false)
          return
        }
        const data = await res.json() as Record<string, unknown>
        if (cancelled) return
        setRealCompany(mapToCompanyDetail(data))
        setRealOffices((data.offices as never) ?? [])
        setRealDepartments((data.departments as never) ?? [])
        setRealIntentSignals((data.intentSignals as never) ?? [])
        setRealCompanyIntents((data.companyIntents as never) ?? [])
        setRealRaw(data)
      } catch {
        // ignore
      } finally {
        if (!cancelled) setRealLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const company = realCompany ?? MOCK_COMPANIES[id]
  const contacts = MOCK_CONTACTS[id] ?? []
  const deals = MOCK_DEALS[id] ?? []
  const scoreTotal = MOCK_SCORE_BREAKDOWN.reduce((s, i) => s + i.points, 0)

  if (!company) {
    if (realLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[rgba(136,187,255,0.2)] border-t-[#88BBFF] animate-spin" />
          <p className="text-[#99AACC] text-sm">企業情報を読み込み中…</p>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#99AACC] text-sm">企業が見つかりません</p>
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
            className="inline-flex items-center gap-1 text-[12px] text-[#99AACC] hover:text-[#CCDDF0] transition-colors"
          >
            <ChevronLeft size={13} />
            企業一覧
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[22px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">
              {company.name}
            </h1>
            <RankBadge rank={company.rank} />
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[#EEEEFF]">{company.score.toFixed(1)}</span>
              <span className="text-[12px] text-[#99AACC]">/ 10</span>
            </div>
          </div>
          <p className="text-[13px] text-[#CCDDF0]">{company.industry} · {company.address}</p>
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
            className="bg-[#0c1028] rounded-[8px] p-5"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${RANK_BAR_COLOR[company.rank]}22, ${RANK_BAR_COLOR[company.rank]}44)` }}
              >
                <Building2 size={22} style={{ color: RANK_BAR_COLOR[company.rank] }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-[#EEEEFF] tracking-[-0.02em]">{company.name}</h2>
              </div>
              {/* Score bar + Edit */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-[rgba(34,68,170,0.1)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: RANK_BAR_COLOR[company.rank] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scorePct}%` }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-[#EEEEFF] tabular-nums">{company.score.toFixed(1)}</span>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium text-[#CCDDF0] hover:bg-[rgba(136,187,255,0.06)] transition-colors"
                  style={{ border: '1px solid #2244AA' }}
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
                  <Phone size={11} className="text-[#99AACC]" />
                  {company.phone}
                </span>
              </InfoRow>
              <InfoRow label="所在地">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-[#99AACC]" />
                  {company.address}
                </span>
              </InfoRow>
              <InfoRow label="従業員数">
                <span className="flex items-center gap-1">
                  <Users size={11} className="text-[#99AACC]" />
                  {company.employeeCount}名
                </span>
              </InfoRow>
              <InfoRow label="設立年">
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-[#99AACC]" />
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
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">コンタクト</h3>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,68,170,0.15)', color: '#CCDDF0' }}
                >
                  {contacts.length}名
                </span>
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#0071E3] hover:text-[#7AB4FF] transition-colors"
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
                <div className="py-8 text-center text-[13px] text-[#99AACC]">コンタクトなし</div>
              ) : (
                contacts.map(contact => (
                  <motion.div
                    key={contact.id}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-center gap-3 px-5 py-3.5 last:border-0 group"
                    style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white"
                      style={{ background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)', boxShadow: '0 0 14px rgba(94,92,230,0.7), 0 0 5px rgba(125,211,252,0.9), inset 0 1px 0 rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      {contact.name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-[13px] font-medium text-[#EEEEFF] tracking-[-0.01em] cursor-pointer hover:text-[#0071E3] transition-colors"
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
                      <p className="text-[11.5px] text-[#99AACC] mt-0.5">{contact.title}</p>
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
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">取引</h3>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,68,170,0.15)', color: '#CCDDF0' }}
                >
                  {deals.length}件
                </span>
              </div>
              <button
                onClick={() => setShowAddDeal(true)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#0071E3] hover:text-[#7AB4FF] transition-colors"
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
                <div className="py-8 text-center text-[13px] text-[#99AACC]">取引なし</div>
              ) : (
                deals.map(deal => (
                  <motion.div
                    key={deal.id}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="flex items-center gap-3 px-5 py-3.5 last:border-0 cursor-pointer hover:bg-[rgba(34,68,170,0.1)] transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(136,187,255,0.06)' }}
                    >
                      <Briefcase size={13} className="text-[#CCDDF0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#EEEEFF] truncate tracking-[-0.01em]">{deal.name}</p>
                      <p className="text-[11.5px] text-[#99AACC] mt-0.5">確度 {deal.probability}%</p>
                    </div>
                    <StageBadge stage={deal.stage} />
                    <span className="text-[13px] font-semibold text-[#EEEEFF] tabular-nums shrink-0">
                      ¥{(deal.amount / 1000000).toFixed(1)}M
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>

          {/* ── 企業マスター 全データ表示 ── */}
          {realCompany && (
            <>
              {/* 企業マスター 詳細情報（API全フィールド） */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#0c1028] rounded-[8px] overflow-hidden"
                style={{ border: '1px solid #2244AA' }}
              >
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
                  <h3 className="text-[13px] font-semibold text-[#EEEEFF]">企業マスター 詳細</h3>
                  <span className="text-[11px] text-[#99AACC]">CompanyMaster（全テナント共通マスター）</span>
                </div>
                <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                  {[
                    ['ID（cuid/uuid）', String(realRaw?.id ?? '-')],
                    ['法人番号', String(realRaw?.corporateNumber ?? '-')],
                    ['正式名称', String(realRaw?.name ?? '-')],
                    ['カナ名称', String(realRaw?.nameKana ?? '-')],
                    ['公式サイト', String(realRaw?.websiteUrl ?? '-')],
                    ['法人種別', String(realRaw?.corporateType ?? '-')],
                    ['都道府県', String(realRaw?.prefecture ?? '-')],
                    ['市区町村', String(realRaw?.city ?? '-')],
                    ['詳細住所', String(realRaw?.address ?? '-')],
                    ['業種', String((realRaw?.industry as { name?: string } | null)?.name ?? '-')],
                    ['従業員数', String(realRaw?.employeeCount ?? '-')],
                    ['売上', String(realRaw?.revenue ?? '-')],
                    ['代表者', String(realRaw?.representative ?? '-')],
                    ['代表電話', String(realRaw?.representativePhone ?? '-')],
                    ['代表メール', String(realRaw?.representativeEmail ?? '-')],
                    ['エンリッチ状態', String(realRaw?.enrichmentStatus ?? '-')],
                    ['最終クロール日時', String(realRaw?.lastCrawledAt ?? '-')],
                    ['最終エンリッチ日時', String(realRaw?.lastEnrichedAt ?? '-')],
                    ['作成日時', String(realRaw?.createdAt ?? '-')],
                    ['更新日時', String(realRaw?.updatedAt ?? '-')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-[#99AACC] text-[11px]">{label}</span>
                      <span className="text-[#EEEEFF] truncate" title={value}>{value}</span>
                    </div>
                  ))}
                  {realRaw?.serviceSummary != null && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[#99AACC] text-[11px]">事業内容</span>
                      <span className="text-[#EEEEFF] leading-relaxed">{String(realRaw.serviceSummary)}</span>
                    </div>
                  )}
                  {realRaw?.companyFeatures != null && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[#99AACC] text-[11px]">企業の特徴</span>
                      <span className="text-[#EEEEFF] leading-relaxed">{String(realRaw.companyFeatures)}</span>
                    </div>
                  )}
                  {Array.isArray(realRaw?.serviceTags) && (realRaw.serviceTags as Array<unknown>).length > 0 && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[#99AACC] text-[11px]">サービスタグ</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(realRaw.serviceTags as Array<{ tag: { name: string } }>).map((st, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-[rgba(136,187,255,0.15)] text-[#88BBFF]">
                            {st.tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 拠点一覧 */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#0c1028] rounded-[8px] overflow-hidden"
                style={{ border: '1px solid #2244AA' }}
              >
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
                  <h3 className="text-[13px] font-semibold text-[#EEEEFF]">
                    拠点一覧 <span className="ml-1.5 text-[11px] text-[#99AACC]">{realOffices.length}件</span>
                  </h3>
                </div>
                {realOffices.length === 0 ? (
                  <p className="px-5 py-6 text-[12px] text-[#99AACC]">拠点データなし</p>
                ) : (
                  <div>
                    {realOffices.map((o, i) => (
                      <div
                        key={i}
                        className="px-5 py-3 grid grid-cols-[1fr_80px_1fr_120px] gap-3 items-center text-[12px]"
                        style={{ borderBottom: i < realOffices.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                      >
                        <div>
                          <span className="text-[#EEEEFF] font-medium">{o.name}</span>
                          {o.isPrimary && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[rgba(255,159,10,0.15)] text-[#FF9F0A]">本社</span>
                          )}
                        </div>
                        <span className="text-[#99AACC]">{o.officeType}</span>
                        <span className="text-[#CCDDF0] truncate">{[o.prefecture, o.city, o.address].filter(Boolean).join(' ')}</span>
                        <span className="text-[#99AACC] text-right">{o.phone ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* 部門一覧 */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#0c1028] rounded-[8px] overflow-hidden"
                style={{ border: '1px solid #2244AA' }}
              >
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
                  <h3 className="text-[13px] font-semibold text-[#EEEEFF]">
                    部門情報 <span className="ml-1.5 text-[11px] text-[#99AACC]">{realDepartments.length}件</span>
                  </h3>
                </div>
                {realDepartments.length === 0 ? (
                  <p className="px-5 py-6 text-[12px] text-[#99AACC]">部門データなし（Haiku 4.5でのエンリッチ実行で取得可能）</p>
                ) : (
                  <div>
                    {realDepartments.map((d, i) => (
                      <div
                        key={i}
                        className="px-5 py-3 grid grid-cols-[1fr_100px_1fr_120px_120px] gap-3 items-center text-[12px]"
                        style={{ borderBottom: i < realDepartments.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                      >
                        <span className="text-[#EEEEFF] font-medium">{d.name}</span>
                        <span className="text-[#99AACC]">{d.departmentType ?? '-'}</span>
                        <span className="text-[#CCDDF0] truncate">{d.contactPersonName ? `${d.contactPersonName}${d.contactPersonTitle ? `（${d.contactPersonTitle}）` : ''}` : '-'}</span>
                        <span className="text-[#99AACC]">{d.phone ?? '-'}</span>
                        <span className="text-[#99AACC] truncate">{d.email ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* インテント集約 */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#0c1028] rounded-[8px] overflow-hidden"
                style={{ border: '1px solid #2244AA' }}
              >
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
                  <h3 className="text-[13px] font-semibold text-[#EEEEFF]">
                    インテント集約 <span className="ml-1.5 text-[11px] text-[#99AACC]">部門別</span>
                  </h3>
                </div>
                {realCompanyIntents.length === 0 ? (
                  <p className="px-5 py-6 text-[12px] text-[#99AACC]">インテントデータなし</p>
                ) : (
                  <div>
                    {realCompanyIntents.map((ci, i) => {
                      const bg =
                        ci.intentLevel === 'HOT' ? 'linear-gradient(135deg, #FF6B35, #FF3B30)' :
                        ci.intentLevel === 'MIDDLE' ? 'linear-gradient(135deg, #FFCC66, #FF9F0A)' :
                        'linear-gradient(135deg, #5AC8FA, #0071E3)'
                      return (
                        <div
                          key={i}
                          className="px-5 py-3 flex items-center gap-3 text-[12px]"
                          style={{ borderBottom: i < realCompanyIntents.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                        >
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-semibold text-white min-w-[50px] text-center"
                            style={{ background: bg }}
                          >
                            {ci.intentLevel}
                          </span>
                          <span className="text-[#EEEEFF] font-medium">{ci.departmentType}</span>
                          <span className="text-[#99AACC]">シグナル {ci.signalCount}件</span>
                          {ci.latestSignalAt && (
                            <span className="text-[#99AACC] ml-auto">最新: {new Date(ci.latestSignalAt).toLocaleDateString('ja-JP')}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>

              {/* インテントシグナル履歴（最新50件） */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#0c1028] rounded-[8px] overflow-hidden"
                style={{ border: '1px solid #2244AA' }}
              >
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
                  <h3 className="text-[13px] font-semibold text-[#EEEEFF]">
                    インテントシグナル履歴 <span className="ml-1.5 text-[11px] text-[#99AACC]">{realIntentSignals.length}件</span>
                  </h3>
                </div>
                {realIntentSignals.length === 0 ? (
                  <p className="px-5 py-6 text-[12px] text-[#99AACC]">シグナル履歴なし</p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {realIntentSignals.map((s, i) => (
                      <div
                        key={s.id}
                        className="px-5 py-3 grid grid-cols-[90px_1fr_90px_100px] gap-3 items-center text-[12px]"
                        style={{ borderBottom: i < realIntentSignals.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                      >
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[rgba(136,187,255,0.1)] text-[#88BBFF] text-center">
                          {s.signalType}
                        </span>
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#EEEEFF] hover:text-[#88BBFF] truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {s.title}
                        </a>
                        <span className="text-[#99AACC]">{s.departmentType ?? '-'}</span>
                        <span className="text-[#99AACC] text-right">
                          {s.publishedAt ? new Date(s.publishedAt).toLocaleDateString('ja-JP') : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[288px] shrink-0 flex flex-col gap-4">

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] overflow-hidden"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
              <TrendingUp size={14} className="text-[#0071E3] shrink-0" />
              <h3 className="text-[13px] font-semibold text-[#EEEEFF] tracking-[-0.01em]">スコア内訳</h3>
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
                  style={{ borderBottom: i < MOCK_SCORE_BREAKDOWN.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#EEEEFF]">{item.label}</p>
                    <p className="text-[11px] text-[#99AACC] truncate">{item.detail}</p>
                  </div>
                  <span className="text-[12px] font-semibold shrink-0" style={{ color: '#34C759' }}>
                    +{item.points}pts
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid #2244AA', background: 'rgba(0,0,0,0.016)' }}
            >
              <span className="text-[12px] text-[#CCDDF0]">合計スコア</span>
              <span className="text-[15px] font-bold text-[#EEEEFF] tabular-nums">{scoreTotal}pts</span>
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
              <button onClick={() => setShowEditModal(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)]">キャンセル</button>
              <button onClick={() => setShowEditModal(false)} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                style={{ background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)', boxShadow: '0 2px 8px rgba(34,68,170,0.4)' }}>
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
              <button onClick={() => setShowAddContact(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)]">キャンセル</button>
              <button onClick={() => setShowAddContact(false)} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                style={{ background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)', boxShadow: '0 2px 8px rgba(34,68,170,0.4)' }}>
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
              <button onClick={() => setShowAddDeal(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)]">キャンセル</button>
              <button onClick={() => setShowAddDeal(false)} className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                style={{ background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)', boxShadow: '0 2px 8px rgba(34,68,170,0.4)' }}>
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
      <motion.div className="relative w-[440px] rounded-[16px] p-6 bg-[#0c1028]"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold text-[#EEEEFF]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.06)]"><X size={16} style={{ color: '#CCDDF0' }} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function ModalField({ label, defaultValue, placeholder, required }: { label: string; defaultValue?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-[#CCDDF0] uppercase tracking-[0.04em]">
        {label} {required && <span className="text-[#FF3B30]">*</span>}
      </label>
      <input
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
        style={{ background: 'rgba(16,16,40,0.6)' }}
      />
    </div>
  )
}
