import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/trpc/provider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Intent Force — for First-Party CRM',
  description: '優秀な営業マネージャーの判断ロジックをシステムに内包する受注実行基盤',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={dmSans.variable}>
        <SessionProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
