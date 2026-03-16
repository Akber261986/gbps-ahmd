// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Lateef } from 'next/font/google'
import Navigation from '@/components/Navigation'
import FloatingChatbot from '@/components/FloatingChatbot'
import { AuthProvider } from '@/contexts/AuthContext'
import { SchoolProvider } from '@/contexts/SchoolContext'

const lateef = Lateef({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-lateef',
})

export const metadata: Metadata = {
  title: 'اسڪول مئنيجمينٽ سسٽم',
  description: 'گورنمينٽ پرائمري اسڪول جو مئنيجمينٽ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sd" dir="rtl">
      <body className={`${lateef.variable} font-lateef antialiased bg-gray-50 text-lg md:text-xl leading-relaxed`}>
        <AuthProvider>
          <SchoolProvider>
            <Navigation />
            <main>
              {children}
            </main>
            <FloatingChatbot />
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  )
}