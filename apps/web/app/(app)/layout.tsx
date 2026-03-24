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
        backgroundColor: '#F4F4F6',
        backgroundImage: `
          radial-gradient(ellipse 75% 50% at 28% 0%, rgba(255,59,48,0.10) 0%, transparent 62%),
          radial-gradient(ellipse 55% 55% at 88% 100%, rgba(79,70,229,0.08) 0%, transparent 58%),
          radial-gradient(ellipse 50% 40% at 75% 15%, rgba(255,159,10,0.05) 0%, transparent 50%),
          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 22px 22px',
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
