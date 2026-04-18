'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Zap, Plus, Check, Star, Shield, Crown, ChevronRight, X } from 'lucide-react'

// ─── クレジット型サブスクリプション管理 ─────────────────────────────────────────

interface Plan {
  id: string
  name: string
  price: string
  priceNote: string
  credits: number
  features: string[]
  icon: React.ElementType
  gradient: string
  glow: string
  color: string
  borderColor: string
  textShadow: string
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'plan1',
    name: 'スタンダード',
    price: '¥9,800',
    priceNote: '/月',
    credits: 500,
    features: ['CRM基本機能', 'タスク管理', 'パイプライン管理', 'AI資料生成 (月5回)', 'メールサポート'],
    icon: Zap,
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 20px rgba(50,173,230,0.85), 0 0 8px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  {
    id: 'plan2',
    name: 'プロフェッショナル',
    price: '¥29,800',
    priceNote: '/月',
    credits: 2000,
    features: ['スタンダード全機能', 'AI資料生成 (無制限)', 'ルールブック機能', 'API連携', '優先サポート', 'カスタムレポート'],
    icon: Star,
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
    glow: '0 0 20px rgba(139,92,246,0.85), 0 0 8px rgba(196,181,253,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(50,20,100,0.6)',
    popular: true,
  },
  {
    id: 'plan3',
    name: 'エンタープライズ',
    price: '¥98,000',
    priceNote: '/月',
    credits: 10000,
    features: ['プロフェッショナル全機能', '専属サポート担当', '導入コンサルティング', 'カスタム開発対応', 'SLA保証 (99.9%)', 'オンサイト研修', '専用Slackチャンネル'],
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 24px rgba(255,159,10,0.95), 0 0 10px rgba(255,204,102,1), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00',
    borderColor: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
  },
]

const CREDIT_PACKS = [
  { amount: 100,  price: '¥2,980',  perCredit: '¥29.8' },
  { amount: 500,  price: '¥12,800', perCredit: '¥25.6', popular: true },
  { amount: 2000, price: '¥39,800', perCredit: '¥19.9' },
]

