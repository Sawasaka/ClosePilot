'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Search, Plus, Tag, Building2, FileText, X } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'UX/UI' | 'インテグレーション' | 'パフォーマンス' | 'セキュリティ' | '機能要望' | 'サポート'
type SourceType = '新規' | '既存'

interface Issue {
  id: string
  title: string
  category: Category
  occurrences: number
  newCount: number
  existingCount: number
  companies: string[]
  relatedMeetings: string[]
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ISSUES: Issue[] = [
  { id: 'i1', title: '既存ツールとのデータ連携', category: 'インテグレーション', occurrences: 4, newCount: 3, existingCount: 1, companies: ['テクノリード', 'サクセス', 'デルタ', 'フューチャー'], relatedMeetings: ['m1', 'm3', 'm5', 'm2'] },
  { id: 'i2', title: 'ダッシュボード表示速度', category: 'パフォーマンス', occurrences: 3, newCount: 2, existingCount: 1, companies: ['サクセス', 'デルタ', 'グロース'], relatedMeetings: ['m3', 'm5', 'm6'] },
  { id: 'i3', title: 'カスタムレポートの柔軟性', category: '機能要望', occurrences: 3, newCount: 1, existingCount: 2, companies: ['フューチャー', 'イノベーション', 'グロース'], relatedMeetings: ['m2', 'm4', 'm6'] },
  { id: 'i4', title: 'SSO対応（SAML）', category: 'セキュリティ', occurrences: 2, newCount: 2, existingCount: 0, companies: ['デルタ', 'テクノリード'], relatedMeetings: ['m5', 'm1'] },
  { id: 'i5', title: 'オートメーション設定のUI改善', category: 'UX/UI', occurrences: 2, newCount: 0, existingCount: 2, companies: ['フューチャー', 'グロース'], relatedMeetings: ['m2', 'm6'] },
  { id: 'i6', title: 'API連携の安定性', category: 'インテグレーション', occurrences: 2, newCount: 1, existingCount: 1, companies: ['サクセス', 'イノベーション'], relatedMeetings: ['m3', 'm4'] },
  { id: 'i7', title: 'ナレッジベースの検索精度向上', category: '機能要望', occurrences: 2, newCount: 0, existingCount: 2, companies: ['イノベーション', 'グロース'], relatedMeetings: ['m4', 'm6'] },
  { id: 'i8', title: '監査ログの出力', category: 'セキュリティ', occurrences: 1, newCount: 1, existingCount: 0, companies: ['デルタ'], relatedMeetings: ['m5'] },
  { id: 'i9', title: 'モバイル対応の有無', category: 'UX/UI', occurrences: 1, newCount: 1, existingCount: 0, companies: ['テクノリード'], relatedMeetings: ['m1'] },
  { id: 'i10', title: 'オンボーディング後のフォロー不足', category: 'サポート', occurrences: 1, newCount: 0, existingCount: 1, companies: ['グロース'], relatedMeetings: ['m6'] },
]

const ALL_CATEGORIES: Category[] = ['UX/UI', 'インテグレーション', 'パフォーマンス', 'セキュリティ', '機能要望', 'サポート']

const CATEGORY_COLORS: Record<Category, string> = {
  'UX/UI': '#5E5CE6',
  'インテグレーション': '#0071E3',
  'パフォーマンス': '#FF9F0A',
  'セキュリティ': '#FF3B30',
  '機能要望': '#34C759',
  'サポート': '#AF52DE',
}

const CARD_SHADOW = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

// ─── Page ───────────────────────────────────────────────────────────────────

export default function IssuesPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | ''>('')
  const [filterSource, setFilterSource] = useState<SourceType | ''>('')

