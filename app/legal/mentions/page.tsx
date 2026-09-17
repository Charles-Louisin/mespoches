import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout'
import Link from 'next/link'

export const metadata = {
  title: 'Mentions légales — MES POCHES',
}

export default function LegalNoticePage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
  const publisher = process.env.NEXT_PUBLIC_LEGAL_PUBLISHER?.trim() || 'MBOKO CODE'

  return (
    <LegalPageLayout
      title="Mentions légales"
      intro="Informations relatives à l’éditeur du site et de l’application MES POCHES."
    >
      <LegalSection title="Éditeur">
        <p>
          <strong>MES POCHES</strong> — application de gestion financière personnelle.
        </p>
        <p>
          Édité par : <strong>{publisher}</strong>
        </p>
        {contactEmail ? (
          <p>
            Contact : <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
        ) : (
          <p>Contact : via l’adresse e-mail associée à votre compte dans l’application.</p>
        )}
      </LegalSection>

      <LegalSection title="Site et application">
        <p>
          Ce site présente le service, permet le téléchargement de l’APK Android et
          publie les informations légales. L’usage quotidien du suivi financier se fait
          dans l’application mobile. MES POCHES n’est pas encore disponible sur Google
          Play ni sur l’App Store. Un fichier iOS (.ipa) sera proposé ultérieurement.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site et les services associés sont hébergés auprès de prestataires
          professionnels, accessibles via une connexion sécurisée (HTTPS). Les données de
          compte sont traitées sur une infrastructure distincte, opérée pour le
          fonctionnement du service.
        </p>
      </LegalSection>

      <LegalSection title="Prestataires">
        <ul>
          <li>Paiement de l’abonnement, le cas échéant : CinetPay.</li>
          <li>Envoi des e-mails de service (vérification, récupération de compte).</li>
          <li>Stockage des images que vous ajoutez volontairement dans l’application.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L’ensemble des éléments du site et de l’application (textes, identité visuelle,
          structure) est protégé. Toute reproduction non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données est décrit dans la{' '}
          <Link href="/legal/privacy">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Signalement">
        <p>
          Pour signaler un problème ou une utilisation abusive du service
          {contactEmail ? (
            <>
              , écrivez à{' '}
              <a href={`mailto:${contactEmail}?subject=Signalement%20MES%20POCHES`}>
                {contactEmail}
              </a>
            </>
          ) : (
            <> , utilisez l’e-mail de votre compte dans l’application</>
          )}
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
