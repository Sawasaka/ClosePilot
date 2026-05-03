'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Zap, Plus, Minus, Check, Star, Crown, X, Wrench, Send, ChevronRight, Users, Mail, Shield, UserPlus, MessageCircle, Trash2 } from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

// ─── プラン定義 ─────────────────────────────────────────

interface Plan {
  id: string
  name: string
  tagline: string
  priceMonthly: number
  priceAnnual: number
  credits: number
  minSeats: number
  baseLabel?: string          // 下位プラン全機能ラベル (例: "Lite全機能")
  additions: string[]         // このプランで追加される機能
  icon: React.ElementType
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    tagline: '社内ナレッジを最速で引き出す',
    priceMonthly: 4300,
    priceAnnual: 3000,
    credits: 500,
    minSeats: 1,
    additions: [
      'AIモデル: GPT-4o mini',
      'シンキングモード: 標準',
      'CRM全機能 (企業・コンタクト・取引・パイプライン管理)',
      '議事録自動取得 + BANT等の自動入力',
      '企業DB(290万社)閲覧',
      '求人インテント・自動エンリッチメント',
      'Slack / Gmail 自動連携',
      '自動メール配信・ナーチャリング',
      'ワンクリック通話 + コール議事録作成',
    ],
    icon: Zap,
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: '社内ナレッジ × 外部リサーチで提案価値を最大化',
    priceMonthly: 7200,
    priceAnnual: 5000,
    credits: 1000,
    minSeats: 1,
    baseLabel: 'Standard全機能',
    additions: [
      'AIモデル: GPT-4o mini / GPT-4o を選択可',
      'シンキングモード: 標準 / 拡張 を選択可',
      '外部リサーチ (ウェブ検索)',
    ],
    icon: Star,
    popular: true,
  },
]

// ─── 開発依頼サンプル ─────────────────────────────────────────

type DevRequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'

interface DevRequest {
  id: string
  title: string
  description: string
  amount: number
  status: DevRequestStatus
  progress?: number
  createdAt: string
  expectedDelivery?: string
}

const SAMPLE_REQUESTS: DevRequest[] = [
  {
    id: 'r1',
    title: '売上レポート改修',
    description: '部署別フィルター追加と新KPI(部門別マージン率)の集計ロジック実装。Excelエクスポートも対応希望。',
    amount: 150000,
    status: 'in_progress',
    progress: 60,
    createdAt: '2026-04-25',
    expectedDelivery: '2026-05-09',
  },
  {
    id: 'r2',
    title: 'Slack通知追加',
    description: '商談ステージが「PROPOSAL」「CONTRACT」に遷移した際、Slackの#sales-alertsチャンネルに自動通知。担当者・金額・次アクションを含めること。',
    amount: 50000,
    status: 'pending',
    createdAt: '2026-04-28',
  },
]

// ─── メンバー定義 ─────────────────────────────────────────

type MemberRole = 'admin' | 'member'

interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  initial: string
}

