import { Eye, FileText, Clock } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const Transparency = () => {
  const items = [
    { Icon: Eye,      t: 'スコア根拠 ホバー表示',     d: 'なぜそのスコアになったか、寄与度をホバーで開示。' },
    { Icon: FileText, t: 'エージェント実行ログ',       d: 'どのエージェントが、何のデータで、何を実行したか。' },
    { Icon: Clock,    t: '自動入力タイムスタンプ',     d: '自動入力フィールドは、いつ・どの議事録から、を全て記録。' },
  ]
  return (
    <Section tone="obsidian" screenLabel="10 Transparency">
      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div className="max-w-3xl">
          <Eyebrow color="#8dffc9">TRANSPARENCY</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text-soft">ブラックボックスは、</span>つくらない。
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {items.map((c, i) => {
            const Icon = c.Icon
            return (
              <div key={i} className="rounded-3xl bg-dusk p-7 fo-lift fo-glass-rim">
                <Icon size={20} color="#8dffc9" strokeWidth={1.5} />
                <div className="font-display font-bold text-[1.15rem] mt-4">{c.t}</div>
                <p className="text-xs text-[#9b99a0] mt-2 leading-relaxed">{c.d}</p>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