const FF = {
  card: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  shadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

export default function SubscriptionPage() {
  const [currentPlan] = useState('plan2')
  const [credits] = useState(1247)
  const [totalCredits] = useState(2000)
  const [showBuyCredits, setShowBuyCredits] = useState(false)

  const usagePct = (credits / totalCredits) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[24px] font-black text-[#EEEEFF] tracking-[0.02em]" style={{ textShadow: '0 0 16px rgba(136,187,255,0.3)' }}>
          プラン・クレジット
        </h1>
        <p className="text-[13px] text-[#99AACC] mt-1">クレジットの利用状況とプラン管理</p>
      </motion.div>

      {/* Credit usage card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[14px] p-6 relative overflow-hidden"
        style={{ background: FF.card, border: FF.border, boxShadow: FF.shadow }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-[11px] font-bold text-[#99AACC] uppercase tracking-[0.08em] mb-1">現在のクレジット残高</p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-[40px] font-black tabular-nums"
                style={{ color: '#FFFFFF', textShadow: '0 0 20px rgba(139,92,246,0.6), 0 0 6px rgba(196,181,253,0.8)' }}
              >
                {credits.toLocaleString()}
              </span>
              <span className="text-[16px] text-[#99AACC] font-medium">/ {totalCredits.toLocaleString()} cr</span>
            </div>
          </div>
          <button
            onClick={() => setShowBuyCredits(true)}
            className="flex items-center gap-1.5 px-5 py-3 text-white text-sm font-bold rounded-[10px] transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
              boxShadow: '0 0 18px rgba(52,199,89,0.8), inset 0 1px 0 rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.4)',
              textShadow: '0 1px 2px rgba(0,60,30,0.4)',
              color: '#053D24',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            クレジット追加
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div
            className="h-4 rounded-full overflow-hidden"
            style={{ background: 'rgba(16,16,40,0.8)', border: '1px solid rgba(139,92,246,0.4)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #C4B5FD 0%, #A78BFA 35%, #8B5CF6 70%, #6D28D9 100%)',
                boxShadow: '0 0 14px rgba(139,92,246,0.85), 0 0 5px rgba(196,181,253,0.95)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-[#99AACC]">使用済み: {(totalCredits - credits).toLocaleString()} cr</span>
            <span className="text-[11px] text-[#99AACC]">残り: {credits.toLocaleString()} cr</span>
          </div>
        </div>
      </motion.div>

      {/* Plans */}
      <div>
        <h2 className="text-[16px] font-bold text-[#EEEEFF] mb-4">プランを選択</h2>
        <div className="grid grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[14px] p-6 relative overflow-hidden"
                style={{
                  background: FF.card,
                  border: isCurrent ? `2px solid rgba(139,92,246,0.7)` : FF.border,
                  boxShadow: isCurrent
                    ? `0 0 24px rgba(139,92,246,0.5), ${FF.shadow}`
                    : FF.shadow,
                }}
              >
                {/* Top glow */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: plan.gradient,
                  boxShadow: plan.glow,
                }} />

                {plan.popular && (
                  <div
                    className="absolute top-3 right-3 px-2 py-[2px] rounded-full text-[9px] font-black uppercase tracking-[0.1em]"
                    style={{
                      background: plan.gradient,
                      boxShadow: plan.glow,
                      color: plan.color,
                      border: `1px solid ${plan.borderColor}`,
                    }}
                  >
                    POPULAR
                  </div>
                )}

                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: plan.gradient,
                    boxShadow: plan.glow,
                    border: `1.5px solid ${plan.borderColor}`,
                  }}
                >
                  <Icon size={22} style={{ color: plan.color, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
                </div>

                <h3 className="text-[16px] font-black text-[#EEEEFF] mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[28px] font-black text-[#FFFFFF]">{plan.price}</span>
                  <span className="text-[13px] text-[#99AACC]">{plan.priceNote}</span>
                </div>
                <p className="text-[12px] font-bold tabular-nums mb-4" style={{ color: '#88BBFF', textShadow: '0 0 6px rgba(136,187,255,0.5)' }}>
                  月間 {plan.credits.toLocaleString()} クレジット
                </p>

                <div className="space-y-2 mb-5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check size={13} className="text-[#34C759] shrink-0 mt-0.5" strokeWidth={3} />
                      <span className="text-[12px] text-[#CCDDF0] leading-tight">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full h-[40px] rounded-[8px] text-[13px] font-bold transition-all"
                  style={isCurrent ? {
                    background: 'rgba(136,187,255,0.1)',
                    border: '1px solid rgba(136,187,255,0.3)',
                    color: '#88BBFF',
                    cursor: 'default',
                  } : {
                    background: plan.gradient,
                    boxShadow: plan.glow,
                    color: plan.color,
                    border: `1px solid ${plan.borderColor}`,
                    textShadow: plan.textShadow,
                  }}
                  disabled={isCurrent}
                >
                  {isCurrent ? '現在のプラン' : 'プランを変更'}
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Credit purchase modal */}
      <AnimatePresence>
        {showBuyCredits && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBuyCredits(false)} />
            <motion.div
              className="relative w-full max-w-[520px] rounded-[16px] overflow-hidden"
              style={{
                background: FF.card,
                border: '1px solid #2244AA',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(85,119,221,0.2)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(34,68,170,0.3)' }}>
                <div className="flex items-center gap-2">
                  <CreditCard size={16} style={{ color: '#88BBFF' }} />
                  <h2 className="text-[16px] font-bold text-[#EEEEFF]">クレジット追加購入</h2>
                </div>
                <button onClick={() => setShowBuyCredits(false)} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.08)]">
                  <X size={16} className="text-[#CCDDF0]" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-[13px] text-[#CCDDF0]">
                  現在の残高: <span className="font-bold text-[#EEEEFF]">{credits.toLocaleString()} cr</span>
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {CREDIT_PACKS.map((pack, i) => (
                    <motion.button
                      key={pack.amount}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-[12px] p-4 text-center relative overflow-hidden"
                      style={{
                        background: FF.card,
                        border: pack.popular ? '2px solid rgba(52,199,89,0.6)' : '1px solid #2244AA',
                        boxShadow: pack.popular ? '0 0 16px rgba(52,199,89,0.3)' : FF.shadow,
                      }}
                    >
                      {pack.popular && (
                        <span className="absolute top-2 right-2 text-[8px] font-black text-[#34C759] bg-[rgba(52,199,89,0.15)] px-1.5 py-0.5 rounded-full uppercase">
                          おすすめ
                        </span>
                      )}
                      <p
                        className="text-[24px] font-black tabular-nums mb-1"
                        style={{ color: '#FFFFFF', textShadow: '0 0 12px rgba(136,187,255,0.5)' }}
                      >
                        {pack.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#99AACC] mb-2">クレジット</p>
                      <p className="text-[16px] font-bold text-[#EEEEFF]">{pack.price}</p>
                      <p className="text-[10px] text-[#99AACC] mt-1">{pack.perCredit}/cr</p>
                    </motion.button>
                  ))}
                </div>

                <button
                  className="w-full h-[44px] rounded-[10px] text-[14px] font-bold transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
                    boxShadow: '0 0 18px rgba(52,199,89,0.8), inset 0 1px 0 rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#053D24',
                    textShadow: '0 1px 2px rgba(0,60,30,0.4)',
                  }}
                >
                  購入する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
