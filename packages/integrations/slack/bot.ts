import { App } from '@slack/bolt'
import type { RagAnswer } from '../../../apps/api/src/services/rag/ragService'

export function createSlackApp() {
  return new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
  })
}

export function formatRagAnswer(answer: RagAnswer): string {
  const sourceLinks = answer.sources
    .map((s, i) => `${i + 1}. <${s.url}|${s.fileName}> （信頼度: ${Math.round(s.score * 100)}%）`)
    .join('\n')

  return [
    answer.text,
    '',
    '*参照ドキュメント:*',
    sourceLinks,
  ].join('\n')
}
