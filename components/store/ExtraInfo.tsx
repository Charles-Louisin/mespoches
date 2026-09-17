import Link from 'next/link'

const PUBLISHER = process.env.NEXT_PUBLIC_LEGAL_PUBLISHER?.trim() || 'MBOKO CODE'
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()

export default function ExtraInfo() {
  return (
    <section className="store-why relative z-10 px-5 pb-20 pt-6 lg:px-8">
      <div className="store-meta mx-auto max-w-3xl">
        <h2 className="font-display text-2xl text-[#111] sm:text-3xl">Informations supplémentaires</h2>

        <Meta label="Publié par">
          <p>{PUBLISHER}</p>
          <p className="mt-1 text-[#5b5270]">MES POCHES — gestion financière personnelle</p>
        </Meta>

        <Meta label="Date de sortie">
          <p>17/09/2026</p>
        </Meta>

        <Meta label="Taille approximative du fichier APK">
          <p>Environ 55 Mo (APK Android, selon l’appareil)</p>
        </Meta>

        <Meta label="Catégorie">
          <p>Finance</p>
        </Meta>

        <Meta label="Installation">
          <p>
            Téléchargez l’APK depuis ce site, sur un appareil Android. L’application n’est pas
            encore distribuée via Google Play ni l’App Store. Le fichier{' '}
            <span className="font-medium text-[#1b1630]">.ipa </span> iOS sera proposé ultérieurement.
          </p>
        </Meta>

        <Meta label="Cette application peut">
          <ul>
            <li>Proposer des transactions à partir de SMS ou de notifications liés à un mouvement d’argent — à valider par vos soins</li>
            <li>Utiliser l’appareil photo pour scanner un reçu</li>
            <li>Utiliser le microphone pour une note vocale</li>
            <li>Conserver un cache sur l’appareil (usage hors ligne)</li>
          </ul>
        </Meta>
        <Meta label="Informations sur l’éditeur">
          <p>{PUBLISHER}</p>
          {CONTACT ? (
            <p className="mt-1">
              Contact :{' '}
              <a href={`mailto:${CONTACT}`} className="text-[#2563EB] hover:underline">
                {CONTACT}
              </a>
            </p>
          ) : null}
        </Meta>

        <Meta label="Conditions supplémentaires">
          <p>
            <Link href="/legal/terms" className="text-[#2563EB] hover:underline">
              Conditions d’utilisation
            </Link>
            {' · '}
            <Link href="/legal/privacy" className="text-[#2563EB] hover:underline">
              Politique de confidentialité
            </Link>
            {' · '}
            <Link href="/legal/mentions" className="text-[#2563EB] hover:underline">
              Mentions légales
            </Link>
          </p>
        </Meta>

        <Meta label="Signaler ce produit">
          {CONTACT ? (
            <p>
              <a href={`mailto:${CONTACT}?subject=Signalement%20MES%20POCHES`} className="text-[#2563EB] hover:underline">
                Signaler un problème
              </a>
            </p>
          ) : (
            <p>
              <Link href="/legal" className="text-[#2563EB] hover:underline">
                Informations légales
              </Link>
            </p>
          )}
        </Meta>

        <Meta label="Clause d’exclusion de responsabilité légale">
          <p>
            L’éditeur certifie proposer uniquement des produits et services conformes aux lois
            applicables, y compris celles de l’Union européenne lorsque le service y est offert.
            MES POCHES n’est pas un établissement de paiement : l’application aide à suivre vos
            comptes, elle ne détient pas vos fonds.
          </p>
        </Meta>
      </div>
    </section>
  )
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="store-meta-row">
      <h3>{label}</h3>
      <div>{children}</div>
    </div>
  )
}
