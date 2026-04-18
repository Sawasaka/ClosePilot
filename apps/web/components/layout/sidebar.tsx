'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Columns3, Building2, Users, Briefcase,
  List, CheckSquare, BookOpen, BarChart2, LayoutDashboard,
  Workflow, FileStack, AlertCircle, Settings, Zap, ChevronRight,
  Trophy, Rocket, Bot, Mail, Send, FileText, Target, GitBranch, Gift,
  Medal, Map, GraduationCap, Award, Swords,
  Globe, Vote, Settings2, History, Tv,
  ScrollText, Palette, CreditCard,
} from 'lucide-react'

// ── Navigation structure ──────────────────────────────────────────────────────
const NAV_GROUPS = [
  // ── ホーム ──
  {
    label: null,
    items: [
      { href: '/',          label: 'ホーム',           icon: Bot },
    ],
  },
  // ── ToDo ──
  {
    label: 'ToDo',
    items: [
      { href: '/today',     label: '今日のタスク一覧',  icon: Home, badge: 8 },
      { href: '/overdue',   label: '期限超過タスク一覧', icon: AlertCircle, badge: 4 },
      { href: '/tasks',     label: 'タスク一覧',        icon: CheckSquare },
    ],
  },
  // ── CRM ──
  {
    label: 'CRM',
    items: [
      { href: '/pipeline',  label: 'パイプライン',     icon: Columns3 },
      { href: '/lists',     label: 'ISリスト',         icon: List },
      { href: '/companies', label: '企業',             icon: Building2 },
      { href: '/contacts',  label: 'コンタクト',       icon: Users },
      { href: '/deals',     label: '取引',             icon: Briefcase },
    ],
  },
  // ── マーケティング ──
  {
    label: 'マーケティング',
    items: [
      { href: '/nurturing',  label: 'ナーチャリング',   icon: Mail },
      { href: '/campaigns',  label: '配信管理',         icon: Send },
      { href: '/leads',      label: 'リード分析',       icon: Target },
      { href: '/automation', label: 'オートメーション', icon: Workflow },
      { href: '/documents', label: 'リンク資料',       icon: FileStack, roadmap: 'v2', tooltip: '顧客の閲覧状況・滞在時間を自動トラッキング' },
      { href: '/content-studio', label: '資料作成',      icon: Palette },
    ],
  },
  // ── PDM ──
  {
    label: 'PDM',
    items: [
      { href: '/meetings',  label: '議事録',           icon: FileText },
      { href: '/issues',    label: '課題ボード',       icon: GitBranch },
      { href: '/priority',  label: '開発優先度',       icon: BarChart2 },
      { href: '/talent/roadmap',      label: '開発ロードマップ', icon: Map },
    ],
  },
  // ── 人事 ──
  {
    label: '人事',
    items: [
      { href: '/talent/level',        label: 'マイレベル',       icon: Medal },
      { href: '/talent/training',     label: '研修プログレス',   icon: GraduationCap },
      { href: '/talent/achievements', label: '達成・バッジ',     icon: Award },
      { href: '/talent/quests',       label: 'クエスト',         icon: Swords },
      { href: '/talent/goals',        label: '目標設定',         icon: Target },
      { href: '/onboarding',          label: 'オンボーディング', icon: Rocket },
    ],
  },
  // ── データサイエンス ──
  {
    label: 'データサイエンス',
    items: [
      { href: '/dashboard', label: '成績',            icon: LayoutDashboard },
      { href: '/analytics', label: 'アクション数',    icon: BarChart2 },
      { href: '/pipeline-report', label: 'パイプラインレポート', icon: BarChart2 },
      { href: '/knowledge', label: 'ナレッジ',         icon: BookOpen },
    ],
  },
  // ── 経営者 ──
  {
    label: '経営者',
    items: [
      { href: '/rulebook',                   label: 'ルールブック',     icon: ScrollText },
      { href: '/gamification',              label: 'ストーリー',       icon: BookOpen },
      { href: '/gamification/tutorial',     label: 'チュートリアル',   icon: Target },
      { href: '/gamification/economy',      label: '仮想経済',         icon: Gift },
      { href: '/gamification/team',         label: 'チームプレイ',     icon: Users },
      { href: '/gamification/leaderboard',  label: 'リーダーボード',   icon: Trophy },
    ],
  },
  // ── メタバース ──
  {
    label: 'メタバース',
    items: [
      { href: '/metaverse/rooms',   label: '研修ルーム一覧', icon: Tv },
      { href: '/metaverse/history', label: '研修履歴',       icon: History },
    ],
  },
  // ── Web3 ──
  {
    label: 'Web3',
    items: [
      { href: '/web3/proposals', label: '提案一覧',           icon: Vote },
      { href: '/web3/influence', label: '影響度ダッシュボード', icon: Globe },
      { href: '/web3/settings',  label: 'スコア設定',         icon: Settings2 },
    ],
  },
]

