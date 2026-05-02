'use client'

import { useEffect, useState } from 'react'
import {
  Calendar as CalendarLucide,
  Check,
  Hash,
  Link2,
  Loader2,
  Mail as MailLucide,
  MessageSquare as MessageSquareLucide,
  Plug,
  RefreshCw,
  Trash2,
  Video as VideoLucide,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'

type ServiceKey = 'gmail' | 'calendar' | 'meet' | 'chat'

interface ServiceState {
  available: boolean // OAuth スコープが取得済みか
  enabled: boolean // ユーザーが有効化しているか
  lastSyncAt: string | null
}

interface GoogleStatus {
  connected: boolean
  email?: string
  services?: Record<ServiceKey, ServiceState>
}

const SERVICE_DEFS: Array<{
  key: ServiceKey
  label: string
  icon: () => React.ReactNode
  description: string
}> = [
  {
    key: 'gmail',
    label: 'Gmail',
    icon: () => (
      <OfficialIcon
        src="/icons/gmail.png"
        alt="Gmail"
        fallback={<BrandedIcon Icon={MailLucide} color="#EA4335" bg="rgba(234,67,53,0.14)" />}
      />
    ),
    description: '送受信メールをコンタクトのメアドと一致させて取り込み',
  },
  {
    key: 'calendar',
    label: 'Google カレンダー',
    icon: () => (
      <OfficialIcon
        src="/icons/google-calendar.png"
        alt="Google Calendar"
        fallback={<BrandedIcon Icon={CalendarLucide} color="#4285F4" bg="rgba(66,133,244,0.14)" />}
      />
    ),
    description: '商談予定を取引・コンタクトに自動連携',
  },
  {
    key: 'meet',
    label: 'Google Meet（議事録）',
    icon: () => (
      <OfficialIcon
        src="/icons/google-meet.png"
        alt="Google Meet"
        fallback={<BrandedIcon Icon={VideoLucide} color="#00897B" bg="rgba(0,137,123,0.14)" />}
      />
    ),
    description: '文字起こし取得 → 商談ステージ自動遷移・n回目商談を自動カウント',
  },
  {
    key: 'chat',
    label: 'Google チャット',
    icon: () => (
      <OfficialIcon
        src="/icons/google-chat.png"
        alt="Google Chat"
        fallback={<BrandedIcon Icon={MessageSquareLucide} color="#34A853" bg="rgba(52,168,83,0.14)" />}
      />
    ),
    description: 'スペース・DM のメッセージをコンタクトに紐付け',
  },
]

export default function IntegrationsPage() {
  const [status, setStatus] = useState<GoogleStatus | null>(null)
  const [busy, setBusy] = useState<ServiceKey | 'all' | null>(null)
  const [lastResult, setLastResult] = useState<unknown>(null)

  const refresh = async () => {
    const r = await fetch('/api/google/status')
    if (r.ok) setStatus(await r.json())
  }

  useEffect(() => {
    refresh()
  }, [])

  const sync = async (scope: ServiceKey | 'all') => {
    setBusy(scope)
    setLastResult(null)
    try {
      const r = await fetch(`/api/google/sync?scope=${scope}`, { method: 'POST' })
      setLastResult(await r.json())
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  const toggle = async (service: ServiceKey, enabled: boolean) => {
    await fetch('/api/google/toggle', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ service, enabled }),
    })
    await refresh()
  }

  const connected = status?.connected ?? false

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Settings"
          title="連携設定"
          caption="Gmail / Google カレンダー / Google Meet / Google チャット を機能ごとに個別連携できます。"
        />

        {/* ── トップ: Google Workspace 一括連携 ── */}
        <ObsCard depth="high" padding="lg" radius="xl">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
            >
              <OfficialIcon
                src="/icons/google-workspace.png"
                alt="Google Workspace"
                fallback={<GoogleLogo />}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                  Google Workspace
                </h2>
                {connected && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: '#4ad98a',
                      backgroundColor: 'rgba(74,217,138,0.14)',
                    }}
                  >
                    <Check size={11} />
                    連携済み
                  </span>
                )}
              </div>
              <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                {connected && status?.email
                  ? `${status.email} としてログイン中。下記カードから機能を個別連携・解除できます。`
                  : '機能ごとに個別連携できます。下のカードから必要な機能だけを連携してください。一括連携も下記ボタンから可能です。'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/api/google/install?service=all"
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[var(--radius-obs-md)] text-[13.5px] font-medium transition-all duration-150"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--color-obs-primary-container) 0%, color-mix(in srgb, var(--color-obs-primary-container) 88%, #000 12%) 100%)',
                    color: 'var(--color-obs-on-primary)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.18)',
                  }}
                >
                  <Plug size={14} />
                  すべての機能を一括連携
                </a>
                {connected && (
                  <ObsButton
                    variant="ghost"
                    size="sm"
                    onClick={() => sync('all')}
                    disabled={busy !== null}
                  >
                    {busy === 'all' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 size={13} className="animate-spin" /> 一括同期中…
                      </span>
                    ) : (
                      'すべての機能を一括同期'
                    )}
                  </ObsButton>
                )}
                {connected && (
                  <button
                    onClick={async () => {
                      if (!confirm('Google 連携をすべて解除します。よろしいですか?')) return
                      setBusy('all')
                      try {
                        await fetch('/api/google/disconnect?service=all', { method: 'POST' })
                        await refresh()
                      } finally {
                        setBusy(null)
                      }
                    }}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors disabled:opacity-50"
                    style={{ color: 'var(--color-obs-hot)' }}
                  >
                    <Trash2 size={12} />
                    すべて解除
                  </button>
                )}
              </div>
            </div>
          </div>
        </ObsCard>

        {/* ── 機能別カード ── */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_DEFS.map((def) => {
            const s = status?.services?.[def.key]
            return (
              <ServiceCard
                key={def.key}
                serviceKey={def.key}
                icon={def.icon()}
                label={def.label}
                description={def.description}
                available={s?.available ?? false}
                enabled={s?.enabled ?? false}
                lastSyncAt={s?.lastSyncAt ?? null}
                busy={busy === def.key}
                onSync={() => sync(def.key)}
                onToggle={(v) => toggle(def.key, v)}
                onDisconnect={async () => {
                  if (!confirm(`${def.label} の連携を解除しますか?`)) return
                  setBusy(def.key)
                  try {
                    await fetch(`/api/google/disconnect?service=${def.key}`, { method: 'POST' })
                    await refresh()
                  } finally {
                    setBusy(null)
                  }
                }}
              />
            )
          })}
        </div>

        {lastResult !== null && (
          <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
            <div
              className="text-[12px] font-medium uppercase tracking-[0.1em] mb-2"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              直前の同期結果
            </div>
            <pre
              className="text-[12px] font-mono whitespace-pre-wrap"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </ObsCard>
        )}

        {/* ── Slack 連携 ── */}
        <SlackSection />

        <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
          <div
            className="text-[12px] font-medium uppercase tracking-[0.1em] mb-2"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            動作の前提
          </div>
          <ul className="text-[13px] space-y-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
            <li>・Workspace 管理コンソールで Meet の録画 / 文字起こし を有効化してください。</li>
            <li>
              ・会議ごとに 録画 と 文字起こし をオンにして開始してください（Meet API は録画/文字起こしが行われた会議のみ取得可能）。
            </li>
            <li>・コンタクトのメールアドレスがカレンダー参加者に含まれていれば、自動で取引・コンタクトに紐付きます。</li>
            <li>・Google Chat はスペース/DM の最近のメッセージを定期取り込みします。</li>
          </ul>
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}

