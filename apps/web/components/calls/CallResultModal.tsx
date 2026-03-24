'use client'

import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  MoreHorizontal,
  Video,
  Users,
  PhoneCall,
  Bell,
  CheckCircle2,
  PhoneOff,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import type { CallResultCode } from '@/types/crm'
import { STATUS_STYLES } from '@/types/crm'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ─── Result Options ────────────────────────────────────────────────────────────

const RESULT_OPTIONS: {
  code: CallResultCode
  label: string
  desc: string
  icon: React.ElementType
}[] = [
  { code: '未着手',     label: '未着手',     desc: 'まだアプローチしていない',              icon: MoreHorizontal },
  { code: '不通',       label: '不通',       desc: '呼び出し音はあったが繋がらなかった',      icon: PhoneOff },
  { code: '不在',       label: '不在',       desc: '繋がったが本人不在（受付が応答）',        icon: Users },
  { code: '接続済み',   label: '接続済み',   desc: '本人と話せた',                          icon: PhoneCall },
  { code: 'コール不可', label: 'コール不可', desc: '「電話しないでください」等',              icon: PhoneOff },
  { code: 'アポ獲得',   label: 'アポ獲得',   desc: '商談日程を取れた',                      icon: Calendar },
  { code: 'Next Action', label: 'Next Action', desc: '次回アクションを設定する',            icon: CheckCircle2 },
]

// ─── Expanded Panels ───────────────────────────────────────────────────────────

