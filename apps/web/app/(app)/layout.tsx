import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ActiveCallWidget } from '@/components/calls/ActiveCallWidget'
import { CallResultModal } from '@/components/calls/CallResultModal'

const DEV_USER = {
  name: '開発 太郎',
  email: 'dev@closepilot.app',
  image: null,
}

async function getSessionUser() {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return DEV_USER
  }
  const { auth } = await import('@/lib/auth')
  const { redirect } = await import('next/navigation')
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return (session as NonNullable<typeof session>).user
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#E8E8EE',
        backgroundImage: `
          radial-gradient(ellipse 85% 60% at 0% 0%,   rgba(255,59,48,0.32)  0%, transparent 50%),
          radial-gradient(ellipse 70% 65% at 100% 100%, rgba(79,70,229,0.26) 0%, transparent 50%),
          radial-gradient(ellipse 55% 50% at 100% 0%,  rgba(255,200,10,0.18) 0%, transparent 48%),
          radial-gradient(ellipse 50% 55% at 0% 100%,  rgba(0,195,80,0.14)  0%, transparent 48%),
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.11) 1.5px, transparent 0)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 20px 20px',
        backgroundAttachment: 'fixed, fixed, fixed, fixed, scroll',
      }}
    >
      <Sidebar />
      <Header user={user} />
      <main className="ml-[224px] pt-[56px] min-h-screen">
        <div className="p-7">
          {children}
        </div>
      </main>
      <ActiveCallWidget />
      <CallResultModal />
    </div>
  )
}
