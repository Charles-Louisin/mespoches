import type { Metadata } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import { Toaster } from 'sonner'
import Providers from '@/components/Providers'
import { SITE_URL } from '@/lib/site'
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
  // Base des URL absolues (canonique, Open Graph) : indispensable pour l'indexation.
  metadataBase: new URL(SITE_URL),
  title: 'MES POCHES — Gestion financière',
  description:
    'Application mobile de gestion financière. Téléchargez MES POCHES pour Android.',
  applicationName: 'MES POCHES',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    siteName: 'MES POCHES',
    type: 'website',
    locale: 'fr_FR',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'MES POCHES' }],
  },
  verification: {
    google: 'RVafmc-RMHhi3At9jbpUHXBCtf9bD9Dz8YolzToMpS8',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className={`${figtree.className} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors duration={3000} />
      </body>
    </html>
  )
}