function AppointmentPanel() {
  const { appointmentData, setAppointmentData } = useCallStore()

  const locationOptions = [
    { value: 'meet'      as const, label: 'Google Meet', icon: Video },
    { value: 'in_person' as const, label: '対面',         icon: Users },
    { value: 'phone'     as const, label: '電話',         icon: Phone },
  ]

  return (
    <div className="space-y-4 pt-1">
      <p className="text-sm font-medium text-[#111827]">商談日程を入力してください</p>

      {/* 日時 */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-[#6B7280] mb-1 block">日付</label>
          <input
            type="date"
            value={appointmentData.date}
            onChange={e => setAppointmentData({ date: e.target.value })}
            className="w-full h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-[#6B7280] mb-1 block">時刻</label>
          <input
            type="time"
            value={appointmentData.time}
            onChange={e => setAppointmentData({ time: e.target.value })}
            className="w-full h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
          />
        </div>
      </div>

      {/* 場所 */}
      <div>
        <label className="text-xs text-[#6B7280] mb-1.5 block">場所</label>
        <div className="flex gap-2">
          {locationOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setAppointmentData({ location: value })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-sm border transition-all duration-100 ${
                appointmentData.location === value
                  ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5] font-medium'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 自動処理チェックボックス */}
      <div className="space-y-2">
        {[
          { key: 'addToCalendar'   as const, label: 'Google Calendarに自動登録する' },
          { key: 'generateMeetUrl' as const, label: 'Google Meet URLを自動生成する', disabled: appointmentData.location !== 'meet' },
          { key: 'advanceDeal'     as const, label: 'DealをFirst Meetingステージに進める' },
        ].map(({ key, label, disabled }) => (
          <label key={key} className={`flex items-center gap-2.5 cursor-pointer group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <div
              onClick={() => !disabled && setAppointmentData({ [key]: !appointmentData[key] })}
              className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all duration-100 ${
                appointmentData[key] && !disabled
                  ? 'bg-[#4F46E5] border-[#4F46E5]'
                  : 'border-[#D1D5DB] group-hover:border-[#4F46E5]'
              }`}
            >
              {appointmentData[key] && !disabled && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-sm text-[#374151]">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function NextActionPanel() {
  const { nextActionData, setNextActionData } = useCallStore()

  const actionTypes = [
    { value: 'call'     as const, label: 'コール',   icon: Phone },
    { value: 'email'    as const, label: 'メール',   icon: MessageSquare },
    { value: 'document' as const, label: '資料送付', icon: FileText },
    { value: 'other'    as const, label: 'その他',   icon: MoreHorizontal },
  ]

  return (
    <div className="space-y-4 pt-1">
      <p className="text-sm font-medium text-[#111827]">Next Actionを設定</p>

      {/* アクション種別 */}
      <div>
        <label className="text-xs text-[#6B7280] mb-1.5 block">アクション種別 <span className="text-[#EF4444]">*</span></label>
        <div className="flex gap-2 flex-wrap">
          {actionTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setNextActionData({ actionType: value })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-sm border transition-all duration-100 ${
                nextActionData.actionType === value
                  ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5] font-medium'
                  : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="text-xs text-[#6B7280] mb-1 block">メモ（任意）</label>
        <textarea
          value={nextActionData.memo}
          onChange={e => setNextActionData({ memo: e.target.value })}
          placeholder="3月末に再度検討するとのこと…"
          rows={2}
          className="w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] resize-none transition-all"
        />
      </div>

      {/* 実行予定日時 */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-[#6B7280] mb-1 block">実行予定日</label>
          <input
            type="date"
            value={nextActionData.dueDate}
            onChange={e => setNextActionData({ dueDate: e.target.value })}
            className="w-full h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-[#6B7280] mb-1 block">時刻</label>
          <input
            type="time"
            value={nextActionData.dueTime}
            onChange={e => setNextActionData({ dueTime: e.target.value })}
            className="w-full h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
          />
        </div>
      </div>

      {/* Slackリマインド */}
      <div className="space-y-1.5">
        <label className="text-xs text-[#6B7280] flex items-center gap-1">
          <Bell size={11} />
          リマインド通知（Slack）
        </label>
        {[
          { key: 'remindDayBefore'  as const, label: '前日 18:00 にSlackで通知' },
          { key: 'remindBeforeExec' as const, label: '当日 実行30分前 にSlackで通知' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => setNextActionData({ [key]: !nextActionData[key] })}
              className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all duration-100 ${
                nextActionData[key]
                  ? 'bg-[#4F46E5] border-[#4F46E5]'
                  : 'border-[#D1D5DB] group-hover:border-[#4F46E5]'
              }`}
            >
              {nextActionData[key] && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-sm text-[#374151]">{label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function MissedCallPanel() {
  const { missedCallData, setMissedCallData } = useCallStore()

  const options = [
    { value: 'tomorrow'  as const, label: '明日の同時刻' },
    { value: 'day_after' as const, label: '2日後' },
    { value: 'week_later'as const, label: '1週間後' },
    { value: 'custom'    as const, label: 'カスタム設定' },
    { value: 'sequence'  as const, label: 'シーケンスに任せる（自動）' },
  ]

  return (
    <div className="space-y-2 pt-1">
      <p className="text-sm font-medium text-[#111827]">次回コール日時を設定する（任意）</p>
      <div className="space-y-1.5">
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setMissedCallData({ nextCallTiming: value })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] border text-sm text-left transition-all duration-100 ${
              missedCallData.nextCallTiming === value
                ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]'
                : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              missedCallData.nextCallTiming === value ? 'border-[#4F46E5]' : 'border-[#D1D5DB]'
            }`}>
              {missedCallData.nextCallTiming === value && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
              )}
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* カスタム日時入力 */}
      <AnimatePresence>
        {missedCallData.nextCallTiming === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
            className="flex gap-3 pt-1"
          >
            <input
              type="date"
              value={missedCallData.customDate}
              onChange={e => setMissedCallData({ customDate: e.target.value })}
              className="flex-1 h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
            />
            <input
              type="time"
              value={missedCallData.customTime}
              onChange={e => setMissedCallData({ customTime: e.target.value })}
              className="w-28 h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-[8px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DNCConfirmBanner() {
  return (
    <div className="flex items-start gap-3 p-3 bg-[#FEF2F2] rounded-[8px] border border-[#FCA5A5]">
      <PhoneOff size={16} className="text-[#DC2626] mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-[#DC2626]">Do Not Contact フラグを自動セットします</p>
        <p className="text-xs text-[#6B7280] mt-0.5">
          保存後、この担当者へのコールが今後ブロックされます。
        </p>
      </div>
    </div>
  )
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export function CallResultModal() {
  const {
    showResultModal,
    selectedResult,
    appointmentData,
    nextActionData,
    durationSeconds,
    setSelectedResult,
    saveResult,
  } = useCallStore()

  // ESCキー完全無効化
  useEffect(() => {
    if (!showResultModal) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [showResultModal])

  // canSave ロジック
  const canSave = useMemo(() => {
    if (!selectedResult) return false
    if (selectedResult === 'アポ獲得') {
      return appointmentData.date !== '' && appointmentData.time !== ''
    }
    if (selectedResult === 'Next Action') {
      return nextActionData.actionType !== null
    }
    return true
  }, [selectedResult, appointmentData, nextActionData])

  // 展開パネルの判定
  const expandedType =
    selectedResult === 'アポ獲得'             ? 'appointment'
    : selectedResult === 'Next Action'        ? 'next_action'
    : selectedResult === '不通' || selectedResult === '不在' ? 'missed'
    : selectedResult === 'コール不可'          ? 'dnc'
    : null

  // モックデータ（本番はStoreから取得）
  const contactName = '田中 誠'
  const company     = '株式会社テクノリード'

  return (
    <AnimatePresence>
      {showResultModal && (
        // Backdrop — クリック無効
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onMouseDown={e => e.preventDefault()}
        >
          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg bg-white rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden"
            onMouseDown={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                  <Phone size={15} className="text-[#4F46E5]" />
                </div>
                <span className="text-sm font-semibold text-[#111827]">コール完了</span>
              </div>
              <p className="text-base font-semibold text-[#111827]">
                {company} / {contactName}
              </p>
              <p className="text-sm text-[#6B7280] mt-0.5">
                通話時間: {formatDuration(durationSeconds)}
              </p>
            </div>

            <div className="h-px bg-[#F3F4F6]" />

            {/* ── Scrollable Body ── */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* 選択肢ラベル */}
              <p className="text-sm font-medium text-[#374151] mb-3">
                結果を選択してください
                <span className="text-[#EF4444] ml-1">*必須</span>
              </p>

              {/* Radio Options */}
              <div className="space-y-1.5 mb-4">
                {RESULT_OPTIONS.map(({ code, label, desc, icon: Icon }) => {
                  const style = STATUS_STYLES[code]
                  const isSelected = selectedResult === code

                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedResult(code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] border text-left transition-all duration-100 ${
                        isSelected
                          ? `${style.bg} border-current/20`
                          : 'bg-white border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {/* Radio circle */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'border-current' : 'border-[#D1D5DB]'
                      }`}
                        style={isSelected ? { borderColor: 'currentColor' } : {}}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
                        )}
                      </div>
                      <Icon size={14} className={isSelected ? style.text : 'text-[#9CA3AF]'} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${isSelected ? style.text : 'text-[#374151]'}`}>
                          {label}
                        </span>
                        <span className={`text-[11px] ml-2 ${isSelected ? 'opacity-70' : 'text-[#9CA3AF]'}`}>
                          {desc}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Expanded Content */}
              <AnimatePresence mode="wait">
                {expandedType && (
                  <motion.div
                    key={expandedType}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="pt-1 pb-2 border-t border-[#F3F4F6]">
                      <div className="pt-3">
                        {expandedType === 'appointment' && <AppointmentPanel />}
                        {expandedType === 'next_action' && <NextActionPanel />}
                        {expandedType === 'missed'      && <MissedCallPanel />}
                        {expandedType === 'dnc'         && <DNCConfirmBanner />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-[#F3F4F6]">
              <motion.button
                whileTap={canSave ? { scale: 0.98 } : {}}
                onClick={canSave ? saveResult : undefined}
                className={`w-full h-11 rounded-[9px] text-sm font-semibold transition-all duration-150 ${
                  canSave
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-[0_1px_4px_rgba(79,70,229,0.3)]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                保存して完了
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
