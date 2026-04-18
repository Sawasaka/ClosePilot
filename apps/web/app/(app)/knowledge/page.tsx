import { BookOpen } from 'lucide-react'

export default function KnowledgePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
        <BookOpen size={24} className="text-[#4F46E5]" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[#EEEEFF]">ナレッジ RAGボット</h2>
        <p className="text-sm text-[#CCDDF0] mt-1">Week 12 で実装予定 — Google Drive 連携・セマンティック検索</p>
      </div>
    </div>
  )
}
