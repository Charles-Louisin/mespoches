import SiteChrome from '@/components/landing/SiteChrome'
import LegalNav from '@/components/LegalNav'

interface LegalPageLayoutProps {
  title: string
  updated?: string
  intro?: string
  children: React.ReactNode
}

/** Pages légales : même en-tête, typographie et couleurs que la page d'accueil. */
export default function LegalPageLayout({
  title,
  updated = '17 septembre 2026',
  intro,
  children,
}: LegalPageLayoutProps) {
  return (
    <SiteChrome>
      <div className="lp-legal-hero">
        <div className="lp-shell">
          <h1 className="lp-legal-title">{title}</h1>
          {intro ? <p className="lp-legal-intro">{intro}</p> : null}
          <p className="lp-legal-updated">Mise à jour le {updated}</p>
        </div>
      </div>
      <div className="lp-shell lp-legal-grid">
        <aside className="lp-legal-aside">
          <LegalNav />
        </aside>
        <article className="lp-legal-body">{children}</article>
      </div>
    </SiteChrome>
  )
}

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={slug(title)} className="lp-legal-section">
      <h2>{title}</h2>
      <div className="lp-legal-section-body">{children}</div>
    </section>
  )
}
