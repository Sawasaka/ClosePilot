'use client'

import { AGENTS, type AgentKey, Eyebrow, NebulaBG, Orb, Section } from '../atoms'

export const AgenticEra = () => {
  const agents: { agent: AgentKey; x: string }[] = [
    { agent: 'sales',     x: '10%' },
    { agent: 'marketing', x: '30%' },
    { agent: 'pdm',       x: '50%' },
    { agent: 'helpdesk',  x: '70%' },
    { agent: 'support',   x: '90%' },
  ]
  return (
    <Section tone="pitch" screenLabel="05 Agentic">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
        <NebulaBG intensity={0.7} />
        <div className="relative max-w-3xl">
          <Eyebrow color="#d3a5ff">THE AGENTIC ERA</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
            人がタブを切り替える時代から、
            <br />
            <span className="fo-gradient-text-soft">エージェントが働き合う時代へ。</span>
          </h2>
          <p className="mt-6 text-[#c7c5c9] text-[1.05rem] leading-relaxed max-w-2xl">
            Front Office では、5体のドメイン特化エージェントが、データ連携を介して互いにタスクを引き継ぎます。
            人は、彼らの仕事をレビューし、判断するだけ。
          </p>
        </div>

        <div className="relative mt-16 h-[260px] md:h-[320px]">
          <svg viewBox="0 0 1000 320" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="streamG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#abc7ff" stopOpacity="0" />
                <stop offset="50%" stopColor="#abc7ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M120,160 C 260,40 360,260 500,160 S 740,40 880,160"
              stroke="url(#streamG)" strokeWidth="1.4" fill="none" className="fo-line-pulse"
            />
            <path
              d="M120,160 C 280,260 380,80 500,160 S 760,240 880,160"
              stroke="url(#streamG)" strokeWidth="1.0" fill="none" className="fo-line-pulse"
              style={{ animationDelay: '-2s' }}
            />
          </svg>
          {agents.map((o, i) => (
            <div key={o.agent} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: o.x }}>
              <div className="fo-orb-drift" style={{ animationDelay: `-${i * 1.2}s` }}>
                <Orb color={AGENTS[o.agent].color} size={48} glow={1.4} />
              </div>
              <div
                className="text-[11px] mt-3 text-center uppercase tracking-[0.14em]"
                style={{ color: AGENTS[o.agent].color }}
              >
                {AGENTS[o.agent].name.replace(' Agent', '')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
