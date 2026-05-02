import { prisma, EmailDirection } from '@bgm/db'
import { getGmailClient, getGoogleOAuthClient } from './oauth'
import type { gmail_v1 } from 'googleapis'

interface SyncOptions {
  /** 取得するメッセージ最大件数（一回の同期で） */
  maxMessages?: number
  /** 直近何日分のメッセージを対象にするか */
  sinceDays?: number
}

interface SyncResult {
  fetched: number
  inserted: number
  matched: number // contact 紐付けに成功した件数
  skipped: number
}

/**
 * Gmail を同期し、コンタクト/企業ドメインに一致するメッセージを EmailMessage に保存。
 *
 * 紐付けロジック:
 *   1. 送信元/送信先メアド完全一致 → contact, company
 *   2. ドメイン一致 → company のみ
 */
export async function syncGmailForUser(userId: string, opts: SyncOptions = {}): Promise<SyncResult> {
  const maxMessages = opts.maxMessages ?? 100
  const sinceDays = opts.sinceDays ?? 30

  const auth = await getGoogleOAuthClient(userId)
  const gmail = getGmailClient(auth)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error(`User not found: ${userId}`)

  // Gmail 検索クエリ: 直近 N 日のメール、自分以外との通信
  const query = `newer_than:${sinceDays}d -in:chats`

  const list = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: maxMessages,
  })

  const messages = list.data.messages ?? []
  let inserted = 0
  let matched = 0
  let skipped = 0

  // コンタクト一覧（メアド一致用）— 実装簡素化のため一括ロード。将来は LRU キャッシュ
  const contacts = await prisma.contact.findMany({
    where: { orgId: user.orgId, email: { not: null } },
    select: { id: true, email: true, companyId: true },
  })
  const contactByEmail = new Map<string, { id: string; companyId: string }>()
  for (const c of contacts) {
    if (c.email) contactByEmail.set(c.email.toLowerCase(), { id: c.id, companyId: c.companyId })
  }

  // 企業ドメイン一覧
  const companies = await prisma.company.findMany({
    where: { orgId: user.orgId, domain: { not: null } },
    select: { id: true, domain: true },
  })
  const companyByDomain = new Map<string, string>()
  for (const c of companies) {
    if (c.domain) companyByDomain.set(c.domain.toLowerCase(), c.id)
  }

  for (const m of messages) {
    if (!m.id) continue
    // 重複チェック
    const existing = await prisma.emailMessage.findUnique({
      where: { userId_gmailMessageId: { userId, gmailMessageId: m.id } },
    })
    if (existing) {
      skipped++
      continue
    }

    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: m.id,
      format: 'full',
    })

    const parsed = parseGmailMessage(detail.data)
    if (!parsed) {
      skipped++
      continue
    }

    // 紐付け解決
    const link = resolveLinkage({
      from: parsed.fromAddress,
      to: parsed.toAddresses,
      cc: parsed.ccAddresses,
      contactByEmail,
      companyByDomain,
    })

    if (link.contactId || link.companyId || link.dealId) matched++

    await prisma.emailMessage.create({
      data: {
        orgId: user.orgId,
        userId,
        gmailMessageId: m.id,
        gmailThreadId: detail.data.threadId ?? '',
        subject: parsed.subject,
        snippet: detail.data.snippet ?? null,
        bodyText: parsed.bodyText,
        bodyHtml: parsed.bodyHtml,
        fromAddress: parsed.fromAddress,
        fromName: parsed.fromName,
        toAddresses: parsed.toAddresses,
        ccAddresses: parsed.ccAddresses,
        sentAt: parsed.sentAt,
        direction: parsed.direction,
        labels: detail.data.labelIds ?? [],
        contactId: link.contactId ?? null,
        companyId: link.companyId ?? null,
        dealId: link.dealId ?? null,
        matchedBy: link.matchedBy ?? null,
      },
    })
    inserted++
  }

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: { lastGmailSyncAt: new Date() },
  })

  return { fetched: messages.length, inserted, matched, skipped }
}

interface ParsedMessage {
  fromAddress: string
  fromName: string | null
  toAddresses: string[]
  ccAddresses: string[]
  subject: string | null
  bodyText: string | null
  bodyHtml: string | null
  sentAt: Date
  direction: EmailDirection
}

function parseGmailMessage(msg: gmail_v1.Schema$Message): ParsedMessage | null {
  const headers = msg.payload?.headers ?? []
  const headerMap = new Map<string, string>()
  for (const h of headers) {
    if (h.name && h.value) headerMap.set(h.name.toLowerCase(), h.value)
  }

  const fromHeader = headerMap.get('from') ?? ''
  const { address: fromAddress, name: fromName } = parseAddress(fromHeader)
  if (!fromAddress) return null

  const toAddresses = parseAddressList(headerMap.get('to') ?? '')
  const ccAddresses = parseAddressList(headerMap.get('cc') ?? '')
  const subject = headerMap.get('subject') ?? null

  const internalDate = msg.internalDate ? new Date(parseInt(msg.internalDate, 10)) : new Date()

  const labels = msg.labelIds ?? []
  const direction: EmailDirection = labels.includes('SENT')
    ? EmailDirection.SENT
    : EmailDirection.RECEIVED

  const { text, html } = extractBody(msg.payload)

  return {
    fromAddress,
    fromName,
    toAddresses,
    ccAddresses,
    subject,
    bodyText: text,
    bodyHtml: html,
    sentAt: internalDate,
    direction,
  }
}

function parseAddress(header: string): { address: string; name: string | null } {
  // "Foo Bar <foo@bar.com>" or "foo@bar.com"
  const m = header.match(/^(.*?)<([^>]+)>\s*$/)
  if (m) {
    const [, name, address] = m
    return { address: (address ?? '').trim().toLowerCase(), name: (name ?? '').trim().replace(/^["']|["']$/g, '') || null }
  }
  return { address: header.trim().toLowerCase(), name: null }
}

function parseAddressList(header: string): string[] {
  if (!header) return []
  return header
    .split(',')
    .map((p) => parseAddress(p).address)
    .filter((a): a is string => !!a)
}

function extractBody(part: gmail_v1.Schema$MessagePart | undefined): {
  text: string | null
  html: string | null
} {
  if (!part) return { text: null, html: null }
  let text: string | null = null
  let html: string | null = null

  const walk = (p: gmail_v1.Schema$MessagePart) => {
    if (p.mimeType === 'text/plain' && p.body?.data) {
      text = decodeBase64Url(p.body.data)
    } else if (p.mimeType === 'text/html' && p.body?.data) {
      html = decodeBase64Url(p.body.data)
    }
    for (const sub of p.parts ?? []) walk(sub)
  }
  walk(part)
  return { text, html }
}

function decodeBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(b64, 'base64').toString('utf8')
}

function resolveLinkage(input: {
  from: string
  to: string[]
  cc: string[]
  contactByEmail: Map<string, { id: string; companyId: string }>
  companyByDomain: Map<string, string>
}): {
  contactId?: string
  companyId?: string
  dealId?: string
  matchedBy?: string
} {
  const all = [input.from, ...input.to, ...input.cc].map((e) => e.toLowerCase()).filter(Boolean)

  for (const addr of all) {
    const c = input.contactByEmail.get(addr)
    if (c) return { contactId: c.id, companyId: c.companyId, matchedBy: 'email_match' }
  }

  for (const addr of all) {
    const dom = addr.split('@')[1]
    if (!dom) continue
    const cid = input.companyByDomain.get(dom)
    if (cid) return { companyId: cid, matchedBy: 'domain_match' }
  }

  return {}
}
