'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Building2,
  Columns3,
  Mail,
  FileText,
  BookOpen,
  LayoutDashboard,
  Zap,
  Bot,
  User,
  X,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════
// SUGGESTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

interface Suggestion {
  id: string
  type: 'action' | 'skill' | 'engage'
  icon: string
  title: string
  message: string
  progress?: { current: number; target: number }
  actions: { label: string; href?: string; dismiss?: boolean }[]
  priority: number
}

// ── Mock User Context ──────────────────────────────────────────────────────

const USER_CONTEXT = {
  name: '田中太郎',
  level: 12,
  rank: 'シルバー',
  badges: ['コールマスター'],
  skills: [
    { name: 'ヒアリング力', value: 4, max: 5 },
    { name: '提案力', value: 3, max: 5 },
    { name: 'クロージング力', value: 2, max: 5 },
    { name: 'プロダクト知識', value: 4, max: 5 },
    { name: '業界知識', value: 3, max: 5 },
  ],
  streak: 5,

  goals: {
    calls: { target: 500, current: 320 },
    appointments: { target: 10, current: 5 },
    deals: { target: 3, current: 1 },
    emails: { target: 100, current: 65 },
  },
  remainingDays: 12,

  teamMembers: [
    { name: '鈴木花子', rank: 'ゴールド', level: 15 },
    { name: '佐藤次郎', rank: 'シルバー', level: 8 },
  ],

  todayTaskCount: 8,
  overdueCount: 4,
}

// ── Rank Comparison Helper ────────────────────────────────────────────────

const RANK_ORDER: Record<string, number> = {
  'ブロンズ': 0, 'シルバー': 1, 'ゴールド': 2, 'プラチナ': 3, 'ダイヤモンド': 4,
}

function rankAtLeast(userRank: string, minRank: string): boolean {
  return (RANK_ORDER[userRank] ?? 0) >= (RANK_ORDER[minRank] ?? 0)
}

// ── Suggestion Rules ──────────────────────────────────────────────────────

