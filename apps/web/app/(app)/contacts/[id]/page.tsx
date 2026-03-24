'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Phone,
  Mail,
  Building2,
  Briefcase,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Clock,
  Star,
  Zap,
  CalendarClock,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import { STATUS_STYLES, RANK_CONFIG } from '@/types/crm'
import type { ApproachStatus, Rank } from '@/types/crm'

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

interface ContactDetail {
  id: string
  name: string
  title: string
  department: string
  company: string
  companyId: string
  email: string
  phone: string
  rank: Rank
  status: ApproachStatus
  callAttempts: number
  lastCallAt: string | null
  nextActionAt: string | null
  bestCallTime: string | null
  sequenceName: string | null
  isDecisionMaker: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Record<string, ContactDetail> = {
  '1': {
    id: '1', name: '田中 誠', title: '営業部長', department: '営業部',
    company: '株式会社テクノリード', companyId: '1',
    email: 'tanaka@techno-lead.co.jp', phone: '03-1234-5678',
    rank: 'A', status: 'アポ獲得', callAttempts: 3,
    lastCallAt: '2026-03-20', nextActionAt: '2026-03-28',
    bestCallTime: '10:00 - 12:00', sequenceName: 'Hot標準シーケンス',
    isDecisionMaker: true,
  },
  '2': {
    id: '2', name: '山本 佳子', title: 'マネージャー', department: '購買部',
    company: '合同会社フューチャー', companyId: '2',
    email: 'yamamoto@future-llc.jp', phone: '06-2345-6789',
    rank: 'A', status: '接続済み', callAttempts: 5,
    lastCallAt: '2026-03-19', nextActionAt: '2026-03-22',
    bestCallTime: '14:00 - 17:00', sequenceName: 'Aランク標準シーケンス',
    isDecisionMaker: false,
  },
}

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

function ActivityIcon({ type, result }: { type: ActivityType; result?: ApproachStatus }) {
  if (type === 'call') {
    const color =
      result === 'アポ獲得' ? '#34C759'
      : result === '不在'   ? '#FF9F0A'
      : result === '不通'   ? '#FF3B30'
      : result === '接続済み' ? '#0071E3'
      : '#AEAEB2'
    return (
      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
        <PhoneCall size={13} style={{ color }} />
      </div>
    )
  }
  if (type === 'email') {
    return (
      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ backgroundColor: 'rgba(0,113,227,0.1)' }}>
        <MessageSquare size={13} style={{ color: '#0071E3' }} />
      </div>
    )
  }
  if (type === 'deal_advance') {
    return (
      <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ backgroundColor: 'rgba(0,113,227,0.08)' }}>
        <TrendingUp size={13} style={{ color: '#0071E3' }} />
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
      <MessageSquare size={13} style={{ color: '#AEAEB2' }} />
    </div>
  )
}

// ─── IS Field Row ──────────────────────────────────────────────────────────────

function ISFieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
      }}
      className="flex items-start justify-between py-2.5 border-b border-[rgba(0,0,0,0.05)] last:border-0"
    >
      <span className="text-xs text-[#AEAEB2] shrink-0 w-28">{label}</span>
      <div className="text-right">{children}</div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { startCall } = useCallStore()

  const contact = MOCK_CONTACTS[id] ?? MOCK_CONTACTS['1']!
  const rankConfig  = RANK_CONFIG[contact.rank]
  const statusStyle = STATUS_STYLES[contact.status]

  const [activityTab, setActivityTab] = useState<'all' | 'call' | 'email' | 'note'>('all')

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
          className="flex items-center gap-1 text-sm text-[#6E6E73] hover:text-[#3C3C43] transition-colors"
        >
          <ChevronLeft size={15} />
          コンタクト一覧
        </Link>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCall}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-[9px] transition-all shadow-[0_1px_4px_rgba(0,113,227,0.3)]"
          style={{ background: 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(180deg, #1986F0 0%, #0077ED 100%)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(180deg, #147CE5 0%, #0071E3 100%)')}
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
            className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] p-5"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,113,227,0.2)]" style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}>
                <span className="text-xl font-semibold text-white">{contact.name[0]}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-[#1D1D1F] tracking-[-0.02em]">
                    {contact.name}
                  </h1>
                  <span
                    className="inline-flex items-center justify-center rounded-[5px] text-[10px] font-bold"
                    style={{ width: 22, height: 22, background: rankConfig.gradient, boxShadow: rankConfig.glow, color: rankConfig.color, letterSpacing: '0.03em' }}
                  >
                    {contact.rank}
                  </span>
                  {contact.isDecisionMaker && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFFBEB] text-[#D97706]">
                      <Star size={10} />
                      決裁者
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-sm text-[#6E6E73]">{contact.title}</span>
                  <span className="text-[#C7C7CC]">·</span>
                  <span className="text-sm text-[#6E6E73]">{contact.department}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <Building2 size={12} className="text-[#AEAEB2]" />
                  <span className="text-sm text-[#3C3C43] font-medium">{contact.company}</span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[rgba(0,0,0,0.05)]">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#0071E3] transition-colors"
              >
                <Mail size={13} />
                {contact.email}
              </a>
              <span className="w-px h-3 bg-[rgba(0,0,0,0.1)]" />
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-sm text-[#6E6E73] hover:text-[#0071E3] transition-colors"
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
            className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)]"
          >
            {/* Tab Header */}
            <div className="px-5 py-3 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1D1D1F]">アクティビティ</h2>
              <div className="flex items-center gap-1 bg-[rgba(0,0,0,0.04)] rounded-[8px] p-0.5">
                {(['all', 'call', 'email', 'note'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivityTab(tab)}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-all duration-100 ${
                      activityTab === tab
                        ? 'bg-white text-[#1D1D1F] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                        : 'text-[#6E6E73] hover:text-[#3C3C43]'
                    }`}
                  >
                    {{ all: '全件', call: 'コール', email: 'メール', note: 'ノート' }[tab]}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="px-5 py-4">
              <motion.div
                initial="hidden"
                animate="visible"
                key={activityTab}
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="relative"
              >
                {/* Vertical line */}
                <div className="absolute left-3 top-3.5 bottom-3.5 w-px bg-[rgba(0,0,0,0.04)]" />

                <div className="space-y-4">
                  {filteredActivities.map(activity => (
                    <motion.div
                      key={activity.id}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="flex gap-4"
                    >
                      {/* Icon dot on timeline */}
                      <div className="relative z-10 shrink-0">
                        <ActivityIcon type={activity.type} result={activity.result} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[#1D1D1F]">{activity.title}</span>
                          {activity.result && (() => {
                            const s = STATUS_STYLES[activity.result]
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                {activity.result}
                              </span>
                            )
                          })()}
                          {activity.durationSec !== undefined && activity.durationSec > 0 && (
                            <span className="text-xs text-[#AEAEB2]">{formatDuration(activity.durationSec)}</span>
                          )}
                          <span className="text-xs text-[#AEAEB2] ml-auto">{formatDateTime(activity.timestamp)}</span>
                        </div>
                        {activity.description && (
                          <p className="text-xs text-[#6E6E73] mt-0.5">{activity.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[300px] shrink-0 space-y-4">

          {/* IS Fields Card */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] p-5"
          >
            <h3 className="text-xs font-semibold text-[#AEAEB2] uppercase tracking-[0.06em] mb-3">
              ISフィールド
            </h3>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              <ISFieldRow label="アプローチ">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {contact.status}
                </span>
              </ISFieldRow>

              <ISFieldRow label="コール試行">
                <div className="flex items-center gap-1.5 justify-end">
                  <PhoneCall size={12} className="text-[#AEAEB2]" />
                  <span className="text-sm font-medium text-[#1D1D1F]">{contact.callAttempts}回</span>
                </div>
              </ISFieldRow>

              <ISFieldRow label="最終コール">
                <span className="text-sm text-[#6E6E73]">
                  {contact.lastCallAt ? contact.lastCallAt : '—'}
                </span>
              </ISFieldRow>

              <ISFieldRow label="ベストコール">
                <div className="flex items-center gap-1 justify-end">
                  <Clock size={11} className="text-[#AEAEB2]" />
                  <span className="text-sm text-[#6E6E73]">{contact.bestCallTime ?? '学習中'}</span>
                </div>
              </ISFieldRow>

              <ISFieldRow label="シーケンス">
                <div className="flex items-center gap-1 justify-end">
                  {contact.sequenceName ? (
                    <>
                      <Zap size={11} style={{ color: '#0071E3' }} />
                      <span className="text-xs font-medium" style={{ color: '#0071E3' }}>{contact.sequenceName}</span>
                    </>
                  ) : (
                    <span className="text-sm text-[#AEAEB2]">未設定</span>
                  )}
                </div>
              </ISFieldRow>
            </motion.div>
          </motion.div>

          {/* Next Action Card */}
          {contact.nextActionAt && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] p-5"
            >
              <h3 className="text-xs font-semibold text-[#AEAEB2] uppercase tracking-[0.06em] mb-3">
                次回アクション
              </h3>
              <div className="flex items-center gap-2">
                <CalendarClock size={14} style={{ color: '#0071E3' }} />
                <span className="text-sm font-medium text-[#1D1D1F]">{contact.nextActionAt}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Briefcase size={12} className="text-[#AEAEB2]" />
                <span className="text-xs text-[#6E6E73]">商談: 株式会社テクノリード 初回打ち合わせ</span>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
