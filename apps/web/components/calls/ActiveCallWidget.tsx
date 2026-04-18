'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, ChevronDown, ChevronUp } from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'

export function ActiveCallWidget() {
  const { activeCall, endCall } = useCallStore()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isMuted, setIsMuted]   = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCall) return
    const initial = Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000)
    setElapsedSeconds(initial)
    const id = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [activeCall])

  const formattedTime = useMemo(() => {
    const m = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')
    const s = (elapsedSeconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }, [elapsedSeconds])

  return (
    <AnimatePresence>
      {activeCall && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-40 w-[280px] bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
        >
          {/* ── Header (always visible) ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-2 min-w-0">
              {/* Pulse indicator */}
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111827] truncate">{activeCall.contactName}</p>
                <p className="text-[10px] text-[#9CA3AF] truncate">{activeCall.company}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(v => !v)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors shrink-0 ml-2"
            >
              {isMinimized
                ? <ChevronUp size={13} className="text-[#9CA3AF]" />
                : <ChevronDown size={13} className="text-[#9CA3AF]" />
              }
            </button>
          </div>

          {/* ── Expandable Body ── */}
          <motion.div
            animate={{ height: isMinimized ? 0 : 'auto' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 py-4 space-y-4">
              {/* Timer */}
              <div className="text-center">
                <span className="text-3xl font-semibold text-[#111827] tabular-nums tracking-tight">
                  {formattedTime}
                </span>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">通話中</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {/* Mute */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsMuted(v => !v)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-150 ${
                    isMuted
                      ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                      : 'bg-[#F3F4F6] border-transparent text-[#374151] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </motion.button>

                {/* End Call */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={endCall}
                  className="flex-1 h-10 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-150 shadow-[0_1px_4px_rgba(239,68,68,0.3)]"
                >
                  <PhoneOff size={15} />
                  通話終了
                </motion.button>

                {/* Speaker */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsSpeaker(v => !v)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-150 ${
                    !isSpeaker
                      ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                      : 'bg-[#F3F4F6] border-transparent text-[#374151] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {isSpeaker ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
