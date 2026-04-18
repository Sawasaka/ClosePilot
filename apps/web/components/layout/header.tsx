'use client'

import { useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Plus, Bug, MessageCircle, Sparkles, Users2,
  Camera, Send, X, ChevronDown,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const PAGE_TITLES: Record<string, string> = {
  '/': 'ホーム',
  '/today': '今日のタスク一覧',
  '/overdue': '期限超過タスク一覧',
  '/pipeline': 'パイプライン',
  '/companies': '企業',
  '/contacts': 'コンタクト',
  '/deals': '取引',
  '/tasks': 'タスク一覧',
  '/knowledge': 'ナレッジ',
  '/analytics': 'アクション数',
  '/settings': '設定',
  '/nurturing': 'ナーチャリング',
  '/campaigns': '配信管理',
  '/leads': 'リード分析',
  '/meetings': '議事録',
  '/issues': '課題ボード',
  '/priority': '開発優先度',
  '/gamification': 'ストーリー',
  '/gamification/tutorial': 'チュートリアル',
  '/gamification/quests': 'クエスト',
  '/gamification/economy': '仮想経済',
  '/gamification/team': 'チームプレイ',
  '/gamification/leaderboard': 'リーダーボード',
  '/talent/level': 'マイレベル',
  '/talent/roadmap': 'ロードマップ',
  '/talent/training': '研修プログレス',
  '/talent/achievements': '達成・バッジ',
  '/talent/quests': 'クエスト',
  '/talent/goals': '目標設定',
  '/pipeline-report': 'パイプラインレポート',
  '/metaverse/rooms': '研修ルーム一覧',
  '/metaverse/history': '研修履歴',
  '/web3/proposals': '提案一覧',
  '/web3/influence': '影響度ダッシュボード',
  '/web3/settings': 'スコア設定',
  '/rulebook': 'ルールブック',
  '/content-studio': '資料作成',
  '/subscription': 'プラン・クレジット',
}

const PAGE_ACTIONS: Record<string, { label: string }> = {
  '/companies': { label: '企業作成' },
  '/contacts': { label: '追加' },
  '/deals': { label: '作成' },
  '/tasks': { label: '追加' },
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return PAGE_TITLES['/'] ?? ''
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const sorted = Object.entries(PAGE_TITLES).sort((a, b) => b[0].length - a[0].length)
  for (const [key, title] of sorted) {
    if (key !== '/' && pathname.startsWith(key)) return title
  }
  return 'BGM'
}

// キャラクター画像URL (モック — 後でAPI生成に置き換え)
const CHARACTER_AVATAR = 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4'

interface HeaderProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// ─── トラブル報告モーダル ─────────────────────────────────────────────────────

function BugReportModal({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const captureScreen = useCallback(() => {
    // html2canvas 未導入のため、現在のURLとタイムスタンプを保存
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0c1028'
      ctx.fillRect(0, 0, 400, 240)
      ctx.fillStyle = '#2244AA'
      ctx.fillRect(0, 0, 400, 3)
      ctx.fillStyle = '#EEEEFF'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText('Screen Capture', 20, 30)
      ctx.fillStyle = '#88BBFF'
      ctx.font = '11px sans-serif'
      ctx.fillText(window.location.href, 20, 55)
      ctx.fillText(new Date().toLocaleString('ja-JP'), 20, 75)
      ctx.fillStyle = '#99AACC'
      ctx.font = '10px sans-serif'
      ctx.fillText('※ 実装後は実際のスクリーンショットが添付されます', 20, 110)
    }
    setScreenshot(canvas.toDataURL())
  }, [])

  function handleSend() {
    setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 1500)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[480px] rounded-[14px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
          border: '1px solid #2244AA',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(255,59,48,0.15)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,68,170,0.3)' }}>
          <div className="flex items-center gap-2">
            <Bug size={16} style={{ color: '#FF8A82' }} />
            <h2 className="text-[16px] font-bold text-[#EEEEFF]">トラブル報告</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[rgba(136,187,255,0.08)]">
            <X size={16} className="text-[#CCDDF0]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Screenshot */}
          <div>
            <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">スクリーンショット</label>
            {screenshot ? (
              <div className="relative rounded-[8px] overflow-hidden" style={{ border: '1px solid #2244AA' }}>
                <img src={screenshot} alt="capture" className="w-full" />
                <button
                  onClick={() => setScreenshot(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={captureScreen}
                className="w-full h-[80px] rounded-[8px] flex flex-col items-center justify-center gap-1.5 transition-colors"
                style={{ background: 'rgba(16,16,40,0.8)', border: '1px dashed rgba(136,187,255,0.4)' }}
              >
                <Camera size={20} className="text-[#88BBFF]" />
                <span className="text-[11px] font-bold text-[#88BBFF]">画面をキャプチャ</span>
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-[#88BBFF] uppercase tracking-[0.06em] mb-1.5 block">問題の詳細</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="発生した問題の詳細を記入してください..."
              rows={4}
              className="w-full px-3 py-2 text-[13px] text-[#EEEEFF] placeholder:text-[#7799CC] outline-none rounded-[8px] resize-none"
              style={{ background: 'rgba(16,16,40,0.8)', border: '1px dashed rgba(136,187,255,0.4)' }}
            />
          </div>

          {/* URL */}
          <div className="rounded-[8px] px-3 py-2" style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid rgba(34,68,170,0.3)' }}>
            <p className="text-[10px] font-bold text-[#99AACC] uppercase tracking-[0.04em]">発生ページ</p>
            <p className="text-[12px] text-[#EEEEFF] truncate">{typeof window !== 'undefined' ? window.location.href : ''}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: '1px solid rgba(34,68,170,0.3)' }}>
          <button onClick={onClose} className="h-[36px] px-4 text-[13px] font-medium text-[#CCDDF0] rounded-[8px] hover:bg-[rgba(136,187,255,0.06)]">
            キャンセル
          </button>
          <button
            onClick={handleSend}
            disabled={!description.trim()}
            className="h-[36px] px-5 text-[13px] font-bold text-white rounded-[8px] flex items-center gap-1.5 transition-all hover:brightness-110 disabled:opacity-40"
            style={{
              background: sent
                ? 'linear-gradient(135deg, #A7F3D0 0%, #34C759 100%)'
                : 'linear-gradient(135deg, #FFB347 0%, #FF3B30 100%)',
              boxShadow: sent
                ? '0 0 14px rgba(52,199,89,0.7)'
                : '0 0 14px rgba(255,59,48,0.5)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: sent ? '#053D24' : '#FFFFFF',
            }}
          >
            {sent ? <><span>送信完了</span></> : <><Send size={13} /><span>チケット送信</span></>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── メインヘッダー ─────────────────────────────────────────────────────────

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const action = Object.entries(PAGE_ACTIONS).find(([key]) => pathname.startsWith(key))?.[1]

  const [showBugReport, setShowBugReport] = useState(false)
  const [showSupportMenu, setShowSupportMenu] = useState(false)

  return (
    <>
      <header
        className="fixed top-0 left-[224px] right-0 h-[56px] flex items-center px-6 gap-2 z-20"
        style={{
          background: 'linear-gradient(180deg, #0c1030 0%, #080a20 100%)',
          borderBottom: '2px solid #2244AA',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(136,187,255,0.05)',
        }}
      >
        {/* Page title */}
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] font-semibold text-[#FFFFFF] tracking-[-0.022em] shrink-0"
        >
          {title}
        </motion.h1>

        {/* Search */}
        <div className="relative hidden md:flex items-center ml-4">
          <Search size={13} className="absolute left-2.5 text-[#88AACC] pointer-events-none" />
          <input
            type="text"
            placeholder="検索"
            className="h-[32px] pl-8 pr-4 w-[140px] text-[13px] rounded-[6px] text-[#EEEEFF] placeholder:text-[#88AACC] transition-all duration-200 focus:w-[200px] focus:outline-none"
            style={{ background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA' }}
            onFocus={e => {
              e.currentTarget.style.background = 'rgba(16,16,40,0.9)'
              e.currentTarget.style.border = '1px solid #4466DD'
              e.currentTarget.style.boxShadow = '0 0 8px rgba(68,102,221,0.3)'
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'rgba(16,16,40,0.6)'
              e.currentTarget.style.border = '1px solid #2244AA'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        <div className="flex-1" />

        {/* ── サポート & お知らせ ── */}

        {/* 新機能お知らせ */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="relative h-[30px] px-2.5 flex items-center gap-1 rounded-[7px] text-[11px] font-bold transition-colors"
          style={{ color: '#A78BFA' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title="新機能のお知らせ"
        >
          <Sparkles size={13} strokeWidth={2} />
          <span className="hidden xl:inline">新機能</span>
          <span
            className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full"
            style={{ background: '#A78BFA', boxShadow: '0 0 0 1.5px #080a20, 0 0 6px rgba(167,139,250,0.8)' }}
          />
        </motion.button>

        {/* BGM Gather (コミュニティイベント) */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="h-[30px] px-2.5 flex items-center gap-1 rounded-[7px] text-[11px] font-bold transition-colors"
          style={{ color: '#6EE7B7' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(110,231,183,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title="BGM Gather — コミュニティイベント・ディスカッション"
        >
          <Users2 size={13} strokeWidth={2} />
          <span className="hidden xl:inline">BGM Gather</span>
        </motion.button>

        {/* トラブル報告 */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setShowBugReport(true)}
          className="h-[30px] px-2.5 flex items-center gap-1 rounded-[7px] text-[11px] font-bold transition-colors"
          style={{ color: '#FF8A82' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,138,130,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title="トラブル報告"
        >
          <Bug size={13} strokeWidth={2} />
          <span className="hidden xl:inline">報告</span>
        </motion.button>

        {/* 問い合わせ */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          className="h-[30px] px-2.5 flex items-center gap-1 rounded-[7px] text-[11px] font-bold transition-colors"
          style={{ color: '#88BBFF' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(136,187,255,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title="直接問い合わせ"
        >
          <MessageCircle size={13} strokeWidth={2} />
          <span className="hidden xl:inline">問い合わせ</span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: '#2244AA' }} />

        {/* Primary action button */}
        {action && (
          <motion.button
            whileHover={{ filter: 'brightness(1.06)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={() => window.dispatchEvent(new CustomEvent('header-action'))}
            className="hidden md:flex items-center gap-1 h-[32px] px-4 rounded-[8px] text-[13px] font-semibold text-white shrink-0"
            style={{
              background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
              boxShadow: '0 2px 8px rgba(34,68,170,0.4), inset 0 1px 0 rgba(200,220,255,0.15)',
              border: '1px solid #3355CC',
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
          style={{ color: '#88AACC' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(136,187,255,0.08)'
            e.currentTarget.style.color = '#FFFFFF'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#88AACC'
          }}
        >
          <Bell size={15} strokeWidth={1.8} />
          <span
            className="absolute top-[8px] right-[8px] w-[5px] h-[5px] rounded-full"
            style={{ background: '#FF4444', boxShadow: '0 0 0 1.5px #080a20' }}
          />
        </motion.button>

        {/* User avatar (キャラクター画像) */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-2 py-1 rounded-[8px] transition-colors duration-100"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(136,187,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="w-[30px] h-[30px] rounded-full overflow-hidden shrink-0"
            style={{
              background: 'linear-gradient(145deg, #5AC8FA 0%, #0A84FF 50%, #5E5CE6 100%)',
              boxShadow: '0 0 12px rgba(94,92,230,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '1.5px solid rgba(255,255,255,0.4)',
            }}
          >
            <img
              src={CHARACTER_AVATAR}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="hidden lg:block text-[13px] font-medium text-[#FFFFFF] max-w-[80px] truncate tracking-[-0.01em]">
            {user?.name ?? 'ユーザー'}
          </span>
        </motion.button>
      </header>

      {/* Bug Report Modal */}
      <AnimatePresence>
        {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} />}
      </AnimatePresence>
    </>
  )
}