const SAMPLE_MEMBERS: Member[] = [
  { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp', role: 'admin', initial: 'N' },
  { id: 'u2', name: '田中 花子', email: 'tanaka@rookiesmart.jp', role: 'member', initial: '田' },
  { id: 'u3', name: '鈴木 一郎', email: 'suzuki@rookiesmart.jp', role: 'member', initial: '鈴' },
  { id: 'u4', name: '佐藤 次郎', email: 'sato@rookiesmart.jp', role: 'member', initial: '佐' },
  { id: 'u5', name: '高橋 三郎', email: 'takahashi@rookiesmart.jp', role: 'member', initial: '高' },
]

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState('pro')
  // サポートティア: none(なし) / chat(担当者へのチャット相談 ¥50,000) / premium(企業担当付きサポート ¥100,000)
  const [supportTier, setSupportTier] = useState<'none' | 'chat' | 'premium'>('none')
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    confirmLabel: string
    variant: 'primary' | 'danger'
    onConfirm: () => void
  } | null>(null)
  const [seats, setSeats] = useState(5)
  const [credits] = useState(3120) // チーム残高 (5シート × 1000c = 5000c中 残3,120c)
  const [personalCredits] = useState(420) // 自分の使用分 (1000c中)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  const [showAddSeats, setShowAddSeats] = useState(false)
  const [pendingSeats, setPendingSeats] = useState(seats)
  const [creditsTab, setCreditsTab] = useState<'team' | 'personal'>('team')
  const [purchaseAmount, setPurchaseAmount] = useState(1000) // 1000単位
  const [requestAmount, setRequestAmount] = useState(100000) // ¥10,000単位
  const [requests] = useState<DevRequest[]>(SAMPLE_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<DevRequest | null>(null)
  const [members, setMembers] = useState<Member[]>(SAMPLE_MEMBERS)
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null)
  const [inviteRole, setInviteRole] = useState<MemberRole>('member')

  const updateRole = (id: string, newRole: MemberRole) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)))
    setOpenRoleMenuId(null)
  }

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }
  // 現在のユーザー権限(本番では auth コンテキストから自動取得)
  const [currentRole] = useState<MemberRole>('admin')
  const isAdmin = currentRole === 'admin'

  const adjustAmount = (delta: number) => {
    setRequestAmount((prev) => Math.max(10000, prev + delta))
  }

  const STATUS_META: Record<DevRequestStatus, { label: string; bg: string; fg: string }> = {
    pending: { label: '承認待ち', bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
    in_progress: { label: '開発中', bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
    completed: { label: '完了', bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
    rejected: { label: '却下', bg: 'rgba(255,90,90,0.14)', fg: '#FF5A5A' },
    cancelled: { label: '取り下げ', bg: 'rgba(160,160,170,0.14)', fg: 'var(--color-obs-text-muted)' },
  }


  const currentPlanData = PLANS.find((p) => p.id === currentPlan)
  const totalCredits = (currentPlanData?.credits ?? 0) * seats // チーム合計
  const personalTotal = currentPlanData?.credits ?? 0 // 1シート分(個人クォータ)
  const usagePct = totalCredits > 0 ? (credits / totalCredits) * 100 : 0
  const personalUsagePct = personalTotal > 0 ? (personalCredits / personalTotal) * 100 : 0

  const formatPrice = (n: number) => `¥${n.toLocaleString()}`
  const CREDIT_UNIT_PRICE = 10 // ¥10 per credit (¥10,000 / 1,000c)
  const CREDIT_STEP = 1000 // 1000-unit step

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Subscription"
          title="プラン・クレジット"
          caption="クレジット利用状況とプラン管理。必要な量だけチャージして利用。"
          action={
            isAdmin ? (
              <ObsButton variant="primary" size="md" onClick={() => setShowBuyCredits(true)}>
                <Plus size={14} className="inline mr-1.5" />
                クレジット追加
              </ObsButton>
            ) : null
          }
        />

        {/* ── Credit usage card (管理者のみ) ── */}
        {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
            <div
              style={{
                position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div className="flex items-start justify-between gap-6 relative mb-4">
              {/* タブ + 残高(左・メイン) */}
              <div className="flex-1">
                {/* タブ */}
                <div
                  className="inline-flex p-1 rounded-[var(--radius-obs-md)] mb-3"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <button
                    onClick={() => setCreditsTab('team')}
                    className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor:
                        creditsTab === 'team' ? 'var(--color-obs-surface-highest)' : 'transparent',
                      color:
                        creditsTab === 'team'
                          ? 'var(--color-obs-text)'
                          : 'var(--color-obs-text-muted)',
                    }}
                  >
                    チーム
                  </button>
                  <button
                    onClick={() => setCreditsTab('personal')}
                    className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor:
                        creditsTab === 'personal' ? 'var(--color-obs-surface-highest)' : 'transparent',
                      color:
                        creditsTab === 'personal'
                          ? 'var(--color-obs-text)'
                          : 'var(--color-obs-text-muted)',
                    }}
                  >
                    個人
                  </button>
                </div>

                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {creditsTab === 'team' ? 'チームのクレジット残高' : '個人のクレジット利用状況'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-[family-name:var(--font-display)] text-[44px] font-bold tabular-nums tracking-[-0.03em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {creditsTab === 'team'
                      ? credits.toLocaleString()
                      : personalCredits.toLocaleString()}
                  </span>
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    / {creditsTab === 'team'
                      ? totalCredits.toLocaleString()
                      : personalTotal.toLocaleString()} cr
                  </span>
                </div>
              </div>

              {/* 現行プラン + シート数(右) */}
              <div className="flex items-stretch gap-3 pt-12">
                <div
                  className="rounded-[var(--radius-obs-md)] px-4 py-2.5 flex flex-col items-start justify-center min-w-[140px]"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    現行プラン
                  </p>
                  <div className="flex items-center gap-1.5">
                    {currentPlanData && (
                      <currentPlanData.icon
                        size={15}
                        style={{ color: 'var(--color-obs-primary)' }}
                      />
                    )}
                    <span
                      className="text-[15px] font-semibold"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {currentPlanData?.name ?? '—'}
                    </span>
                  </div>
                </div>

                <div
                  className="rounded-[var(--radius-obs-md)] px-4 py-2.5 flex flex-col items-start justify-center min-w-[120px]"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    シート数
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-[20px] font-bold tabular-nums tracking-[-0.02em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {seats}
                    </span>
                    <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                      シート契約中
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}
              >
                <motion.div
                  key={creditsTab}
                  initial={{ width: 0 }}
                  animate={{ width: `${creditsTab === 'team' ? usagePct : personalUsagePct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  使用済み: {creditsTab === 'team'
                    ? (totalCredits - credits).toLocaleString()
                    : personalCredits.toLocaleString()} cr
                </span>
                <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  残り: {creditsTab === 'team'
                    ? credits.toLocaleString()
                    : (personalTotal - personalCredits).toLocaleString()} cr
                </span>
              </div>
            </div>
          </ObsCard>
        </motion.div>
        )}

        {/* ── Credit usage card (メンバー用・読み取り専用シンプル版) ── */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
              <div
                style={{
                  position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
                  background: 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative">
                {/* タブ */}
                <div
                  className="inline-flex p-1 rounded-[var(--radius-obs-md)] mb-3"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <button
                    onClick={() => setCreditsTab('team')}
                    className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor:
                        creditsTab === 'team' ? 'var(--color-obs-surface-highest)' : 'transparent',
                      color:
                        creditsTab === 'team'
                          ? 'var(--color-obs-text)'
                          : 'var(--color-obs-text-muted)',
                    }}
                  >
                    チーム
                  </button>
                  <button
                    onClick={() => setCreditsTab('personal')}
                    className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor:
                        creditsTab === 'personal' ? 'var(--color-obs-surface-highest)' : 'transparent',
                      color:
                        creditsTab === 'personal'
                          ? 'var(--color-obs-text)'
                          : 'var(--color-obs-text-muted)',
                    }}
                  >
                    個人
                  </button>
                </div>

                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {creditsTab === 'team' ? 'チームのクレジット残高' : '個人のクレジット利用状況'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-[family-name:var(--font-display)] text-[44px] font-bold tabular-nums tracking-[-0.03em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {creditsTab === 'team'
                      ? credits.toLocaleString()
                      : personalCredits.toLocaleString()}
                  </span>
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    / {creditsTab === 'team'
                      ? totalCredits.toLocaleString()
                      : personalTotal.toLocaleString()} cr
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}
                >
                  <motion.div
                    key={creditsTab}
                    initial={{ width: 0 }}
                    animate={{ width: `${creditsTab === 'team' ? usagePct : personalUsagePct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    使用済み: {creditsTab === 'team'
                      ? (totalCredits - credits).toLocaleString()
                      : personalCredits.toLocaleString()} cr
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    残り: {creditsTab === 'team'
                      ? credits.toLocaleString()
                      : (personalTotal - personalCredits).toLocaleString()} cr
                  </span>
                </div>
              </div>

              <div
                className="mt-5 pt-4 border-t flex items-center gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <Shield size={12} style={{ color: 'var(--color-obs-text-subtle)' }} />
                <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  クレジット追加・プラン変更は管理者のみ可能です
                </p>
              </div>
            </ObsCard>
          </motion.div>
        )}

        {/* ── Plans (管理者のみ) ── */}
        {isAdmin && (
        <div className="mt-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <ObsSectionHeader
                title="プランを選択"
                caption="シート単位の課金。年額契約で約30%お得になります"
              />
            </div>
            {/* Billing cycle toggle */}
            <div
              className="inline-flex p-1 rounded-[var(--radius-obs-md)]"
              style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor:
                    billingCycle === 'monthly' ? 'var(--color-obs-surface-highest)' : 'transparent',
                  color:
                    billingCycle === 'monthly'
                      ? 'var(--color-obs-text)'
                      : 'var(--color-obs-text-muted)',
                }}
              >
                月額
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor:
                    billingCycle === 'annual' ? 'var(--color-obs-surface-highest)' : 'transparent',
                  color:
                    billingCycle === 'annual'
                      ? 'var(--color-obs-text)'
                      : 'var(--color-obs-text-muted)',
                }}
              >
                年額
                <span
                  className="text-[9px] font-semibold px-1.5 py-[1px] rounded-full"
                  style={{
                    backgroundColor: 'rgba(171,199,255,0.18)',
                    color: 'var(--color-obs-primary)',
                  }}
                >
                  約30%お得
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon
              const isCurrent = currentPlan === plan.id
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ObsCard
                    depth={isCurrent ? 'highest' : 'high'}
                    padding="lg"
                    radius="xl"
                    className="relative h-full flex flex-col"
                  >
                    <div
                      className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center mb-4"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                      }}
                    >
                      <Icon size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                    </div>

                    <h3
                      className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] mb-1"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className="text-[11.5px] mb-3"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {plan.tagline}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className="font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.03em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {formatPrice(price)}
                      </span>
                      <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                        /seat /月
                      </span>
                    </div>
                    <p
                      className="text-[12px] font-medium tabular-nums mb-1"
                      style={{ color: 'var(--color-obs-primary)' }}
                    >
                      月間 {plan.credits.toLocaleString()} クレジット込 / seat
                    </p>
                    <p
                      className="text-[11px] mb-4"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {plan.minSeats}シートから購入可能
                    </p>


                    <div className="space-y-2 mb-6 flex-1">
                      {/* 下位プラン継承 */}
                      {plan.baseLabel && (
                        <>
                          <div className="flex items-start gap-2">
                            <Check
                              size={13}
                              className="shrink-0 mt-0.5"
                              strokeWidth={2.5}
                              style={{ color: 'var(--color-obs-low)' }}
                            />
                            <span
                              className="text-[12.5px] leading-relaxed font-medium"
                              style={{ color: 'var(--color-obs-text)' }}
                            >
                              {plan.baseLabel}
                            </span>
                          </div>

                          {/* + 区切り */}
                          <div className="flex items-center gap-2 pl-[3px] py-1">
                            <Plus
                              size={12}
                              strokeWidth={3}
                              style={{ color: 'var(--color-obs-primary)' }}
                            />
                            <div
                              className="flex-1 h-px"
                              style={{ backgroundColor: 'rgba(171,199,255,0.18)' }}
                            />
                          </div>
                        </>
                      )}

                      {/* 追加機能 */}
                      {plan.additions.map((f, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check
                            size={13}
                            className="shrink-0 mt-0.5"
                            strokeWidth={2.5}
                            style={{ color: 'var(--color-obs-low)' }}
                          />
                          <span
                            className="text-[12.5px] leading-relaxed"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    {isCurrent ? (
                      <div className="w-full">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setPendingSeats(Math.max(seats, plan.minSeats))
                              setShowAddSeats(true)
                            }}
                            className="w-full mb-2 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors"
                            style={{
                              backgroundColor: 'var(--color-obs-surface-highest)',
                              color: 'var(--color-obs-text)',
                              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(171,199,255,0.10)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-obs-surface-highest)'
                            }}
                          >
                            <Users size={14} style={{ color: 'var(--color-obs-primary)' }} />
                            シート数を変更
                            <span
                              className="text-[11.5px] font-medium px-2 py-[2px] rounded-full ml-0.5"
                              style={{
                                backgroundColor: 'rgba(171,199,255,0.16)',
                                color: 'var(--color-obs-primary)',
                              }}
                            >
                              現在 {Math.max(seats, plan.minSeats)} 名
                            </span>
                          </button>
                        )}
                        <div
                          className="w-full h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center text-[13px] font-semibold"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                            color: 'var(--color-obs-on-primary)',
                          }}
                        >
                          現在のプラン
                        </div>
                      </div>
                    ) : isAdmin ? (
                      (() => {
                        const isDowngrade = plan.id === 'standard' && currentPlan === 'pro'
                        return (
                          <button
                            onClick={() => {
                              const targetPrice =
                                billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
                              setConfirmDialog({
                                title: isDowngrade
                                  ? `${plan.name} プランへダウングレード`
                                  : `${plan.name} プランへ変更`,
                                message: `変更後の料金は ¥${targetPrice.toLocaleString()}/seat/月 になります。${
                                  isDowngrade
                                    ? '\n\n一部機能(GPT-4o / 外部リサーチなど)は利用できなくなります。'
                                    : ''
                                }`,
                                confirmLabel: isDowngrade ? 'ダウングレードする' : '変更する',
                                variant: isDowngrade ? 'danger' : 'primary',
                                onConfirm: () => setCurrentPlan(plan.id),
                              })
                            }}
                            className="w-full h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                            style={
                              isDowngrade
                                ? {
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-obs-text-muted)',
                                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                                  }
                                : {
                                    background:
                                      'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                                    color: 'var(--color-obs-on-primary)',
                                    fontWeight: 600,
                                  }
                            }
                          >
                            {isDowngrade ? 'ダウングレード' : 'プランを変更'}
                          </button>
                        )
                      })()
                    ) : (
                      <div
                        className="w-full h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center text-[12px]"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--color-obs-text-subtle)',
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                        }}
                      >
                        管理者のみ変更可
                      </div>
                    )}
                  </ObsCard>
                </motion.div>
              )
            })}
          </div>

        </div>
        )}

        {/* ── サポートオプション (管理者のみ) ── */}
        {isAdmin && (
        <div className="mt-12">
          <ObsSectionHeader
            title="サポートオプション"
            caption="運用の伴走レベルに応じて2つのプランから選択。テナント単位の追加オプション"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* チャット相談プラン (¥50,000) */}
            <ObsCard
              depth="high"
              padding="lg"
              radius="xl"
              className={
                supportTier === 'chat'
                  ? 'relative overflow-hidden h-full flex flex-col ring-2 ring-[var(--color-obs-primary)]'
                  : 'relative overflow-hidden h-full flex flex-col'
              }
            >
              <div
                style={{
                  position: 'absolute', top: '-30%', right: '-10%', width: '320px', height: '320px',
                  background: supportTier === 'chat'
                    ? 'radial-gradient(circle, rgba(75,200,140,0.10) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(171,199,255,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-surface-highest) 0%, var(--color-obs-surface-high) 100%)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                    }}
                  >
                    <MessageCircle size={20} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        担当者へのチャット相談
                      </h3>
                      {supportTier === 'chat' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(75,200,140,0.14)',
                            color: '#4BC88C',
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                          利用中
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      お困りごとを気軽にチャットで相談
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    '担当者へのチャット相談 (専属対応)',
                  ].map((f, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check
                        size={13}
                        className="shrink-0 mt-0.5"
                        strokeWidth={2.5}
                        style={{ color: 'var(--color-obs-low)' }}
                      />
                      <span
                        className="text-[12.5px] leading-relaxed"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-end justify-between pt-4 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>+</span>
                      <span
                        className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums tracking-[-0.03em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        ¥50,000
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      /月 (テナント単位)
                    </p>
                  </div>
                  {supportTier === 'chat' ? (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          title: '担当者へのチャット相談 を解除',
                          message:
                            '解除すると、専属担当者へのチャット相談が利用できなくなります。次回請求から ¥50,000/月 が差し引かれます。',
                          confirmLabel: '解除する',
                          variant: 'danger',
                          onConfirm: () => setSupportTier('none'),
                        })
                      }
                      className="px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      解除する
                    </button>
                  ) : (
                    <ObsButton
                      variant={supportTier === 'premium' ? 'ghost' : 'primary'}
                      size="md"
                      onClick={() =>
                        setConfirmDialog({
                          title:
                            supportTier === 'premium'
                              ? '担当者へのチャット相談 へ変更'
                              : '担当者へのチャット相談 を追加',
                          message:
                            supportTier === 'premium'
                              ? '企業担当付きサポート (¥100,000/月) を解除し、担当者へのチャット相談 (¥50,000/月) に切り替えます。次回請求から差額が反映されます。'
                              : '担当者への専属チャット相談がご利用いただけます。月額 ¥50,000(テナント単位) が請求に追加されます。',
                          confirmLabel: supportTier === 'premium' ? '変更する' : '追加する',
                          variant: 'primary',
                          onConfirm: () => setSupportTier('chat'),
                        })
                      }
                    >
                      {supportTier === 'premium' ? 'このプランへ変更' : '追加する'}
                    </ObsButton>
                  )}
                </div>
              </div>
            </ObsCard>

            {/* 企業担当付きサポート (¥100,000) */}
            <ObsCard
              depth="high"
              padding="lg"
              radius="xl"
              className={
                supportTier === 'premium'
                  ? 'relative overflow-hidden h-full flex flex-col ring-2 ring-[var(--color-obs-primary)]'
                  : 'relative overflow-hidden h-full flex flex-col'
              }
            >
              <div
                style={{
                  position: 'absolute', top: '-30%', right: '-10%', width: '320px', height: '320px',
                  background: supportTier === 'premium'
                    ? 'radial-gradient(circle, rgba(75,200,140,0.10) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    }}
                  >
                    <Crown size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        企業担当付きサポート
                      </h3>
                      {supportTier === 'premium' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(75,200,140,0.14)',
                            color: '#4BC88C',
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                          利用中
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      ご導入から運用までの伴走サポート
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {/* 定例ミーティング + 内訳 */}
                  <div className="flex items-start gap-2">
                    <Check
                      size={13}
                      className="shrink-0 mt-0.5"
                      strokeWidth={2.5}
                      style={{ color: 'var(--color-obs-low)' }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-[12.5px] leading-relaxed"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        月1回 1時間 定例ミーティング
                      </p>
                      <ul className="mt-1.5 space-y-1 pl-3">
                        {['設計レビュー', 'カスタム提案', 'ビジネスサポート'].map((sub, k) => (
                          <li
                            key={k}
                            className="text-[11.5px] leading-relaxed flex items-center gap-1.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            <span
                              className="w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--color-obs-text-subtle)' }}
                            />
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-4 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>+</span>
                      <span
                        className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums tracking-[-0.03em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        ¥100,000
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      /月 (テナント単位)
                    </p>
                  </div>
                  {supportTier === 'premium' ? (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          title: '企業担当付きサポート を解除',
                          message:
                            '解除すると、専属担当者によるサポート・月次定例ミーティングが利用できなくなります。次回請求から ¥100,000/月 が差し引かれます。',
                          confirmLabel: '解除する',
                          variant: 'danger',
                          onConfirm: () => setSupportTier('none'),
                        })
                      }
                      className="px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      解除する
                    </button>
                  ) : (
                    <ObsButton
                      variant="primary"
                      size="md"
                      onClick={() =>
                        setConfirmDialog({
                          title:
                            supportTier === 'chat'
                              ? '企業担当付きサポート へ変更'
                              : '企業担当付きサポート を追加',
                          message:
                            supportTier === 'chat'
                              ? '担当者へのチャット相談 (¥50,000/月) を解除し、企業担当付きサポート (¥100,000/月) に切り替えます。次回請求から差額が反映されます。'
                              : '専属担当者によるサポート・月次定例ミーティングがご利用いただけます。月額 ¥100,000(テナント単位) が請求に追加されます。',
                          confirmLabel: supportTier === 'chat' ? '変更する' : '追加する',
                          variant: 'primary',
                          onConfirm: () => setSupportTier('premium'),
                        })
                      }
                    >
                      {supportTier === 'chat' ? 'このプランへ変更' : '追加する'}
                    </ObsButton>
                  )}
                </div>
              </div>
            </ObsCard>
          </div>
        </div>
        )}

        {/* ── Members (管理者のみ) ── */}
        {isAdmin && (
        <div className="mt-12">
          <ObsSectionHeader
            title="メンバー"
            caption="誰でもメンバーを招待できます。プラン編集・クレジット追加・機能リクエストは管理者のみ可能です"
          />

          <ObsCard depth="high" padding="lg" radius="xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  }}
                >
                  <Users size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                </div>
                <div>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.1em] mb-0.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    チームメンバー
                  </p>
                  <p
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {members.length} 名 / {seats} シート
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <ObsButton
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setPendingSeats(currentPlanData?.minSeats ?? 1)
                      setShowAddSeats(true)
                    }}
                  >
                    <Plus size={14} className="inline mr-1.5" />
                    シート追加
                  </ObsButton>
                )}
                <ObsButton variant="primary" size="md" onClick={() => setShowInviteMember(true)}>
                  <UserPlus size={14} className="inline mr-1.5" />
                  メンバーを招待
                </ObsButton>
              </div>
            </div>

            <div className="space-y-2">
              {members.map((m) => {
                // 自分自身は削除不可。最後の管理者も削除不可
                const isSelf = m.email === 'h.sawasaka@rookiesmart.jp'
                const isLastAdmin =
                  m.role === 'admin' &&
                  members.filter((mm) => mm.role === 'admin').length <= 1
                const canDelete = isAdmin && !isSelf && !isLastAdmin
                return (
                <div
                  key={m.id}
                  className="rounded-[var(--radius-obs-md)] p-3.5 flex items-center justify-between gap-4"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-highest)',
                        color: 'var(--color-obs-text)',
                      }}
                    >
                      {m.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate flex items-center gap-2"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {m.name}
                        {isSelf && (
                          <span
                            className="text-[9.5px] font-semibold px-1.5 py-[1px] rounded uppercase tracking-[0.08em]"
                            style={{
                              backgroundColor: 'var(--color-obs-surface-highest)',
                              color: 'var(--color-obs-text-subtle)',
                            }}
                          >
                            自分
                          </span>
                        )}
                      </p>
                      <p
                        className="text-[11.5px] truncate"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {m.email}
                      </p>
                    </div>
                  </div>

                  {/* 権限バッジ + 切替ドロップダウン(管理者のみ操作可) */}
                  <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (!isAdmin) return
                        setOpenRoleMenuId(openRoleMenuId === m.id ? null : m.id)
                      }}
                      disabled={!isAdmin}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.08em] whitespace-nowrap flex items-center gap-1 transition-all disabled:cursor-default"
                      style={{
                        backgroundColor:
                          m.role === 'admin'
                            ? 'rgba(171,199,255,0.14)'
                            : 'var(--color-obs-surface-highest)',
                        color:
                          m.role === 'admin'
                            ? 'var(--color-obs-primary)'
                            : 'var(--color-obs-text-muted)',
                        boxShadow: isAdmin
                          ? 'inset 0 0 0 1px rgba(255,255,255,0.06)'
                          : 'none',
                      }}
                    >
                      {m.role === 'admin' ? (
                        <>
                          <Shield size={10} />
                          管理者
                        </>
                      ) : (
                        'メンバー'
                      )}
                      {isAdmin && (
                        <ChevronRight
                          size={10}
                          style={{
                            transform:
                              openRoleMenuId === m.id ? 'rotate(90deg)' : 'rotate(90deg)',
                          }}
                        />
                      )}
                    </button>

                    {/* ドロップダウンメニュー */}
                    {openRoleMenuId === m.id && isAdmin && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenRoleMenuId(null)}
                        />
                        <div
                          className="absolute right-0 top-full mt-1.5 z-20 min-w-[180px] rounded-[var(--radius-obs-md)] overflow-hidden"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-highest)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                          }}
                        >
                          <button
                            onClick={() => updateRole(m.id, 'admin')}
                            className="w-full px-3 py-2.5 flex items-start gap-2 text-left transition-colors hover:bg-[var(--color-obs-surface-high)]"
                          >
                            <Shield
                              size={13}
                              className="mt-0.5 shrink-0"
                              style={{ color: 'var(--color-obs-primary)' }}
                            />
                            <div className="flex-1">
                              <p
                                className="text-[12px] font-semibold flex items-center gap-1.5"
                                style={{ color: 'var(--color-obs-text)' }}
                              >
                                管理者
                                {m.role === 'admin' && (
                                  <Check
                                    size={11}
                                    style={{ color: 'var(--color-obs-primary)' }}
                                  />
                                )}
                              </p>
                              <p
                                className="text-[10.5px] mt-0.5 leading-snug"
                                style={{ color: 'var(--color-obs-text-subtle)' }}
                              >
                                プラン・クレジット・機能リクエスト・メンバー管理が可能
                              </p>
                            </div>
                          </button>

                          <div
                            className="border-t"
                            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                          />

                          <button
                            onClick={() => updateRole(m.id, 'member')}
                            disabled={
                              m.role === 'admin' &&
                              members.filter((mm) => mm.role === 'admin').length <= 1
                            }
                            className="w-full px-3 py-2.5 flex items-start gap-2 text-left transition-colors hover:bg-[var(--color-obs-surface-high)] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Users
                              size={13}
                              className="mt-0.5 shrink-0"
                              style={{ color: 'var(--color-obs-text-muted)' }}
                            />
                            <div className="flex-1">
                              <p
                                className="text-[12px] font-semibold flex items-center gap-1.5"
                                style={{ color: 'var(--color-obs-text)' }}
                              >
                                メンバー
                                {m.role === 'member' && (
                                  <Check
                                    size={11}
                                    style={{ color: 'var(--color-obs-primary)' }}
                                  />
                                )}
                              </p>
                              <p
                                className="text-[10.5px] mt-0.5 leading-snug"
                                style={{ color: 'var(--color-obs-text-subtle)' }}
                              >
                                標準権限・閲覧と利用が可能
                              </p>
                              {m.role === 'admin' &&
                                members.filter((mm) => mm.role === 'admin').length <= 1 && (
                                  <p
                                    className="text-[10px] mt-1"
                                    style={{ color: '#FFC107' }}
                                  >
                                    最後の管理者は変更できません
                                  </p>
                                )}
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 削除ボタン (管理者のみ・自分自身/最後の管理者は不可) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (!canDelete) return
                        setConfirmDialog({
                          title: 'メンバーを削除',
                          message: `${m.name} (${m.email}) をチームから削除します。このメンバーのアカウントは無効化され、ダッシュボードへアクセスできなくなります。この操作は取り消せません。`,
                          confirmLabel: '削除する',
                          variant: 'danger',
                          onConfirm: () => deleteMember(m.id),
                        })
                      }}
                      disabled={!canDelete}
                      title={
                        isSelf
                          ? '自分自身は削除できません'
                          : isLastAdmin
                            ? '最後の管理者は削除できません'
                            : 'このメンバーを削除'
                      }
                      className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'transparent',
                        color: canDelete ? 'var(--color-obs-text-muted)' : 'var(--color-obs-text-subtle)',
                      }}
                      onMouseEnter={(e) => {
                        if (!canDelete) return
                        e.currentTarget.style.backgroundColor = 'rgba(255,90,90,0.10)'
                        e.currentTarget.style.color = '#FF5A5A'
                      }}
                      onMouseLeave={(e) => {
                        if (!canDelete) return
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--color-obs-text-muted)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  </div>
                </div>
                )
              })}
            </div>
          </ObsCard>
        </div>
        )}

        {/* ── Custom Dev Requests (管理者のみ) ── */}
        {isAdmin && (
        <div className="mt-12">
          <ObsSectionHeader
            title="機能リクエスト"
            caption="追加機能を1万円単位の希望額で開発依頼。承認時のみ課金され、スキルもしくは全体機能としてサービスに追加されます"
          />

          <ObsCard depth="high" padding="lg" radius="xl">
            {/* Header: Title + Send button */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  }}
                >
                  <Wrench size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                </div>
                <div>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.1em] mb-0.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    依頼一覧
                  </p>
                  <p
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {requests.length} 件
                  </p>
                </div>
              </div>
              <ObsButton variant="primary" size="md" onClick={() => setShowNewRequest(true)}>
                <Send size={14} className="inline mr-1.5" />
                機能リクエストを送信
              </ObsButton>
            </div>

            {/* Request list */}
            {requests.length === 0 ? (
              <div
                className="rounded-[var(--radius-obs-md)] p-8 text-center"
                style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
              >
                <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  まだリクエストはありません。「機能リクエストを送信」から最初の提案を作成してください。
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => {
                  const meta = STATUS_META[req.status]
                  return (
                    <motion.button
                      key={req.id}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setSelectedRequest(req)}
                      className="group w-full rounded-[var(--radius-obs-md)] p-4 text-left transition-all cursor-pointer"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-obs-surface-highest)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-obs-surface-high)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p
                              className="text-[14px] font-semibold truncate transition-colors"
                              style={{ color: 'var(--color-obs-text)' }}
                            >
                              {req.title}
                            </p>
                            <span
                              className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] whitespace-nowrap"
                              style={{ backgroundColor: meta.bg, color: meta.fg }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-3 text-[11.5px]"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            <span className="font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                              ¥{req.amount.toLocaleString()}
                            </span>
                            <span>依頼日 {req.createdAt}</span>
                          </div>
                        </div>

                        {/* 詳細表示の手がかり */}
                        <div
                          className="flex items-center gap-1 shrink-0 text-[11.5px] font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          <span>詳細</span>
                          <ChevronRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </ObsCard>
        </div>
        )}

        {/* ── Confirm dialog (汎用確認モーダル) ── */}
        <AnimatePresence>
          {confirmDialog && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setConfirmDialog(null)}
              />
              <motion.div
                className="relative w-full max-w-[460px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="px-6 pt-6 pb-2">
                  <h2
                    className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] mb-2"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {confirmDialog.title}
                  </h2>
                  <p
                    className="text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {confirmDialog.message}
                  </p>
                </div>

                <div className="px-6 pb-6 pt-4 flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-obs-text-muted)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm()
                      setConfirmDialog(null)
                    }}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-semibold transition-colors"
                    style={
                      confirmDialog.variant === 'danger'
                        ? {
                            backgroundColor: 'rgba(255,90,90,0.16)',
                            color: '#FF7A7A',
                            boxShadow: 'inset 0 0 0 1px rgba(255,90,90,0.32)',
                          }
                        : {
                            background:
                              'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                            color: 'var(--color-obs-on-primary)',
                          }
                    }
                  >
                    {confirmDialog.confirmLabel}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add seats modal ── */}
        <AnimatePresence>
          {showAddSeats && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowAddSeats(false)}
              />
              <motion.div
                className="relative w-full max-w-[520px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      シート数を変更
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowAddSeats(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* 現在の契約情報 */}
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3.5 grid grid-cols-2 gap-3"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        現在のプラン
                      </p>
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                        {currentPlanData?.name ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        現在のシート数
                      </p>
                      <p
                        className="text-[14px] font-semibold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {seats} シート
                      </p>
                    </div>
                  </div>

                  {/* シート数調整 */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      シート数の調整
                    </label>
                    <div
                      className="rounded-[var(--radius-obs-md)] p-4"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            setPendingSeats((p) =>
                              Math.max(currentPlanData?.minSeats ?? 1, p - 1),
                            )
                          }
                          disabled={pendingSeats <= (currentPlanData?.minSeats ?? 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="シート減らす"
                        >
                          <Minus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>

                        <div className="flex-1 text-center">
                          <p
                            className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {pendingSeats}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            現在の合計シート数
                          </p>
                        </div>

                        <button
                          onClick={() => setPendingSeats((p) => p + 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="シート増やす"
                        >
                          <Plus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>
                      </div>
                    </div>

                    {/* メンバー数を下回る場合の警告 */}
                    {pendingSeats < members.length && (
                      <div
                        className="mt-3 rounded-[var(--radius-obs-sm)] p-3 flex items-start gap-2"
                        style={{
                          backgroundColor: 'rgba(255,193,7,0.10)',
                          color: '#FFC107',
                        }}
                      >
                        <span className="text-[14px] leading-none mt-0.5">⚠</span>
                        <p className="text-[11.5px] leading-relaxed">
                          現在 {members.length} 名のメンバーが在籍中です。シート数を {pendingSeats} に減らすと、超過分のメンバー({members.length - pendingSeats} 名)はアクセスできなくなります。事前にメンバーを削除してください。
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 料金プレビュー */}
                  {(() => {
                    const pricePerSeat =
                      billingCycle === 'annual'
                        ? currentPlanData?.priceAnnual ?? 0
                        : currentPlanData?.priceMonthly ?? 0
                    const currentTotal = pricePerSeat * seats
                    const newTotal = pricePerSeat * pendingSeats
                    const diff = newTotal - currentTotal
                    return (
                      <div
                        className="rounded-[var(--radius-obs-md)] p-3.5"
                        style={{
                          backgroundColor: 'rgba(171,199,255,0.06)',
                          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                        }}
                      >
                        <div className="flex justify-between text-[12px] mb-2">
                          <span style={{ color: 'var(--color-obs-text-muted)' }}>
                            現在の月額(税抜)
                          </span>
                          <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                            ¥{currentTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[12px] mb-2">
                          <span style={{ color: 'var(--color-obs-text-muted)' }}>
                            変更後の月額(税抜)
                          </span>
                          <span
                            className="tabular-nums font-semibold"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            ¥{newTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[13px] pt-2 border-t" style={{ borderColor: 'rgba(171,199,255,0.16)' }}>
                          <span className="font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                            差額(月額)
                          </span>
                          <span
                            className="tabular-nums font-bold"
                            style={{
                              color: diff >= 0 ? 'var(--color-obs-primary)' : '#4BC88C',
                            }}
                          >
                            {diff >= 0 ? '+' : ''}¥{diff.toLocaleString()}
                          </span>
                        </div>
                        {diff > 0 && (
                          <p
                            className="text-[10.5px] mt-2 leading-relaxed"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            ※ 日割り計算で初回請求に追加されます。次月以降は新シート数で課金。
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddSeats(false)}
                      className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      キャンセル
                    </button>
                    <ObsButton
                      variant="primary"
                      size="md"
                      className="flex-1"
                      disabled={pendingSeats < members.length || pendingSeats === seats}
                      onClick={() => {
                        setSeats(pendingSeats)
                        setShowAddSeats(false)
                      }}
                    >
                      変更を確定
                    </ObsButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Member invite modal ── */}
        <AnimatePresence>
          {showInviteMember && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowInviteMember(false)}
              />
              <motion.div
                className="relative w-full max-w-[480px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      メンバーを招待
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowInviteMember(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* シート空き状況(1行・分かりやすく) */}
                  <div
                    className="rounded-[var(--radius-obs-md)] px-3.5 py-2.5 flex items-center justify-between gap-3"
                    style={{
                      backgroundColor:
                        members.length >= seats
                          ? 'rgba(255,193,7,0.08)'
                          : 'var(--color-obs-surface-high)',
                      boxShadow:
                        members.length >= seats
                          ? 'inset 0 0 0 1px rgba(255,193,7,0.25)'
                          : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        size={14}
                        style={{
                          color:
                            members.length >= seats
                              ? '#FFC107'
                              : 'var(--color-obs-text-muted)',
                        }}
                      />
                      <p className="text-[12.5px] tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                        シート使用:{' '}
                        <span className="font-semibold">
                          {members.length} / {seats}
                        </span>{' '}
                        <span style={{ color: 'var(--color-obs-text-muted)' }}>
                          {members.length >= seats
                            ? '(満員・空きなし)'
                            : `(残り ${seats - members.length} シート)`}
                        </span>
                      </p>
                    </div>
                    {members.length >= seats && isAdmin && (
                      <button
                        onClick={() => {
                          setShowInviteMember(false)
                          setPendingSeats(currentPlanData?.minSeats ?? 1)
                          setShowAddSeats(true)
                        }}
                        className="text-[11.5px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-[var(--radius-obs-sm)] transition-colors"
                        style={{
                          backgroundColor: '#FFC107',
                          color: '#1a1a1a',
                        }}
                      >
                        + シート追加
                      </button>
                    )}
                  </div>

                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      メールアドレス *
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      />
                      <input
                        type="email"
                        placeholder="taro@example.com"
                        disabled={members.length >= seats}
                        className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-high)',
                          color: 'var(--color-obs-text)',
                        }}
                      />
                    </div>
                    <p
                      className="text-[11px] mt-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      複数招待時はカンマ区切りで入力
                    </p>
                  </div>

                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      権限
                    </label>
                    <div
                      className="inline-flex p-1 rounded-[var(--radius-obs-md)] w-full"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <button
                        onClick={() => setInviteRole('member')}
                        className="flex-1 px-4 py-2 rounded-[var(--radius-obs-sm)] text-[12.5px] font-semibold transition-colors"
                        style={{
                          backgroundColor:
                            inviteRole === 'member'
                              ? 'var(--color-obs-surface-highest)'
                              : 'transparent',
                          color:
                            inviteRole === 'member'
                              ? 'var(--color-obs-text)'
                              : 'var(--color-obs-text-muted)',
                        }}
                      >
                        メンバー
                      </button>
                      <button
                        onClick={() => isAdmin && setInviteRole('admin')}
                        disabled={!isAdmin}
                        className="flex-1 px-4 py-2 rounded-[var(--radius-obs-sm)] text-[12.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            inviteRole === 'admin'
                              ? 'rgba(171,199,255,0.16)'
                              : 'transparent',
                          color:
                            inviteRole === 'admin'
                              ? 'var(--color-obs-primary)'
                              : 'var(--color-obs-text-muted)',
                        }}
                      >
                        <Shield size={12} />
                        管理者
                      </button>
                    </div>
                    <p
                      className="text-[10.5px] mt-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {!isAdmin
                        ? '管理者権限の付与は管理者のみ可能です'
                        : inviteRole === 'admin'
                          ? 'プラン・クレジット・機能リクエスト・メンバー管理ができます'
                          : '標準権限・閲覧と利用が可能です'}
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-[var(--radius-obs-md)] text-[11.5px] leading-relaxed"
                    style={{
                      backgroundColor: 'rgba(171,199,255,0.06)',
                      color: 'var(--color-obs-text-muted)',
                    }}
                  >
                    💡 招待メールが送信され、相手が承諾するとチームに参加します。
                  </div>

                  {members.length >= seats ? (
                    <button
                      disabled
                      className="w-full h-12 rounded-[var(--radius-obs-md)] text-[13px] font-semibold cursor-not-allowed opacity-50"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      シートが足りません
                    </button>
                  ) : (
                    <ObsButton variant="primary" size="lg" className="w-full">
                      招待を送信
                    </ObsButton>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Credit purchase modal ── */}
        <AnimatePresence>
          {showBuyCredits && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowBuyCredits(false)}
              />
              <motion.div
                className="relative w-full max-w-[520px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      クレジット追加購入
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowBuyCredits(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    現在のチーム残高:{' '}
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {credits.toLocaleString()} cr
                    </span>
                  </p>

                  {/* クレジット数ステッパー(1000単位) */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      追加するクレジット数 (1,000単位)
                    </label>
                    <div
                      className="rounded-[var(--radius-obs-md)] p-4"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            setPurchaseAmount((p) => Math.max(CREDIT_STEP, p - CREDIT_STEP))
                          }
                          disabled={purchaseAmount <= CREDIT_STEP}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="クレジット減らす"
                        >
                          <Minus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>

                        <div className="flex-1 text-center">
                          <p
                            className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {purchaseAmount.toLocaleString()}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            クレジット
                          </p>
                        </div>

                        <button
                          onClick={() => setPurchaseAmount((p) => p + CREDIT_STEP)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="クレジット増やす"
                        >
                          <Plus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>
                      </div>

                      {/* クイック増減 */}
                      <div className="grid grid-cols-3 gap-1.5 mt-3">
                        {[1000, 5000, 10000].map((delta) => (
                          <button
                            key={delta}
                            onClick={() => setPurchaseAmount((p) => p + delta)}
                            className="py-1.5 rounded-[var(--radius-obs-sm)] text-[11px] font-semibold transition-colors"
                            style={{
                              backgroundColor: 'var(--color-obs-surface-highest)',
                              color: 'var(--color-obs-text)',
                            }}
                          >
                            +{delta.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 料金プレビュー */}
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3.5"
                    style={{
                      backgroundColor: 'rgba(171,199,255,0.06)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                    }}
                  >
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span style={{ color: 'var(--color-obs-text-muted)' }}>単価</span>
                      <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                        ¥{(CREDIT_UNIT_PRICE * 1000).toLocaleString()} / 1,000クレジット
                      </span>
                    </div>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span style={{ color: 'var(--color-obs-text-muted)' }}>追加クレジット</span>
                      <span
                        className="tabular-nums font-semibold"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        +{purchaseAmount.toLocaleString()} cr
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-[14px] pt-2 border-t"
                      style={{ borderColor: 'rgba(171,199,255,0.16)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                        合計(税抜)
                      </span>
                      <span
                        className="tabular-nums font-bold"
                        style={{ color: 'var(--color-obs-primary)' }}
                      >
                        ¥{(purchaseAmount * CREDIT_UNIT_PRICE).toLocaleString()}
                      </span>
                    </div>
                    <p
                      className="text-[11px] mt-2 leading-relaxed"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      購入後、即時にチーム残高に反映されます。
                    </p>
                  </div>

                  <ObsButton variant="primary" size="lg" className="w-full">
                    ¥{(purchaseAmount * CREDIT_UNIT_PRICE).toLocaleString()} で購入する
                  </ObsButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Request detail modal ── */}
        <AnimatePresence>
          {selectedRequest && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setSelectedRequest(null)}
              />
              <motion.div
                className="relative w-full max-w-[560px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Wrench size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      依頼詳細
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em]"
                      style={{
                        backgroundColor: STATUS_META[selectedRequest.status].bg,
                        color: STATUS_META[selectedRequest.status].fg,
                      }}
                    >
                      {STATUS_META[selectedRequest.status].label}
                    </span>
                    <span className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      ID: {selectedRequest.id}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      タイトル
                    </p>
                    <p
                      className="text-[18px] font-semibold leading-tight"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {selectedRequest.title}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      希望支払額
                    </p>
                    <p
                      className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums tracking-[-0.03em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      ¥{selectedRequest.amount.toLocaleString()}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      詳細・要件
                    </p>
                    <div
                      className="rounded-[var(--radius-obs-md)] p-3.5 text-[13px] leading-relaxed whitespace-pre-wrap"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      {selectedRequest.description}
                    </div>
                  </div>

                  {/* Meta */}
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3.5"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      依頼日
                    </p>
                    <p className="text-[12.5px] tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {selectedRequest.createdAt}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2">
                    <ObsButton variant="primary" size="md" className="w-full" onClick={() => setSelectedRequest(null)}>
                      閉じる
                    </ObsButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── New dev request modal ── */}
        <AnimatePresence>
          {showNewRequest && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowNewRequest(false)}
              />
              <motion.div
                className="relative w-full max-w-[560px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Send size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      機能リクエストを送信
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowNewRequest(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      タイトル *
                    </label>
                    <input
                      type="text"
                      placeholder="例: 売上レポートに部署別フィルター追加"
                      className="w-full px-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      詳細・要件 *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="期待する成果物・必要な機能・参考画面など"
                      className="w-full px-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0 resize-none"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      オファー額 (1万円単位)
                    </label>

                    {/* 大きな金額表示 + ステッパー */}
                    <div
                      className="rounded-[var(--radius-obs-md)] p-4 mb-3"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => adjustAmount(-10000)}
                          disabled={requestAmount <= 10000}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="1万円減らす"
                        >
                          <Minus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>

                        <div className="flex-1 text-center">
                          <p
                            className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            ¥{requestAmount.toLocaleString()}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            {(requestAmount / 10000).toLocaleString()}枚相当
                          </p>
                        </div>

                        <button
                          onClick={() => adjustAmount(10000)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="1万円増やす"
                        >
                          <Plus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>
                      </div>
                    </div>

                    {/* クイック追加ボタン */}
                    <p
                      className="text-[10.5px] uppercase tracking-[0.1em] mb-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      クイック追加
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[10000, 50000, 100000, 500000, 1000000].map((delta) => (
                        <motion.button
                          key={delta}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => adjustAmount(delta)}
                          className="py-2 rounded-[var(--radius-obs-sm)] text-[11.5px] font-semibold transition-colors"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-high)',
                            color: 'var(--color-obs-text)',
                          }}
                        >
                          +{(delta / 10000).toLocaleString()}万
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-[var(--radius-obs-md)] space-y-2"
                    style={{
                      backgroundColor: 'rgba(171,199,255,0.06)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                    }}
                  >
                    <p
                      className="text-[12px] font-semibold leading-relaxed"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      🌐 採用された機能はスキルもしくは全体機能として実装
                    </p>
                    <p
                      className="text-[11.5px] leading-relaxed"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      提案いただいた内容を分析し、採用された場合は「スキル」もしくは「全体機能」としてサービスに追加されます。
                    </p>
                    <p
                      className="text-[12px] font-semibold leading-relaxed pt-1"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      💡 引き落としは承認時のみ
                    </p>
                    <p
                      className="text-[11.5px] leading-relaxed"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      送信した時点ではクレジットは一切消費されません。担当が内容を確認し承認した瞬間に、提示額分がクレジットから引き落とされます。却下・見積修正の場合は引き落としは発生しません。
                    </p>
                  </div>

                  <ObsButton variant="primary" size="lg" className="w-full">
                    送信する
                  </ObsButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
