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
