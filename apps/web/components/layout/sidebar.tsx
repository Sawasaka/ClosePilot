'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Columns3, Building2, Users, Briefcase,
  List, CheckSquare, BookOpen, BarChart2, LayoutDashboard,
  Workflow, FileStack, AlertCircle, Settings, Zap, ChevronRight,
} from 'lucide-react'

// ── Navigation structure ──────────────────────────────────────────────────────
const NAV_GROUPS = [
  // ── MVP ──
  {
    label: null,
    items: [
      { href: '/',          label: '今日のタスク', icon: Home, badge: 8 },
      { href: '/overdue',   label: '期限超過タスク',       icon: AlertCircle, badge: 4 },
      { href: '/pipeline',  label: 'パイプライン',       icon: Columns3 },
    ],
  },
  {
    label: 'データ',
    items: [
      { href: '/companies', label: '企業',       icon: Building2 },
      { href: '/contacts',  label: 'コンタクト', icon: Users },
      { href: '/deals',     label: '取引',       icon: Briefcase },
    ],
  },
  {
    label: null,
    items: [
      { href: '/lists',       label: 'リスト',           icon: List },
      { href: '/tasks',       label: 'タスク',           icon: CheckSquare },
      { href: '/automation',  label: 'オートメーション', icon: Workflow },
      { href: '/documents',   label: '資料',             icon: FileStack },
    ],
  },
  // ── 開発ロードマップ ──
  {
    label: 'ロードマップ',
    items: [
      { href: '/dashboard', label: 'ダッシュボード',    icon: LayoutDashboard, roadmap: 'v2' },
      { href: '/analytics', label: 'アナリティクス',    icon: BarChart2, roadmap: 'v2' },
      { href: '/knowledge', label: 'ナレッジ',          icon: BookOpen, roadmap: 'v3' },
    ],
  },
]

// ── NavItem — Nintendo button style ──────────────────────────────────────────
function NavItem({
  href, label, icon: Icon, active, badge, roadmap,
}: {
  href: string; label: string; icon: React.ElementType; active: boolean; badge?: number; roadmap?: string
}) {
  return (
    <Link href={href} className="block mx-2">
      <motion.div
        className="relative flex items-center gap-2.5 px-3 py-[8px] rounded-[8px]"
        style={active ? {
          background: 'linear-gradient(135deg, #FF4E38 0%, #FF3B30 50%, #CC1A00 100%)',
          boxShadow: '0 3px 14px rgba(255,59,48,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
        } : undefined}
        whileHover={!active ? { background: 'rgba(0,0,0,0.05)' } : undefined}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
      >
        <Icon
          size={15}
          strokeWidth={active ? 2.4 : 1.75}
          style={{ color: active ? '#FFFFFF' : '#8E8E93', flexShrink: 0 }}
        />
        <span
          className="leading-none tracking-[-0.01em] text-[13px]"
          style={{
            color: active ? '#FFFFFF' : '#3C3C43',
            fontWeight: active ? 600 : 400,
          }}
        >
          {label}
        </span>

        {badge != null && badge > 0 && (
          <span
            className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold leading-none shrink-0"
            style={{
              background: active ? 'rgba(255,255,255,0.25)' : href === '/overdue' ? '#FF3B30' : '#0071E3',
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
              background: roadmap === 'v2' ? 'rgba(0,113,227,0.08)' : 'rgba(94,92,230,0.08)',
              color: roadmap === 'v2' ? '#0071E3' : '#5E5CE6',
            }}
          >
            {roadmap === 'v2' ? 'Phase 2' : 'Phase 3'}
          </span>
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
      </motion.div>
    </Link>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase"
      style={{ color: '#AEAEB2', letterSpacing: '0.08em' }}
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
        background: '#FFFFFF',
        boxShadow: '1px 0 0 rgba(0,0,0,0.06), 4px 0 20px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="h-[56px] flex items-center px-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 40%, #CC1A00 100%)',
              boxShadow: '0 3px 12px rgba(255,59,48,0.55), 0 0 0 1px rgba(255,255,255,0.2) inset',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Zap size={14} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <span className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
            ClosePilot
          </span>
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
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4 h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />

      {/* ── Settings ── */}
      <div className="py-1.5">
        <NavItem href="/settings" label="設定" icon={Settings} active={isActive('/settings')} />
      </div>

      {/* ── Workspace ── */}
      <div className="mx-2 mb-3">
        <motion.div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.03)' }}
          whileHover={{ background: 'rgba(0,0,0,0.05)' }}
          transition={{ duration: 0.12 }}
        >
          <div
            className="w-[20px] h-[20px] rounded-[5px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(145deg, #0A84FF, #5E5CE6)' }}
          >
            <span className="text-[8px] font-bold text-white leading-none">CP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-[#3C3C43] truncate tracking-[-0.01em]">
              ワークスペース
            </p>
          </div>
          <ChevronRight size={12} style={{ color: '#C7C7CC' }} className="shrink-0" />
        </motion.div>
      </div>
    </aside>
  )
}