function ServiceCard({
  serviceKey,
  icon,
  label,
  description,
  available,
  enabled,
  lastSyncAt,
  busy,
  onSync,
  onToggle,
  onDisconnect,
}: {
  serviceKey: ServiceKey
  icon: React.ReactNode
  label: string
  description: string
  available: boolean
  enabled: boolean
  lastSyncAt: string | null
  busy: boolean
  onSync: () => void
  onToggle: (v: boolean) => void
  onDisconnect: () => void
}) {
  return (
    <div
      className="rounded-[var(--radius-obs-xl)] p-5"
      style={{
        backgroundColor: 'var(--color-obs-surface)',
        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-high)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold text-[14.5px] tracking-[-0.01em]"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {label}
            </h3>
            <StatusPill available={available} enabled={enabled} />
          </div>
          <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            {description}
          </p>

          {!available ? (
            <div className="mt-3">
              <a
                href={`/api/google/install?service=${serviceKey}`}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-obs-primary-container)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                <Link2 size={12} />
                {label} を連携する
              </a>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                最終同期: {lastSyncAt ? new Date(lastSyncAt).toLocaleString('ja-JP') : '未同期'}
              </span>
              <div className="flex items-center gap-2">
                <ToggleSwitch checked={enabled} onChange={onToggle} />
                <button
                  onClick={onSync}
                  disabled={!enabled || busy}
                  className="h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors disabled:opacity-40"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    color: 'var(--color-obs-text)',
                  }}
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" /> 同期中
                    </span>
                  ) : (
                    '今すぐ同期'
                  )}
                </button>
                <button
                  onClick={onDisconnect}
                  disabled={busy}
                  className="h-8 px-2 rounded-[var(--radius-obs-md)] text-[12px] inline-flex items-center gap-1 transition-colors disabled:opacity-40"
                  style={{ color: 'var(--color-obs-hot)' }}
                  title="この機能の連携を解除"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// タイル内で使う、背景なしのカラー付きフォールバックアイコン。
// 親側の w-12 h-12 タイル（surface-high 背景）の中央に配置される。
function BrandedIcon({
  Icon,
  color,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  color: string
  bg?: string // 互換のため残す（未使用）
}) {
  return <Icon size={26} strokeWidth={2.2} style={{ color }} />
}

/**
 * 公式ブランドアイコンを表示。public/icons/ に PNG が置いてあれば表示し、
 * 無ければ fallback を表示する。サイズは親タイル（48px）に対して 32px。
 */
