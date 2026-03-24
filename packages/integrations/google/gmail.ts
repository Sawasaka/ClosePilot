import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'

export async function sendEmail(
  auth: OAuth2Client,
  to: string,
  subject: string,
  body: string
): Promise<string> {
  const gmail = google.gmail({ version: 'v1', auth })
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ].join('\n')

  const encoded = Buffer.from(message).toString('base64url')
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  })
  return res.data.id ?? ''
}

export async function watchGmail(auth: OAuth2Client, topicName: string) {
  const gmail = google.gmail({ version: 'v1', auth })
  return gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName,
      labelIds: ['INBOX'],
    },
  })
}

export async function getMessageById(auth: OAuth2Client, messageId: string) {
  const gmail = google.gmail({ version: 'v1', auth })
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })
  return res.data
}
