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
    <div className="min-h-screen" style={{ background: '#E8EDF5' }}>
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