function generateSuggestions(ctx: typeof USER_CONTEXT): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Rule 1: アポ目標の進捗が遅れている
  const apptGoal = ctx.goals.appointments
  const apptPct = apptGoal.current / apptGoal.target
  if (apptPct < 0.5 && ctx.remainingDays <= 15) {
    const remaining = apptGoal.target - apptGoal.current
    const callsPerAppt = ctx.goals.calls.current > 0 && apptGoal.current > 0
      ? Math.ceil(ctx.goals.calls.current / apptGoal.current)
      : 100
    const totalCallsNeeded = remaining * callsPerAppt
    const dailyCalls = Math.ceil(totalCallsNeeded / ctx.remainingDays)

    suggestions.push({
      id: 'action-appt-behind',
      type: 'action',
      icon: '🎯',
      title: '行動提案',
      message: `月間アポ目標${apptGoal.target}件に対し現在${apptGoal.current}件。残り${ctx.remainingDays}営業日で達成するには、1日${dailyCalls}件のコールが必要です。`,
      progress: { current: apptGoal.current, target: apptGoal.target },
      actions: [
        { label: 'アクション計画を見る', href: '/talent/goals' },
        { label: 'スキップ', dismiss: true },
      ],
      priority: 10,
    })
  }

  // Rule 2: 期限超過タスクが多い
  if (ctx.overdueCount >= 3) {
    suggestions.push({
      id: 'action-overdue',
      type: 'action',
      icon: '⚠️',
      title: '期限超過アラート',
      message: `期限超過のタスクが${ctx.overdueCount}件あります。リスケジュールまたは対応しましょう。`,
      actions: [
        { label: '確認する', href: '/overdue' },
        { label: 'スキップ', dismiss: true },
      ],
      priority: 9,
    })
  }

  // Rule 3: ハイランカーに研修開催を提案
  if (rankAtLeast(ctx.rank, 'ゴールド') && ctx.badges.length >= 3) {
    suggestions.push({
      id: 'skill-host-training',
      type: 'skill',
      icon: '🏆',
      title: '研修開催の提案',
      message: `${ctx.badges[ctx.badges.length - 1]}バッジを獲得！あなたの知見をチームに共有しませんか？`,
      actions: [
        { label: '研修を開催する', href: '/metaverse/rooms' },
        { label: '後で', dismiss: true },
      ],
      priority: 8,
    })
  }

  // Rule 4: 弱いスキルがあり、チームにゴールド以上がいる
  const weakSkills = ctx.skills.filter(s => s.value <= 2)
  const goldMembers = ctx.teamMembers.filter(m => rankAtLeast(m.rank, 'ゴールド'))
  if (weakSkills.length > 0 && goldMembers.length > 0) {
    const weakest = weakSkills.sort((a, b) => a.value - b.value)[0]
    const mentor = goldMembers[0]
    suggestions.push({
      id: `skill-request-${weakest.name}`,
      type: 'skill',
      icon: '📚',
      title: 'スキルアップ提案',
      message: `「${weakest.name}」が${weakest.value}/${weakest.max}です。${mentor.name}さん（${mentor.rank}）に研修を依頼しませんか？`,
      actions: [
        { label: '研修を依頼', href: '/metaverse/rooms' },
        { label: 'スキップ', dismiss: true },
      ],
      priority: 7,
    })
  }

  // Rule 5: 連続ログインボーナスが近い
  if (ctx.streak >= 5) {
    const nextBonus = Math.ceil(ctx.streak / 7) * 7
    const daysUntilBonus = nextBonus - ctx.streak
    if (daysUntilBonus <= 2) {
      suggestions.push({
        id: 'engage-streak',
        type: 'engage',
        icon: '🔥',
        title: 'ログインボーナス',
        message: `${ctx.streak}日連続ログイン中！あと${daysUntilBonus}日で${nextBonus}日ボーナス達成です。`,
        actions: [
          { label: 'クエストを見る', href: '/talent/quests' },
          { label: 'スキップ', dismiss: true },
        ],
        priority: 6,
      })
    }
  }

  // Rule 6: 今日のタスクが多い
  if (ctx.todayTaskCount >= 5) {
    suggestions.push({
      id: 'action-tasks-today',
      type: 'action',
      icon: '📋',
      title: '今日のタスク',
      message: `今日のタスクが${ctx.todayTaskCount}件あります。優先順位を確認しましょう。`,
      actions: [
        { label: '確認する', href: '/today' },
        { label: 'スキップ', dismiss: true },
      ],
      priority: 5,
    })
  }

  // Rule 7: 月間コール目標がもうすぐ達成
  const callPct = ctx.goals.calls.current / ctx.goals.calls.target
  if (callPct >= 0.8 && callPct < 1) {
    const remaining = ctx.goals.calls.target - ctx.goals.calls.current
    suggestions.push({
      id: 'engage-calls-almost',
      type: 'engage',
      icon: '🚀',
      title: 'あと少し！',
      message: `月間コール目標まであと${remaining}件！ゴールが見えています。`,
      progress: { current: ctx.goals.calls.current, target: ctx.goals.calls.target },
      actions: [
        { label: '目標を確認', href: '/talent/goals' },
        { label: 'スキップ', dismiss: true },
      ],
      priority: 4,
    })
  }

  return suggestions.sort((a, b) => b.priority - a.priority)
}

// ── Dismiss Management (localStorage) ─────────────────────────────────────

const DISMISS_KEY = 'bgm_dismissed_suggestions'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

function getDismissed(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, number>
    const now = Date.now()
    // 1週間超えたものを削除
    const cleaned: Record<string, number> = {}
    for (const [id, ts] of Object.entries(parsed)) {
      if (now - ts < ONE_WEEK_MS) cleaned[id] = ts
    }
    localStorage.setItem(DISMISS_KEY, JSON.stringify(cleaned))
    return cleaned
  } catch { return {} }
}

