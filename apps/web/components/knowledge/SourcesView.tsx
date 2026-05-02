'use client'

import { Database, FileText, Globe } from 'lucide-react'
import { ObsCard } from '@/components/obsidian'

export function SourcesView() {
  return (
    <ObsCard depth="high" padding="lg" radius="xl">
      <div className="flex flex-col items-center justify-center py-10 gap-5">
        <div
          className="w-16 h-16 rounded-[var(--radius-obs-lg)] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
        >
          <Database size={26} style={{ color: 'var(--color-obs-primary)' }} />
        </div>
        <div className="text-center flex flex-col gap-1.5 max-w-md">
          <h2
            className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            Phase 2 で実装予定
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
            Drive / SharePoint / Webサイトの接続設定、対象フォルダの指定、再認証フローを提供する予定です。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mt-4">
          {[
            { icon: Database, label: 'Google Drive', desc: '指定フォルダを再帰インデックス' },
            { icon: FileText, label: 'SharePoint', desc: 'サイト単位で接続' },
            { icon: Globe, label: 'Web ページ', desc: '社内Wiki などの公開URL' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[var(--radius-obs-md)] p-4 flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
              }}
            >
              <s.icon size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
              <p className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                {s.label}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ObsCard>
  )
}
