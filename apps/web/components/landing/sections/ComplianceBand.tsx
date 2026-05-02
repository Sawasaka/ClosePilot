import { Section } from '../atoms'

export const ComplianceBand = () => (
  <Section tone="pitch" screenLabel="15 Compliance">
    <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <div className="rounded-3xl bg-dusk px-6 py-6 fo-glass-rim flex flex-wrap items-center justify-around gap-4 text-center">
        {[
          ['gBizINFO', '公式連携'],
          ['国内DC',   'SOC2 準拠'],
          ['専任CS',   'オンボード'],
          ['マニュアル', '完備'],
        ].map(([a, b], i) => (
          <div key={i} className="px-4">
            <div className="font-display font-bold text-[1.1rem] text-[#e7e5ea]">{a}</div>
            <div className="text-xs text-[#7e7c83] mt-1">{b}</div>
          </div>
        ))}
      </div>
    </div>
  </Section>
)