function dismissSuggestion(id: string) {
  if (typeof window === 'undefined') return
  const current = getDismissed()
  current[id] = Date.now()
  localStorage.setItem(DISMISS_KEY, JSON.stringify(current))
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS & CHAT
// ═══════════════════════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { label: '企業登録',       href: '/companies', icon: Building2,       color: '#88BBFF' },
  { label: 'パイプライン',   href: '/pipeline',  icon: Columns3,        color: '#AA88FF' },
  { label: 'マーケティング', href: '/nurturing',  icon: Mail,            color: '#FFDD44' },
  { label: 'プロダクト',     href: '/meetings',   icon: FileText,        color: '#44FF88' },
  { label: 'ナレッジ検索',   href: '/knowledge',  icon: BookOpen,        color: '#FF8888' },
  { label: 'ダッシュボード', href: '/dashboard',  icon: LayoutDashboard, color: '#FF88CC' },
]

interface Message { id: string; role: 'assistant' | 'user'; content: string }

const INITIAL_MESSAGES: Message[] = [
  { id: 'welcome', role: 'assistant', content: 'おはようございます！BGM へようこそ。\n\n何かお手伝いできることはありますか？' },
]

const TYPE_COLORS = { action: '#88BBFF', skill: '#44FF88', engage: '#FFDD44' }