// ── NavItem — Nintendo button style ──────────────────────────────────────────
function NavItem({
  href, label, icon: Icon, active, badge, roadmap, note, tooltip, devOrder,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean; badge?: number; roadmap?: string; note?: string; tooltip?: string; devOrder?: number
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative mx-2">
      <Link href={href} className="block">
        <motion.div
          className="relative flex flex-wrap items-center gap-2.5 px-3 py-[8px] rounded-[8px]"
          style={active ? {
            background: 'linear-gradient(180deg, #182058 0%, #101840 100%)',
            boxShadow: '0 0 12px rgba(68,102,200,0.25), inset 0 1px 0 rgba(200,220,255,0.1)',
            border: '1px solid #3355AA',
          } : undefined}
          whileHover={!active ? { background: 'rgba(136,187,255,0.05)' } : undefined}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
        >
          <Icon
            size={15}
            strokeWidth={active ? 2.4 : 1.75}
            style={{ color: active ? '#FFFFFF' : '#556688', flexShrink: 0 }}
          />
          <span
            className="leading-none tracking-[-0.01em] text-[13px]"
            style={{
              color: active ? '#FFFFFF' : '#7788AA',
              fontWeight: active ? 600 : 400,
            }}
          >
            {label}
          </span>

          {badge != null && badge > 0 && (
            <span
              className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none shrink-0"
              style={{
                background: active ? 'rgba(255,255,255,0.2)' : href === '/overdue' ? '#FF4444' : '#3355CC',
                color: '#FFFFFF',
              }}
            >
              {badge}
            </span>
          )}

          {roadmap && !active && (
            <span
              className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] shrink-0 uppercase tracking-[0.03em]"
              style={{
                background: roadmap === 'v2' ? 'rgba(96,165,250,0.12)' : 'rgba(139,92,246,0.12)',
                color: roadmap === 'v2' ? '#60A5FA' : '#A78BFA',
              }}
            >
              {roadmap === 'v2' ? 'Phase 2' : 'Phase 3'}
            </span>
          )}

          {devOrder != null && !active && (
            <span
              className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] shrink-0 tracking-[0.03em]"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#4A5568' }}
            >
              #{devOrder}
            </span>
          )}

          {tooltip && !active && (
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setShowTooltip(v => !v) }}
              className="ml-auto w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold hover:bg-[rgba(255,255,255,0.08)] transition-colors"
              style={{ color: '#4A5568' }}
            >
              ?
            </button>
          )}

          {/* Active badge dot */}
          <AnimatePresence>
            {active && (
              <motion.span
                layoutId="sidebar-active-dot"
                className="ml-auto w-[5px] h-[5px] rounded-full bg-white shrink-0"
                style={{ opacity: 0.7 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.7, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </AnimatePresence>
          {note && !active && (
            <span className="w-full pl-[27px] text-[9px] leading-tight -mt-1 mb-0.5" style={{ color: '#4A5568' }}>
              {note}
            </span>
          )}
        </motion.div>
      </Link>
      {/* Tooltip popover */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 right-3 mt-1 px-3 py-2 rounded-[8px] z-40"
            style={{ background: '#1D1D1F', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          >
            <p className="text-[10px] text-white leading-relaxed">{tooltip}</p>
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-1 right-1.5 text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="px-5 pt-4 pb-1.5 text-[10px] font-bold uppercase"
      style={{ color: '#99AACC', letterSpacing: '0.12em' }}
    >
      {label}
    </p>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[224px] flex flex-col z-30 select-none"
      style={{
        background: 'linear-gradient(180deg, #0c1030 0%, #060818 100%)',
        borderRight: '2px solid #2244AA',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5), inset -1px 0 0 rgba(136,187,255,0.08)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="h-[56px] flex items-center px-5 shrink-0"
        style={{ borderBottom: '2px solid #2244AA' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #5AC8FA 0%, #5577DD 35%, #2244AA 70%, #3355CC 100%)',
              boxShadow: '0 0 16px rgba(85,119,221,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Zap size={15} className="text-white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#FFFFFF] tracking-[-0.03em] leading-tight">
              BGM
            </span>
            <span className="text-[9px] text-[#5577DD] tracking-[0.06em] leading-tight uppercase font-semibold">
              Business Growth Management
            </span>
          </div>
        </Link>
      </div>

      {/* ── Navigation groups ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
            {group.label && <SectionLabel label={group.label} />}
            {!group.label && gi === 0 && <div className="h-1" />}
            <div className="flex flex-col gap-[2px]">
              {group.items.map(item => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  badge={'badge' in item ? (item as { badge: number }).badge : undefined}
                  roadmap={'roadmap' in item ? (item as { roadmap: string }).roadmap : undefined}
                  note={'note' in item ? (item as { note: string }).note : undefined}
                  tooltip={'tooltip' in item ? (item as { tooltip: string }).tooltip : undefined}
                  devOrder={'devOrder' in item ? (item as { devOrder: number }).devOrder : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4 h-px" style={{ background: '#2244AA' }} />

      {/* ── Settings & Subscription ── */}
      <div className="py-1.5">
        <NavItem href="/subscription" label="プラン・クレジット" icon={CreditCard} active={isActive('/subscription')} />
        <NavItem href="/settings" label="設定" icon={Settings} active={isActive('/settings')} />
      </div>

      {/* ── Workspace ── */}
      <div className="mx-2 mb-3">
        <motion.div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.03)' }}
          whileHover={{ background: 'rgba(255,255,255,0.06)' }}
          transition={{ duration: 0.12 }}
        >
          <div
            className="w-[20px] h-[20px] rounded-[5px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}
          >
            <span className="text-[8px] font-bold text-white leading-none">CP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-[#8B95A5] truncate tracking-[-0.01em]">
              ワークスペース
            </p>
          </div>
          <ChevronRight size={12} style={{ color: '#3355AA' }} className="shrink-0" />
        </motion.div>
      </div>
    </aside>
  )
}
