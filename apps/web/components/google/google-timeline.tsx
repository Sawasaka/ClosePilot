'use client'

import { useEffect, useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Video,
} from 'lucide-react'

type Direction = 'SENT' | 'RECEIVED'
type MeetingStatus = 'SCHEDULED' | 'HELD' | 'COMPLETED' | 'CANCELED'
type MeetingType = 'FIRST' | 'FOLLOW_UP' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSING' | 'OTHER' | null

interface EmailItem {
  id: string
  subject: string | null
  snippet: string | null
  fromAddress: string
  fromName: string | null
  toAddresses: string[]
  sentAt: string
  direction: Direction
}

interface MeetingItem {
  id: string
  title: string
  startsAt: string
  endsAt: string
  meetUrl: string | null
  status: MeetingStatus
  occurrenceIndex: number | null
  meetingType: MeetingType
  attendeeEmails: string[]
}

interface TranscriptItem {
  id: string
  type: 'CALL' | 'MEETING'
  source: 'MANUAL' | 'GOOGLE_MEET' | 'ZOOM' | 'OTHER'
  preview: string
  durationSec: number | null
  googleDocUrl: string | null
  meetingEventId: string | null
  createdAt: string
}

interface TimelineData {
  emails: EmailItem[]
  meetings: MeetingItem[]
  transcripts?: TranscriptItem[]
}