const TYPE_GAME_STYLES = {
  action: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 20px rgba(50,173,230,0.6), 0 0 6px rgba(125,211,252,0.8)',
    titleGlow: '0 0 8px rgba(125,211,252,0.7), 0 0 2px rgba(125,211,252,0.9)',
  },
  skill: {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 20px rgba(52,199,89,0.6), 0 0 6px rgba(167,243,208,0.8)',
    titleGlow: '0 0 8px rgba(110,231,183,0.7), 0 0 2px rgba(110,231,183,0.9)',
  },
  engage: {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 20px rgba(255,159,10,0.6), 0 0 6px rgba(255,204,102,0.8)',
    titleGlow: '0 0 8px rgba(255,204,102,0.7), 0 0 2px rgba(255,221,68,0.9)',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [dismissed, setDismissed] = useState<Record<string, number>>({})

  useEffect(() => { setDismissed(getDismissed()) }, [])

  const suggestions = useMemo(() => {
    const all = generateSuggestions(USER_CONTEXT)
    return all.filter(s => !dismissed[s.id]).slice(0, 3)
  }, [dismissed])

  function handleDismiss(id: string) {
    dismissSuggestion(id)
    setDismissed(getDismissed())
  }

  function handleSend() {
    if (!input.trim()) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant',
        content: 'かしこまりました。該当する情報を確認しています...\n\n（AI接続は今後実装予定です）',
      }])
    }, 800)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }} className="text-center pt-6 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #5AC8FA 0%, #5577DD 35%, #2244AA 70%, #3355CC 100%)',
              boxShadow: '0 0 24px rgba(85,119,221,0.95), 0 0 8px rgba(125,211,252,1), inset 0 1px 0 rgba(255,255,255,0.5)',
              border: '1.5px solid rgba(255,255,255,0.4)',
            }}
          >
            <Zap size={22} className="text-white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
          </div>
        </div>
        <h1
          className="text-[24px] font-black text-[#FFFFFF] tracking-[0.02em]"
          style={{ textShadow: '0 0 16px rgba(125,211,252,0.6), 0 0 4px rgba(255,255,255,0.8)' }}
        >
          BGM
        </h1>
        <p className="text-[11px] text-[#99AACC] mt-1 tracking-[0.1em] uppercase font-semibold">Business Growth Management</p>
      </motion.div>

      {/* ── Suggestion Cards ── */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-3 space-y-2">
            {suggestions.map((s, i) => {
              const accent = TYPE_COLORS[s.type]
              const game = TYPE_GAME_STYLES[s.type]
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.25 }}
                  className="rounded-[10px] p-4 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
                    border: `1px solid ${accent}55`,
                    boxShadow: `0 2px 12px rgba(0,0,0,0.4), 0 0 16px ${accent}20, inset 0 1px 0 ${accent}25`,
                  }}
                >
                  {/* グロー光線 */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: game.gradient,
                    boxShadow: game.glow,
                  }} />
                  {/* 背景フェード */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
                    background: `radial-gradient(circle at top right, ${accent}15 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />

                  <div className="flex items-start gap-3 relative">
                    <span className="text-[22px] shrink-0 mt-0.5" style={{ filter: `drop-shadow(0 0 8px ${accent}80)` }}>{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.08em] mb-1" style={{ color: accent, textShadow: game.titleGlow }}>{s.title}</p>
                      <p className="text-[13px] text-[#CCDDEE] leading-relaxed">{s.message}</p>

                      {/* プログレスバー */}
                      {s.progress && (
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className="flex-1 h-3 rounded-full overflow-hidden"
                            style={{
                              background: 'rgba(16,16,40,0.8)',
                              border: `1px solid ${accent}55`,
                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(s.progress.current / s.progress.target) * 100}%`,
                                background: game.gradient,
                                boxShadow: `0 0 10px ${accent}cc, 0 0 4px ${accent}, inset 0 1px 0 rgba(255,255,255,0.4)`,
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] font-black tabular-nums"
                            style={{ color: accent, textShadow: game.titleGlow }}
                          >
                            {s.progress.current}/{s.progress.target}
                          </span>
                        </div>
                      )}

                      {/* アクション */}
                      <div className="flex items-center gap-2 mt-3">
                        {s.actions.map(a => (
                          a.dismiss ? (
                            <button key={a.label} onClick={() => handleDismiss(s.id)}
                              className="text-[11px] text-[#99AACC] hover:text-[#CCDDF0] transition-colors ml-auto">
                              {a.label} →
                            </button>
                          ) : (
                            <button
                              key={a.label}
                              onClick={() => a.href && router.push(a.href)}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-[6px] transition-all hover:scale-105"
                              style={{
                                background: game.gradient,
                                color: '#FFFFFF',
                                border: `1px solid rgba(255,255,255,0.35)`,
                                boxShadow: `0 0 12px ${accent}80, inset 0 1px 0 rgba(255,255,255,0.3)`,
                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                              }}
                            >
                              {a.label}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.map((msg, i) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i === 0 ? 0.3 : 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={
                msg.role === 'assistant'
                  ? {
                      background: 'linear-gradient(135deg, #5AC8FA 0%, #5577DD 35%, #2244AA 70%, #3355CC 100%)',
                      boxShadow: '0 0 14px rgba(85,119,221,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.4)',
                    }
                  : {
                      background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
                      boxShadow: '0 0 14px rgba(52,199,89,0.85), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.4)',
                    }
              }
            >
              {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
            </div>
            <div className="max-w-[80%] rounded-[14px] px-4 py-3" style={{
              background: msg.role === 'user' ? 'linear-gradient(180deg, #182050, #101838)' : 'linear-gradient(180deg, #101838, #0c1028)',
              color: '#EEEEFF', border: msg.role === 'user' ? '1px solid #3355AA' : '1px solid #2244AA',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              <p className="text-[13.5px] leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="px-4 pb-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon
            return (
              <button key={action.href} onClick={() => router.push(action.href)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: 'linear-gradient(180deg, #141838, #0e1228)', color: '#CCDDFF', border: '1px solid #2244AA', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                <Icon size={13} />
                {action.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Input ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="px-4 pb-6">
        <div className="flex items-center gap-2 rounded-[14px] px-4 py-3" style={{
          background: 'linear-gradient(180deg, #101838, #0c1028)', border: '2px solid #2244AA',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
        }}>
          <input type="text" placeholder="BGM にご質問ください..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 text-[14px] text-[#EEEEFF] placeholder:text-[#88AACC] outline-none bg-transparent" />
          <button onClick={handleSend} disabled={!input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #2244AA, #3355CC)' : 'rgba(34,68,170,0.2)',
              boxShadow: input.trim() ? '0 2px 8px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.15)' : 'none',
              border: input.trim() ? '1px solid #4466DD' : '1px solid transparent',
              cursor: input.trim() ? 'pointer' : 'default',
            }}>
            <Send size={14} style={{ color: input.trim() ? '#FFFFFF' : '#556688' }} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
