'use client'

import { useEffect, useRef, useState } from 'react'
import { UserRound, Check } from 'lucide-react'

type Assignee = { id: string; name: string }

// Phase 1: モック。将来的にはワークスペースのメンバー一覧から取得する。
const ASSIGNEES: Assignee[] = [
  { id: 'all',          name: '全員' },
  { id: 'dev-taro',     name: '開発 太郎' },
  { id: 'sales-hanako', name: '営業 花子' },
  { id: 'mkt-jiro',     name: 'マーケ 次郎' },
  { id: 'is-saburo',    name: 'IS 三郎' },
  { id: 'cs-shiro',     name: 'CS 四郎' },
]

export function AssigneeFilter() {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('all')
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const selected = ASSIGNEES.find((a) => a.id === selectedId) ?? ASSIGNEES[0]!

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium transition-colors duration-150"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          color: 'var(--color-obs-text)',
        }}
        title="担当者で絞り込む"
      >
        <UserRound size={12} style={{ color: 'var(--color-obs-primary)' }} />
        {selected.name}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 rounded-[var(--radius-obs-md)] py-1 z-50 min-w-[180px]"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(109,106,111,0.14)',
          }}
        >
          {ASSIGNEES.map((a) => {
            const isSelected = a.id === selectedId
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedId(a.id)
                  setOpen(false)
                }}
                className="w-[calc(100%-8px)] mx-1 flex items-center gap-2 px-3 py-[7px] rounded-[6px] text-left transition-colors duration-100"
                style={{
                  color: 'var(--color-obs-text)',
                  fontWeight: isSelected ? 600 : 500,
                  backgroundColor: 'transparent',
                }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-obs-surface-low)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <span className="text-[13px] tracking-[-0.01em] flex-1">{a.name}</span>
                {isSelected && (
                  <Check size={13} strokeWidth={2.2} style={{ color: 'var(--color-obs-primary)' }} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
