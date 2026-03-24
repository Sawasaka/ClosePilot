import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function generateBrowserToken(identity: string): Promise<string> {
  const AccessToken = twilio.jwt.AccessToken
  const VoiceGrant = AccessToken.VoiceGrant

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: false,
  })

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY!,
    process.env.TWILIO_API_SECRET!,
    { identity, ttl: 3600 }
  )
  token.addGrant(voiceGrant)
  return token.toJwt()
}

export async function getCallDetails(callSid: string) {
  return client.calls(callSid).fetch()
}

export async function getRecordingUrl(callSid: string): Promise<string | null> {
  const recordings = await client.recordings.list({ callSid, limit: 1 })
  if (!recordings.length) return null
  const rec = recordings[0]!
  return `https://api.twilio.com${rec.uri.replace('.json', '.mp3')}`
}

export function generateTwiML(toNumber: string, callerId: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse
  const twiml = new VoiceResponse()
  const dial = twiml.dial({ callerId, record: 'record-from-answer-dual' })
  dial.number(toNumber)
  return twiml.toString()
}
