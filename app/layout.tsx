import type { Metadata } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import { Toaster } from 'sonner'
import SyncIndicator from '@/components/SyncIndicator'
import Providers from '@/components/Providers'
import CapacitorBridge from '@/components/CapacitorBridge'
import AppBootLoader from '@/components/AppBootLoader'
import NativePermissionsOnLaunch from '@/components/NativePermissionsOnLaunch'
import AutomationBridge from '@/components/AutomationBridge'
import ClientSideInit from '@/components/ClientSideInit'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MES POCHES - Gestion Financière',
  description: 'Application de gestion financière personnelle',
  applicationName: 'MES POCHES',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MES POCHES',
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: 'RVafmc-RMHhi3At9jbpUHXBCtf9bD9Dz8YolzToMpS8',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.ico', sizes: '32x32' }
    ]
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className={`${figtree.className} font-sans`}>
        <ClientSideInit />
        <Providers>{children}</Providers>
        <AppBootLoader />
        <NativePermissionsOnLaunch />
        <AutomationBridge />
        <CapacitorBridge />
        <SyncIndicator />
        <Toaster position="top-center" richColors duration={3000} />
      </body>
    </html>
  )
}
