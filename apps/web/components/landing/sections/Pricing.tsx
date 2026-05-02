import { Check } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const Pricing = () => {
  const tiers = [
    {
      eyebrow: 'Starter', scale: '〜30名', price: 'お問い合わせ', featured: false, color: '#9b99a0',
      feats: ['CRM ✓', 'MA 1部門', 'Helpdesk Agent ✓', 'コアエージェント 3体', '標準サポート'],
    },
    {
      eyebrow: 'Growth', scale: '〜300名', price: 'お問い合わせ', featured: true, color: '#abc7ff',
      feats: ['全機能 ✓', '全エージェント 5体 ✓', 'インテント全4部門', 'gBizINFO 連携', '99.9% SLA'],
    },
    {
      eyebrow: 'Enterprise', scale: '1,000名+', price: 'お問い合わせ', featured: false, color: '#c8b9ff',
      feats: ['全機能フル', 'カスタムエージェント', 'SOC2 / ISO27001', '専任CS', 'セキュリティWP'],
    },
  ]
  return (
    <Section tone="pitch" screenLabel="17 Pricing">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-3xl">
          <Eyebrow color="#abc7ff">PRICING</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            あなたのチームの<span className="fo-gradient-text-soft">ちょうど良いプラン。</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-14 items-end">
          {tiers.map((t, i) => {
            const featured = t.featured
            return (
              <div
                key={i}
                className={`rounded-3xl ${featured ? 'p-[1px] md:-translate-y-4' : ''}`}
                style={
                  featured
                    ? { background: 'linear-gradient(135deg, rgba(171,199,255,0.6), rgba(0,113,227,0.4), transparent 70%)' }
                    : undefined
                }
              >
                <div className={`rounded-3xl p-7 fo-glass-rim h-full ${featured ? 'bg-pitch' : 'bg-dusk fo-lift'} relative overflow-hidden`}>
                  {featured && (
                    <div
                      className="absolute -top-20 -right-20 w-56 h-56 rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.18), transparent 60%)', filter: 'blur(40px)' }}
                    />
                  )}
                  <div
                    className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] relative"
                    style={{ color: t.color }}
                  >
                    {t.eyebrow} {featured && <span className="ml-2 text-[10px]">★ MOST CHOSEN</span>}
                  </div>
                  <div className={`font-display font-bold text-[1.6rem] mt-3 relative ${featured ? 'fo-gradient-text' : ''}`}>
                    {t.scale}
                  </div>
                  <div className="mt-3 font-mono text-[#9b99a0] text-sm relative">{t.price}</div>
                  <div className="mt-6 space-y-2.5 relative">
                    {t.feats.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#c7c5c9]">
                        <Check size={14} color={t.color} /> {f}
                      </div>
                    ))}
                  </div>
                  <button
                    className={`mt-7 w-full rounded-lg py-3 text-sm font-medium relative ${
                      featured ? 'text-[#0a0a0c]' : 'text-aurora bg-shimmer/40 hover:bg-shimmer'
                    }`}
                    style={featured ? { background: 'linear-gradient(135deg, #abc7ff, #0071e3)' } : undefined}
                  >
                    お問い合わせ
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
