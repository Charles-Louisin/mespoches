import SiteChrome from '@/components/landing/SiteChrome'
import LegalNav from '@/components/LegalNav'

export const metadata = {
  title: "Informations légales — MES POCHES",
  description:
    "Politique de confidentialité, conditions d’utilisation, mentions légales et suppression de compte de l’application MES POCHES.",
  alternates: { canonical: "/legal" },
}

export default function LegalIndexPage() {
  return (
    <SiteChrome>
      <div className="lp-legal-hero">
        <div className="lp-shell">
          <h1 className="lp-legal-title">Informations légales</h1>
          <p className="lp-legal-intro">
            Les documents qui s’appliquent au site et à l’application Android. Lisez-les avant d’installer l’APK ou de
            créer un compte.
          </p>
          <p className="lp-legal-updated">Mise à jour le 17 septembre 2026</p>
        </div>
      </div>
      <div className="lp-shell lp-legal-index">
        <LegalNav variant="cards" />
      </div>
    </SiteChrome>
  )
}
