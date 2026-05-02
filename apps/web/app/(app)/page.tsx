'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUp,
  Paperclip,
  Mic,
  Hourglass,
  Check,
  ChevronDown,
} from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'
import { AssigneeFilter } from '@/components/ai/AssigneeFilter'

type ThinkingDepth = 'standard' | 'extended'

const THINKING_DEPTH_OPTIONS: { value: ThinkingDepth; label: string; description: string }[] = [
  { value: 'standard', label: '標準', description: '素早い回答' },
  { value: 'extended', label: '拡張', description: 'より深く考える' },
]

export default function HomePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [thinkingDepth, setThinkingDepth] = useState<ThinkingDepth>('extended')
  const [isDepthOpen, setIsDepthOpen] = useState(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const depthRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isDepthOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (depthRef.current && !depthRef.current.contains(e.target as Node)) {
        setIsDepthOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDepthOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isDepthOpen])

  const currentDepth = THINKING_DEPTH_OPTIONS.find((o) => o.value === thinkingDepth)!

  const handleSubmit = () => {
    const q = prompt.trim()
    if (!q) return
    const params = new URLSearchParams({ q })
    // TODO: RAG エンドポイントに送信する — いまはナレッジページへ検索クエリとして渡す
    router.push(`/knowledge?${params.toString()}`)
  }

  return (
    <ObsPageShell>
      <div
        className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-8"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(171,199,255,0.06) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(0,113,227,0.04) 0%, transparent 50%)',
        }}
      >
        {/* ── Chat / RAG Input (centered vertically; hero title sits above via absolute) ── */}
        <div className="w-full max-w-[780px] relative">
          {/* ── Hero prompt (大きな見出し: 何を調べますか？) ── */}
          <div className="absolute bottom-full left-0 right-0 mb-10 flex flex-col items-center gap-2">
            <h1
              className="font-[family-name:var(--font-display)] text-center font-semibold tracking-[-0.025em] leading-[1.1]"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                color: 'var(--color-obs-text)',
              }}
            >
              何を調べますか？
            </h1>
          </div>

        {/* ── Chat input box ── */}
        <div
            className="rounded-[var(--radius-obs-2xl)] p-1.5 transition-shadow duration-300"
            style={{
              backgroundColor: 'var(--color-obs-surface-high)',
              boxShadow: prompt
                ? '0 0 0 2px rgba(171,199,255,0.18), 0 20px 40px rgba(0,0,0,0.35)'
                : '0 10px 30px rgba(0,0,0,0.3)',
              transitionTimingFunction: 'var(--ease-liquid)',
            }}
          >
            <textarea
              ref={taRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="BGMに何でも尋ねる — 企業・商談・議事録を横断検索"
              rows={2}
              className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-[15px] leading-relaxed"
              style={{
                color: 'var(--color-obs-text)',
              }}
            />

            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
                  }}
                  title="添付"
                >
                  <Paperclip size={16} />
                </button>
                {/* ── 思考の深さ Dropdown ── */}
                <div ref={depthRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDepthOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={isDepthOpen}
                    className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full text-[12px] font-medium transition-colors duration-150"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-highest)',
                      color: 'var(--color-obs-text)',
                    }}
                    title="思考の深さ"
                  >
                    <Hourglass size={12} style={{ color: 'var(--color-obs-primary)' }} />
                    {currentDepth.label}
                    <ChevronDown
                      size={12}
                      style={{
                        color: 'var(--color-obs-text-muted)',
                        transform: isDepthOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 150ms var(--ease-liquid)',
                      }}
                    />
                  </button>

                  {isDepthOpen && (
                    <div
                      role="listbox"
                      aria-label="思考の深さ"
                      className="absolute bottom-full left-0 mb-2 min-w-[200px] py-2 rounded-[var(--radius-obs-lg)] z-50"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        border: '1px solid var(--color-obs-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div
                        className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.1em] uppercase"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        思考の深さ
                      </div>
                      {THINKING_DEPTH_OPTIONS.map((opt) => {
                        const selected = opt.value === thinkingDepth
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setThinkingDepth(opt.value)
                              setIsDepthOpen(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-150"
                            style={{ color: 'var(--color-obs-text)' }}
                            onMouseOver={(e) => {
                              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                'var(--color-obs-surface-highest)'
                            }}
                            onMouseOut={(e) => {
                              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                'transparent'
                            }}
                          >
                            <Hourglass
                              size={13}
                              style={{
                                color: selected
                                  ? 'var(--color-obs-primary)'
                                  : 'var(--color-obs-text-muted)',
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium leading-tight">
                                {opt.label}
                              </div>
                              <div
                                className="text-[11.5px] leading-tight mt-0.5"
                                style={{ color: 'var(--color-obs-text-muted)' }}
                              >
                                {opt.description}
                              </div>
                            </div>
                            {selected && (
                              <Check
                                size={14}
                                style={{ color: 'var(--color-obs-primary)' }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── 担当者で絞り込む ── */}
                <AssigneeFilter />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
                  }}
                  title="音声入力"
                >
                  <Mic size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    background: prompt.trim()
                      ? 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                      : 'var(--color-obs-surface-highest)',
                    color: prompt.trim() ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                    boxShadow: prompt.trim() ? 'inset 0 1px 0 rgba(255,255,255,0.18)' : 'inset 0 0 0 1px var(--color-obs-border)',
                    transitionTimingFunction: 'var(--ease-liquid)',
                  }}
                  title="送信 (Enter)"
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ObsPageShell>
  )
}
