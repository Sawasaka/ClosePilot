'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Upload, FileText, Sparkles, Copy, Eye, X, Plus, CheckCircle2 } from 'lucide-react'

// ─── 資料作成スタジオ ─────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description: string
  fileType: 'pptx' | 'pdf' | 'doc'
  colors: string[]
  createdAt: string
  usageCount: number
}

const FILE_TYPE_LABELS: Record<string, string> = { pptx: 'PowerPoint', pdf: 'PDF', doc: 'Word' }

const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: '会社紹介資料', description: 'コーポレートカラーを基調としたフォーマルな会社紹介テンプレート', fileType: 'pptx', colors: ['#0071E3', '#1D1D1F', '#FFFFFF'], createdAt: '2026-03-10', usageCount: 24 },
  { id: 't2', name: '製品提案書', description: '製品の強みとROIを訴求するセールス向け提案テンプレート', fileType: 'pptx', colors: ['#FF9F0A', '#1D1D1F', '#F5F5F7'], createdAt: '2026-03-15', usageCount: 18 },
  { id: 't3', name: '事例紹介レポート', description: '導入事例のBefore/Afterを視覚的に伝えるレポート形式', fileType: 'pdf', colors: ['#34C759', '#1D1D1F', '#FFFFFF'], createdAt: '2026-03-20', usageCount: 12 },
]

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

export default function ContentStudioPage() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES)
  const [showUpload, setShowUpload] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  function handleGenerate(templateId: string) {
    setGenerating(templateId)
    setTimeout(() => setGenerating(null), 2500)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-[14px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
              boxShadow: '0 0 24px rgba(139,92,246,0.85), 0 0 8px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
              border: '2px solid rgba(255,255,255,0.4)',
            }}
          >
            <Palette size={28} style={{ color: '#FFFFFF', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
          </div>
          <div>
            <h1 className="text-[24px] font-black text-[#EEEEFF] tracking-[0.02em]" style={{ textShadow: '0 0 16px rgba(167,139,250,0.4)' }}>
              資料作成スタジオ
            </h1>
            <p className="text-[13px] text-[#99AACC]">ベース資料のトンマナを維持してAIが資料を自動生成</p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-white text-sm font-bold rounded-[9px] transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
            border: '1px solid #3355CC',
            boxShadow: '0 2px 8px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.15)',
          }}
        >
          <Upload size={14} strokeWidth={2.5} />
          ベース資料を登録
        </button>
      </motion.div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-[10px] p-5 flex items-center gap-6"
        style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}>
        {[
          { step: '01', icon: Upload, label: 'ベース資料登録', desc: 'デザイン・トンマナの元となる資料をアップロード' },
          { step: '02', icon: Sparkles, label: 'AI解析', desc: 'カラー・フォント・レイアウトを自動学習' },
          { step: '03', icon: FileText, label: '資料生成', desc: '同じトンマナで新しい資料を自動作成' },
        ].map((s, i) => (
          <div key={s.step} className="flex-1 flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
                boxShadow: '0 0 14px rgba(139,92,246,0.7), inset 0 1px 0 rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#A78BFA] uppercase tracking-[0.1em]">STEP {s.step}</p>
              <p className="text-[13px] font-bold text-[#EEEEFF]">{s.label}</p>
              <p className="text-[11px] text-[#99AACC] mt-0.5">{s.desc}</p>
            </div>
            {i < 2 && <div className="w-px h-12 shrink-0 mt-1" style={{ background: '#2244AA' }} />}
          </div>
        ))}
      </motion.div>

      {/* Template cards */}
      <div>
        <h2 className="text-[14px] font-bold text-[#EEEEFF] mb-3">登録済みテンプレート ({templates.length})</h2>
        <div className="grid grid-cols-3 gap-4">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[12px] p-5 relative overflow-hidden group"
              style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}
            >
              {/* Color bar */}
              <div className="flex gap-1 mb-4">
                {tpl.colors.map((c, j) => (
                  <div key={j} className="w-6 h-6 rounded-full" style={{
                    background: c,
                    boxShadow: `0 0 10px ${c}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
                    border: '1.5px solid rgba(255,255,255,0.4)',
                  }} />
                ))}
                <span className="ml-auto text-[10px] font-bold text-[#99AACC] uppercase tracking-[0.06em] px-2 py-0.5 rounded-[4px]"
                  style={{ background: 'rgba(136,187,255,0.1)', border: '1px solid rgba(136,187,255,0.2)' }}>
                  {FILE_TYPE_LABELS[tpl.fileType]}
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-[#EEEEFF] mb-1">{tpl.name}</h3>
              <p className="text-[12px] text-[#99AACC] leading-relaxed mb-4 line-clamp-2">{tpl.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#99AACC]">{tpl.usageCount}回利用</span>
                <button
                  onClick={() => handleGenerate(tpl.id)}
                  disabled={generating === tpl.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-[8px] transition-all hover:brightness-110"
                  style={{
                    background: generating === tpl.id
                      ? 'linear-gradient(135deg, #A7F3D0 0%, #34C759 100%)'
                      : 'linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)',
                    color: generating === tpl.id ? '#053D24' : '#FFFFFF',
                    boxShadow: generating === tpl.id
                      ? '0 0 14px rgba(52,199,89,0.7)'
                      : '0 0 14px rgba(139,92,246,0.7)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {generating === tpl.id ? (
                    <><CheckCircle2 size={12} />生成完了</>
                  ) : (
                    <><Sparkles size={12} />資料を生成</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
