'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart2, TrendingUp, Users, DollarSign, CalendarDays, Award,
  Globe, FileText, Eye, Clock, Copy, ChevronDown, ChevronRight,
} from 'lucide-react'
import type { GA4PageData, GA4DailyTraffic, GA4SourceMedium, TrackedDocument, DocumentViewEvent } from '@/types/crm'

// ─── Types ──────────────────────────────────────────────────────────────────

type AnalyticsTab = 'channel' | 'team' | 'event' | 'ga' | 'tracking'

interface LeadSource {
  id: string
  label: string
  leads: number
  deals: number
  pocs: number
  won: number
  avgDealAmount: number
}

interface RepData {
  name: string
  deals: number
  won: number
  avgAmount: number
  avgCycleDays: number
  color: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const LEAD_SOURCES: LeadSource[] = [
  { id: 'hp',       label: 'HP問い合わせ', leads: 50,  deals: 12, pocs: 8,  won: 6, avgDealAmount: 1500000 },
  { id: 'pricing',  label: '料金ページ',   leads: 30,  deals: 10, pocs: 7,  won: 5, avgDealAmount: 800000  },
  { id: 'seminar',  label: 'セミナー主催', leads: 80,  deals: 20, pocs: 12, won: 8, avgDealAmount: 2000000 },
  { id: 'referral', label: '紹介',         leads: 15,  deals: 10, pocs: 9,  won: 8, avgDealAmount: 3200000 },
  { id: 'paid_ads', label: '有料広告',     leads: 100, deals: 8,  pocs: 3,  won: 1, avgDealAmount: 600000  },
  { id: 'partner',  label: 'パートナー',   leads: 20,  deals: 9,  pocs: 7,  won: 6, avgDealAmount: 2500000 },
]

const REPS: RepData[] = [
  { name: '田中太郎', deals: 18, won: 8, avgAmount: 3200000, avgCycleDays: 42, color: '#0071E3' },
  { name: '鈴木花子', deals: 14, won: 7, avgAmount: 2800000, avgCycleDays: 38, color: '#34C759' },
  { name: '佐藤次郎', deals: 12, won: 4, avgAmount: 1900000, avgCycleDays: 56, color: '#FF9F0A' },
]

// ─── GA4 Mock Data ──────────────────────────────────────────────────────────

const GA4_PAGES: GA4PageData[] = [
  { path: '/', title: 'トップページ', pageViews: 12500, uniqueUsers: 8200, avgSessionDuration: 45, bounceRate: 42, conversions: 85 },
  { path: '/pricing', title: '料金ページ', pageViews: 3800, uniqueUsers: 2900, avgSessionDuration: 120, bounceRate: 28, conversions: 52 },
  { path: '/features', title: '機能紹介', pageViews: 5200, uniqueUsers: 3100, avgSessionDuration: 90, bounceRate: 35, conversions: 23 },
  { path: '/case-studies', title: '導入事例', pageViews: 2100, uniqueUsers: 1600, avgSessionDuration: 180, bounceRate: 22, conversions: 18 },
  { path: '/contact', title: 'お問い合わせ', pageViews: 1800, uniqueUsers: 1500, avgSessionDuration: 60, bounceRate: 15, conversions: 120 },
  { path: '/blog', title: 'ブログ', pageViews: 8900, uniqueUsers: 6500, avgSessionDuration: 75, bounceRate: 55, conversions: 8 },
]

const GA4_DAILY: GA4DailyTraffic[] = [
  { date: '3/20', sessions: 450, users: 380, pageViews: 1200, cvRate: 2.1 },
  { date: '3/21', sessions: 520, users: 420, pageViews: 1450, cvRate: 2.5 },
  { date: '3/22', sessions: 380, users: 310, pageViews: 980,  cvRate: 1.8 },
  { date: '3/23', sessions: 610, users: 490, pageViews: 1680, cvRate: 3.2 },
  { date: '3/24', sessions: 480, users: 400, pageViews: 1350, cvRate: 2.4 },
  { date: '3/25', sessions: 550, users: 440, pageViews: 1520, cvRate: 2.8 },
  { date: '3/26', sessions: 590, users: 470, pageViews: 1600, cvRate: 3.0 },
]

const GA4_SOURCES: GA4SourceMedium[] = [
  { source: 'google',   medium: 'organic',  sessions: 1200, users: 980,  cvRate: 2.8 },
  { source: 'google',   medium: 'cpc',      sessions: 800,  users: 650,  cvRate: 3.5 },
  { source: '(direct)',  medium: '(none)',   sessions: 600,  users: 500,  cvRate: 4.2 },
  { source: 'linkedin',  medium: 'social',  sessions: 300,  users: 250,  cvRate: 1.9 },
  { source: 'referral',  medium: 'partner', sessions: 200,  users: 180,  cvRate: 5.1 },
]

// ─── Tracking Mock Data ─────────────────────────────────────────────────────

const MOCK_DOCS: TrackedDocument[] = [
  { id: 'doc-1', name: 'Intent Force サービス紹介資料 v2.1', type: 'service_intro', trackingUrl: 'https://track.closepilot.app/d/abc123', totalPages: 12, createdAt: '2026-03-15', createdBy: '田中太郎', totalViews: 45, uniqueViewers: 28 },
  { id: 'doc-2', name: '株式会社テクノリード向け提案書', type: 'proposal', trackingUrl: 'https://track.closepilot.app/d/def456', totalPages: 18, createdAt: '2026-03-20', createdBy: '鈴木花子', totalViews: 12, uniqueViewers: 3 },
  { id: 'doc-3', name: '導入事例集 2026年版', type: 'case_study', trackingUrl: 'https://track.closepilot.app/d/ghi789', totalPages: 24, createdAt: '2026-03-10', createdBy: '田中太郎', totalViews: 67, uniqueViewers: 41 },
  { id: 'doc-4', name: '料金プラン比較表', type: 'pricing', trackingUrl: 'https://track.closepilot.app/d/jkl012', totalPages: 4, createdAt: '2026-03-22', createdBy: '佐藤次郎', totalViews: 23, uniqueViewers: 18 },
]

const MOCK_VIEWS: Record<string, DocumentViewEvent[]> = {
  'doc-1': [
    { id: 'ev-1', documentId: 'doc-1', viewedAt: '2026-03-26 14:30', resolvedCompany: '株式会社テクノリード', companyId: '1', totalDurationSec: 340, pagesViewed: 10, maxScrollDepth: 85 },
    { id: 'ev-2', documentId: 'doc-1', viewedAt: '2026-03-25 10:15', resolvedCompany: '合同会社フューチャー', companyId: '2', totalDurationSec: 180, pagesViewed: 6, maxScrollDepth: 50 },
    { id: 'ev-3', documentId: 'doc-1', viewedAt: '2026-03-24 16:45', resolvedCompany: null, companyId: null, totalDurationSec: 45, pagesViewed: 3, maxScrollDepth: 25 },
  ],
  'doc-2': [
    { id: 'ev-4', documentId: 'doc-2', viewedAt: '2026-03-26 09:20', resolvedCompany: '株式会社テクノリード', companyId: '1', totalDurationSec: 520, pagesViewed: 18, maxScrollDepth: 100 },
    { id: 'ev-5', documentId: 'doc-2', viewedAt: '2026-03-25 15:00', resolvedCompany: '株式会社テクノリード', companyId: '1', totalDurationSec: 280, pagesViewed: 12, maxScrollDepth: 67 },
  ],
  'doc-3': [
    { id: 'ev-6', documentId: 'doc-3', viewedAt: '2026-03-26 11:10', resolvedCompany: '株式会社イノベーション', companyId: '3', totalDurationSec: 420, pagesViewed: 20, maxScrollDepth: 83 },
    { id: 'ev-7', documentId: 'doc-3', viewedAt: '2026-03-24 13:30', resolvedCompany: '株式会社グロース', companyId: '4', totalDurationSec: 150, pagesViewed: 8, maxScrollDepth: 33 },
    { id: 'ev-8', documentId: 'doc-3', viewedAt: '2026-03-23 17:00', resolvedCompany: null, companyId: null, totalDurationSec: 60, pagesViewed: 4, maxScrollDepth: 17 },
  ],
  'doc-4': [
    { id: 'ev-9', documentId: 'doc-4', viewedAt: '2026-03-26 16:00', resolvedCompany: '有限会社サクセス', companyId: '5', totalDurationSec: 90, pagesViewed: 4, maxScrollDepth: 100 },
  ],
}

const DOC_TYPE_LABELS: Record<string, string> = {
  proposal: '提案書', service_intro: 'サービス紹介', case_study: '事例集', pricing: '料金表', other: 'その他',
}

const FUNNEL_COLORS = {
  leads:  { color: '#99AACC', label: 'リード' },
  deals:  { color: '#0071E3', label: '商談化' },
  pocs:   { color: '#5E5CE6', label: 'PoC'   },
  won:    { color: '#34C759', label: '受注'   },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1000000) return `¥${(n / 1000000).toFixed(1)}M`
  return `¥${(n / 10000).toFixed(0)}万`
}

