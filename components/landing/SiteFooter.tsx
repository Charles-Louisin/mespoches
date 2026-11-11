import Link from 'next/link'
import AppLogo from '@/components/AppLogo'
import SaasIndexBadge from '@/components/store/SaasIndexBadge'

/** Pied de page commun à la landing et aux pages du site public. */
export default function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-shell lp-footer-row">
        <Link href="/" className="lp-brand">
          <AppLogo size="xs" />
          <span>MES POCHES</span>
        </Link>
        <SaasIndexBadge />
        <nav aria-label="Liens légaux">
          <Link href="/legal">Informations légales</Link>
          <Link href="/legal/privacy">Confidentialité</Link>
          <Link href="/legal/terms">Conditions</Link>
          <Link href="/legal/mentions">Mentions légales</Link>
          <Link href="/suppression-compte">Supprimer mon compte</Link>
          <Link href="/login">Connexion</Link>
        </nav>
        <p className="lp-copy">© {new Date().getFullYear()} MES POCHES</p>
      </div>
    </footer>
  )
}
