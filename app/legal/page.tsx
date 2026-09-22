import Link from 'next/link'
import StoreChrome from '@/components/store/StoreChrome'
import LegalNav from '@/components/LegalNav'

export const metadata = {
  title: 'Informations légales — MES POCHES',
}

export default function LegalIndexPage() {
  return (
    <StoreChrome bare>
      <div className="legal-index">
        <header className="legal-index-hero">
          <p className="legal-kicker">MES POCHES</p>
          <h1 className="legal-title">Informations légales</h1>
          <p className="legal-intro">
            Documents applicables au site et à l’application Android. Lisez-les avant
            d’installer l’APK ou de créer un compte. L’application n’est pas encore
            distribuée via les stores.
          </p>
        </header>
        <LegalNav variant="cards" />
        <p className="legal-index-note">
          Dernière mise à jour : 17 septembre 2026 ·{' '}
          <Link href="/">Retour à l’accueil</Link>
        </p>
      </div>
    </StoreChrome>
  )
}
