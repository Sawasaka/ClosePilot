'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { Eyebrow, NebulaBG, Section } from './atoms'

const StackComparisonChart = () => {
  const data = [
    { name: 'HubSpot Sales Pro', v: 450,  c: '#9b99a0' },
    { name: 'Gong',              v: 4500, c: '#9b99a0' },
    { name: 'Sales Marker',      v: 600,  c: '#9b99a0' },
    { name: 'Glean',             v: 450,  c: '#9b99a0' },
    { name: 'Front Office',      v: 90,   c: '#abc7ff' },
  ]
  return (
    <div className="fo-recharts" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-12} dy={8} height={50} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `¥${v}M`} />
          <Bar dataKey="v" radius={[8, 8, 0, 0]}>
            {data.map((d, i) => (<Cell key={i} fill={d.c} />))}
            <LabelList dataKey="v" position="top" formatter={(v: number) => `¥${(v / 100).toFixed(1)}M`} fill="#c7c5c9" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const TcoChart = () => {
  const data = [
    { name: '社内開発',    v: 105,  c: '#9b99a0' },
    { name: 'Front Office', v: 10.8, c: '#abc7ff' },
  ]
  return (
    <div className="fo-recharts" style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 60, left: 50, bottom: 8 }}>
          <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `¥${v}M`} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={110} />
          <Bar dataKey="v" radius={[0, 8, 8, 0]}>
            {data.map((d, i) => (<Cell key={i} fill={d.c} />))}
            <LabelList dataKey="v" position="right" formatter={(v: number) => `¥${v}M`} fill="#e7e5ea" fontSize={13} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const ROISection = () => {
  const stack = [
    { t: 'HubSpot Sales Pro', s: 'CRM',     v: '¥450,000' },
    { t: 'Gong',              s: '議事録AI', v: '¥4,500,000' },
    { t: 'Sales Marker',      s: 'ABM',     v: '¥600,000' },
    { t: 'Glean',             s: 'ナレッジ', v: '¥450,000' },
  ]
  return (
    <Section tone="pitch" screenLabel="13 ROI">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
        <NebulaBG intensity={0.6} />

        <div className="relative max-w-3xl">
          <Eyebrow color="#abc7ff">ROI ／ TOTAL COST OF OWNERSHIP</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.6rem] leading-[1.04] mt-5">
            <span className="fo-gradient-text">Front Office は、</span>
            <br />
            いちばん安い、いちばん速い。
          </h2>
          <p className="mt-6 text-[#c7c5c9] text-[1.05rem] leading-relaxed max-w-2xl">
            比較対象は2つあります。「4ツールを契約する場合」と「社内で内製する場合」。
            <br />
            どちらと比べても、結論は同じです。
          </p>
        </div>

        {/* 13-A Stack Comparison */}
        <div className="relative mt-16">
          <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-aurora">13-A · STACK COMPARISON</div>
          <div className="font-display font-bold text-[1.6rem] md:text-[2rem] mt-3 max-w-3xl">
            本当の競合は<span className="fo-gradient-text-soft">「CRM + 議事録AI + ABM + ナレッジ」の4ツール契約</span>。
          </div>

          <div className="grid md:grid-cols-12 gap-6 mt-10">
            <div className="md:col-span-5 rounded-3xl bg-dusk p-7 fo-glass-rim">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9b99a0]">30名利用想定 ／ 月額</div>
              <div className="mt-4 space-y-3">
                {stack.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)' }}
                  >
                    <div>
                      <div className="text-[0.95rem] text-[#e7e5ea]">{r.t}</div>
                      <div className="text-xs text-[#7e7c83]">{r.s}</div>
                    </div>
                    <div className="font-mono text-[#c7c5c9]">{r.v}</div>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between py-3 border-t"
                  style={{ borderColor: 'rgba(171,199,255,0.16)' }}
                >
                  <div className="text-[#e7e5ea] font-medium">4社合算</div>
                  <div className="font-mono font-display font-bold text-coral text-[1.2rem]">¥6,000,000</div>
                </div>
                <div
                  className="rounded-xl p-4 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(171,199,255,0.10), rgba(0,113,227,0.06))',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[#e7e5ea] font-medium">Front Office</div>
                    <div className="font-mono font-display font-bold text-aurora text-[1.4rem]">¥90,000</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 rounded-3xl bg-dusk p-7 fo-glass-rim">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9b99a0] mb-2">月額比較 (¥M)</div>
              <StackComparisonChart />
            </div>
          </div>

          <div
            className="mt-10 rounded-3xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
          >
            <div className="rounded-3xl bg-pitch px-8 py-10 text-center fo-glass-rim">
              <div className="font-display font-bold text-[3rem] md:text-[5rem] leading-none fo-gradient-text">−約 97% 削減</div>
              <div className="text-xs text-[#7e7c83] mt-4">
                各ツールは2026年4月時点の30名規模での標準プラン参考価格。実際の費用は要件・契約により変動します。
              </div>
            </div>
          </div>
        </div>

        {/* 13-B Build vs Buy */}
        <div className="relative mt-24">
          <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-mint">13-B · BUILD VS BUY</div>
          <div className="font-display font-bold text-[1.6rem] md:text-[2rem] mt-3 max-w-3xl">
            <span className="fo-gradient-text-soft">「自分たちで作ればいい」</span>という選択肢の現実。
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="rounded-3xl bg-dusk p-7 fo-glass-rim">
              <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#9b99a0]">社内開発</div>
              <div className="font-display font-bold text-[1.4rem] mt-2">3年TCO 約 ¥105M</div>
              <div className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
                <div className="text-[#7e7c83]">期間</div><div className="text-[#e7e5ea]">18-24ヶ月</div>
                <div className="text-[#7e7c83]">体制</div><div className="text-[#e7e5ea]">PM + Eng×3 + Designer×0.5</div>
                <div className="text-[#7e7c83]">初期</div><div className="text-[#e7e5ea] font-mono">¥80M</div>
                <div className="text-[#7e7c83]">年間運用</div><div className="text-[#e7e5ea] font-mono">¥12.5M</div>
                <div className="text-[#7e7c83]">年間インフラ</div><div className="text-[#e7e5ea] font-mono">¥0.47M</div>
              </div>
            </div>
            <div
              className="rounded-3xl p-[1px]"
              style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
            >
              <div className="rounded-3xl bg-pitch p-7 fo-glass-rim relative overflow-hidden h-full">
                <div
                  className="absolute -top-20 -right-20 w-56 h-56 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.20), transparent 60%)', filter: 'blur(40px)' }}
                />
                <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-aurora relative">Front Office</div>
                <div className="font-display font-bold text-[1.4rem] mt-2 fo-gradient-text relative">3年TCO 約 ¥10.8M</div>
                <div className="mt-5 grid grid-cols-2 gap-y-3 text-sm relative">
                  <div className="text-[#7e7c83]">立ち上げ</div><div className="text-[#e7e5ea]">2週間</div>
                  <div className="text-[#7e7c83]">体制</div><div className="text-[#e7e5ea]">追加採用 0名</div>
                  <div className="text-[#7e7c83]">初期</div><div className="text-[#e7e5ea] font-mono">¥0</div>
                  <div className="text-[#7e7c83]">月額 (Growth)</div><div className="text-[#e7e5ea] font-mono">¥298,000</div>
                  <div className="text-[#7e7c83]">年間運用</div><div className="text-[#e7e5ea] font-mono">¥3.6M</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-dusk p-7 fo-glass-rim">
            <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9b99a0] mb-3">3年TCO 比較</div>
            <TcoChart />
            <div className="mt-2 text-xs text-[#7e7c83]">
              PMフルタイム ¥1.2M/月、エンジニア ¥1M/月、デザイナー ¥1M/月、Front Office は Growth プラン仮価格 ¥298,000/月 想定。
            </div>
          </div>

          <div
            className="mt-10 rounded-3xl p-[1px]"
            style={{ background: 'linear-gradient(135deg, rgba(141,255,201,0.45), rgba(171,199,255,0.30), transparent 70%)' }}
          >
            <div className="rounded-3xl bg-pitch px-8 py-10 text-center fo-glass-rim">
              <div className="font-display font-bold text-[3rem] md:text-[5rem] leading-none fo-gradient-text">−約 90% 削減</div>
            </div>
          </div>
        </div>

        {/* 13-C Closing */}
        <div className="mt-24 text-center max-w-3xl mx-auto">
          <div className="font-display font-bold text-[2rem] md:text-[3rem] leading-[1.1] fo-gradient-text">
            4ツール契約で 97% オフ。<br />社内開発で 90% オフ。
          </div>
          <p className="mt-6 text-[#c7c5c9] text-[1.05rem] leading-relaxed">
            コスト削減の話ではありません。Front Office を使うことは、
            <br />
            <span className="text-aurora">レベニュー創出のための時間と資金を取り戻すこと</span>です。
          </p>
        </div>
      </div>
    </Section>
  )
}
