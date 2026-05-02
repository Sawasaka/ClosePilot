// ─── ナレッジ・チケット 共有モック ─────────────────────────────────────────
// チャット (Slack/Chat/Teams) → 自動起票 → RAG (Drive/SharePoint) で AI 回答
// → 解決可否のフィードバック → 必要なら補足 → FAQ ファイルへ蓄積
// 実 API は未連携。UI 検証用のフィクスチャ。

export type TicketSource = 'slack' | 'google_chat' | 'teams'
export type TicketStatus = 'open' | 'resolved' | 'unresolved' | 'updated'

export interface RagSource {
  id: string
  type: 'drive' | 'sharepoint' | 'web'
  name: string
  url: string
  snippet: string
  folder?: string
}

export interface Supplement {
  id: string
  type: 'text' | 'url'
  content: string
  addedBy: string
  addedAt: string
  triggeredAiUpdate: boolean
}

export interface KnowledgeTicket {
  id: string
  number: number
  title: string
  question: string
  source: TicketSource
  channel: string
  reporter: string
  status: TicketStatus
  aiAnswer: string
  aiAnsweredAt: string
  ragSources: RagSource[]
  feedback?: { resolved: boolean; at: string; by: string }
  supplements: Supplement[]
  createdAt: string
  updatedAt: string
  category: string
}

export interface FaqEntry {
  id: string
  question: string
  answer: string
  sourceTicketId: string
  sourceTicketNumber: number
  category: string
  hits: number
  lastUpdated: string
}

export interface FaqSyncStatus {
  drivePath: string
  lastSyncedAt: string
  entryCount: number
  fileSize: string
}

export const SOURCE_LABEL: Record<TicketSource, string> = {
  slack: 'Slack',
  google_chat: 'Google Chat',
  teams: 'Teams',
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: '未回答',
  resolved: '解決済',
  unresolved: '未解決',
  updated: '更新済',
}

export const SOURCE_STYLE: Record<TicketSource, { color: string; bg: string }> = {
  slack: {
    color: '#c4a8ff',
    bg: 'rgba(196,168,255,0.12)',
  },
  google_chat: {
    color: '#7ec6ff',
    bg: 'rgba(126,198,255,0.12)',
  },
  teams: {
    color: 'var(--color-obs-primary)',
    bg: 'rgba(171,199,255,0.12)',
  },
}

export const STATUS_STYLE: Record<TicketStatus, { color: string; bg: string; tone: 'primary' | 'low' | 'hot' | 'middle' }> = {
  open:       { color: 'var(--color-obs-primary)', bg: 'rgba(171,199,255,0.14)', tone: 'primary' },
  resolved:   { color: 'var(--color-obs-low)',     bg: 'rgba(126,198,255,0.14)', tone: 'low'     },
  unresolved: { color: 'var(--color-obs-hot)',     bg: 'rgba(255,107,107,0.14)', tone: 'hot'     },
  updated:    { color: 'var(--color-obs-middle)',  bg: 'rgba(255,184,107,0.14)', tone: 'middle'  },
}

// ─── Tickets ─────────────────────────────────────────────────────────────────

