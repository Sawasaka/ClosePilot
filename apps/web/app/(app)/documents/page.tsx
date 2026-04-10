'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, FileText, Eye, Users, Copy, Upload, X, Link2 } from 'lucide-react'
import type { ManagedDocument } from '@/types/crm'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DOCS: ManagedDocument[] = [
  { id: 'doc-1', name: 'Intent Force サービス紹介資料 v2.1', type: 'service_intro', trackingUrl: 'https://track.closepilot.app/d/abc123', totalPages: 12, createdAt: '2026-03-15', createdBy: '田中太郎', totalViews: 45, uniqueViewers: 28, fileSize: 2400000, mimeType: 'application/pdf', isPublished: true, password: null, expiresAt: null, tags: ['サービス紹介', 'v2'] },
  { id: 'doc-2', name: '株式会社テクノリード向け提案書', type: 'proposal', trackingUrl: 'https://track.closepilot.app/d/def456', totalPages: 18, createdAt: '2026-03-20', createdBy: '鈴木花子', totalViews: 12, uniqueViewers: 3, fileSize: 5100000, mimeType: 'application/pdf', isPublished: true, password: 'tech2026', expiresAt: '2026-04-20', tags: ['提案書', 'テクノリード'] },
  { id: 'doc-3', name: '導入事例集 2026年版', type: 'case_study', trackingUrl: 'https://track.closepilot.app/d/ghi789', totalPages: 24, createdAt: '2026-03-10', createdBy: '田中太郎', totalViews: 67, uniqueViewers: 41, fileSize: 8200000, mimeType: 'application/pdf', isPublished: true, password: null, expiresAt: null, tags: ['事例集', '2026'] },
  { id: 'doc-4', name: '料金プラン比較表', type: 'pricing', trackingUrl: 'https://track.closepilot.app/d/jkl012', totalPages: 4, createdAt: '2026-03-22', createdBy: '佐藤次郎', totalViews: 23, uniqueViewers: 18, fileSize: 980000, mimeType: 'application/pdf', isPublished: true, password: null, expiresAt: null, tags: ['料金'] },
  { id: 'doc-5', name: 'ROI試算シート', type: 'other', trackingUrl: 'https://track.closepilot.app/d/mno345', totalPages: 6, createdAt: '2026-03-25', createdBy: '鈴木花子', totalViews: 8, uniqueViewers: 5, fileSize: 1200000, mimeType: 'application/pdf', isPublished: false, password: null, expiresAt: null, tags: ['ROI'] },
  { id: 'doc-6', name: 'セキュリティチェックシート', type: 'other', trackingUrl: 'https://track.closepilot.app/d/pqr678', totalPages: 3, createdAt: '2026-03-26', createdBy: '田中太郎', totalViews: 4, uniqueViewers: 2, fileSize: 450000, mimeType: 'application/pdf', isPublished: true, password: null, expiresAt: null, tags: ['セキュリティ'] },
]

const TYPE_LABELS: Record<string, string> = {
  proposal: '提案書', service_intro: 'サービス紹介', case_study: '事例集', pricing: '料金表', other: 'その他',
}
const TYPE_COLORS: Record<string, string> = {
  proposal: '#5E5CE6', service_intro: '#0071E3', case_study: '#34C759', pricing: '#FF9F0A', other: '#8E8E93',
}
const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

