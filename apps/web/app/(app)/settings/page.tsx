import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
        <Settings size={24} className="text-[#4F46E5]" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#111827]">組織設定</h2>
        <p className="text-sm text-[#6B7280] mt-1">Week 16 で実装予定 — 権限管理・Slack/Google連携設定</p>
      </div>
    </div>
  )
}