// ─── Channel Funnel Table ────────────────────────────────────────────────────

function ChannelFunnelChart({ costMap, setCostMap }: {
  costMap: Record<string, string>
  setCostMap: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  return (
    <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
        <div className="px-6 py-3.5" style={{ borderBottom: '1px solid #2244AA' }}>
          <h3 className="text-[14px] font-semibold text-[#EEEEFF]">経路別 費用 & ROI</h3>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_80px_80px_120px_80px] items-center px-6 py-2.5" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
          {['経路', 'リード', '商談', '受注', '費用', 'ROI'].map(h => (
            <span key={h} className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em]">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {LEAD_SOURCES.map((src, i) => {
          const cost = parseInt(costMap[src.id] || '0', 10) || 0
          const revenue = src.won * src.avgDealAmount
          const roi = cost > 0 ? (revenue / cost).toFixed(1) + 'x' : '—'
          const roiColor = cost > 0
            ? (revenue / cost >= 3 ? '#44FF88' : revenue / cost >= 1 ? '#FFDD44' : '#FF4444')
            : '#4466AA'

          return (
            <motion.div
              key={src.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[1fr_80px_80px_80px_120px_80px] items-center px-6 py-3"
              style={{ borderBottom: i < LEAD_SOURCES.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
            >
              <span className="text-[13px] font-medium text-[#EEEEFF]">{src.label}</span>
              <span className="text-[13px] tabular-nums text-[#CCDDF0]">{src.leads}件</span>
              <span className="text-[13px] tabular-nums text-[#CCDDF0]">{src.deals}件</span>
              <span className="text-[13px] tabular-nums font-semibold text-[#EEEEFF]">{src.won}件</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#99AACC]">¥</span>
                <input
                  type="number"
                  placeholder="0"
                  value={costMap[src.id] ?? ''}
                  onChange={e => setCostMap(m => ({ ...m, [src.id]: e.target.value }))}
                  className="w-full pl-5 pr-2 py-1.5 text-[13px] bg-[rgba(34,68,170,0.1)] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-[#0c1028] transition-all tabular-nums"
                />
              </div>
              <span className="text-[14px] font-bold tabular-nums" style={{ color: roiColor }}>{roi}</span>
            </motion.div>
          )
        })}
      </div>
  )
}

// ─── Team Performance Tab ────────────────────────────────────────────────────

function TeamPerformanceTab() {
  const totalDeals = REPS.reduce((s, r) => s + r.deals, 0)
  const totalWon = REPS.reduce((s, r) => s + r.won, 0)
  const avgWin = totalDeals > 0 ? Math.round((totalWon / totalDeals) * 100) : 0
  const totalRevenue = REPS.reduce((s, r) => s + r.won * r.avgAmount, 0)

  return (
    <motion.div
      key="team"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Team KPI */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '総商談数', value: `${totalDeals}件`, color: '#0071E3' },
          { label: '総受注数', value: `${totalWon}件`, color: '#34C759' },
          { label: '平均受注率', value: `${avgWin}%`, color: '#5E5CE6' },
          { label: '総受注額', value: formatAmount(totalRevenue), color: '#FF9F0A' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-[10px] px-4 py-3" style={{ background: `${kpi.color}0A` }}>
            <p className="text-[10px] text-[#CCDDF0] uppercase tracking-[0.04em]">{kpi.label}</p>
            <p className="text-[20px] font-bold tracking-[-0.03em] mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* 担当者比較テーブル */}
      <div className="rounded-[8px] overflow-hidden bg-[#0c1028] mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #2244AA' }}>
          <h4 className="text-[14px] font-semibold text-[#EEEEFF]">担当者別パフォーマンス</h4>
        </div>
        <div className="grid grid-cols-[1fr_80px_80px_80px_100px_80px] items-center px-5 py-2" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
          {['担当者', '商談', '受注', '受注率', '平均金額', 'サイクル'].map(h => (
            <span key={h} className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em]">{h}</span>
          ))}
        </div>
        {REPS.map((rep, i) => {
          const winRate = Math.round((rep.won / rep.deals) * 100)
          return (
            <motion.div
              key={rep.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[1fr_80px_80px_80px_100px_80px] items-center px-5 py-3"
              style={{ borderBottom: i < REPS.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: rep.color, boxShadow: `0 0 12px ${rep.color}aa, 0 0 4px ${rep.color}, inset 0 1px 0 rgba(255,255,255,0.4)`, border: "1px solid rgba(255,255,255,0.3)" }}>
                  {rep.name[0]}
                </div>
                <span className="text-[13px] font-medium text-[#EEEEFF]">{rep.name}</span>
              </div>
              <span className="text-[13px] tabular-nums text-[#CCDDF0]">{rep.deals}件</span>
              <span className="text-[13px] tabular-nums font-semibold text-[#EEEEFF]">{rep.won}件</span>
              <span className="text-[13px] tabular-nums font-semibold" style={{ color: winRate >= 50 ? '#1A7A35' : winRate >= 30 ? '#C07000' : '#CF3131' }}>{winRate}%</span>
              <span className="text-[13px] tabular-nums text-[#CCDDF0]">{formatAmount(rep.avgAmount)}</span>
              <span className="text-[13px] tabular-nums text-[#CCDDF0]">{rep.avgCycleDays}日</span>
            </motion.div>
          )
        })}
      </div>

      {/* Next Action 推奨 */}
      <div className="space-y-2">
        <h4 className="text-[13px] font-semibold text-[#EEEEFF]">Next Action 推奨</h4>
        <div className="flex items-center gap-3 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.15)' }}>
          <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: '#FF4444' }} />
          <p className="text-[13px] text-[#FF8A82]"><span className="font-semibold">佐藤:</span> 受注率33% — 商談の質向上が必要。Aランク案件に集中推奨</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)' }}>
          <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: '#FF9F0A' }} />
          <p className="text-[13px] text-[#FFC266]"><span className="font-semibold">佐藤:</span> 平均サイクル56日 — 他メンバー（38-42日）対比で長い。ボトルネック確認推奨</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── GA4 Tab ─────────────────────────────────────────────────────────────────

