import { Section } from '../atoms'

export const MetricsBand = () => {
  const stats = [
    { k: '1',     suf: 'つで',  l: '5領域',                          c: '#abc7ff' },
    { k: '5',     suf: '体',    l: 'ドメイン特化エージェント',         c: '#d3a5ff' },
    { k: '0',     suf: '入力',  l: '議事録・メール・コール自動取込',   c: '#8dffc9' },
    { k: '290万', suf: '',      l: '収録企業数',                       c: '#ffcf4a' },
  ]
  return (
    <Section tone="pitch" screenLabel="11 Metrics">
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden bg-[#1f1f21] fo-glass-rim">
          {stats.map((s, i) => (
            <div key={i} className="bg-pitch p-8 md:p-10">
              <div className="font-display font-bold text-[2.6rem] md:text-[3.4rem] leading-none" style={{ color: s.c }}>
                {s.k}
                <span className="text-[1.2rem] ml-1 text-[#9b99a0]">{s.suf}</span>
              </div>
              <div className="text-xs text-[#9b99a0] mt-3 leading-relaxed">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
