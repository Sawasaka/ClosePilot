import type {
  ApproachStatus,
  DealStage,
  LeadRank,
} from '@prisma/client'

export type ClosePilotEvent =
  // リード
  | { type: 'lead.created'; payload: { companyId: string; rank: LeadRank } }
  | { type: 'lead.rank_changed'; payload: { companyId: string; from: LeadRank; to: LeadRank } }
  | { type: 'lead.score_updated'; payload: { companyId: string; score: number } }

  // コンタクト
  | { type: 'contact.call_started'; payload: { contactId: string; callSid: string } }
  | {
      type: 'contact.call_ended'
      payload: {
        contactId: string
        callSid: string
        recordingUrl: string
        durationSec: number
      }
    }
  | {
      type: 'contact.approach_status_changed'
      payload: { contactId: string; status: ApproachStatus }
    }

  // Deal
  | { type: 'deal.created'; payload: { dealId: string; companyName: string } }
  | { type: 'deal.stage_changed'; payload: { dealId: string; from: DealStage; to: DealStage } }
  | { type: 'deal.stalled'; payload: { dealId: string; daysSinceLastActivity: number } }
  | { type: 'deal.won'; payload: { dealId: string; amount: number } }
  | { type: 'deal.lost'; payload: { dealId: string; lostReason: string } }

  // 議事録
  | { type: 'meeting.ended'; payload: { meetingId: string; driveFileId: string; dealId?: string } }
  | { type: 'transcript.ready'; payload: { transcriptId: string; dealId?: string } }
  | {
      type: 'transcript.extracted'
      payload: { transcriptId: string; dealId: string; fieldsUpdated: string[] }
    }

  // メール
  | { type: 'email.sent'; payload: { contactId: string; threadId: string; subject: string } }
  | { type: 'email.received'; payload: { contactId: string; threadId: string } }

  // タスク
  | { type: 'task.created'; payload: { taskId: string; dueAt: Date } }
  | { type: 'task.completed'; payload: { taskId: string } }
  | { type: 'task.overdue'; payload: { taskId: string; ownerId: string } }

  // シーケンス
  | {
      type: 'sequence.step_due'
      payload: { contactId: string; sequenceId: string; step: number }
    }
  | { type: 'sequence.completed'; payload: { contactId: string; sequenceId: string } }

  // RAG
  | { type: 'knowledge.updated'; payload: { orgId: string; docId: string; fileId: string } }
  | { type: 'research_brief.ready'; payload: { dealId: string; briefId: string } }
