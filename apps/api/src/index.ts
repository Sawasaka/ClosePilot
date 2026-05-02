import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { appRouter } from './router'
import { createContext } from './middleware/context'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

async function bootstrap() {
  // セキュリティ
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  })

  // CORS
  await fastify.register(cors, {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    ],
    credentials: true,
  })

  // tRPC
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError: ({ error }: { error: Error }) => {
        console.error('tRPC Error:', error)
      },
    },
  })

  // ヘルスチェック
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  const port = Number(process.env.PORT ?? 3001)
  await fastify.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 BGM API running on port ${port}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
