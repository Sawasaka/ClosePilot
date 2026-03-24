import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'

export async function listDriveFiles(
  auth: OAuth2Client,
  folderId: string,
  mimeTypes?: string[]
) {
  const drive = google.drive({ version: 'v3', auth })
  const q = mimeTypes
    ? `'${folderId}' in parents and (${mimeTypes.map((m) => `mimeType='${m}'`).join(' or ')})`
    : `'${folderId}' in parents`

  const res = await drive.files.list({
    q,
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
    pageSize: 100,
  })
  return res.data.files ?? []
}

export async function exportDriveFile(
  auth: OAuth2Client,
  fileId: string,
  mimeType = 'text/plain'
): Promise<string> {
  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.files.export(
    { fileId, mimeType },
    { responseType: 'text' }
  )
  return res.data as string
}

export async function watchDriveFolder(
  auth: OAuth2Client,
  folderId: string,
  webhookUrl: string,
  channelId: string
) {
  const drive = google.drive({ version: 'v3', auth })
  return drive.files.watch({
    fileId: folderId,
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
    },
  })
}