function OfficialIcon({
  src,
  alt,
  fallback,
  size = 32,
}: {
  src: string
  alt: string
  fallback: React.ReactNode
  size?: number
}) {
  const [errored, setErrored] = useState(false)
  if (errored) return <>{fallback}</>
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  )
}

function StatusPill({ available, enabled }: { available: boolean; enabled: boolean }) {
  if (!available) {
    return (
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
        style={{
          color: 'var(--color-obs-text-subtle)',
          backgroundColor: 'var(--color-obs-surface-high)',
        }}
      >
        未取得
      </span>
    )
  }
  if (enabled) {
    return (
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
        style={{
          color: '#4ad98a',
          backgroundColor: 'rgba(74,217,138,0.14)',
        }}
      >
        有効
      </span>
    )
  }
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
      style={{
        color: 'var(--color-obs-text-muted)',
        backgroundColor: 'var(--color-obs-surface-high)',
      }}
    >
      無効
    </span>
  )
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative w-9 h-5 rounded-full transition-colors disabled:opacity-50"
      style={{
        backgroundColor: checked ? 'var(--color-obs-primary)' : 'var(--color-obs-surface-highest)',
      }}
      aria-label="toggle"
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
        style={{
          backgroundColor: 'var(--color-obs-text)',
          transform: checked ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}

// ─── Slack セクション ────────────────────────────────────────────────────────

interface SlackWorkspaceState {
  id: string
  teamId: string
  teamName: string
  enabled: boolean
  lastSyncAt: string | null
}

function SlackSection() {
  const [status, setStatus] = useState<{ connected: boolean; workspaces: SlackWorkspaceState[] } | null>(
    null,
  )
  const [busy, setBusy] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<unknown>(null)

  const refresh = async () => {
    const r = await fetch('/api/slack/status')
    if (r.ok) setStatus(await r.json())
  }

  useEffect(() => {
    refresh()
  }, [])

  const sync = async (workspaceId?: string) => {
    setBusy(workspaceId ?? 'all')
    setLastResult(null)
    try {
      const url = workspaceId ? `/api/slack/sync?workspaceId=${workspaceId}` : '/api/slack/sync'
      const r = await fetch(url, { method: 'POST' })
      setLastResult(await r.json())
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  const disconnect = async (workspaceId: string) => {
    if (!confirm('このワークスペースとの連携を解除しますか?')) return
    setBusy(workspaceId)
    try {
      await fetch(`/api/slack/disconnect?workspaceId=${workspaceId}`, { method: 'POST' })
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  return (
    <ObsCard depth="high" padding="lg" radius="xl" className="mt-4">
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          <OfficialIcon src="/icons/slack.png" alt="Slack" fallback={<SlackLogo />} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              Slack
            </h2>
            {status?.connected && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: '#4ad98a', backgroundColor: 'rgba(74,217,138,0.14)' }}
              >
                <Check size={11} />
                {status.workspaces.length} 個のワークスペース連携中
              </span>
            )}
          </div>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            {status?.connected
              ? 'Bot を追加したチャンネル/DM のメッセージを取り込み、コンタクトに紐付けます。'
              : 'Slack ワークスペースに BGM CRM Bot を追加すると、メッセージをコンタクトに紐付けて取り込めます。'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/api/slack/install"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: '#4A154B',
                color: '#ffffff',
              }}
            >
              <SlackLogoMini />
              {status?.connected ? '別のワークスペースを追加' : 'Slack で連携する'}
            </a>
            {status?.connected && (
              <ObsButton variant="ghost" size="sm" onClick={() => sync()} disabled={busy !== null}>
                {busy === 'all' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" /> 同期中…
                  </span>
                ) : (
                  '全ワークスペース同期'
                )}
              </ObsButton>
            )}
          </div>

          {status?.connected && (
            <div className="mt-4 flex flex-col gap-2">
              {status.workspaces.map((w) => (
                <div
                  key={w.id}
                  className="rounded-[var(--radius-obs-md)] p-3 flex items-center gap-3"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <Hash size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {w.teamName || w.teamId}
                    </div>
                    <div
                      className="text-[11.5px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      最終同期: {w.lastSyncAt ? new Date(w.lastSyncAt).toLocaleString('ja-JP') : '未同期'}
                    </div>
                  </div>
                  <button
                    onClick={() => sync(w.id)}
                    disabled={busy !== null}
                    className="h-7 px-2 rounded-[var(--radius-obs-md)] text-[11.5px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-highest)',
                      color: 'var(--color-obs-text)',
                    }}
                  >
                    {busy === w.id ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    同期
                  </button>
                  <button
                    onClick={() => disconnect(w.id)}
                    disabled={busy !== null}
                    className="h-7 px-2 rounded-[var(--radius-obs-md)] text-[11.5px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    style={{ color: 'var(--color-obs-hot)' }}
                  >
                    <Trash2 size={11} />
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}

          {lastResult !== null && (
            <pre
              className="mt-3 text-[11.5px] font-mono whitespace-pre-wrap p-2 rounded"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text-muted)',
              }}
            >
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </ObsCard>
  )
}

function SlackLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
    </svg>
  )
}

function SlackLogoMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
