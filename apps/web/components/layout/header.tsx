'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Bell, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const PAGE_TITLES: Record<string, string> = {
  '/': "Today's Action",
  '/pipeline': 'パイプライン',
  '/companies': '企業',
  '/contacts': 'コンタクト',
  '/deals': '取引',
  '/tasks': 'タスク',
  '/knowledge': 'ナレッジ',
  '/analytics': 'アナリティクス',
  '/settings': '設定',
}

const PAGE_ACTIONS: Record<string, { label: string }> = {
  '/companies': { label: '追加' },
  '/contacts': { label: '追加' },
  '/deals': { label: '作成' },
  '/tasks': { label: '追加' },
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return PAGE_TITLES['/'] ?? ''
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (key !== '/' && pathname.startsWith(key)) return title
  }
  return 'ClosePilot'
}

interface HeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const action = Object.entries(PAGE_ACTIONS).find(([key]) => pathname.startsWith(key))?.[1]

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CP'

  return (
    <header
      className="fixed top-0 left-[224px] right-0 h-[56px] flex items-center px-6 gap-3 z-20"
      style={{
        background: 'rgba(232,237,245,0.88)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: '1px solid rgba(0,55,255,0.08)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* Page title */}
      <motion.h1
        key={pathname}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-[15px] font-semibold text-[#1D1D1F] tracking-[-0.022em] shrink-0"
      >
        {title}
      </motion.h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={13} className="absolute left-2.5 text-[#AEAEB2] pointer-events-none" />
        <input
          type="text"
          placeholder="検索"
          className="h-[32px] pl-8 pr-4 w-[160px] text-[13px] rounded-[8px] text-[#1D1D1F] placeholder:text-[#AEAEB2] transition-all duration-200 focus:w-[220px] focus:outline-none"
          style={{
            background: 'rgba(0,0,0,0.055)',
            border: '1px solid transparent',
            letterSpacing: '-0.01em',
          }}
          onFocus={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)'
            e.currentTarget.style.border = '1px solid rgba(79,70,229,0.4)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.14)'
          }}
          onBlur={e => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.055)'
            e.currentTarget.style.border = '1px solid transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Primary action button */}
      {action && (
        <motion.button
          whileHover={{ filter: 'brightness(1.06)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
          className="hidden md:flex items-center gap-1 h-[32px] px-4 rounded-[8px] text-[13px] font-semibold text-white shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6E6BF0 0%, #4F46E5 55%, #3730A3 100%)',
            boxShadow: '0 2px 8px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.22)',
            letterSpacing: '-0.01em',
          }}
        >
          <Plus size={13} strokeWidth={2.5} />
          {action.label}
        </motion.button>
      )}

      {/* Notification bell */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        className="relative w-[32px] h-[32px] flex items-center justify-center rounded-[8px] transition-colors duration-100"
        style={{ color: '#6E6E73' }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.06)'
          e.currentTarget.style.color = '#1D1D1F'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#6E6E73'
        }}
      >
        <Bell size={15} strokeWidth={1.8} />
        <span
          className="absolute top-[8px] right-[8px] w-[5px] h-[5px] rounded-full"
          style={{ background: '#FF3B30', boxShadow: '0 0 0 1.5px rgba(245,245,245,0.9)' }}
        />
      </motion.button>

      {/* User avatar */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-2 py-1 rounded-[8px] transition-colors duration-100"
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <Avatar className="w-[26px] h-[26px]">
          {user?.image && <AvatarImage src={user.image} alt={user.name ?? ''} />}
          <AvatarFallback
            className="text-[10px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 55%, #CC1A00 100%)' }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden lg:block text-[13px] font-medium text-[#1D1D1F] max-w-[80px] truncate tracking-[-0.01em]">
          {user?.name ?? 'ユーザー'}
        </span>
      </motion.button>
    </header>
  )
}
