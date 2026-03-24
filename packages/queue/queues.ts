import { Queue } from 'bullmq'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

const connection = { url: REDIS_URL }

// 4本のキュー
export const criticalQueue = new Queue('critical', {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
})

export const standardQueue = new Queue('standard', {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
})

export const backgroundQueue = new Queue('background', {
  connection,
  defaultJobOptions: { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
})

export const scheduledQueue = new Queue('scheduled', {
  connection,
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 } },
})

// ジョブ名定数
export const JOB_NAMES = {
  TRANSCRIBE_CALL: 'transcribe_call',
  TRANSCRIBE_MEETING: 'transcribe_meeting',
  GENERATE_RESEARCH_BRIEF: 'generate_research_brief',
  INDEX_KNOWLEDGE_DOC: 'index_knowledge_doc',
  SEND_SEQUENCE_EMAIL: 'send_sequence_email',
  CHECK_STALLED_DEALS: 'check_stalled_deals',
  RECALCULATE_SCORES: 'recalculate_scores',
  SEND_TASK_REMINDER: 'send_task_reminder',
  PROCESS_APPOINTMENT: 'process_appointment',
} as const