function GATab() {
  const totalSessions = GA4_DAILY.reduce((s, d) => s + d.sessions, 0)
  const totalUsers = GA4_DAILY.reduce((s, d) => s + d.users, 0)
  const totalPV = GA4_DAILY.reduce((s, d) => s + d.pageViews, 0)
  const avgCV = (GA4_DAILY.reduce((s, d) => s + d.cvRate, 0) / GA4_DAILY.length).toFixed(1)

  return (
    <motion.div key="ga" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'セッション', value: totalSessions.toLocaleString(), color: '#0071E3' },
          { label: 'ユーザー', value: totalUsers.toLocaleString(), color: '#34C759' },
          { label: 'ページビュー', value: totalPV.toLocaleString(), color: '#5E5CE6' },
          { label: 'CV率', value: `${avgCV}%`, color: '#FF9F0A' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-[10px] px-4 py-3" style={{ background: `${kpi.color}0A` }}>
            <p className="text-[10px] text-[#CCDDF0] uppercase tracking-[0.04em]">{kpi.label}</p>
            <p className="text-[20px] font-bold tracking-[-0.03em] mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Daily traffic table */}
      <div className="rounded-[8px] overflow-hidden bg-[#0c1028] mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #2244AA' }}>
          <h4 className="text-[14px] font-semibold text-[#EEEEFF]">日別トラフィック</h4>
        </div>
        <div className="grid grid-cols-[1fr_90px_90px_90px_60px] items-center px-5 py-2" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
          {['日付', 'セッション', 'ユーザー', 'PV', 'CV率'].map(h => (
            <span key={h} className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em]">{h}</span>
          ))}
        </div>
        {GA4_DAILY.map((d, i) => (
          <div key={d.date} className="grid grid-cols-[1fr_90px_90px_90px_60px] items-center px-5 py-2.5" style={{ borderBottom: i < GA4_DAILY.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}>
            <span className="text-[13px] font-medium text-[#EEEEFF]">{d.date}</span>
            <span className="text-[13px] tabular-nums text-[#CCDDF0]">{d.sessions}</span>
            <span className="text-[13px] tabular-nums text-[#CCDDF0]">{d.users}</span>
            <span className="text-[13px] tabular-nums text-[#CCDDF0]">{d.pageViews.toLocaleString()}</span>
            <span className="text-[13px] tabular-nums font-semibold" style={{ color: d.cvRate >= 3 ? '#44FF88' : d.cvRate >= 2.5 ? '#FFDD44' : '#7788AA' }}>{d.cvRate}%</span>
          </div>
        ))}
      </div>

      {/* Tables stacked vertically */}
      <div className="space-y-5">
        {/* Page PV table */}
        <div className="rounded-[8px] overflow-hidden bg-[#0c1028]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid #2244AA' }}>
            <h4 className="text-[14px] font-semibold text-[#EEEEFF]">ページ別パフォーマンス</h4>
          </div>
          <div className="grid grid-cols-[1fr_90px_90px_80px_70px] items-center px-5 py-2" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
            {['ページ', 'PV', 'UU', '直帰率', 'CV'].map(h => (
              <span key={h} className="text-[11px] font-medium text-[#99AACC] uppercase tracking-[0.05em]">{h}</span>
            ))}
          </div>
          {GA4_PAGES.map((p, i) => (
            <div key={p.path} className="grid grid-cols-[1fr_90px_90px_80px_70px] items-center px-5 py-2.5" style={{ borderBottom: i < GA4_PAGES.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}>
              <div>
                <p className="text-[13px] font-medium text-[#EEEEFF]">{p.title}</p>
                <p className="text-[11px] text-[#99AACC]">{p.path}</p>
              </div>
              <span className="text-[13px] tabular-nums font-semibold text-[#EEEEFF]">{p.pageViews.toLocaleString()}</span>
              <span className="text-[13px] tabular-nums text-[#CCDDF0]">{p.uniqueUsers.toLocaleString()}</span>
              <span className="text-[13px] tabular-nums" style={{ color: p.bounceRate <= 25 ? '#44FF88' : p.bounceRate <= 40 ? '#7788AA' : '#FF4444' }}>{p.bounceRate}%</span>
              <span className="text-[13px] tabular-nums font-semibold text-[#0071E3]">{p.conversions}</span>
            </div>
          ))}
        </div>

        {/* Sources table */}
        <div className="rounded-[8px] overflow-hidden bg-[#0c1028]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid #2244AA' }}>
            <h4 className="text-[14px] font-semibold text-[#EEEEFF]">流入元別セッション</h4>
          </div>
          {GA4_SOURCES.map((s, i) => (
            <div key={`${s.source}-${s.medium}`} className="grid grid-cols-[1fr_80px_60px] items-center px-5 py-3" style={{ borderBottom: i < GA4_SOURCES.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}>
              <div>
                <p className="text-[13px] font-medium text-[#EEEEFF]">{s.source}</p>
                <p className="text-[11px] text-[#99AACC]">{s.medium}</p>
              </div>
              <span className="text-[13px] tabular-nums font-semibold text-[#EEEEFF] text-right">{s.sessions}</span>
              <div className="text-right">
                <span className="text-[13px] tabular-nums font-semibold px-2 py-0.5 rounded-[4px]" style={{
                  color: s.cvRate >= 4 ? '#44FF88' : s.cvRate >= 2.5 ? '#FFDD44' : '#7788AA',
                  background: s.cvRate >= 4 ? 'rgba(52,199,89,0.1)' : s.cvRate >= 2.5 ? 'rgba(255,159,10,0.1)' : 'rgba(0,0,0,0.04)',
                }}>{s.cvRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Document Tracking Tab ───────────────────────────────────────────────────

function TrackingTab() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const formatDuration = (sec: number) => {
    if (sec >= 60) return `${Math.floor(sec / 60)}分${sec % 60}秒`
    return `${sec}秒`
  }

  return (
    <motion.div key="tracking" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '総資料数', value: MOCK_DOCS.length, color: '#0071E3' },
          { label: '総閲覧数', value: MOCK_DOCS.reduce((s, d) => s + d.totalViews, 0), color: '#5E5CE6' },
          { label: 'ユニーク閲覧者', value: MOCK_DOCS.reduce((s, d) => s + d.uniqueViewers, 0), color: '#34C759' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-[10px] px-4 py-3" style={{ background: `${kpi.color}0A` }}>
            <p className="text-[10px] text-[#CCDDF0] uppercase tracking-[0.04em]">{kpi.label}</p>
            <p className="text-[20px] font-bold tracking-[-0.03em] mt-0.5" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Document cards */}
      <div className="space-y-3">
        {MOCK_DOCS.map((doc, di) => {
          const views = MOCK_VIEWS[doc.id] || []
          const isExpanded = expandedDoc === doc.id

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: di * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[8px] overflow-hidden"
              style={{ border: '1px solid #2244AA' }}
            >
              {/* Card header */}
              <div className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0" style={{ background: 'rgba(94,92,230,0.08)' }}>
                  <FileText size={16} style={{ color: '#5E5CE6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#EEEEFF] truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#99AACC]">{DOC_TYPE_LABELS[doc.type]}</span>
                    <span className="text-[11px] text-[#99AACC]">{doc.totalPages}ページ</span>
                    <span className="text-[11px] text-[#99AACC]">{doc.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <Eye size={12} style={{ color: '#5E5CE6' }} />
                    <span className="text-[12px] font-semibold text-[#5E5CE6]">{doc.totalViews}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} style={{ color: '#34C759' }} />
                    <span className="text-[12px] font-medium text-[#34C759]">{doc.uniqueViewers}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(doc.trackingUrl)}
                    className="h-[26px] px-2 flex items-center gap-1 text-[11px] font-medium text-[#CCDDF0] rounded-[6px] hover:bg-[rgba(0,0,0,0.04)] transition-colors"
                  >
                    <Copy size={11} />
                    URL
                  </button>
                  <button
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                    className="h-[26px] px-2 flex items-center gap-1 text-[11px] font-medium rounded-[6px] transition-colors"
                    style={{ background: isExpanded ? 'rgba(136,187,255,0.12)' : 'rgba(136,187,255,0.06)', color: isExpanded ? '#88BBFF' : '#7788AA' }}
                  >
                    {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    詳細
                  </button>
                </div>
              </div>

              {/* Expanded view history */}
              <AnimatePresence>
                {isExpanded && views.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div style={{ borderTop: '1px solid #2244AA' }}>
                      {/* View table header */}
                      <div className="grid grid-cols-[1fr_100px_80px_1fr] items-center px-4 py-2" style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}>
                        <span className="text-[10px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">企業</span>
                        <span className="text-[10px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">閲覧時間</span>
                        <span className="text-[10px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">ページ</span>
                        <span className="text-[10px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">スクロール深度</span>
                      </div>
                      {views.map((v, vi) => (
                        <div key={v.id} className="grid grid-cols-[1fr_100px_80px_1fr] items-center px-4 py-2.5" style={{ borderBottom: vi < views.length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none' }}>
                          <div>
                            <p className="text-[12px] font-medium" style={{ color: v.resolvedCompany ? '#EEEEFF' : '#4466AA' }}>
                              {v.resolvedCompany || '不明な訪問者'}
                            </p>
                            <p className="text-[10px] text-[#99AACC]">{v.viewedAt}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={10} style={{ color: '#CCDDF0' }} />
                            <span className="text-[11px] text-[#CCDDF0]">{formatDuration(v.totalDurationSec)}</span>
                          </div>
                          <span className="text-[11px] text-[#CCDDF0]">{v.pagesViewed}/{doc.totalPages}</span>
                          <span className="text-[13px] tabular-nums font-semibold px-2 py-0.5 rounded-[4px]" style={{
                            color: v.maxScrollDepth >= 80 ? '#1A7A35' : v.maxScrollDepth >= 50 ? '#C07000' : '#CF3131',
                            background: v.maxScrollDepth >= 80 ? 'rgba(52,199,89,0.1)' : v.maxScrollDepth >= 50 ? 'rgba(255,159,10,0.1)' : 'rgba(255,59,48,0.1)',
                          }}>
                            {v.maxScrollDepth}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('channel')
  const [costMap, setCostMap] = useState<Record<string, string>>({})

  // Summary KPIs
  const totalLeads = LEAD_SOURCES.reduce((s, x) => s + x.leads, 0)
  const totalWon   = LEAD_SOURCES.reduce((s, x) => s + x.won, 0)
  const avgWinRate = Math.round((totalWon / LEAD_SOURCES.reduce((s, x) => s + x.deals, 0)) * 100)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bestROI = [...LEAD_SOURCES].sort((a, b) => {
    const ra = parseInt(costMap[a.id] || '0') > 0 ? (a.won * a.avgDealAmount) / parseInt(costMap[a.id] || '0') : 0
    const rb = parseInt(costMap[b.id] || '0') > 0 ? (b.won * b.avgDealAmount) / parseInt(costMap[b.id] || '0') : 0
    return rb - ra
  })[0]!  // LEAD_SOURCES is non-empty, so [0] is always defined

  const TABS: { key: AnalyticsTab; label: string; icon: React.ElementType }[] = [
    { key: 'channel',  label: 'IS経路分析',      icon: TrendingUp },
    { key: 'team',     label: 'チーム実績',      icon: Users },
    { key: 'ga',       label: 'HP分析',          icon: Globe },
    { key: 'tracking', label: '資料トラッキング', icon: FileText },
    { key: 'event',    label: 'イベント成果',    icon: BarChart2 },
  ]

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">アナリティクス</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">経路別・担当者別の商談パフォーマンス分析</p>
      </div>

      {/* ── Summary KPI Bar ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: '総リード数',
            value: `${totalLeads}件`,
            sub: '全経路合計',
            icon: Users,
            color: '#0071E3',
            bg: 'rgba(0,113,227,0.08)',
          },
          {
            label: '平均受注率',
            value: `${avgWinRate}%`,
            sub: '商談→受注',
            icon: Award,
            color: '#34C759',
            bg: 'rgba(52,199,89,0.08)',
          },
          {
            label: '最高ROI経路',
            value: bestROI.label,
            sub: `受注${bestROI.won}件 / 受注額${formatAmount(bestROI.won * bestROI.avgDealAmount)}`,
            icon: TrendingUp,
            color: '#5E5CE6',
            bg: 'rgba(94,92,230,0.08)',
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0c1028] rounded-[8px] p-4 flex items-start gap-3"
            style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: kpi.bg }}
            >
              <kpi.icon size={16} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-[11px] text-[#99AACC] uppercase tracking-[0.04em] font-medium mb-0.5">{kpi.label}</p>
              <p className="text-[18px] font-semibold text-[#EEEEFF] tracking-[-0.02em] leading-none">{kpi.value}</p>
              <p className="text-[11px] text-[#CCDDF0] mt-0.5">{kpi.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="bg-[#0c1028] rounded-[8px] overflow-hidden"
        style={{ border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        <div className="flex" style={{ borderBottom: '1px solid #2244AA' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium transition-colors duration-100 ${
                activeTab === tab.key ? 'text-[#0071E3]' : 'text-[#CCDDF0] hover:text-[#EEEEFF]'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="analytics-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: '#0071E3' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === 'channel' && (
              <motion.div
                key="channel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChannelFunnelChart costMap={costMap} setCostMap={setCostMap} />
              </motion.div>
            )}

            {activeTab === 'team' && <TeamPerformanceTab />}

            {activeTab === 'ga' && <GATab />}

            {activeTab === 'tracking' && <TrackingTab />}

            {activeTab === 'event' && (
              <motion.div
                key="event"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div
                  className="w-14 h-14 rounded-[8px] flex items-center justify-center"
                  style={{ background: 'rgba(0,113,227,0.08)' }}
                >
                  <BarChart2 size={24} style={{ color: '#0071E3' }} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-[#EEEEFF] tracking-[-0.02em]">イベント成果分析</p>
                  <p className="text-[13px] text-[#99AACC] mt-1">セミナー・展示会・ウェビナーの成果分析 — 近日公開</p>
                </div>
                <div
                  className="px-4 py-2 rounded-full text-[12px] font-medium"
                  style={{ background: 'rgba(0,113,227,0.08)', color: '#0071E3' }}
                >
                  Coming Soon
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