export const MOCK_TICKETS: KnowledgeTicket[] = [
  {
    id: 't1',
    number: 1,
    title: '請求書の発行タイミングを教えて',
    question: '今月分の請求書はいつ発行されますか？月末締めですか月初発行ですか？経理の処理予定が立たず困っています。',
    source: 'slack',
    channel: '#sales-help',
    reporter: '山田 太郎',
    status: 'resolved',
    category: '経理',
    aiAnswer:
      '請求書は **月末締め・翌月5営業日以内に発行** されます。発行担当は経理部の高橋（@takahashi）です。発行希望日が指定ある場合は前月20日までに Slack #legal-q でお知らせください。請求書PDFは Drive の「経理 / 請求書 / YYYYMM」フォルダに自動保存されます。',
    aiAnsweredAt: '2026-04-18T10:14:00',
    ragSources: [
      {
        id: 's1-1',
        type: 'drive',
        name: '経理規程_v3.2.pdf',
        url: 'https://drive.google.com/file/d/mock-1',
        snippet: '請求書は当月末締め、翌月5営業日以内に発行する。発行担当は経理部とし、請求先住所はマスタ管理する。',
        folder: '/共有ドライブ/管理本部/経理',
      },
      {
        id: 's1-2',
        type: 'drive',
        name: '請求業務フロー_2026.md',
        url: 'https://drive.google.com/file/d/mock-1b',
        snippet: '請求書発行希望日が指定ある場合は前月20日までに #legal-q チャンネルで申請する。',
        folder: '/共有ドライブ/管理本部/経理',
      },
    ],
    feedback: { resolved: true, at: '2026-04-18T10:32:00', by: '山田 太郎' },
    supplements: [],
    createdAt: '2026-04-18T10:12:00',
    updatedAt: '2026-04-18T10:32:00',
  },
  {
    id: 't2',
    number: 2,
    title: '契約書の押印フローは?',
    question: '取引先との業務委託契約書、押印申請ってどこで出すんでしたっけ？クラウドサインで完結できますか？',
    source: 'slack',
    channel: '#legal-q',
    reporter: '佐藤 美咲',
    status: 'resolved',
    category: '法務',
    aiAnswer:
      '**取引金額500万円以下** はクラウドサインで電子締結可能です。それを超える場合は紙押印が必要で、法務部の事前レビュー（CloudSign Workflow）→ 代表印申請（@法務）→ 押印 → スキャン保管、の順で進みます。テンプレート契約書は Drive「法務 / 標準契約 / 2026」にあります。',
    aiAnsweredAt: '2026-04-19T14:22:00',
    ragSources: [
      {
        id: 's2-1',
        type: 'sharepoint',
        name: '契約書管理規程.docx',
        url: 'https://sharepoint.example.com/sites/legal/contract-policy',
        snippet: '取引金額500万円以下については電子契約サービス（クラウドサイン）による締結を認める。',
        folder: '/Sites/Legal/Policy',
      },
    ],
    feedback: { resolved: true, at: '2026-04-19T14:40:00', by: '佐藤 美咲' },
    supplements: [],
    createdAt: '2026-04-19T14:20:00',
    updatedAt: '2026-04-19T14:40:00',
  },
  {
    id: 't3',
    number: 3,
    title: '経費精算の上限額',
    question: '出張時の宿泊費って一泊いくらまで精算できますか？深夜便の場合の特例とかあれば教えて。',
    source: 'google_chat',
    channel: '総務相談',
    reporter: '鈴木 健太',
    status: 'open',
    category: '経費',
    aiAnswer:
      '宿泊費の上限は **国内出張: 一泊15,000円（東京/大阪は18,000円）/ 海外出張: 一泊25,000円（NY/LA/Londonは35,000円）**。深夜便の前後泊は事前申請があれば上限を50%まで超過できます（経理規程 Article 8.3）。',
    aiAnsweredAt: '2026-04-22T09:01:00',
    ragSources: [
      {
        id: 's3-1',
        type: 'drive',
        name: '出張・経費規程_v2.1.pdf',
        url: 'https://drive.google.com/file/d/mock-3',
        snippet: '宿泊費上限: 国内15,000円/泊、東京・大阪は18,000円/泊、海外25,000円/泊。',
        folder: '/共有ドライブ/管理本部/総務',
      },
    ],
    supplements: [],
    createdAt: '2026-04-22T09:00:00',
    updatedAt: '2026-04-22T09:01:00',
  },
  {
    id: 't4',
    number: 4,
    title: 'Slack 連携のトークン更新方法',
    question: '社内ツールの Slack 通知が止まってます。Bot トークンの更新ってどう手続きしたらいいですか？',
    source: 'teams',
    channel: 'IT-helpdesk',
    reporter: '田中 翔',
    status: 'unresolved',
    category: 'IT',
    aiAnswer:
      'Slack Workspace 管理画面 → App 管理 → 該当 Bot → 「Reissue Token」で再発行できます。再発行後は Drive の `/IT/secrets/slack-tokens.txt` を更新し、対象システムを再起動してください。',
    aiAnsweredAt: '2026-04-21T16:45:00',
    ragSources: [
      {
        id: 's4-1',
        type: 'drive',
        name: 'IT運用マニュアル_2025.md',
        url: 'https://drive.google.com/file/d/mock-4',
        snippet: 'Slack Bot トークンの更新手順 (旧UI)。Slack 管理画面 → アプリ → ...',
        folder: '/共有ドライブ/IT',
      },
    ],
    feedback: { resolved: false, at: '2026-04-21T17:02:00', by: '田中 翔' },
    supplements: [],
    createdAt: '2026-04-21T16:43:00',
    updatedAt: '2026-04-21T17:02:00',
  },
  {
    id: 't5',
    number: 5,
    title: '育休復帰後の人事面談はいつ?',
    question: '育休から復帰して2週間ほど経ちます。1on1とか面談ってどういうタイミングで設定されますか？',
    source: 'slack',
    channel: '#hr',
    reporter: '高橋 美穂',
    status: 'updated',
    category: '人事',
    aiAnswer:
      '育休復帰後は **復帰後2週間以内に直属マネージャー、4週間以内に人事面談** が標準です。人事面談はキャリア相談・働き方の希望（時短/フレックス）の確認も兼ねます。HR Bot から自動でカレンダー招待が届くはずですが、届かない場合は @人事 にメンションしてください。',
    aiAnsweredAt: '2026-04-15T11:00:00',
    ragSources: [
      {
        id: 's5-1',
        type: 'sharepoint',
        name: '育児支援ハンドブック_2026.pdf',
        url: 'https://sharepoint.example.com/sites/hr/childcare-handbook',
        snippet: '育休復帰後のフォローアップ: 2週間以内に直属マネージャー面談、4週間以内に人事面談を設定する。',
        folder: '/Sites/HR/Handbook',
      },
    ],
    feedback: { resolved: false, at: '2026-04-15T11:20:00', by: '高橋 美穂' },
    supplements: [
      {
        id: 'sup5-1',
        type: 'url',
        content: 'https://sharepoint.example.com/sites/hr/childcare-2026rev',
        addedBy: '人事 田村',
        addedAt: '2026-04-16T09:30:00',
        triggeredAiUpdate: true,
      },
      {
        id: 'sup5-2',
        type: 'text',
        content: '2026年4月から人事面談は復帰後3週間以内に短縮されました。HR Botの自動招待ロジックも更新済み。',
        addedBy: '人事 田村',
        addedAt: '2026-04-16T09:31:00',
        triggeredAiUpdate: true,
      },
    ],
    createdAt: '2026-04-15T10:58:00',
    updatedAt: '2026-04-16T09:31:00',
  },
  {
    id: 't6',
    number: 6,
    title: '営業日報の提出締切',
    question: '営業日報って毎日いつまでに出せばいいですか？',
    source: 'google_chat',
    channel: '営業',
    reporter: '伊藤 拓海',
    status: 'resolved',
    category: '営業',
    aiAnswer:
      '営業日報は **当日 19:00** までに Salesforce の活動オブジェクトに登録、もしくは Google Form 経由で提出が必要です。マネージャーレビューは翌朝行われます。',
    aiAnsweredAt: '2026-04-20T18:20:00',
    ragSources: [
      {
        id: 's6-1',
        type: 'drive',
        name: '営業オペレーションマニュアル.md',
        url: 'https://drive.google.com/file/d/mock-6',
        snippet: '日報は当日19:00までに提出。Salesforce活動オブジェクトに登録、または Google Form 経由。',
        folder: '/共有ドライブ/営業',
      },
    ],
    feedback: { resolved: true, at: '2026-04-20T18:25:00', by: '伊藤 拓海' },
    supplements: [],
    createdAt: '2026-04-20T18:18:00',
    updatedAt: '2026-04-20T18:25:00',
  },
  {
    id: 't7',
    number: 7,
    title: 'VPN 接続できない',
    question: '社内VPNにつながりません。社外からSalesforceにアクセスしたいのですが、何か手続き必要でしたっけ？',
    source: 'teams',
    channel: 'IT-helpdesk',
    reporter: '渡辺 翔太',
    status: 'resolved',
    category: 'IT',
    aiAnswer:
      'Cisco AnyConnect で `vpn.bgm.example.com` に接続してください。SSO（Okta）認証が必要です。初回接続時は IT に Okta 多要素認証の登録を依頼する必要があります。Drive の「IT / VPN設定手順」を参照。',
    aiAnsweredAt: '2026-04-17T13:05:00',
    ragSources: [
      {
        id: 's7-1',
        type: 'drive',
        name: 'VPN設定手順_2026.pdf',
        url: 'https://drive.google.com/file/d/mock-7',
        snippet: 'Cisco AnyConnect インストール後、 vpn.bgm.example.com に接続。Okta SSO で認証する。',
        folder: '/共有ドライブ/IT',
      },
    ],
    feedback: { resolved: true, at: '2026-04-17T13:25:00', by: '渡辺 翔太' },
    supplements: [],
    createdAt: '2026-04-17T13:00:00',
    updatedAt: '2026-04-17T13:25:00',
  },
  {
    id: 't8',
    number: 8,
    title: '業務委託の発注書テンプレ',
    question: 'フリーランスの方に発注したいのですが、発注書の社内テンプレートはどこにありますか?',
    source: 'slack',
    channel: '#legal-q',
    reporter: '中村 美月',
    status: 'open',
    category: '法務',
    aiAnswer:
      '業務委託の発注書テンプレは Drive「法務 / 標準契約 / 業務委託」配下にあります。`発注書_業務委託_v2.docx` が最新版です。記入後は法務（@legal）にレビュー依頼してください。金額500万円以下なら電子締結可能です。',
    aiAnsweredAt: '2026-04-23T11:30:00',
    ragSources: [
      {
        id: 's8-1',
        type: 'drive',
        name: '発注書_業務委託_v2.docx',
        url: 'https://drive.google.com/file/d/mock-8',
        snippet: '業務委託契約に伴う発注書の標準テンプレート。委託業務の範囲、納期、報酬、検収条件を記入する。',
        folder: '/共有ドライブ/法務/標準契約/業務委託',
      },
    ],
    supplements: [],
    createdAt: '2026-04-23T11:28:00',
    updatedAt: '2026-04-23T11:30:00',
  },
  {
    id: 't9',
    number: 9,
    title: '健康診断の予約方法',
    question: '今年の健康診断、予約サイトはどこでしたっけ?',
    source: 'slack',
    channel: '#hr',
    reporter: '小林 直樹',
    status: 'resolved',
    category: '人事',
    aiAnswer:
      '健康診断は **e健康診断ナビ**（`https://e-kenko.example.com`）から予約します。社員番号と Okta SSO でログイン可能です。実施期間は5/15〜7/31。希望日時を選んで予約後、人事から承認メールが届きます。',
    aiAnsweredAt: '2026-04-22T15:40:00',
    ragSources: [
      {
        id: 's9-1',
        type: 'sharepoint',
        name: '2026年度健康診断のご案内.docx',
        url: 'https://sharepoint.example.com/sites/hr/kenko-2026',
        snippet: '健康診断の予約は e健康診断ナビからオンラインで実施。実施期間: 2026年5月15日〜7月31日。',
        folder: '/Sites/HR/Kenko',
      },
    ],
    feedback: { resolved: true, at: '2026-04-22T15:50:00', by: '小林 直樹' },
    supplements: [],
    createdAt: '2026-04-22T15:38:00',
    updatedAt: '2026-04-22T15:50:00',
  },
  {
    id: 't10',
    number: 10,
    title: 'Salesforce との同期失敗時の対応',
    question: 'BGM ↔ Salesforce の同期エラーが出ました。リトライしてもダメな場合の連絡先はどこですか?',
    source: 'teams',
    channel: 'プロダクト',
    reporter: '林 大輔',
    status: 'unresolved',
    category: 'プロダクト',
    aiAnswer:
      'Salesforce 連携の同期エラーはまず BGM 設定 → 連携設定 → Salesforce → 「再認証」を試してください。それでも復旧しない場合は @プロダクト の桑原（@kuwabara）にメンション。直近1時間の sync ログは Datadog の `bgm-sync-errors` ダッシュボードで確認できます。',
    aiAnsweredAt: '2026-04-24T17:10:00',
    ragSources: [
      {
        id: 's10-1',
        type: 'web',
        name: 'BGM 連携トラブルシューティング',
        url: 'https://docs.bgm.example.com/integrations/salesforce/troubleshooting',
        snippet: '同期エラー時はまず再認証。エラーコード SYNC-401 / SYNC-503 の場合は token 期限切れの可能性が高い。',
      },
    ],
    feedback: { resolved: false, at: '2026-04-24T17:25:00', by: '林 大輔' },
    supplements: [],
    createdAt: '2026-04-24T17:08:00',
    updatedAt: '2026-04-24T17:25:00',
  },
]

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const MOCK_FAQS: FaqEntry[] = [
  {
    id: 'f1',
    question: '請求書はいつ発行される？',
    answer: '月末締め・翌月5営業日以内に経理部から発行。発行希望日指定は前月20日までに #legal-q で申請。',
    sourceTicketId: 't1',
    sourceTicketNumber: 1,
    category: '経理',
    hits: 14,
    lastUpdated: '2026-04-18T10:32:00',
  },
  {
    id: 'f2',
    question: '契約書の押印フロー（電子と紙）',
    answer: '取引金額500万円以下はクラウドサイン、超過は紙押印（法務レビュー → 代表印申請 → スキャン保管）。',
    sourceTicketId: 't2',
    sourceTicketNumber: 2,
    category: '法務',
    hits: 8,
    lastUpdated: '2026-04-19T14:40:00',
  },
  {
    id: 'f3',
    question: '出張時の宿泊費上限',
    answer: '国内15,000円/泊（東京・大阪18,000円）、海外25,000円/泊。深夜便前後泊は事前申請で50%まで超過可。',
    sourceTicketId: 't3',
    sourceTicketNumber: 3,
    category: '経費',
    hits: 22,
    lastUpdated: '2026-04-22T09:01:00',
  },
  {
    id: 'f4',
    question: '育休復帰後の面談タイミング',
    answer: '直属マネージャー面談=復帰後3週間以内、人事面談=4週間以内（2026年4月改定）。HR Botから自動招待。',
    sourceTicketId: 't5',
    sourceTicketNumber: 5,
    category: '人事',
    hits: 5,
    lastUpdated: '2026-04-16T09:31:00',
  },
  {
    id: 'f5',
    question: 'VPN接続手順（社外からSalesforceアクセス）',
    answer: 'Cisco AnyConnect → vpn.bgm.example.com → Okta SSO 認証。初回はIT に MFA 登録依頼が必要。',
    sourceTicketId: 't7',
    sourceTicketNumber: 7,
    category: 'IT',
    hits: 11,
    lastUpdated: '2026-04-17T13:25:00',
  },
]

export const MOCK_FAQ_SYNC: FaqSyncStatus = {
  drivePath: '/共有ドライブ/BGM/BGM-FAQ.md',
  lastSyncedAt: '2026-04-25T08:30:00',
  entryCount: MOCK_FAQS.length,
  fileSize: '14.2 KB',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function findTicket(id: string): KnowledgeTicket | undefined {
  return MOCK_TICKETS.find((t) => t.id === id)
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${m}/${day} ${h}:${min}`
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return '今日'
  if (diff < 7 * day) return `${Math.floor(diff / day)}日前`
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))}週間前`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}ヶ月前`
  return `${Math.floor(diff / (365 * day))}年前`
}
