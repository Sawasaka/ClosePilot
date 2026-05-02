'use client'

/**
 * Hero — Front Office ライブチャットデモ
 * チャット入力 + 5体のサジェストチップで RAG 風の回答を擬似ストリーミング表示。
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Sparkles, Send, Check, Copy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { AGENTS, type AgentKey, Eyebrow, NebulaBG, Orb, ParticleField, Section, MiniBar } from './atoms'

const PLACEHOLDERS = [
  '今週アプローチすべきHOT企業を教えて',
  '先週の議事録から要望機能を集計して',
  '未対応チケットを担当者ごとに集計して',
  '採用インテントが伸びてる企業 TOP10',
]

interface Suggestion {
  id: keyof typeof RESPONSES
  label: string
  agent: AgentKey
}

const SUGGESTIONS: Suggestion[] = [
  { id: 'hot',    label: '今週アプローチすべきHOT企業を教えて',   agent: 'sales' },
  { id: 'pdm',    label: '先週の議事録から要望機能を集計して',     agent: 'pdm' },
  { id: 'ticket', label: '未対応チケットを担当者ごとに集計して',   agent: 'support' },
  { id: 'intent', label: '採用インテントが伸びてる企業 TOP10',      agent: 'marketing' },
  { id: 'tmpl',   label: 'ベテランの提案テンプレートを教えて',     agent: 'helpdesk' },
]

// ---------- Rich content blocks ----------
const HotCompaniesTable = () => {
  const rows = [
    { c: 'アクトラス株式会社',   i: 'SaaS',    e: '120名',   s: '資料DL3回 / 役員来訪',    score: 94 },
    { c: '株式会社メリディアン', i: '製造',    e: '850名',   s: '求人+12 / 価格ページ',    score: 89 },
    { c: 'PoltCraft Inc.',       i: 'FinTech', e: '240名',   s: 'ウェビナー参加 / 比較記事', score: 86 },
    { c: 'セレナーデ商事',       i: '商社',    e: '1,200名', s: '問合せ / 資料DL2回',       score: 81 },
    { c: 'ベルガモット工業',     i: '化学',    e: '560名',   s: '求人+8 / 採用ページ滞在',  score: 77 },
  ]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim">
      <div className="grid grid-cols-12 text-[0.68rem] uppercase tracking-[0.14em] text-[#9b99a0] pb-2">
        <div className="col-span-4">会社名</div>
        <div className="col-span-2">業界</div>
        <div className="col-span-2">従業員</div>
        <div className="col-span-2">今週シグナル</div>
        <div className="col-span-2 text-right">スコア</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-12 items-center text-sm py-2.5"
          style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)' }}
        >
          <div className="col-span-4 text-[#e7e5ea] truncate">{r.c}</div>
          <div className="col-span-2 text-[#9b99a0]">{r.i}</div>
          <div className="col-span-2 text-[#9b99a0]">{r.e}</div>
          <div className="col-span-2 text-[#c7c5c9] truncate text-xs">{r.s}</div>
          <div className="col-span-2 flex items-center justify-end gap-2">
            <MiniBar value={r.score} color="#abc7ff" w={60} />
            <span className="font-mono text-aurora text-xs w-7 text-right">{r.score}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const FeatureRequestsList = () => {
  const items = [
    { t: 'Salesforce 双方向連携の双方向フィールドマッピング', n: 14, src: 'B2B SaaS / 製造 / 商社' },
    { t: '議事録の話者分離と発言サマリー要約レベル設定',       n: 11, src: 'BPO / 金融 / SaaS' },
    { t: 'PDM ダッシュボードの要望機能スコア閾値カスタム',     n: 9,  src: 'ProductOps / PdM' },
    { t: 'Marketo / HubSpot 双方向シーケンス起動',           n: 8,  src: 'マーケ / セールス' },
    { t: '監査ログ CSV エクスポート (90日 → 24ヶ月)',        n: 7,  src: 'セキュリティ / 法務' },
  ]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="font-mono text-mint text-xs w-6">#{i + 1}</div>
          <div className="flex-1 text-sm text-[#e7e5ea]">{it.t}</div>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-mono"
            style={{ background: 'rgba(141,255,201,0.10)', color: '#8dffc9' }}
          >
            ×{it.n}
          </span>
          <span className="text-xs text-[#9b99a0] hidden md:block">{it.src}</span>
        </div>
      ))}
    </div>
  )
}

const TicketChart = () => {
  const data = [
    { name: '佐藤', v: 8 },
    { name: '田中', v: 6 },
    { name: '鈴木', v: 5 },
    { name: '高橋', v: 3 },
    { name: '中村', v: 2 },
  ]
  const tickets = [
    { id: 'T-1042', t: 'ログイン2段階認証が突然要求される', as: '佐藤', age: '3h', sev: 'high' },
    { id: 'T-1041', t: 'CSV出力で文字化け (Shift_JIS要望)', as: '田中', age: '5h', sev: 'med' },
    { id: 'T-1037', t: 'Webhook 再送が実行されない',         as: '鈴木', age: '8h', sev: 'med' },
  ]
  return (
    <div className="mt-3 space-y-3 fo-recharts">
      <div className="rounded-xl bg-pitch/80 p-4 fo-glass-rim">
        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[#9b99a0] mb-2">担当者別 未対応チケット</div>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill="#ff8dcf" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl bg-pitch/80 p-3 fo-glass-rim space-y-2">
        {tickets.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-1.5">
            <span className="font-mono text-xs text-coral">{t.id}</span>
            <span className="flex-1 text-sm truncate">{t.t}</span>
            <span className="text-xs text-[#9b99a0]">@{t.as}</span>
            <span className="text-xs font-mono text-[#c7c5c9]">{t.age}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                background: t.sev === 'high' ? 'rgba(255,141,207,0.12)' : 'rgba(255,207,74,0.10)',
                color: t.sev === 'high' ? '#ff8dcf' : '#ffcf4a',
              }}
            >
              {t.sev}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const IntentTopList = () => {
  const items = [
    'アクトラス株式会社', '株式会社オリオン技研', 'PoltCraft Inc.', 'メリディアン製作所',
    'ベルガモット工業', 'セレナーデ商事', 'ノクターン物流', 'リフラクトラボ', 'ヴィアスポーラ',
    'サフロン株式会社',
  ]
  const deltas = [42, 31, 28, 24, 22, 19, 17, 14, 12, 10]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      {items.map((c, i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <div className="font-mono text-xs text-amber w-6">{String(i + 1).padStart(2, '0')}</div>
          <div className="flex-1 text-sm truncate">{c}</div>
          <span className="text-xs font-mono" style={{ color: '#ffcf4a' }}>↑+{deltas[i]}人</span>
        </div>
      ))}
    </div>
  )
}

const TemplateBlock = () => {
  const tmpl = `[件名] {{company}} 様 — 来期営業支援に向けたご提案
お世話になっております、{{sender}} です。
先日の {{event}} ありがとうございました。

▼ ご提示の課題
- {{issue_1}}
- {{issue_2}}

▼ ご提案
1. {{solution_1}}（効果指標: {{kpi_1}}）
2. {{solution_2}}（効果指標: {{kpi_2}}）

▼ 次のステップ
{{next_step}} まで、{{owner}} よりドラフトを共有いたします。`
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-3 rounded-xl bg-[#0d0d0f] p-4 fo-glass-rim relative">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-lilac">
          提案テンプレート ／ TOP-1 提案勝率 73%
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(tmpl)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs bg-shimmer/60 hover:bg-shimmer text-[#c7c5c9]"
        >
          {copied ? <Check size={14} color="#8dffc9" /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      <pre className="font-mono text-[12.5px] leading-relaxed text-[#c7c5c9] whitespace-pre-wrap">{tmpl}</pre>
    </div>
  )
}

// ---------- Canned response definitions ----------
type RichKind = 'hotTable' | 'featureList' | 'ticketChart' | 'intentList' | 'template' | null

interface CannedResponse {
  agent: AgentKey
  text: string
  rich: RichKind
}

const RESPONSES: Record<'hot' | 'pdm' | 'ticket' | 'intent' | 'tmpl', CannedResponse> = {
  hot: {
    agent: 'sales',
    text: '今週注目すべき HOT 企業 TOP5 を抽出しました。1stパーティのサイト行動と、求人・公式IRから生成した 4 部門インテントを掛け合わせています。最上位の「アクトラス株式会社」は、本日朝に IR ページ + 価格ページを 12 分閲覧しています。今週中の打診を推奨。',
    rich: 'hotTable',
  },
  pdm: {
    agent: 'pdm',
    text: '先週の商談・サポート議事録 134 件を解析し、頻出度・重要度でスコアリングしました。Salesforce 双方向連携の要望が突出しています（14社 / 製造・商社・SaaS 横断）。次回ロードマップで優先度 P0 候補です。',
    rich: 'featureList',
  },
  ticket: {
    agent: 'support',
    text: '現在 24 件の未対応チケットがあります。佐藤さんに 8 件偏重しており、SLA 違反 1 件（T-1042）を検知しました。担当再配分を推奨します。',
    rich: 'ticketChart',
  },
  intent: {
    agent: 'marketing',
    text: '求人公開数 × 新規ハイヤー職種から、過去30日で採用インテントが急上昇している企業 TOP10 です。ICP 一致率 80%以上のみフィルタしました。「アクトラス株式会社」は SaaS 営業職 +42人で、上位パイプライン候補です。',
    rich: 'intentList',
  },
  tmpl: {
    agent: 'helpdesk',
    text: 'ベテラン営業 (勝率 TOP 5%) が直近 90日 で利用した提案テンプレートを抽出しました。共通パターン「課題3点 → 提案2案 → KPI明示 → Next Step期限」をベースにしています。下記をベースに、{{company}} などのプレースホルダを置き換えてご利用ください。',
    rich: 'template',
  },
}

const RichBlock = ({ kind }: { kind: RichKind }) => {
  if (kind === 'hotTable')    return <HotCompaniesTable />
  if (kind === 'featureList') return <FeatureRequestsList />
  if (kind === 'ticketChart') return <TicketChart />
  if (kind === 'intentList')  return <IntentTopList />
  if (kind === 'template')    return <TemplateBlock />
  return null
}

// ---------- ChatMessage ----------
interface ChatMsg {
  id: string
  role: 'user' | 'agent'
  agent?: AgentKey
  text: string
  rich?: RichKind
}

const ChatMessage = ({ m, streaming }: { m: ChatMsg; streaming: boolean }) => {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm"
          style={{
            background: 'rgba(171,199,255,0.10)',
            color: '#e7e5ea',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
          }}
        >
          {m.text}
        </div>
      </div>
    )
  }
  const a = AGENTS[m.agent ?? 'sales']
  return (
    <div className="flex gap-3">
      <div className="pt-1 shrink-0">
        <Orb color={a.color} size={22} active={streaming} />
      </div>
      <div className="flex-1 max-w-[88%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.78rem] font-semibold" style={{ color: a.color }}>{a.name}</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#7e7c83]">RAG demo</span>
        </div>
        <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-shimmer/40 fo-glass-rim">
          <div className="text-[0.95rem] leading-relaxed text-[#e7e5ea] whitespace-pre-wrap">
            {m.text}
            {streaming && <span className="fo-cursor-blink" />}
          </div>
          {m.rich && !streaming && <RichBlock kind={m.rich} />}
          {!streaming && (
            <div className="mt-3 text-[11px] text-[#7e7c83] flex items-center gap-1.5">
              <Sparkles size={12} color="#abc7ff" />
              これは Front Office のRAGデモです。実データで試すには{' '}
              <a href="#cta" className="text-aurora hover:underline ml-1">無料アカウント発行 →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Hero ----------
export const Hero = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'm0',
      role: 'agent',
      agent: 'sales',
      text: 'こんにちは。Front Office のRAGデモです。下の質問例を試すか、自由に入力してください。',
    },
  ])
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null)
  const [input, setInput] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  const [phShow, setPhShow] = useState(true)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Rotate placeholder
  useEffect(() => {
    const t = setInterval(() => {
      setPhShow(false)
      setTimeout(() => {
        setPhIdx((i) => (i + 1) % PLACEHOLDERS.length)
        setPhShow(true)
      }, 600)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  // Autoscroll
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
    }
  })

  const streamResponse = useCallback((agent: AgentKey, text: string, rich: RichKind) => {
    const id = 'a' + Date.now()
    setMessages((ms) => [...ms, { id, role: 'agent', agent, text: '', rich }])
    setStreamingId(id)
    setActiveAgent(agent)
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const step = () => {
      i += 2
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, text: text.slice(0, i) } : m)))
      if (i < text.length) {
        timer = setTimeout(step, 28)
      } else {
        setStreamingId(null)
        setActiveAgent(null)
      }
    }
    timer = setTimeout(step, 220)
    return () => clearTimeout(timer)
  }, [])

  const sendChip = useCallback(
    (sug: Suggestion) => {
      if (streamingId) return
      const userMsg: ChatMsg = { id: 'u' + Date.now(), role: 'user', text: sug.label }
      setMessages((ms) => [...ms, userMsg])
      const r = RESPONSES[sug.id]
      setTimeout(() => streamResponse(r.agent, r.text, r.rich), 350)
    },
    [streamingId, streamResponse]
  )

  const sendInput = useCallback(() => {
    const v = input.trim()
    if (!v || streamingId) return
    setInput('')
    setMessages((ms) => [...ms, { id: 'u' + Date.now(), role: 'user', text: v }])
    const match = SUGGESTIONS.find((s) => v.includes(s.label.slice(0, 8)) || v === s.label)
    setTimeout(() => {
      if (match) {
        const r = RESPONSES[match.id]
        streamResponse(r.agent, r.text, r.rich)
      } else {
        const fallback =
          'こちらは静的デモ環境のため、自由入力には実データで回答できません。実際にあなたの組織のデータで試すには、無料アカウントを発行してください → 無料で始める'
        streamResponse('sales', `Sales Agent: ${fallback}`, null)
      }
    }, 350)
  }, [input, streamingId, streamResponse])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendInput()
    }
  }

  const orbs: Array<{ agent: AgentKey; pos: string; size: number }> = [
    { agent: 'sales',     pos: 'top-[8%] left-[6%] hidden md:block',      size: 38 },
    { agent: 'marketing', pos: 'top-[14%] right-[7%] hidden md:block',    size: 44 },
    { agent: 'pdm',       pos: 'bottom-[18%] left-[4%] hidden md:block',  size: 36 },
    { agent: 'support',   pos: 'bottom-[10%] right-[6%] hidden md:block', size: 42 },
    { agent: 'helpdesk',  pos: 'top-[48%] left-[2%] hidden lg:block',     size: 32 },
  ]

  const heroWords = ['Front', 'Office', 'を、']
  const heroLine2 = ['まず、', '聞いて', 'みて', 'ください。']

  return (
    <Section id="hero" tone="obsidian" screenLabel="01 Hero">
      <NebulaBG intensity={1.2} />
      <ParticleField count={48} seed={11} />

      {orbs.map((o, i) => (
        <div key={i} className={`absolute ${o.pos} fo-orb-drift`} style={{ animationDelay: `-${i * 1.4}s` }}>
          <Orb color={AGENTS[o.agent].color} size={o.size} active={activeAgent === o.agent} glow={1.4} />
        </div>
      ))}

      <div className="relative mx-auto max-w-6xl px-6 pt-32 md:pt-40 pb-24 md:pb-32 min-h-screen flex flex-col justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Eyebrow color="#abc7ff">A NEW CATEGORY ／ BGM × AGENTIC ERA</Eyebrow>
          </div>
          <h1 className="font-display font-bold tracking-[-0.025em] text-[2.6rem] sm:text-[3.4rem] md:text-[4.6rem] leading-[1.04]">
            <span className="block">
              {heroWords.map((w, i) => (
                <span key={i} className="fo-word-in inline-block fo-gradient-text" style={{ animationDelay: `${i * 80}ms` }}>
                  {w}
                </span>
              ))}
            </span>
            <span className="block mt-1">
              {heroLine2.map((w, i) => (
                <span
                  key={i}
                  className="fo-word-in inline-block fo-gradient-text"
                  style={{ animationDelay: `${(i + heroWords.length) * 80}ms` }}
                >
                  {w}
                </span>
              ))}
            </span>
          </h1>
          <p className="mt-6 text-[#c7c5c9] max-w-2xl mx-auto text-[1.05rem] leading-relaxed fo-word-in" style={{ animationDelay: '650ms' }}>
            これは説明ページではありません。<span className="text-aurora">Front Office そのものです。</span>
            <br />
            下のチャットに何でも投げてみてください。5体のAIエージェントが答えます。
          </p>
        </div>

        {/* Chat panel */}
        <div className="relative mt-10 md:mt-14 fo-word-in" style={{ animationDelay: '900ms' } as CSSProperties}>
          <div
            className="absolute -inset-6 rounded-[2.2rem] fo-halo pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(171,199,255,0.18), rgba(0,113,227,0.20))',
              filter: 'blur(40px)',
            }}
          />
          <div className="relative rounded-[1.8rem] fo-glass-strong fo-glass-rim overflow-hidden fo-tilt-1400" style={{ transformStyle: 'preserve-3d' }}>
            {/* Top bar */}
            <div className="px-5 md:px-7 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {(Object.keys(AGENTS) as AgentKey[]).map((k) => (
                    <span key={k} className="rounded-full" style={{ padding: 1, background: '#1b1b1d' }}>
                      <Orb color={AGENTS[k].color} size={14} active={activeAgent === k} />
                    </span>
                  ))}
                </div>
                <span className="text-sm text-[#c7c5c9]">
                  Front Office <span className="text-[#7e7c83]">／ Live RAG demo</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-mono"
                  style={{ background: 'rgba(141,255,201,0.10)', color: '#8dffc9' }}
                >
                  ● online
                </span>
                <span className="text-xs text-[#7e7c83] font-mono hidden sm:block">tnt_demo · region:apne1</span>
              </div>
            </div>

            {/* Thread */}
            <div
              ref={threadRef}
              className="px-5 md:px-7 py-4 space-y-5 overflow-y-auto fo-thin-scroll"
              style={{ minHeight: 320, maxHeight: 480 }}
            >
              {messages.map((m) => (
                <ChatMessage key={m.id} m={m} streaming={m.id === streamingId} />
              ))}
            </div>

            {/* Input */}
            <div className="px-5 md:px-7 pb-5 pt-2">
              <div className="relative">
                <div
                  className="absolute -inset-2 rounded-2xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, rgba(171,199,255,0.18), rgba(0,113,227,0.18))',
                    filter: 'blur(18px)',
                  }}
                />
                <div
                  className="relative rounded-2xl bg-pitch flex items-center gap-3 px-4 md:px-5 h-[68px] md:h-20"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.18)' }}
                  onClick={() => inputRef.current?.focus()}
                >
                  <Sparkles size={20} color="#abc7ff" />
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      className="w-full bg-transparent outline-none text-[1rem] md:text-[1.05rem] text-[#e7e5ea]"
                      style={{ caretColor: '#abc7ff' }}
                      aria-label="ask Front Office"
                    />
                    {!input && (
                      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                        <span
                          className={`text-[#7e7c83] text-[1rem] md:text-[1.05rem] transition-all duration-[600ms] ${phShow ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                        >
                          {PLACEHOLDERS[phIdx]}
                        </span>
                        <span className="fo-cursor-blink ml-0.5" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendInput}
                    disabled={!input.trim() || !!streamingId}
                    className="rounded-xl px-4 h-11 inline-flex items-center gap-2 text-sm font-medium disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)', color: '#0a0a0c' }}
                  >
                    送信 <Send size={15} color="#0a0a0c" />
                  </button>
                </div>
              </div>

              {/* Suggested chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => {
                  const a = AGENTS[s.agent]
                  return (
                    <button
                      key={s.id}
                      onClick={() => sendChip(s)}
                      disabled={!!streamingId}
                      className="group inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-xs bg-dusk hover:bg-shimmer transition-colors disabled:opacity-40 fo-chip-shimmer"
                    >
                      <Orb color={a.color} size={10} />
                      <span className="text-[#e7e5ea]">{s.label}</span>
                      <span className="text-[#7e7c83] hidden sm:inline">→ {a.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Below chat */}
        <div className="mt-12 md:mt-16 text-center space-y-6">
          <div className="text-[#c7c5c9] text-sm">
            実際にあなたの組織のデータで試すには →{' '}
            <a href="#cta" className="text-aurora underline-offset-4 hover:underline">無料で始める</a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-xs text-[#9b99a0]">
            <span>累計エンリッチ <span className="text-[#e7e5ea] font-mono">4,560社</span></span>
            <span className="hidden sm:inline text-[#414753]">／</span>
            <span>収録企業 <span className="text-[#e7e5ea] font-mono">2,900,000社</span></span>
            <span className="hidden sm:inline text-[#414753]">／</span>
            <span>gBizINFO <span className="text-[#e7e5ea]">公式連携</span></span>
          </div>
        </div>
      </div>
    </Section>
  )
}
