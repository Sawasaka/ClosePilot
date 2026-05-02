import { prisma } from '@bgm/db'
import { slack } from './client'

interface SyncResult {
  channels: number
  messages: number
  matched: number
}

const USER_CACHE_TTL_MS = 5 * 60 * 1000

/**
 * Slack のチャンネルとメッセージを同期し、ユーザーメアドがコンタクトと一致するものを SlackMessage に保存。
 *
 * 紐付け: senderEmail（users.info から取得）→ contact.email 完全一致
 */
export async function syncSlackForOrg(workspaceId: string, options?: { perChannel?: number }): Promise<SyncResult> {
  const ws = await prisma.slackWorkspace.findUnique({ where: { id: workspaceId } })
  if (!ws) throw new Error(`SlackWorkspace not found: ${workspaceId}`)
  if (!ws.enabled) return { channels: 0, messages: 0, matched: 0 }

  const token = ws.botToken
  const perChannel = options?.perChannel ?? 30

  // コンタクト一覧（メアド一致用）
  const contacts = await prisma.contact.findMany({
    where: { orgId: ws.orgId, email: { not: null } },
    select: { id: true, email: true, companyId: true },
  })
  const contactByEmail = new Map<string, { id: string; companyId: string }>()
  for (const c of contacts) {
    if (c.email) contactByEmail.set(c.email.toLowerCase(), { id: c.id, companyId: c.companyId })
  }

  // user info キャッシュ
  const userCache = new Map<string, { email?: string; name?: string }>()
  const getUser = async (uid: string) => {
    if (!uid) return null
    const cached = userCache.get(uid)
    if (cached) return cached
    try {
      const r = await slack.usersInfo(token, uid)
      const info = {
        email: r.user.profile?.email,
        name: r.user.profile?.display_name || r.user.real_name || r.user.profile?.real_name,
      }
      userCache.set(uid, info)
      return info
    } catch {
      return null
    }
  }

  // チャンネル一覧（自分が参加しているもののみ）
  const channels: Array<{ id: string; name: string }> = []
  let cursor: string | undefined
  do {
    const list = await slack.conversationsList(token, { cursor, limit: 200 })
    for (const c of list.channels) {
      if (c.is_archived) continue
      // public/private チャンネルは is_member=true、im/mpim は常時参加
      if (c.is_member !== false) channels.push({ id: c.id, name: c.name ?? c.id })
    }
    cursor = list.response_metadata?.next_cursor || undefined
  } while (cursor)

  let messages = 0
  let matched = 0

  for (const ch of channels) {
    let history
    try {
      history = await slack.conversationsHistory(token, { channel: ch.id, limit: perChannel })
    } catch {
      continue
    }
    for (const m of history.messages ?? []) {
      if (!m.text || m.bot_id) continue
      const exists = await prisma.slackMessage.findUnique({
        where: { workspaceId_channelId_ts: { workspaceId: ws.id, channelId: ch.id, ts: m.ts } },
      })
      if (exists) continue

      let senderEmail: string | undefined
      let senderName: string | undefined
      if (m.user) {
        const info = await getUser(m.user)
        senderEmail = info?.email
        senderName = info?.name ?? undefined
      }

      const link = senderEmail ? contactByEmail.get(senderEmail.toLowerCase()) : undefined
      if (link) matched++

      let permalink: string | undefined
      try {
        const r = await slack.chatGetPermalink(token, ch.id, m.ts)
        permalink = r.permalink
      } catch {
        // ignore
      }

      await prisma.slackMessage.create({
        data: {
          orgId: ws.orgId,
          workspaceId: ws.id,
          channelId: ch.id,
          channelName: ch.name,
          ts: m.ts,
          threadTs: m.thread_ts ?? null,
          senderUserId: m.user ?? null,
          senderEmail: senderEmail ?? null,
          senderName: senderName ?? null,
          text: m.text,
          permalink: permalink ?? null,
          postedAt: new Date(parseFloat(m.ts) * 1000),
          contactId: link?.id ?? null,
          companyId: link?.companyId ?? null,
          matchedBy: link ? 'email_match' : null,
        },
      })
      messages++
    }
  }

  await prisma.slackWorkspace.update({
    where: { id: ws.id },
    data: { lastSyncAt: new Date() },
  })

  return { channels: channels.length, messages, matched }
}

// 一応 TTL 残り時間で消すロジック (currently unused). exports for future use.
export const _userCacheTtl = USER_CACHE_TTL_MS