export function GoogleTimeline({
  scope,
  id,
}: {
  scope: 'deal' | 'contact'
  id: string
}) {
  const [data, setData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'call' | 'email' | 'meeting' | 'transcript'>('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch(`/api/${scope === 'deal' ? 'deals' : 'contacts'}/${id}/timeline`)
        if (!r.ok) throw new Error(`status ${r.status}`)
        const json = (await r.json()) as TimelineData
        if (!cancelled) setData(json)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [scope, id])

  const items = mergeAndSort(data, filter)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FilterChip label="すべて" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip
          label="コール"
          active={filter === 'call'}
          onClick={() => setFilter('call')}
          icon={<Phone size={11} />}
        />
        <FilterChip
          label="メール"
          active={filter === 'email'}
          onClick={() => setFilter('email')}
          icon={<Mail size={11} />}
        />
        <FilterChip
          label="会議"
          active={filter === 'meeting'}
          onClick={() => setFilter('meeting')}
          icon={<CalendarIcon size={11} />}
        />
        {scope === 'deal' && (
          <FilterChip
            label="議事録"
            active={filter === 'transcript'}
            onClick={() => setFilter('transcript')}
            icon={<FileText size={11} />}
          />
        )}
      </div>

      {loading && (
        <div className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          読み込み中…
        </div>
      )}
      {error && (
        <div className="text-[12px]" style={{ color: 'var(--color-obs-hot)' }}>
          取得に失敗しました: {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div
          className="text-[12px] py-6 text-center"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          まだメール・会議の履歴がありません。連携設定から同期してください。
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) =>
          item.kind === 'email' ? (
            <EmailRow key={`e-${item.id}`} item={item.data} />
          ) : item.kind === 'meeting' ? (
            <MeetingRow key={`m-${item.id}`} item={item.data} />
          ) : (
            <TranscriptRow key={`t-${item.id}`} item={item.data} />
          ),
        )}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  icon,
}: {
  label: string
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-medium"
      style={{
        backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
        color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function EmailRow({ item }: { item: EmailItem }) {
  const [open, setOpen] = useState(false)
  const isSent = item.direction === 'SENT'
  return (
    <div
      className="rounded-[var(--radius-obs-md)] p-3 transition-colors"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 text-left"
      >
        <div
          className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
        >
          <Mail size={13} style={{ color: 'var(--color-obs-text-muted)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
              style={{
                color: isSent ? 'var(--color-obs-primary)' : '#4ad98a',
                backgroundColor: isSent ? 'rgba(171,199,255,0.12)' : 'rgba(74,217,138,0.12)',
              }}
            >
              {isSent ? '送信' : '受信'}
            </span>
            <span
              className="font-medium text-[13.5px] truncate"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {item.subject ?? '(件名なし)'}
            </span>
          </div>
          <div
            className="mt-0.5 text-[12px] truncate"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {item.fromName ?? item.fromAddress} ・ {formatDate(item.sentAt)}
          </div>
          {!open && item.snippet && (
            <div className="mt-1 text-[12px] line-clamp-2" style={{ color: 'var(--color-obs-text-muted)' }}>
              {item.snippet}
            </div>
          )}
        </div>
        {open ? <ChevronUp size={14} className="shrink-0 mt-1 opacity-60" /> : <ChevronDown size={14} className="shrink-0 mt-1 opacity-60" />}
      </button>
      {open && (
        <div
          className="mt-2 pt-2 text-[12.5px] whitespace-pre-wrap"
          style={{ color: 'var(--color-obs-text-muted)', borderTop: '1px solid var(--color-obs-surface-low)' }}
        >
          {item.snippet ?? '(本文なし)'}
        </div>
      )}
    </div>
  )
}

function MeetingRow({ item }: { item: MeetingItem }) {
  return (
    <div
      className="rounded-[var(--radius-obs-md)] p-3"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
        >
          <CalendarIcon size={13} style={{ color: 'var(--color-obs-text-muted)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {item.occurrenceIndex && (
              <span
                className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                style={{ color: 'var(--color-obs-primary)', backgroundColor: 'rgba(171,199,255,0.14)' }}
              >
                {item.occurrenceIndex}回目
              </span>
            )}
            <StatusPill status={item.status} />
            <span className="font-medium text-[13.5px] truncate" style={{ color: 'var(--color-obs-text)' }}>
              {item.title}
            </span>
          </div>
          <div
            className="mt-0.5 text-[12px] truncate"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {formatDate(item.startsAt)} – {formatTime(item.endsAt)}
          </div>
          {item.attendeeEmails.length > 0 && (
            <div className="mt-1 text-[11.5px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
              参加者: {item.attendeeEmails.join(', ')}
            </div>
          )}
          {item.meetUrl && (
            <a
              href={item.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] hover:underline"
              style={{ color: 'var(--color-obs-primary)' }}
            >
              <Video size={11} />
              Meet を開く
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TranscriptRow({ item }: { item: TranscriptItem }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-[var(--radius-obs-md)] p-3"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 text-left"
      >
        <div
          className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
        >
          <FileText size={13} style={{ color: 'var(--color-obs-text-muted)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
              style={{ color: 'var(--color-obs-text-muted)', backgroundColor: 'var(--color-obs-surface-highest)' }}
            >
              {item.source === 'GOOGLE_MEET' ? 'Meet 議事録' : '議事録'}
            </span>
            <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {formatDate(item.createdAt)}
              {item.durationSec ? ` ・ ${Math.round(item.durationSec / 60)}分` : ''}
            </span>
          </div>
          <div className={`mt-1.5 text-[12.5px] whitespace-pre-wrap ${open ? '' : 'line-clamp-3'}`} style={{ color: 'var(--color-obs-text-muted)' }}>
            {item.preview}
          </div>
          {item.googleDocUrl && (
            <a
              href={item.googleDocUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] hover:underline"
              style={{ color: 'var(--color-obs-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              元の議事録 Doc を開く
              <ExternalLink size={10} />
            </a>
          )}
        </div>
        {open ? <ChevronUp size={14} className="shrink-0 mt-1 opacity-60" /> : <ChevronDown size={14} className="shrink-0 mt-1 opacity-60" />}
      </button>
    </div>
  )
}

function StatusPill({ status }: { status: MeetingStatus }) {
  const tone =
    status === 'COMPLETED'
      ? { color: '#4ad98a', bg: 'rgba(74,217,138,0.14)', label: '完了' }
      : status === 'HELD'
        ? { color: 'var(--color-obs-middle)', bg: 'rgba(255,184,107,0.14)', label: '開催済' }
        : status === 'CANCELED'
          ? { color: 'var(--color-obs-text-subtle)', bg: 'var(--color-obs-surface-highest)', label: 'キャンセル' }
          : { color: 'var(--color-obs-low)', bg: 'rgba(126,198,255,0.14)', label: '予定' }
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
      style={{ color: tone.color, backgroundColor: tone.bg }}
    >
      {tone.label}
    </span>
  )
}

type MergedItem =
  | { kind: 'email'; id: string; at: number; data: EmailItem }
  | { kind: 'meeting'; id: string; at: number; data: MeetingItem }
  | { kind: 'transcript'; id: string; at: number; data: TranscriptItem }

function mergeAndSort(
  data: TimelineData | null,
  filter: 'all' | 'call' | 'email' | 'meeting' | 'transcript',
): MergedItem[] {
  if (!data) return []
  const out: MergedItem[] = []
  if (filter === 'all' || filter === 'email') {
    for (const e of data.emails) {
      out.push({ kind: 'email', id: e.id, at: new Date(e.sentAt).getTime(), data: e })
    }
  }
  if (filter === 'all' || filter === 'meeting') {
    for (const m of data.meetings) {
      out.push({ kind: 'meeting', id: m.id, at: new Date(m.startsAt).getTime(), data: m })
    }
  }
  if (data.transcripts) {
    for (const t of data.transcripts) {
      // コール: type === 'CALL'、議事録: type === 'MEETING'
      if (filter === 'all') {
        out.push({ kind: 'transcript', id: t.id, at: new Date(t.createdAt).getTime(), data: t })
      } else if (filter === 'call' && t.type === 'CALL') {
        out.push({ kind: 'transcript', id: t.id, at: new Date(t.createdAt).getTime(), data: t })
      } else if (filter === 'transcript' && t.type === 'MEETING') {
        out.push({ kind: 'transcript', id: t.id, at: new Date(t.createdAt).getTime(), data: t })
      }
    }
  }
  out.sort((a, b) => b.at - a.at)
  return out
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}