  const filtered = useMemo(() => {
    let list = MOCK_ISSUES
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.companies.some(c => c.toLowerCase().includes(q)))
    }
    if (filterCategory) list = list.filter(i => i.category === filterCategory)
    if (filterSource === '新規') list = list.filter(i => i.newCount > 0)
    if (filterSource === '既存') list = list.filter(i => i.existingCount > 0)
    return list.sort((a, b) => b.occurrences - a.occurrences)
  }, [search, filterCategory, filterSource])

  const maxOccurrences = Math.max(...MOCK_ISSUES.map(i => i.occurrences))

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">課題ボード</h1>
          <p className="text-[13px] text-[#CCDDF0] mt-0.5">顧客から抽出された課題・ニーズを一元管理</p>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-[#CCDDF0]">課題数 <strong className="text-[#EEEEFF]">{MOCK_ISSUES.length}</strong></span>
          <span className="text-[#CCDDF0]">関連企業 <strong className="text-[#0071E3]">{new Set(MOCK_ISSUES.flatMap(i => i.companies)).size}</strong> 社</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#99AACC]" />
          <input
            type="text" placeholder="課題・企業名を検索..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-[32px] pl-8 pr-3 w-[200px] text-[13px] rounded-[8px] text-[#EEEEFF] placeholder:text-[#99AACC] outline-none"
            style={{ background: 'rgba(16,16,40,0.6)' }}
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterCategory('')}
            className="h-[28px] px-2.5 text-[12px] font-medium rounded-full transition-all"
            style={{ background: !filterCategory ? '#2244AA' : 'rgba(136,187,255,0.06)', color: !filterCategory ? '#FFF' : '#88BBFF' }}
          >
            全カテゴリ
          </button>
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(prev => prev === cat ? '' : cat)}
              className="h-[28px] px-2.5 text-[12px] font-medium rounded-full transition-all"
              style={{
                background: filterCategory === cat ? CATEGORY_COLORS[cat] + '20' : 'rgba(0,0,0,0.04)',
                color: filterCategory === cat ? CATEGORY_COLORS[cat] : '#88BBFF',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Source filter */}
        <div className="flex items-center gap-1 ml-auto">
          {(['', '新規', '既存'] as (SourceType | '')[]).map(s => (
            <button
              key={s || 'all'}
              onClick={() => setFilterSource(s)}
              className="h-[28px] px-2.5 text-[12px] font-medium rounded-full transition-all"
              style={{
                background: filterSource === s ? '#2244AA' : 'rgba(136,187,255,0.06)',
                color: filterSource === s ? '#FFF' : '#88BBFF',
              }}
            >
              {s || '全て'}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
        {/* Header */}
        <div className="grid items-center px-5 py-2.5" style={{ gridTemplateColumns: '1fr 100px 140px 120px', borderBottom: '1px solid #2244AA', background: 'rgba(0,0,0,0.018)' }}>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">課題</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">出現数</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">新規 / 既存</span>
          <span className="text-[11px] text-[#99AACC] font-medium uppercase tracking-[0.04em]">カテゴリ</span>
        </div>

        {/* Rows */}
        {filtered.map((issue, i) => {
          const catColor = CATEGORY_COLORS[issue.category]
          const barWidth = (issue.occurrences / maxOccurrences) * 100
          return (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="grid items-center px-5 py-3.5 hover:bg-[rgba(136,187,255,0.04)] transition-colors cursor-pointer"
              style={{ gridTemplateColumns: '1fr 100px 140px 120px', borderBottom: '1px solid rgba(34,68,170,0.2)' }}
            >
              {/* 課題名 + 企業 */}
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#EEEEFF] truncate">{issue.title}</p>
                <p className="text-[11px] text-[#99AACC] mt-0.5 truncate flex items-center gap-1">
                  <Building2 size={10} />
                  {issue.companies.join('、')}
                </p>
              </div>

              {/* 出現数バー */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(34,68,170,0.15)' }}>
                  <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: catColor }} />
                </div>
                <span className="text-[13px] font-semibold text-[#EEEEFF] tabular-nums w-5 text-right">{issue.occurrences}</span>
              </div>

              {/* 新規/既存 内訳 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[6px] rounded-full overflow-hidden flex" style={{ background: 'rgba(34,68,170,0.15)' }}>
                  {issue.newCount > 0 && (
                    <div className="h-full" style={{ width: `${(issue.newCount / issue.occurrences) * 100}%`, background: '#0071E3' }} />
                  )}
                  {issue.existingCount > 0 && (
                    <div className="h-full" style={{ width: `${(issue.existingCount / issue.occurrences) * 100}%`, background: '#34C759' }} />
                  )}
                </div>
                <span className="text-[11px] text-[#CCDDF0] tabular-nums shrink-0">{issue.newCount} / {issue.existingCount}</span>
              </div>

              {/* カテゴリ */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium w-fit"
                style={{ background: catColor + '15', color: catColor }}
              >
                <Tag size={10} />
                {issue.category}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-[#99AACC]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />新規顧客</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />既存顧客</span>
      </div>
    </div>
  )
}
