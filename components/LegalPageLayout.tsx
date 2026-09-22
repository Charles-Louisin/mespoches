import Link from 'next/link'
import StoreChrome from '@/components/store/StoreChrome'
import LegalNav from '@/components/LegalNav'

interface LegalPageLayoutProps {
  title: string
  updated?: string
  intro?: string
  children: React.ReactNode
}

export default function LegalPageLayout({
  title,
  updated = '17 septembre 2026',
  intro,
  children,
}: LegalPageLayoutProps) {
  return (
    <StoreChrome bare>
      <div className="legal-page">
        <aside className="legal-aside">
          <p className="legal-kicker">Documents</p>
          <LegalNav />
          <Link href="/" className="legal-back">
            Retour à l’accueil
          </Link>
        </aside>
        <article className="legal-panel">
          <p className="legal-kicker">Informations légales</p>
          <h1 className="legal-title">{title}</h1>
          {intro ? <p className="legal-intro">{intro}</p> : null}
          <p className="legal-updated">Dernière mise à jour : {updated}</p>
          <div className="legal-body">{children}</div>
        </article>
      </div>
    </StoreChrome>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="legal-section-body">{children}</div>
    </section>
  )
}
