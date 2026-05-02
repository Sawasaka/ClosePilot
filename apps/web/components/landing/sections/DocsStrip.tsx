import { Book, Handshake, Code, Shield, FileText, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

interface DocCard { Icon: LucideIcon; t: string; d: string; c: string }

const CARDS: DocCard[] = [
  { Icon: Book,      t: 'セットアップガイド',         d: '30分で初期設定',        c: '#abc7ff' },
  { Icon: Handshake, t: 'パートナー運用マニュアル',   d: '代理店・SIer向け',      c: '#c8b9ff' },
  { Icon: Code,      t: 'API ドキュメント',          d: 'REST + Webhook',         c: '#8dffc9' },
  { Icon: Shield,    t: 'セキュリティWP',             d: 'RLS / 暗号化 / 監査',   c: '#7ec6ff' },
  { Icon: FileText,  t: 'リリースノート',             d: '毎週更新',              c: '#ffcf4a' },
]

export const DocsStrip = () => (
  <Section tone="pitch" screenLabel="19 Docs">
    <div className="relative mx-auto max-w-6xl px-6 py-24">
      <Eyebrow color="#abc7ff">DOCS</Eyebrow>
      <div className="grid md:grid-cols-5 gap-3 mt-8">
        {CARDS.map((c, i) => {
          const Icon = c.Icon
          return (
            <a key={i} href="#" className="rounded-2xl bg-dusk p-5 fo-lift fo-glass-rim block group">
              <Icon size={18} color={c.c} strokeWidth={1.5} />
              <div className="font-display font-bold text-[0.95rem] mt-3 text-[#e7e5ea]">{c.t}</div>
              <div className="text-xs text-[#9b99a0] mt-1">{c.d}</div>
              <div className="mt-4 text-aurora text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                開く <ArrowUpRight size={12} color="#abc7ff" />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  </Section>
)
