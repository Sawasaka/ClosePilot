import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'

export async function createCalendarEvent(
  auth: OAuth2Client,
  params: {
    summary: string
    startAt: Date
    endAt: Date
    attendeeEmails: string[]
    addMeet?: boolean
  }
) {
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    requestBody: {
      summary: params.summary,
      start: { dateTime: params.startAt.toISOString() },
      end: { dateTime: params.endAt.toISOString() },
      attendees: params.attendeeEmails.map((email) => ({ email })),
      conferenceData: params.addMeet
        ? {
            createRequest: {
              requestId: `closepilot-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          }
        : undefined,
    },
    conferenceDataVersion: params.addMeet ? 1 : 0,
  })
  return res.data
}

export async function getCalendarEvent(auth: OAuth2Client, eventId: string) {
  const calendar = google.calendar({ version: 'v3', auth })
  const res = await calendar.events.get({ calendarId: 'primary', eventId })
  return res.data
}
