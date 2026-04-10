'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
} from 'lucide-react'

// ─── Quick Actions ──────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: '企業登録',       href: '/companies', icon: Building2,       color: '#0071E3' },
  { label: 'パイプライン',   href: '/pipeline',  icon: Columns3,        color: '#5E5CE6' },
  { label: 'マーケティング', href: '/nurturing',  icon: Mail,            color: '#FF9F0A' },
  { label: 'プロダクト',     href: '/meetings',   icon: FileText,        color: '#34C759' },
  { label: 'ナレッジ検索',   href: '/knowledge',  icon: BookOpen,        color: '#FF2D55' },
  { label: 'ダッシュボード', href: '/dashboard',  icon: LayoutDashboard, color: '#AF52DE' },
]

// ─── Mock Messages ──────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'おはようございます！Intent Force へようこそ。\n\n今日のサマリーです：\n・ 今日のタスク: 8件\n・ 期限超過: 4件\n・ Hot企業: 3社がアクティブ\n\n何かお手伝いできることはありますか？',
  },
]

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  function handleSend() {
    if (!input.trim()) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'かしこまりました。該当する情報を確認しています...\n\n（AI接続は今後実装予定です）',
      }
      setMessages(prev => [...prev, aiMsg])
    }, 800)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="text-center pt-8 pb-6"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF3B30 40%, #CC1A00 100%)',
              boxShadow: '0 4px 16px rgba(255,59,48,0.4)',
            }}
          >
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">
          Intent Force
        </h1>
        <p className="text-[13px] text-[#8E8E93] mt-1">Revenue OS — 何でも聞いてください</p>
      </motion.div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i === 0 ? 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, #FF6B35, #FF3B30)'
                  : 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
              }}
            >
              {msg.role === 'assistant'
                ? <Bot size={14} className="text-white" />
                : <User size={14} className="text-white" />
              }
            </div>
            <div
              className="max-w-[80%] rounded-[14px] px-4 py-3"
              style={{
                background: msg.role === 'user' ? '#0071E3' : '#F5F5F7',
                color: msg.role === 'user' ? '#FFFFFF' : '#1D1D1F',
              }}
            >
              <p className="text-[13.5px] leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="px-4 pb-3"
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: `${action.color}10`,
                  color: action.color,
                  border: `1px solid ${action.color}25`,
                }}
              >
                <Icon size={13} />
                {action.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Input ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="px-4 pb-6"
      >
        <div
          className="flex items-center gap-2 rounded-[14px] px-4 py-3"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          <input
            type="text"
            placeholder="Intent Force にご質問ください..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 text-[14px] text-[#1D1D1F] placeholder:text-[#AEAEB2] outline-none bg-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0"
            style={{
              background: input.trim()
                ? 'linear-gradient(135deg, #FF4E38, #FF3B30, #CC1A00)'
                : 'rgba(0,0,0,0.06)',
              boxShadow: input.trim() ? '0 2px 8px rgba(255,59,48,0.4)' : 'none',
              cursor: input.trim() ? 'pointer' : 'default',
            }}
          >
            <Send size={14} style={{ color: input.trim() ? '#FFFFFF' : '#AEAEB2' }} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
