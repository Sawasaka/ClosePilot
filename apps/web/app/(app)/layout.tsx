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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a18' }}>
      {/* FF8 background — dark blue gradient with subtle grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep space gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #101040 0%, #0a0a18 70%)',
        }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(68,102,170,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(68,102,170,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        {/* Ambient glow — left */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(34,68,170,0.12) 0%, transparent 70%)',
        }} />
        {/* Ambient glow — right */}
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] rounded-full" style={{
          background: 'radial-gradient(circle, rgba(100,50,180,0.08) 0%, transparent 70%)',
        }} />
      </div>

      <Sidebar />
      <Header user={user} />
      <main className="relative ml-[224px] pt-[56px] min-h-screen" style={{ zIndex: 1 }}>
        <div className="p-7">
          {children}
        </div>
      </main>
      <ActiveCallWidget />
      <CallResultModal />
    </div>
  )
}
