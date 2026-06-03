import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata = {
  title: 'Mentions légales — MES POCHES',
};

export default function LegalNoticePage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const publisher = process.env.NEXT_PUBLIC_LEGAL_PUBLISHER?.trim();

  return (
    <LegalPageLayout title="Mentions légales">
      <p className="text-xs text-gray-500">Dernière mise à jour : mai 2026</p>

      <LegalSection title="Éditeur de l'application">
        <p>
          <strong>MES POCHES</strong> — application de gestion financière personnelle.
        </p>
        {publisher ? (
          <p>
            Édité par : <strong>{publisher}</strong>
          </p>
        ) : (
          <p>
            Éditeur : responsable de la publication de l&apos;application MES POCHES (coordonnées
            de contact ci-dessous).
          </p>
        )}
        {contactEmail && (
          <p>
            Contact :{' '}
            <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">
              {contactEmail}
            </a>
          </p>
        )}
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          L&apos;interface web et l&apos;application mobile (wrapper) s&apos;appuient sur un
          frontend hébergé en ligne (HTTPS). Les données de compte et financières sont
          traitées par une API backend hébergée sur une infrastructure cloud séparée.
        </p>
        <p>
          Les URLs exactes de production sont celles configurées lors du déploiement de
          votre instance (frontend et API).
        </p>
      </LegalSection>

      <LegalSection title="Prestataires tiers">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>CinetPay</strong> — paiement de l&apos;abonnement Premium (Mobile Money,
            carte).
          </li>
          <li>
            <strong>UploadThing</strong> — hébergement des images téléversées (poches,
            catégories), lorsque vous utilisez cette fonctionnalité.
          </li>
          <li>Prestataire d&apos;e-mails — envoi des codes de vérification à l&apos;inscription.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments de l&apos;application (textes, design, logo, structure)
          est protégé. Toute reproduction non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la{' '}
          <a href="/legal/privacy" className="text-primary-600 underline">
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Signalement">
        <p>
          Pour signaler un problème technique ou une demande relative au service, utilisez
          l&apos;application (Profil / Paramètres)
          {contactEmail ? (
            <>
              {' '}
              ou écrivez à{' '}
              <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">
                {contactEmail}
              </a>
            </>
          ) : (
            <> avec l&apos;adresse e-mail de votre compte</>
          )}
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
