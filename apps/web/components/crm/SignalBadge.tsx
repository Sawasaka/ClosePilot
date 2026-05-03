'use client'

/**
 * 1stパーティ シグナルバッジ
 *
 * 自社1stパーティーデータ（メール開封・資料DL・サイト訪問など）から算出した
 * インテントシグナルを 強/中/弱 で表示する。取引・パイプラインなど CRM 系で共通利用。
 *
 * - 強：3チャネルすべて（メール開封・資料DL・サイト訪問）
 * - 中：2チャネル揃う or 「資料DL」「サイト訪問」のいずれか単独
 * - 弱：メール開封のみ
 */

import { useState } from 'react'
import { Activity, Zap, Radio, Mail, FileText, Globe, Check } from 'lucide-react'

export type Signal = 'Hot' | 'Middle' | 'Low'
type ChipTone = 'hot' | 'middle' | 'low'

export function signalToTone(s: Signal): ChipTone {
  if (s === 'Hot') return 'hot'
  if (s === 'Middle') return 'middle'
  return 'low'
}

export function signalLabel(s: Signal): string {
  if (s === 'Hot') return '強'
  if (s === 'Middle') return '中'
  return '弱'
}

export function signalIcon(s: Signal) {
  if (s === 'Hot') return Zap
  if (s === 'Middle') return Activity
  return Radio
}

type SignalChannel = 'email' | 'doc' | 'site'

const SIGNAL_CHANNELS: { key: SignalChannel; label: string; Icon: typeof Mail }[] = [
  { key: 'email', label: 'メール開封', Icon: Mail },
  { key: 'doc',   label: '資料DL',     Icon: FileText },
  { key: 'site',  label: 'サイト訪問', Icon: Globe },
]

// 各シグナル段階のサンプル充足パターン（実装時はGA4/MA/サイトログ等から取得）
const SIGNAL_HITS: Record<Signal, Record<SignalChannel, boolean>> = {
  Hot:    { email: true, doc: true,  site: true },
  Middle: { email: true, doc: false, site: true },
  Low:    { email: true, doc: false, site: false },
}

const TONE_COLOR: Record<ChipTone, { fg: string; bg: string; ring: string }> = {
  hot:    { fg: 'var(--color-obs-hot)',    bg: 'rgba(255,107,107,0.14)', ring: 'rgba(255,107,107,0.32)' },
  middle: { fg: 'var(--color-obs-middle)', bg: 'rgba(255,184,107,0.14)', ring: 'rgba(255,184,107,0.32)' },
  low:    { fg: 'var(--color-obs-low)',    bg: 'rgba(126,198,255,0.14)', ring: 'rgba(126,198,255,0.32)' },
}

export function SignalBadge({ signal }: { signal: Signal }) {
  const [hover, setHover] = useState(false)
  const Icon = signalIcon(signal)
  const tone = signalToTone(signal)
  const label = signalLabel(signal)
  const hits = SIGNAL_HITS[signal]
  const hitCount = (Object.values(hits) as boolean[]).filter(Boolean).length
  const c = TONE_COLOR[tone]

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold cursor-help"
        style={{ backgroundColor: c.bg, color: c.fg, boxShadow: `inset 0 0 0 1px ${c.ring}` }}
      >
        <Icon size={11} strokeWidth={2.4} />
        {label}
      </span>

      {hover && (
        <div
          className="absolute left-0 top-full mt-1.5 z-30 w-[240px] rounded-[var(--radius-obs-md)] overflow-hidden animate-[fadeIn_0.18s_ease-out]"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(65,71,83,0.4)',
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
          >
            <span
              className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] uppercase"
              style={{ color: c.fg }}
            >
              <Icon size={11} strokeWidth={2.4} />
              シグナル {label}
            </span>
            <span
              className="text-[10.5px] tabular-nums font-medium"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              {hitCount} / 3
            </span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            {SIGNAL_CHANNELS.map((ch) => {
              const ok = hits[ch.key]
              const ChIcon = ch.Icon
              return (
                <div key={ch.key} className="flex items-center justify-between text-[11.5px]">
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: ok ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}
                  >
                    <ChIcon size={11} strokeWidth={2.2} />
                    {ch.label}
                  </span>
                  {ok ? (
                    <Check size={12} strokeWidth={3} style={{ color: '#6ee7a1' }} />
                  ) : (
                    <span
                      className="text-[10.5px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      —
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div
            className="px-3 py-1.5 text-[10px]"
            style={{
              color: 'var(--color-obs-text-subtle)',
              backgroundColor: 'var(--color-obs-surface-low)',
            }}
          >
            <span className="inline-flex items-center gap-1">
              <Activity size={9} />
              過去7日 / 1stパーティーデータ
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
