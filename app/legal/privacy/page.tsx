import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata = {
  title: 'Politique de confidentialité — MES POCHES',
};

export default function PrivacyPolicyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <LegalPageLayout title="Confidentialité">
      <p className="text-xs text-gray-500">Dernière mise à jour : mai 2026</p>

      <LegalSection title="1. Responsable du traitement">
        <p>
          L&apos;application <strong>MES POCHES</strong> est un service de gestion
          financière personnelle. Pour toute question relative à vos données, vous
          pouvez nous contacter{contactEmail ? (
            <>
              {' '}
              à l&apos;adresse{' '}
              <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">
                {contactEmail}
              </a>
            </>
          ) : (
            <> via les paramètres de l&apos;application (section Profil, adresse e-mail de votre compte)</>
          )}
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Dans le cadre de l&apos;utilisation de l&apos;application, nous traitons notamment :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Compte</strong> : adresse e-mail, nom (optionnel), mot de passe
            (stocké de manière sécurisée côté serveur), date de création du compte.
          </li>
          <li>
            <strong>Données financières que vous saisissez</strong> : poches (portefeuilles),
            transactions (revenus, dépenses, transferts), catégories, budgets, objectifs
            d&apos;épargne, dépenses prévues, transactions récurrentes (fonctionnalités
            selon votre formule).
          </li>
          <li>
            <strong>Préférences</strong> : devise d&apos;affichage, paramètres liés au compte
            (ex. masquage de l&apos;aide sur les dépenses prévues).
          </li>
          <li>
            <strong>Abonnement Premium</strong> : statut d&apos;abonnement, identifiants de
            transaction de paiement, dates liées au paiement (via notre prestataire CinetPay).
          </li>
          <li>
            <strong>Images</strong> : photos optionnelles pour les poches et catégories
            (hébergement via UploadThing lorsque vous en ajoutez).
          </li>
          <li>
            <strong>Données techniques</strong> : jeton d&apos;authentification sur votre
            appareil, état de connexion pour la synchronisation, cache local pour le mode
            hors ligne.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalités">
        <ul className="list-disc pl-5 space-y-1">
          <li>Fournir et sécuriser l&apos;accès à votre compte.</li>
          <li>Enregistrer, afficher et synchroniser vos données financières.</li>
          <li>Gérer l&apos;abonnement Premium et les paiements.</li>
          <li>Permettre l&apos;export de vos transactions (abonnés Premium).</li>
          <li>Assurer le support et le fonctionnement technique du service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base légale et conservation">
        <p>
          Le traitement repose sur l&apos;exécution du contrat (utilisation du service) et,
          le cas échéant, votre consentement pour certaines fonctionnalités. Les données sont
          conservées tant que votre compte est actif. Vous pouvez supprimer votre compte
          depuis <strong>Profil</strong> ; cela entraîne la suppression de vos données
          associées sur nos serveurs, sous réserve des obligations légales de conservation.
        </p>
      </LegalSection>

      <LegalSection title="5. Hébergement et sous-traitants">
        <p>Vos données sont traitées via nos infrastructures et prestataires techniques, notamment :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Base de données et API backend (hébergement serveur sécurisé).</li>
          <li>Frontend de l&apos;application (hébergement web).</li>
          <li>
            <strong>CinetPay</strong> : traitement des paiements Mobile Money (MTN, Orange)
            et carte bancaire pour l&apos;abonnement Premium.
          </li>
          <li>
            <strong>UploadThing</strong> : stockage des images que vous téléversez
            (poches, catégories).
          </li>
          <li>
            Service d&apos;envoi d&apos;e-mails pour la vérification de compte à
            l&apos;inscription (lorsque cette fonctionnalité est active).
          </li>
        </ul>
        <p>
          Ces prestataires ne reçoivent que les données nécessaires à leur mission. Les
          paiements sont régis par les conditions de CinetPay.
        </p>
      </LegalSection>

      <LegalSection title="6. Stockage local (hors ligne)">
        <p>
          L&apos;application peut enregistrer certaines données localement sur votre appareil
          (cache, file de synchronisation) pour fonctionner sans connexion et synchroniser
          ultérieurement avec le serveur lorsque vous êtes connecté.
        </p>
      </LegalSection>

      <LegalSection title="7. Vos droits">
        <p>
          Vous pouvez accéder à vos données dans l&apos;application, les modifier, exporter
          (fonction export réservée aux abonnés Premium) et supprimer votre compte. Pour
          toute demande complémentaire, contactez-nous via les coordonnées indiquées en tête
          de document.
        </p>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <p>
          L&apos;accès au compte est protégé par authentification (jeton JWT). Les
          communications avec nos serveurs utilisent HTTPS. Aucun système n&apos;étant
          infaillible, nous vous invitons à protéger vos identifiants.
        </p>
      </LegalSection>

      <LegalSection title="9. Mineurs">
        <p>
          Le service n&apos;est pas destiné aux personnes de moins de 16 ans. Nous ne
          collectons pas sciemment de données concernant des mineurs.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifications">
        <p>
          Cette politique peut être mise à jour. La date en tête de page sera adaptée en cas
          de changement significatif.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
