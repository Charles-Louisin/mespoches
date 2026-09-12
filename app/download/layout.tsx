import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MES POCHES — Télécharger l’application',
  description:
    'Vos poches, vos soldes, votre rythme. Téléchargez MES POCHES pour Android.',
}

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
