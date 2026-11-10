import Link from 'next/link'
import AppLogo from '@/components/AppLogo'
import { DownloadApkButton } from '@/components/store/DownloadApkButton'
import SiteFooter from './SiteFooter'
import { outfit } from '@/lib/fonts'
import './landing.css'

/** En-tête + pied de page du site public, identiques à la landing (pages légales, etc.). */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${outfit.variable} lp is-loaded lp-site`}>
      <header className="lp-nav is-scrolled">
        <a href="#contenu" className="lp-skip">
          Aller au contenu
        </a>
        <div className="lp-shell lp-nav-row">
          <Link href="/" className="lp-brand" aria-label="MES POCHES, accueil">
            <AppLogo size="xs" priority />
            <span>MES POCHES</span>
          </Link>
          <div className="lp-nav-cta">
            <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-sm lp-nav-login">
              Connexion
            </Link>
            <DownloadApkButton className="lp-btn lp-btn-primary lp-btn-sm">Télécharger</DownloadApkButton>
          </div>
        </div>
      </header>
      <main id="contenu">{children}</main>
      <SiteFooter />
    </div>
  )
}
