// ─── 共通CRM型定義 ────────────────────────────────────────────────────────────

// A = Hot（🔥）/ B = Middle（⭐）/ C = Low（💧）
export type Rank = 'A' | 'B' | 'C'

export type ApproachStatus =
  | '未着手'
  | '不通'
  | '不在'
  | '接続済み'
  | 'コール不可'
  | 'アポ獲得'
  | 'Next Action'

export type CallResultCode = ApproachStatus

export const STATUS_STYLES: Record<ApproachStatus, { bg: string; text: string; dot: string }> = {
  '未着手':      { bg: 'bg-[rgba(0,0,0,0.06)]',     text: 'text-[#6E6E73]', dot: 'bg-[#AEAEB2]' },
  '不通':        { bg: 'bg-[rgba(255,59,48,0.13)]',  text: 'text-[#D92B1A]', dot: 'bg-[#FF3B30]' },
  '不在':        { bg: 'bg-[rgba(255,159,10,0.13)]', text: 'text-[#C07000]', dot: 'bg-[#FF9F0A]' },
  '接続済み':    { bg: 'bg-[rgba(0,85,255,0.1)]',    text: 'text-[#0044DD]', dot: 'bg-[#0055FF]' },
  'コール不可':  { bg: 'bg-[rgba(255,59,48,0.13)]',  text: 'text-[#D92B1A]', dot: 'bg-[#FF3B30]' },
  'アポ獲得':    { bg: 'bg-[rgba(0,200,83,0.12)]',   text: 'text-[#007A30]', dot: 'bg-[#00C853]' },
  'Next Action': { bg: 'bg-[rgba(94,92,230,0.13)]',  text: 'text-[#3D3ABF]', dot: 'bg-[#5E5CE6]' },
}

export type RankConfig = { gradient: string; glow: string; color: string }

// Hot(A) = 🔥 Fire red  /  Middle(B) = ⭐ Gold  /  Low(C) = 💧 Ocean blue
export const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)', glow: '0 2px 8px rgba(255,59,48,0.5)',    color: '#fff' },
  B: { gradient: 'linear-gradient(135deg, #FFE040 0%, #FFD60A 55%, #FF9F0A 100%)', glow: '0 2px 7px rgba(255,214,10,0.5)',   color: '#7B4000' },
  C: { gradient: 'linear-gradient(135deg, #5AC8FA 0%, #32ADE6 55%, #0071E3 100%)', glow: '0 2px 6px rgba(50,173,230,0.45)',  color: '#fff' },
}

// ─── コールリスト型定義 ──────────────────────────────────────────────────────

export interface CallList {
  id: string
  name: string
  description: string | null
  ownerName: string
  contactCount: number
  completedCount: number
  appointmentCount: number
  color: string
  createdAt: string
  updatedAt: string
}

export interface CallListItem {
  id: string
  listId: string
  contactId: string
  contactName: string
  contactTitle: string
  companyId: string
  companyName: string
  rank: Rank
  status: ApproachStatus
  callAttempts: number
  lastCallAt: string | null
  nextActionAt: string | null
  priority: number
}

// ─── GA4連携型 ───────────────────────────────────────────────────────────────

export interface GA4PageData {
  path: string
  title: string
  pageViews: number
  uniqueUsers: number
  avgSessionDuration: number
  bounceRate: number
  conversions: number
}

export interface GA4DailyTraffic {
  date: string
  sessions: number
  users: number
  pageViews: number
  cvRate: number
}

export interface GA4SourceMedium {
  source: string
  medium: string
  sessions: number
  users: number
  cvRate: number
}

// ─── 資料トラッキング型 ─────────────────────────────────────────────────────

export type DocumentType = 'proposal' | 'service_intro' | 'case_study' | 'pricing' | 'other'

export interface TrackedDocument {
  id: string
  name: string
  type: DocumentType
  trackingUrl: string
  totalPages: number
  createdAt: string
  createdBy: string
  totalViews: number
  uniqueViewers: number
}

export interface DocumentViewEvent {
  id: string
  documentId: string
  viewedAt: string
  resolvedCompany: string | null
  companyId: string | null
  totalDurationSec: number
  pagesViewed: number
  maxScrollDepth: number
}

// ─── ISアクティビティ型 ─────────────────────────────────────────────────────

export interface ISRepActivity {
  repId: string
  repName: string
  color: string
  today: { calls: number; connected: number; appointments: number; emails: number }
  thisWeek: {
    calls: number; connected: number; appointments: number; emails: number
    emailOpenRate: number; emailReplyRate: number
  }
}

export type DashboardView = 'personal' | 'team'

// ─── 資料管理型（拡張）─────────────────────────────────────────────────────

export interface ManagedDocument extends TrackedDocument {
  fileSize: number
  mimeType: string
  isPublished: boolean
  password: string | null
  expiresAt: string | null
  tags: string[]
}

export interface DocumentShareLink {
  id: string
  documentId: string
  url: string
  contactId: string | null
  contactName: string | null
  companyName: string | null
  createdAt: string
  viewCount: number
  lastViewedAt: string | null
}

// ─── オートメーション型 ─────────────────────────────────────────────────────

export type SequenceStatus = 'active' | 'paused' | 'draft'
export type StepType = 'wait' | 'email' | 'condition' | 'task'

export interface SequenceStep {
  type: StepType
  label: string
  detail: string
}

export interface Sequence {
  id: string
  name: string
  description: string | null
  status: SequenceStatus
  triggerLabel: string
  steps: SequenceStep[]
  enrolledCount: number
  completedCount: number
  emailsSent: number
  openRate: number
  clickRate: number
  replyRate: number
  createdAt: string
  updatedAt: string
}

export interface SequenceEnrollment {
  id: string
  sequenceId: string
  contactName: string
  companyName: string
  currentStepIndex: number
  status: 'active' | 'completed' | 'paused' | 'exited'
  enrolledAt: string
  lastActionAt: string | null
}
