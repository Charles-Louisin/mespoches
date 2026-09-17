import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout'

export const metadata = {
  title: 'Politique de confidentialité — MES POCHES',
}

export default function PrivacyPolicyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()

  return (
    <LegalPageLayout
      title="Politique de confidentialité"
      intro="Cette politique décrit, de manière claire, les données que MES POCHES traite, pourquoi, et les choix dont vous disposez. Elle s’applique au site web et à l’application mobile Android."
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          L’application et le site <strong>MES POCHES</strong> sont édités par{' '}
          <strong>{process.env.NEXT_PUBLIC_LEGAL_PUBLISHER?.trim() || 'MBOKO CODE'}</strong>.
          Pour toute question relative à vos données
          {contactEmail ? (
            <>
              , vous pouvez écrire à{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </>
          ) : (
            <> , utilisez l’adresse e-mail associée à votre compte dans l’application</>
          )}
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Champ d’application">
        <p>
          Le présent document couvre : (i) le site de présentation et de téléchargement ; (ii)
          l’application Android distribuée sous forme de fichier APK depuis ce site ; (iii) le
          compte utilisateur nécessaire pour utiliser l’application. L’application n’est pas
          encore proposée sur Google Play ni sur l’App Store.
        </p>
      </LegalSection>

      <LegalSection title="3. Données traitées">
        <p>Selon l’usage que vous faites du service, nous pouvons traiter :</p>
        <ul>
          <li>
            <strong>Compte</strong> : adresse e-mail, nom (si vous le renseignez), identifiants
            de connexion, date de création du compte et statut de vérification de l’e-mail.
          </li>
          <li>
            <strong>Données financières que vous validez</strong> : poches (par exemple espèces,
            mobile money, banque), transactions, catégories, et, selon la formule, éléments
            associés tels que budgets, objectifs ou récurrences.
          </li>
          <li>
            <strong>Préférences</strong> : paramètres d’affichage de votre compte (devise, options
            d’interface).
          </li>
          <li>
            <strong>Abonnement</strong> : statut de formule, références de paiement nécessaires
            au suivi d’un abonnement, sans conservation de vos coordonnées de paiement complètes
            par MES POCHES.
          </li>
          <li>
            <strong>Fichiers que vous ajoutez</strong> : images optionnelles (poches, catégories)
            et, si vous utilisez le scan, la photo d’un reçu que vous capturez.
          </li>
          <li>
            <strong>Données techniques utiles au service</strong> : session authentifiée sur
            l’appareil, cache local permettant un usage hors ligne, puis synchronisation lorsque
            une connexion est disponible.
          </li>
        </ul>
        <p>
          Le mot de passe n’est pas stocké en clair. Nous ne vous demandons pas le code secret
          de vos services Mobile Money, ni l’accès à vos comptes bancaires en ligne.
        </p>
      </LegalSection>

      <LegalSection title="4. Ce que l’application fait">
        <p>MES POCHES est un outil de suivi personnel. Elle peut, avec votre accord :</p>
        <ul>
          <li>Vous aider à enregistrer revenus, dépenses et transferts entre vos poches.</li>
          <li>
            Proposer une transaction à partir d’un SMS ou d’une notification qui semble concerner
            un mouvement d’argent, afin que vous la validiez, la modifiiez ou l’ignoriez.
          </li>
          <li>Vous permettre de photographier un reçu pour en extraire les informations utiles.</li>
          <li>Vous permettre de dicter une opération courte (note vocale).</li>
          <li>Conserver un cache local pour continuer à consulter vos données sans réseau.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Ce que l’application ne fait pas">
        <ul>
          <li>
            Elle n’est pas une banque, un établissement de paiement, un portefeuille d’argent
            électronique ni un conseiller financier réglementé.
          </li>
          <li>Elle ne détient pas vos fonds et n’exécute aucun virement à votre place.</li>
          <li>Elle n’envoie pas de SMS et n’opère pas sur vos comptes d’opérateur.</li>
          <li>
            Elle n’enregistre pas une opération détectée comme définitive sans votre validation.
          </li>
          <li>
            Elle ne revend pas vos données personnelles à des annonceurs et n’élabore pas de
            profil publicitaire à partir de vos finances.
          </li>
          <li>
            Elle ne remplace pas vos relevés officiels (opérateur, banque). Vous restez
            responsable de l’exactitude des informations que vous conservez dans l’app.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. SMS, notifications, appareil photo et micro">
        <p>
          Sur Android, certaines fonctions s’appuient sur des permissions que vous accordez
          librement, et que vous pouvez retirer à tout moment dans les réglages du système :
        </p>
        <ul>
          <li>
            <strong>SMS et notifications</strong> : uniquement pour repérer des messages
            susceptibles de décrire un mouvement d’argent, puis vous proposer une ligne à
            valider. Les messages sans rapport avec cet usage ne sont pas destinés à alimenter
            votre historique.
          </li>
          <li>
            <strong>Appareil photo</strong> : pour le scan d’un ticket ou d’un reçu, à votre
            initiative.
          </li>
          <li>
            <strong>Microphone</strong> : pour une saisie vocale, à votre initiative.
          </li>
        </ul>
        <p>
          Ces accès servent exclusivement les fonctionnalités décrites. Ils ne donnent pas à
          MES POCHES un contrôle sur vos applications bancaires ou Mobile Money.
        </p>
      </LegalSection>

      <LegalSection title="7. Finalités">
        <ul>
          <li>Créer et sécuriser votre compte.</li>
          <li>Fournir le suivi de vos poches et la synchronisation entre vos appareils.</li>
          <li>Traiter l’abonnement, lorsqu’il est souscrit.</li>
          <li>Assurer le support, la sécurité et le bon fonctionnement du service.</li>
          <li>Respecter nos obligations légales, le cas échéant.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Base légale et conservation">
        <p>
          Le traitement repose principalement sur l’exécution du contrat (fourniture du
          service) et, pour les permissions de l’appareil, sur votre consentement, que vous
          pouvez retirer. Les données de compte et financières sont conservées tant que le
          compte est actif. La suppression du compte depuis l’application entraîne l’effacement
          des données associées sur nos serveurs, sous réserve d’éventuelles obligations légales
          de conservation.
        </p>
      </LegalSection>

      <LegalSection title="9. Destinataires">
        <p>
          Vos données ne sont accessibles qu’aux personnes et prestataires qui en ont besoin
          pour opérer le service, dans la limite de leur mission :
        </p>
        <ul>
          <li>hébergement et infogérance des serveurs ;</li>
          <li>envoi des e-mails de vérification ou de récupération de compte ;</li>
          <li>
            paiement de l’abonnement, le cas échéant, via le prestataire de paiement affiché au
            moment de la souscription (aujourd’hui CinetPay) — MES POCHES ne stocke pas vos
            numéros de carte ni vos codes Mobile Money ;
          </li>
          <li>stockage des images que vous choisissez d’ajouter.</li>
        </ul>
        <p>Nous ne cédons pas vos données à des tiers à des fins commerciales.</p>
      </LegalSection>

      <LegalSection title="10. Sécurité">
        <p>
          L’accès au compte est protégé par authentification. Les échanges entre l’application,
          le site et nos serveurs s’effectuent via une connexion chiffrée (HTTPS). Un cache
          local peut exister sur l’appareil pour le mode hors ligne. Aucun système n’étant
          infaillible, nous vous invitons à choisir un mot de passe unique et à ne télécharger
          l’application que depuis ce site officiel.
        </p>
      </LegalSection>

      <LegalSection title="11. Téléchargement de l’APK">
        <p>
          L’application Android est proposée en téléchargement direct (fichier APK) depuis ce
          site. La taille du fichier est d’environ 55 Mo, selon la version et l’appareil. Nous
          vous recommandons de ne jamais installer MES POCHES à partir d’une source tierce.
          L’installation peut nécessiter d’autoriser, dans les réglages Android, les
          applications d’une source externe. Un fichier iOS (.ipa) sera proposé ultérieurement.
        </p>
      </LegalSection>

      <LegalSection title="12. Vos droits">
        <p>
          Vous pouvez consulter et modifier vos informations dans l’application, et supprimer
          votre compte. Selon votre formule, un export de vos transactions peut être proposé.
          Pour une demande complémentaire
          {contactEmail ? (
            <>
              , écrivez à <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </>
          ) : (
            <> , contactez-nous via l’e-mail de votre compte</>
          )}
          .
        </p>
      </LegalSection>

      <LegalSection title="13. Mineurs">
        <p>
          Le service n’est pas destiné aux personnes de moins de 16 ans. Nous ne collectons
          pas sciemment de données concernant des mineurs.
        </p>
      </LegalSection>

      <LegalSection title="14. Modifications">
        <p>
          Cette politique peut être mise à jour pour refléter l’évolution du service ou de la
          réglementation. La date indiquée en tête de page fait foi.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
