/**
 * グローバル検索のモックデータ
 *
 * Phase 1: 静的なモック。
 * 将来的には tRPC 経由で DB を叩いて、企業・コンタクト・取引を横断検索する。
 */

export type SearchKind = 'company' | 'contact' | 'deal'

export type SearchItem = {
  id: string
  kind: SearchKind
  /** 一覧表示用の名前 */
  title: string
  /** サブタイトル（例：会社名 / フェーズ など） */
  subtitle?: string
  /** クリック時の遷移先 */
  href: string
}

const COMPANIES: SearchItem[] = [
  { id: 'co-1', kind: 'company', title: 'フューチャー株式会社',     subtitle: 'IT・SaaS / 従業員 1,200名',  href: '/companies/co-1' },
  { id: 'co-2', kind: 'company', title: 'グロースマーケティング',   subtitle: '広告・代理店 / 従業員 320名', href: '/companies/co-2' },
  { id: 'co-3', kind: 'company', title: 'テクノリード株式会社',     subtitle: '製造・ロボティクス / 従業員 850名', href: '/companies/co-3' },
  { id: 'co-4', kind: 'company', title: 'ロジクラウド',             subtitle: '物流・倉庫 / 従業員 540名',  href: '/companies/co-4' },
  { id: 'co-5', kind: 'company', title: 'メディカルパス株式会社',   subtitle: '医療・ヘルスケア / 従業員 220名', href: '/companies/co-5' },
  { id: 'co-6', kind: 'company', title: 'ビズオート',               subtitle: 'バックオフィス SaaS / 従業員 90名', href: '/companies/co-6' },
]

const CONTACTS: SearchItem[] = [
  { id: 'ct-1', kind: 'contact', title: '田中 太郎',   subtitle: 'フューチャー株式会社 / 営業部 部長',     href: '/contacts/ct-1' },
  { id: 'ct-2', kind: 'contact', title: '鈴木 花子',   subtitle: 'グロースマーケティング / マーケ責任者',   href: '/contacts/ct-2' },
  { id: 'ct-3', kind: 'contact', title: '佐藤 次郎',   subtitle: 'テクノリード株式会社 / CTO',              href: '/contacts/ct-3' },
  { id: 'ct-4', kind: 'contact', title: '高橋 三郎',   subtitle: 'ロジクラウド / 経営企画',                 href: '/contacts/ct-4' },
  { id: 'ct-5', kind: 'contact', title: '中村 美香',   subtitle: 'メディカルパス株式会社 / 事業開発',       href: '/contacts/ct-5' },
  { id: 'ct-6', kind: 'contact', title: '小林 健一',   subtitle: 'ビズオート / 代表取締役',                 href: '/contacts/ct-6' },
  { id: 'ct-7', kind: 'contact', title: '伊藤 結衣',   subtitle: 'フューチャー株式会社 / 経理',             href: '/contacts/ct-7' },
]

const DEALS: SearchItem[] = [
  { id: 'd-1', kind: 'deal', title: 'フューチャー社 — 新規導入提案',    subtitle: '提案中 / ¥12,000,000',  href: '/deals/d-1' },
  { id: 'd-2', kind: 'deal', title: 'グロース社 — 拡張プラン',          subtitle: '稟議中 / ¥4,800,000',   href: '/deals/d-2' },
  { id: 'd-3', kind: 'deal', title: 'テクノリード社 — 更新交渉',        subtitle: '見積回答待ち / ¥9,300,000', href: '/deals/d-3' },
  { id: 'd-4', kind: 'deal', title: 'ロジクラウド — POC 提案',          subtitle: '初回提案 / ¥2,400,000',  href: '/deals/d-4' },
  { id: 'd-5', kind: 'deal', title: 'メディカルパス社 — 年契約',        subtitle: 'クロージング / ¥6,000,000', href: '/deals/d-5' },
]

export const SEARCH_INDEX: SearchItem[] = [...COMPANIES, ...CONTACTS, ...DEALS]

export const KIND_LABEL: Record<SearchKind, string> = {
  company: '企業',
  contact: 'コンタクト',
  deal:    '取引',
}

/** 大文字小文字・全半角を緩めに正規化した部分一致検索 */
export function searchAll(query: string, limitPerKind = 5): Record<SearchKind, SearchItem[]> {
  const q = query.trim().toLowerCase()
  const empty: Record<SearchKind, SearchItem[]> = { company: [], contact: [], deal: [] }
  if (!q) return empty

  const buckets: Record<SearchKind, SearchItem[]> = { company: [], contact: [], deal: [] }
  for (const item of SEARCH_INDEX) {
    const haystack = `${item.title} ${item.subtitle ?? ''}`.toLowerCase()
    if (haystack.includes(q)) buckets[item.kind].push(item)
  }

  ;(['company', 'contact', 'deal'] as SearchKind[]).forEach((k) => {
    buckets[k] = buckets[k].slice(0, limitPerKind)
  })
  return buckets
}
