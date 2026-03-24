export type ScoreSignal =
  | 'meeting_booked'
  | 'email_replied'
  | 'same_domain_multiple'
  | 'document_read_deep'
  | 'call_answered'
  | 'pricing_page_view'
  | 'document_read_shallow'
  | 'video_75pct'
  | 'lp_deep_read'
  | 'case_study_view'
  | 'return_visit_3x'

export type RecencyBucket =
  | '0-3d'
  | '4-7d'
  | '8-14d'
  | '15-30d'
  | '31-60d'
  | '61d+'

export const RECENCY_MULTIPLIERS: Record<RecencyBucket, number> = {
  '0-3d':  1.0,
  '4-7d':  0.8,
  '8-14d': 0.7,
  '15-30d': 0.5,
  '31-60d': 0.4,
  '61d+':  0.2,
}

export const SCORE_SIGNALS: Record<ScoreSignal, number> = {
  // Behavior Score (最大5点)
  meeting_booked:         3,
  email_replied:          2,
  same_domain_multiple:   2,
  document_read_deep:     2,
  call_answered:          1,
  pricing_page_view:      1,
  document_read_shallow:  1,
  video_75pct:            1,
  lp_deep_read:           1,
  case_study_view:        1,
  return_visit_3x:        1,
}

export const SOURCE_SCORES: Record<string, number> = {
  HP_INQUIRY:        5,
  PRICING_INQUIRY:   5,
  REFERRAL:          4,
  DOCUMENT_REQUEST:  4,
  SEMINAR_OWN:       3,
  SEMINAR_OWN_ABSENT: 2,
  EVENT:             2,
  SEMINAR_CO:        1,
  PAID_SEARCH:       1,
  PAID_SOCIAL:       1,
  ORGANIC:           1,
  PARTNER:           1,
  SEMINAR_CO_ABSENT: 0,
  CSV_IMPORT:        0,
}

export const RANK_THRESHOLDS = {
  S: 8,
  A: 6,
  B: 4,
  C: 2,
  D: 0,
} as const
