'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[360px]"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-[#4F46E5] rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(79,70,229,0.3)]">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-[#111827] tracking-[-0.03em] leading-tight">
              Intent Force
            </span>
            <span className="text-[10px] text-[#9CA3AF] tracking-[0.02em]">
              for First-Party CRM
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          <h1 className="text-[22px] font-semibold text-[#111827] tracking-[-0.03em] mb-1">
            ログイン
          </h1>
          <p className="text-sm text-[#6B7280] mb-6">
            Intent Forceにアクセスするには<br />Googleアカウントでログインしてください
          </p>

          <Button
            className="w-full h-10 gap-3"
            variant="secondary"
            onClick={() => signIn('google', { callbackUrl: '/' })}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Googleでログイン
          </Button>
        </div>

        <p className="mt-5 text-center text-xs text-[#9CA3AF]">
          © 2026 Intent Force. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