function formatSize(bytes: number) {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`
  return `${Math.round(bytes / 1000)}KB`
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showUpload, setShowUpload] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = MOCK_DOCS
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)))
    }
    if (typeFilter !== 'all') list = list.filter(d => d.type === typeFilter)
    return list
  }, [search, typeFilter])

  const totalViews = MOCK_DOCS.reduce((s, d) => s + d.totalViews, 0)
  const totalUnique = MOCK_DOCS.reduce((s, d) => s + d.uniqueViewers, 0)

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">資料</h1>
        <p className="text-[13px] text-[#8E8E93] mt-0.5">営業資料のアップロード・リンク生成・閲覧分析</p>
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '総資料数', value: MOCK_DOCS.length, color: '#0071E3' },
          { label: '総閲覧数', value: totalViews, color: '#5E5CE6' },
          { label: 'ユニーク閲覧者', value: totalUnique, color: '#34C759' },
          { label: '公開中', value: MOCK_DOCS.filter(d => d.isPublished).length, color: '#FF9F0A' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[14px] p-4 relative overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${kpi.color}25 0%, transparent 70%)` }} />
            <p className="text-[11px] text-[#AEAEB2] font-medium uppercase tracking-[0.04em]">{kpi.label}</p>
            <p className="text-[24px] font-bold tracking-[-0.04em] mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#AEAEB2' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="資料名・タグで検索..."
            className="h-[32px] w-full pl-8 pr-3 text-[13px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid transparent' }} />
        </div>
        <div className="flex items-center gap-1.5">
          {[{ key: 'all', label: '全て' }, ...Object.entries(TYPE_LABELS).map(([k, v]) => ({ key: k, label: v }))].map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)}
              className="h-[28px] px-3 text-[12px] font-medium rounded-full transition-all"
              style={{ background: typeFilter === f.key ? '#1D1D1F' : 'rgba(0,0,0,0.04)', color: typeFilter === f.key ? '#FFF' : '#6E6E73' }}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowUpload(true)}
          className="h-[32px] px-3 flex items-center gap-1.5 text-[13px] font-medium text-white rounded-[8px] ml-auto"
          style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}>
          <Upload size={13} />
          資料アップロード
        </button>
      </div>

      {/* Document cards */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[14px] p-5 cursor-pointer" style={{ boxShadow: CARD_SHADOW }}
            onClick={() => router.push(`/documents/${doc.id}`)}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: `${TYPE_COLORS[doc.type]}12` }}>
                <FileText size={18} style={{ color: TYPE_COLORS[doc.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1D1D1F] truncate leading-tight">{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-[4px]"
                    style={{ background: `${TYPE_COLORS[doc.type]}12`, color: TYPE_COLORS[doc.type] }}>
                    {TYPE_LABELS[doc.type]}
                  </span>
                  <span className="text-[11px] text-[#AEAEB2]">{doc.totalPages}ページ</span>
                  <span className="text-[11px] text-[#AEAEB2]">{formatSize(doc.fileSize)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Eye size={12} style={{ color: '#5E5CE6' }} />
                <span className="text-[12px] font-semibold text-[#5E5CE6]">{doc.totalViews}</span>
                <span className="text-[11px] text-[#AEAEB2]">閲覧</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} style={{ color: '#34C759' }} />
                <span className="text-[12px] font-medium text-[#34C759]">{doc.uniqueViewers}</span>
                <span className="text-[11px] text-[#AEAEB2]">ユニーク</span>
              </div>
              {!doc.isPublished && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] bg-[rgba(0,0,0,0.06)] text-[#8E8E93]">非公開</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); handleCopy(doc.trackingUrl, doc.id) }}
                className="flex-1 h-[30px] flex items-center justify-center gap-1.5 text-[12px] font-medium rounded-[7px] transition-all"
                style={{ background: copied === doc.id ? 'rgba(52,199,89,0.1)' : 'rgba(0,0,0,0.04)', color: copied === doc.id ? '#1A7A35' : '#6E6E73' }}>
                {copied === doc.id ? <><Link2 size={12} />コピー済み</> : <><Copy size={12} />URLコピー</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16"><p className="text-[14px] text-[#AEAEB2]">資料が見つかりません</p></div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowUpload(false)} />
            <motion.div className="relative w-[480px] rounded-[16px] p-6" style={{ background: '#FFF', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
              initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-semibold text-[#1D1D1F]">資料アップロード</h2>
                <button onClick={() => setShowUpload(false)} className="p-1 rounded-full hover:bg-[rgba(0,0,0,0.05)]"><X size={16} style={{ color: '#8E8E93' }} /></button>
              </div>
              <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-[12px] p-8 text-center mb-4 hover:border-[rgba(0,85,255,0.3)] transition-colors">
                <Upload size={32} style={{ color: '#AEAEB2' }} className="mx-auto mb-3" />
                <p className="text-[14px] font-medium text-[#1D1D1F]">ファイルをドラッグ&ドロップ</p>
                <p className="text-[12px] text-[#AEAEB2] mt-1">PDF, PPTX, DOCX (最大50MB)</p>
                <button className="mt-3 h-[32px] px-4 text-[13px] font-medium text-[#0071E3] rounded-[8px] hover:bg-[rgba(0,85,255,0.06)] transition-colors">
                  ファイルを選択
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">資料名</label>
                  <input placeholder="例: サービス紹介資料 v2.1" className="mt-1 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#6E6E73] uppercase tracking-[0.04em]">種別</label>
                  <select className="mt-1 w-full h-[36px] px-3 text-[14px] rounded-[8px] text-[#1D1D1F] outline-none" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowUpload(false)} className="h-[34px] px-4 text-[13px] font-medium text-[#6E6E73] rounded-[8px] hover:bg-[rgba(0,0,0,0.05)]">キャンセル</button>
                <button className="h-[34px] px-4 text-[13px] font-semibold text-white rounded-[8px]"
                  style={{ background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)', boxShadow: '0 2px 8px rgba(255,59,48,0.35)' }}
                  onClick={() => setShowUpload(false)}>
                  アップロード
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
