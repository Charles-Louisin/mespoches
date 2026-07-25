import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';
import { SUBSCRIPTION_PLANS } from '@/lib/planLimits';
import { formatCurrency } from '@/lib/utils';

export const metadata = {
  title: "Conditions d'utilisation — MES POCHES",
};

export default function TermsPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const monthly = SUBSCRIPTION_PLANS.monthly;
  const yearly = SUBSCRIPTION_PLANS.yearly;

  return (
    <LegalPageLayout title="Conditions d'utilisation">
      <p className="text-xs text-gray-500">Dernière mise à jour : mai 2026</p>

      <LegalSection title="1. Objet">
        <p>
          Les présentes conditions régissent l&apos;utilisation de l&apos;application{' '}
          <strong>MES POCHES</strong>, service de gestion financière personnelle (suivi de
          poches, transactions, catégories, statistiques et fonctionnalités associées). En
          créant un compte ou en utilisant l&apos;application, vous acceptez ces conditions.
        </p>
      </LegalSection>

      <LegalSection title="2. Nature du service">
        <p>
          MES POCHES est un outil d&apos;aide à la gestion personnelle de finances.{' '}
          <strong>
            Ce n&apos;est pas une banque, un établissement de paiement ni un conseil
            financier réglementé.
          </strong>{' '}
          Vous restez seul responsable de vos décisions financières et de l&apos;exactitude
          des informations saisies.
        </p>
      </LegalSection>

      <LegalSection title="3. Compte utilisateur">
        <ul className="list-disc pl-5 space-y-1">
          <li>Inscription avec adresse e-mail et mot de passe.</li>
          <li>
            Une vérification par code envoyé par e-mail peut être requise à
            l&apos;inscription.
          </li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
          <li>
            Vous pouvez supprimer votre compte depuis la page Profil ; cette action est
            irréversible et supprime vos données associées sur nos serveurs.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Formules Gratuit et Premium">
        <p>
          <strong>Formule gratuite</strong> (sans abonnement payant) : accès aux
          fonctionnalités de base, notamment gestion des poches, saisie de revenus et
          dépenses, catégories limitées (10 par type revenu/dépense), historique des
          transactions limité aux 3 derniers mois, dépenses prévues, et autres écrans
          accessibles sans badge Premium dans l&apos;application.
        </p>
        <p>
          <strong>Formule Premium</strong> (abonnement payant) : débloque notamment les
          transferts entre poches, l&apos;historique complet, les catégories illimitées,
          les images personnalisées pour poches/catégories, les analyses avancées, les
          budgets mensuels par catégorie, les objectifs d&apos;épargne, les transactions
          récurrentes et l&apos;export des transactions (CSV, PDF, Excel selon les options
          proposées dans l&apos;app).
        </p>
        <p>
          Tarifs affichés dans l&apos;application au moment de la souscription :{' '}
          {formatCurrency(monthly.priceXaf)}
          {monthly.periodLabel} (mensuel) ou {formatCurrency(yearly.priceXaf)}
          {yearly.periodLabel} (annuel), en francs CFA (XAF). Les prix peuvent être
          révisés ; le tarif applicable est celui affiché avant validation du paiement.
        </p>
      </LegalSection>

      <LegalSection title="5. Paiement Premium">
        <p>
          Le paiement de l&apos;abonnement Premium est traité par <strong>CinetPay</strong>{' '}
          (Mobile Money MTN ou Orange, carte bancaire selon les moyens proposés au moment
          du paiement, pour le Cameroun en XAF). MES POCHES ne stocke pas vos coordonnées
          bancaires complètes ; le paiement s&apos;effectue sur l&apos;interface sécurisée
          de CinetPay ou via leur flux de paiement intégré.
        </p>
        <p>
          L&apos;activation Premium intervient après confirmation du paiement par notre
          système (vérification du statut auprès de CinetPay). En cas de litige de
          paiement, contactez-nous
          {contactEmail ? (
            <>
              {' '}
              à{' '}
              <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">
                {contactEmail}
              </a>
            </>
          ) : (
            <> via votre e-mail de compte</>
          )}{' '}
          en indiquant la référence de transaction affichée après le paiement.
        </p>
      </LegalSection>

      <LegalSection title="6. Utilisation de l'application">
        <p>
          L&apos;application mobile peut détecter automatiquement vos opérations Mobile Money
          (SMS et notifications) pour proposer des transactions à valider. Le scan de reçus
          par photo est disponible depuis la création de transaction (abonnés Premium).
        </p>
        <p className="mt-2">Vous vous engagez à :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Utiliser l&apos;application conformément aux lois applicables.</li>
          <li>Ne pas tenter d&apos;accéder aux comptes d&apos;autres utilisateurs.</li>
          <li>Valider chaque proposition détectée avant enregistrement définitif.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Disponibilité et évolutions">
        <p>
          Nous nous efforçons d&apos;assurer la disponibilité du service, sans garantie
          d&apos;absence d&apos;interruption. Des mises à jour, corrections ou modifications
          de fonctionnalités peuvent intervenir. Le mode hors ligne permet une utilisation
          limitée ; la synchronisation nécessite une connexion Internet.
        </p>
      </LegalSection>

      <LegalSection title="8. Propriété intellectuelle">
        <p>
          L&apos;application, son interface et ses contenus (hors données que vous saisissez)
          restent protégés. Vous conservez la propriété des données financières que vous
          entrez dans l&apos;application.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation de responsabilité">
        <p>
          Dans les limites autorisées par la loi, MES POCHES ne saurait être tenu
          responsable des pertes financières liées à vos décisions, aux erreurs de saisie,
          aux indisponibilités temporaires du service ou aux actions de prestataires tiers
          (hébergeur, CinetPay, opérateurs Mobile Money).
        </p>
      </LegalSection>

      <LegalSection title="10. Résiliation">
        <p>
          Vous pouvez cesser d&apos;utiliser le service et supprimer votre compte à tout
          moment. Nous pouvons suspendre un compte en cas de violation grave des présentes
          conditions.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions relatives aux conditions :
          {contactEmail ? (
            <>
              {' '}
              <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">
                {contactEmail}
              </a>
            </>
          ) : (
            <> contactez-nous via l&apos;e-mail associé à votre compte dans l&apos;application.</>
          )}
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
