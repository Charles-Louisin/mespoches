import type { Metadata } from 'next'
import { outfit } from '@/lib/fonts'
import Landing from '@/components/landing/Landing'


export const metadata: Metadata = {
  title: 'MES POCHES — Chaque franc retrouve sa poche',
  description:
    'Cash, mobile money et banque au même endroit. MES POCHES lit vos SMS de transaction, scanne vos tickets et écoute vos notes vocales. Gratuit sur Android, 1 mois Pro offert.',
  openGraph: {
    title: 'MES POCHES — Chaque franc retrouve sa poche',
    description:
      'L’app qui note vos dépenses à votre place : SMS mobile money, tickets, notes vocales. Gratuit sur Android.',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function HomePage() {
  return (
    <div className={outfit.variable}>
      <Landing />
    </div>
  )
}
