import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Votre compte — MES POCHES',
  robots: { index: false, follow: false, nocache: true },
}

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return children
}
