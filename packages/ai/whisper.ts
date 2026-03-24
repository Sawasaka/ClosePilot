import fs from 'fs'
import { openai } from './openai'

export async function transcribeAudio(audioPath: string): Promise<string> {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'ja',
    response_format: 'text',
  })
  return response
}

export async function transcribeFromUrl(audioUrl: string): Promise<string> {
  const res = await fetch(audioUrl)
  const buffer = await res.arrayBuffer()
  const blob = new Blob([buffer], { type: 'audio/mpeg' })
  const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' })

  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'ja',
    response_format: 'text',
  })
  return response
}
