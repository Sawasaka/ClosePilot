import { TrendingUp, X } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const AntiCosmetic = () => {
  const dead = [
    'デコラティブな円グラフ', '回転するゲージ', '意味のないスパークライン',
    'アニメーションするKPIカウンタ', '美しいだけのヒートマップ', '実装3週間のダッシュボードビルダー',
    '誰も開かないBIタブ', '20色使ったタグ管理', '気合のロゴアニメ',
  ]
  return (
    <Section tone="obsidian" screenLabel="04 Anti-Cosmetic">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 md:sticky md:top-32 self-start">
            <Eyebrow color="#ff8dcf">NOT JUST ANOTHER PRETTY SAAS</Eyebrow>
            <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
              きれいなダッシュボード
              <br />
              では、<span className="fo-gradient-text-soft">売上は、増えない。</span>
            </h2>
            <div className="mt-6 space-y-3 text-[#c7c5c9] leading-relaxed">
              <p>BIダッシュボードを綺麗に飾っても、ホット企業を逃したら意味がありません。</p>
              <p>私たちは、レベニューの最前線に効かない機能を、最初から入れません。</p>
              <p className="text-[#7e7c83]">削るほどに、強くなる。</p>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="rounded-3xl bg-dusk p-8 md:p-10 fo-glass-rim">
              <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-coral">
                DEPRECATED ／ COSMETIC FEATURES
              </div>
              <div className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {dead.map((t) => (
                  <div key={t} className="flex items-center gap-3 text-[#9b99a0]">
                    <X size={14} color="#ff8dcf" />
                    <span
                      className="text-[0.95rem]"
                      style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(255,141,207,0.6)' }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="mt-6 rounded-3xl p-[1px]"
              style={{ background: 'linear-gradient(135deg, rgba(141,255,201,0.4), transparent 70%)' }}
            >
              <div className="rounded-3xl bg-pitch p-7 fo-glass-rim flex items-center gap-4">
                <TrendingUp size={28} color="#8dffc9" />
                <div>
                  <div className="text-[0.95rem] text-[#e7e5ea]">代わりに残したのは、レベニューを動かす機能だけ。</div>
                  <div className="text-xs text-[#7e7c83] mt-1">Chat Home / Auto-CRM / 1st-party Intent / Agent Fabric / RLS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
