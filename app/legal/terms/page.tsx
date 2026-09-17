import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout'
import { SUBSCRIPTION_PLANS } from '@/lib/planLimits'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: "Conditions d'utilisation — MES POCHES",
}

export default function TermsPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()
  const monthly = SUBSCRIPTION_PLANS.monthly
  const yearly = SUBSCRIPTION_PLANS.yearly

  return (
    <LegalPageLayout
      title="Conditions d’utilisation"
      intro="Les présentes conditions régissent l’accès au site MES POCHES et l’usage de l’application mobile de gestion financière personnelle."
    >
      <LegalSection title="1. Objet">
        <p>
          MES POCHES est un service d’aide au suivi de vos poches (espèces, mobile money,
          compte bancaire) et de vos mouvements. En créant un compte, en téléchargeant
          l’application ou en utilisant le service, vous acceptez ces conditions.
        </p>
      </LegalSection>

      <LegalSection title="2. Nature du service">
        <p>
          MES POCHES est un outil d’information personnelle.{' '}
          <strong>
            Ce n’est pas une banque, un établissement de paiement, un service de transfert
            d’argent ni un conseil financier réglementé.
          </strong>{' '}
          L’application n’exécute aucune opération sur vos comptes d’opérateur ou bancaires
          et ne détient pas vos fonds. Vous restez seul responsable de vos décisions
          financières et de l’exactitude des informations que vous enregistrez.
        </p>
      </LegalSection>

      <LegalSection title="3. Distribution de l’application">
        <p>
          L’application est actuellement disponible en téléchargement direct au format APK
          Android depuis ce site. Elle n’est pas encore distribuée via Google Play ni l’App
          Store. Un fichier iOS (.ipa) sera proposé ultérieurement. Téléchargez uniquement
          l’APK depuis ce site. L’éditeur ne saurait être tenu responsable d’une copie
          obtenue auprès d’un tiers.
        </p>
      </LegalSection>

      <LegalSection title="4. Compte utilisateur">
        <ul>
          <li>L’inscription s’effectue avec une adresse e-mail et un mot de passe, ou via un prestataire d’identité s’il est proposé.</li>
          <li>Une vérification de l’e-mail peut être exigée avant l’activation complète du compte.</li>
          <li>Vous êtes responsable de la confidentialité de vos identifiants.</li>
          <li>
            Vous pouvez supprimer votre compte depuis l’application. Cette action est
            irréversible et supprime les données associées sur nos serveurs, sous réserve
            des obligations légales.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Formules Gratuit et Premium">
        <p>
          <strong>Essai</strong> : un nouveau compte vérifié peut bénéficier d’une période
          d’essai aux fonctionnalités Premium, d’une durée d’un mois calendaire. À l’issue
          de l’essai, le compte revient à la formule gratuite sauf souscription. Aucun
          prélèvement n’est déclenché sans action de votre part.
        </p>
        <p>
          <strong>Formule gratuite</strong> : accès aux fonctions de suivi de base
          (poches, saisie, historique récent, catégories dans la limite indiquée dans
          l’application).
        </p>
        <p>
          <strong>Formule Premium</strong> : débloque les fonctions avancées présentées
          dans l’application au moment de la souscription (notamment historique étendu,
          analyses, budgets, objectifs, récurrences, personnalisation et export, selon
          l’offre en vigueur).
        </p>
        <p>
          Tarifs affichés dans l’application avant paiement : {formatCurrency(monthly.priceXaf)}
          {monthly.periodLabel} ou {formatCurrency(yearly.priceXaf)}
          {yearly.periodLabel}, en francs CFA (XAF). Le prix applicable est celui affiché
          au moment de la validation.
        </p>
      </LegalSection>

      <LegalSection title="6. Paiement">
        <p>
          L’abonnement Premium, lorsqu’il est proposé, est encaissé par un prestataire de
          paiement (CinetPay), selon les moyens affichés au moment de la souscription
          (Mobile Money et/ou carte). MES POCHES ne conserve pas vos coordonnées de
          paiement secrètes. L’activation intervient après confirmation du paiement. En cas
          de difficulté
          {contactEmail ? (
            <>
              , écrivez à <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </>
          ) : (
            <> , contactez-nous via l’e-mail de votre compte</>
          )}{' '}
          en indiquant la référence affichée après l’opération.
        </p>
      </LegalSection>

      <LegalSection title="7. Usage de l’application">
        <p>Vous vous engagez à :</p>
        <ul>
          <li>utiliser le service conformément aux lois applicables ;</li>
          <li>ne pas tenter d’accéder au compte d’un tiers ;</li>
          <li>
            valider, modifier ou ignorer chaque proposition issue d’un SMS, d’une
            notification, d’un scan ou d’une dictée avant de la considérer comme
            enregistrée ;
          </li>
          <li>ne pas détourner l’application à des fins frauduleuses.</li>
        </ul>
        <p>
          Les permissions Android (SMS, notifications, appareil photo, microphone, stockage
          local) sont optionnelles au regard des fonctions correspondantes. Les retirer
          peut limiter certaines fonctionnalités, sans empêcher une saisie manuelle.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilité">
        <p>
          Nous nous efforçons d’assurer un service continu, sans garantir l’absence
          d’interruption. Des mises à jour peuvent modifier des fonctions. Le mode hors
          ligne permet un usage limité ; la synchronisation nécessite une connexion.
        </p>
      </LegalSection>

      <LegalSection title="9. Propriété intellectuelle">
        <p>
          L’application, le site, la marque et les éléments de design restent protégés.
          Vous conservez la propriété des informations financières que vous y enregistrez.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation de responsabilité">
        <p>
          Dans les limites autorisées par la loi, MES POCHES ne saurait être tenu
          responsable des pertes liées à vos décisions, à une saisie inexacte, à une
          indisponibilité temporaire, à une installation depuis une source non officielle,
          ou aux actes d’un prestataire ou d’un opérateur tiers.
        </p>
      </LegalSection>

      <LegalSection title="11. Résiliation">
        <p>
          Vous pouvez cesser d’utiliser le service et supprimer votre compte à tout
          moment. Nous pouvons suspendre un compte en cas de violation grave des présentes
          conditions.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Pour toute question relative à ces conditions
          {contactEmail ? (
            <>
              : <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </>
          ) : (
            <> , contactez-nous via l’e-mail associé à votre compte.</>
          )}
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
