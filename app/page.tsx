import type { Metadata } from 'next'
import StoreLanding from '@/components/store/StoreLanding'

export const metadata: Metadata = {
  title: 'MES POCHES — Télécharger l’application',
  description:
    'Gérez cash, mobile money et banque. Notifications, scan de tickets et dictée. Pas encore sur les stores — téléchargez l’APK Android.',
}

export default function HomePage() {
  return <StoreLanding />
}
