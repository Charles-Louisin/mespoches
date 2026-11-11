import type { Metadata } from 'next'
import { outfit } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Espace interne — MES POCHES',
  robots: { index: false, follow: false, nocache: true },
}

/** Console : même police que le site et l'application (Outfit). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${outfit.variable} ad-font`}>{children}</div>
}
