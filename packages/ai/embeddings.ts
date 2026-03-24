import { openai } from './openai'

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text.replace(/\n/g, ' '),
    dimensions: 1536,
  })
  return response.data[0]?.embedding ?? []
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: texts.map((t) => t.replace(/\n/g, ' ')),
    dimensions: 1536,
  })
  return response.data.map((d) => d.embedding)
}
