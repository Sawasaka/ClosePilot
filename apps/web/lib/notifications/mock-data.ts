// ヘッダーのベルアイコンから開く通知パネルの仮データ。
// 運営(開発者)からユーザーへ届くお知らせを想定。
export type NotificationKind = 'release' | 'maintenance' | 'tip' | 'alert'

export type NotificationItem = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: string // ISO
  read: boolean
  ctaLabel?: string
  ctaHref?: string
}

export const KIND_META: Record<NotificationKind, { label: string; tone: 'primary' | 'middle' | 'low' | 'hot' }> = {
  release:     { label: 'リリース', tone: 'primary' },
  tip:         { label: 'Tips',    tone: 'low'     },
  maintenance: { label: 'メンテ',  tone: 'middle'  },
  alert:       { label: '重要',    tone: 'hot'     },
}

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_2026_05_01',
    kind: 'release',
    title: 'Google 連携(Gmail / Calendar / Meet)正式リリース',
    body:
      'Gmail・Google カレンダー・Meet 議事録の自動取込が利用可能になりました。アカウント連携は [設定 → 連携] から数クリックで完了します。',
    createdAt: '2026-05-01T10:00:00+09:00',
    read: false,
    ctaLabel: '連携を始める',
    ctaHref: '/settings/integrations',
  },
  {
    id: 'n_2026_04_28',
    kind: 'tip',
    title: 'インテントスコアの「部門別ビュー」が追加されました',
    body:
      '企業詳細画面のインテントタブに、IT / Sales / HR / Marketing の 4 部門別ヒートマップを追加しました。「どの部門で動きが出ているか」をひと目で把握できます。',
    createdAt: '2026-04-28T15:30:00+09:00',
    read: false,
    ctaLabel: 'サンプルを見る',
    ctaHref: '/companies',
  },
  {
    id: 'n_2026_04_25',
    kind: 'maintenance',
    title: '5 月 6 日 (火) 02:00–03:00 メンテナンス予定',
    body:
      'インフラ更新のため一時的にアクセスできなくなる時間帯があります。データの整合性に影響はありません。',
    createdAt: '2026-04-25T09:00:00+09:00',
    read: true,
  },
  {
    id: 'n_2026_04_22',
    kind: 'release',
    title: '企業 DB が 290 万社に拡大、4,560 社のフルエンリッチを完了',
    body:
      'gBizINFO 連携を含む新しいエンリッチパイプラインを稼働。本社電話・SNS・部署×役職×名前・全求人インテント・PR TIMES などを自動収集します。',
    createdAt: '2026-04-22T18:00:00+09:00',
    read: true,
  },
]

// 相対時刻の簡易フォーマッタ(「3分前 / 2時間前 / 4日前」)。
export function formatRelative(iso: string, nowMs = Date.now()): string {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, nowMs - t)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}時間前`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}日前`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}週間前`
  const months = Math.floor(days / 30)
  return `${months}か月前`
}
