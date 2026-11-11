import type { Metadata } from 'next'
import { outfit } from '@/lib/fonts'
import { SITE_URL } from '@/lib/site'
import Landing from '@/components/landing/Landing'

export const metadata: Metadata = {
  title: 'MES POCHES — Chaque franc retrouve sa poche',
  description:
    'Cash, mobile money et banque au même endroit. MES POCHES lit les notifications de vos paiements Mobile Money, scanne vos tickets et écoute vos notes vocales. Gratuit sur Android, 1 mois Pro offert.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MES POCHES — Chaque franc retrouve sa poche',
    description:
      'L’app qui note vos dépenses à votre place : notifications Mobile Money, tickets, notes vocales. Gratuit sur Android.',
    url: '/',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'MES POCHES',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'MES POCHES' }],
  },
}

/** Données structurées : Google comprend qu'il s'agit d'une application Android de finances personnelles. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'MES POCHES',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      email: 'contact@mespoches.store',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MES POCHES',
      operatingSystem: 'Android',
      applicationCategory: 'FinanceApplication',
      inLanguage: 'fr',
      url: SITE_URL,
      image: `${SITE_URL}/logo.png`,
      description:
        'Suivi de budget : cash, mobile money et banque au même endroit. Détection des transactions Mobile Money, scan de tickets et notes vocales.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'XAF' },
    },
  ],
}

export default function HomePage() {
  return (
    <div className={outfit.variable}>
      <script
        type="application/ld+json"
        // Contenu statique défini ci-dessus, sans donnée utilisateur.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Landing />
    </div>
  )
}
