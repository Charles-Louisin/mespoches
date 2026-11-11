import Link from 'next/link'
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout'

export const metadata = {
  title: 'Politique de confidentialité — MES POCHES',
  description:
    'Données traitées par MES POCHES, accès aux notifications, intelligence artificielle, conservation, suppression du compte et vos droits.',
  alternates: { canonical: '/legal/privacy' },
}

export default function PrivacyPolicyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'contact@mespoches.store'

  return (
    <LegalPageLayout
      title="Politique de confidentialité"
      updated="11 novembre 2026"
      intro="Cette politique décrit, de manière claire, les données que MES POCHES traite, pourquoi, avec qui elles sont partagées et les choix dont vous disposez. Elle s’applique au site web et à l’application Android, qu’elle soit installée depuis Google Play ou depuis ce site."
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          L’application et le site <strong>MES POCHES</strong> sont édités par{' '}
          <strong>{process.env.NEXT_PUBLIC_LEGAL_PUBLISHER?.trim() || 'MBOKO CODE'}</strong>. Pour toute question
          relative à vos données, écrivez à <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Champ d’application">
        <p>
          Le présent document couvre : (i) le site de présentation ; (ii) l’application Android distribuée sur Google
          Play et sous forme de fichier APK depuis ce site ; (iii) le compte utilisateur nécessaire pour utiliser
          l’application.
        </p>
      </LegalSection>

      <LegalSection title="3. Données traitées">
        <p>Selon l’usage que vous faites du service, nous traitons :</p>
        <ul>
          <li>
            <strong>Compte</strong> : adresse e-mail, nom (si vous le renseignez), mot de passe chiffré ou identifiant
            Google si vous vous connectez avec Google, date de création, statut de vérification et réglages de double
            authentification.
          </li>
          <li>
            <strong>Données financières que vous saisissez ou validez</strong> : poches (espèces, mobile money,
            banque), transactions et leurs tâches, catégories, budgets, objectifs d’épargne, récurrences et dépenses
            prévues.
          </li>
          <li>
            <strong>Contenu des notifications liées à l’argent</strong> (si vous activez la détection) : texte des
            notifications d’opérateurs Mobile Money, de banques et des SMS d’opérateurs, nom de l’application émettrice
            et heure de réception. Voir la section 6.
          </li>
          <li>
            <strong>Photos et enregistrements que vous choisissez d’envoyer</strong> : photo d’un ticket ou d’un reçu
            (scan), courte note vocale (dictée), images de poches ou de catégories.
          </li>
          <li>
            <strong>Abonnement</strong> : forfait, montant, statut et références du paiement. MES POCHES ne reçoit
            jamais vos numéros de carte ni vos codes Mobile Money.
          </li>
          <li>
            <strong>Données techniques</strong> : jeton de notification push de l’appareil, identifiant aléatoire
            d’installation, version de l’application et du système, journal des dernières connexions (date, adresse
            IP, type d’appareil) pour la sécurité du compte.
          </li>
          <li>
            <strong>Statistiques d’usage</strong> : écrans ouverts et fonctions utilisées (par exemple « export »),
            rattachés à votre compte, pour améliorer l’application. Elles ne servent jamais à la publicité.
          </li>
          <li>
            <strong>Messages au support</strong> : contenu des messages que vous nous envoyez depuis l’application.
          </li>
        </ul>
        <p>
          Nous ne vous demandons jamais le code secret de vos services Mobile Money ni l’accès à vos comptes bancaires
          en ligne. Nous ne collectons ni vos contacts, ni votre position, ni vos photos sans action de votre part.
        </p>
      </LegalSection>

      <LegalSection title="4. Ce que l’application fait">
        <p>MES POCHES est un outil de suivi personnel. Elle peut, avec votre accord :</p>
        <ul>
          <li>vous aider à enregistrer revenus, dépenses et transferts entre vos poches ;</li>
          <li>
            vous proposer une transaction à partir d’une notification qui décrit un mouvement d’argent, que vous
            validez, modifiez ou ignorez ;
          </li>
          <li>lire un ticket photographié ou une note vocale pour pré-remplir une transaction ;</li>
          <li>vous envoyer des rappels (par exemple chaque soir à 19 h) et des notifications utiles ;</li>
          <li>exporter vos transactions (CSV, Excel, PDF) selon votre forfait ;</li>
          <li>conserver un cache local pour consulter vos données sans réseau.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Ce que l’application ne fait pas">
        <ul>
          <li>
            Elle n’est pas une banque, un établissement de paiement, un portefeuille d’argent électronique ni un
            conseiller financier réglementé. Elle ne propose aucun prêt.
          </li>
          <li>Elle ne détient pas vos fonds et n’exécute aucun virement à votre place.</li>
          <li>Elle n’envoie pas de SMS et n’agit pas sur vos comptes d’opérateur.</li>
          <li>Elle n’enregistre pas une opération détectée sans votre validation.</li>
          <li>
            Elle ne vend pas vos données, ne les partage pas à des fins publicitaires et n’établit pas de profil
            publicitaire à partir de vos finances.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Notifications, appareil photo et micro">
        <p>
          Ces accès sont facultatifs : l’application fonctionne sans eux (saisie manuelle). Vous les accordez dans les
          réglages Android et pouvez les retirer à tout moment.
        </p>
        <ul>
          <li>
            <strong>Accès aux notifications</strong> : avant de l’activer, l’application vous explique ce qu’elle lit.
            Sur le téléphone, elle ne retient que les notifications liées à un mouvement d’argent (opérateurs Mobile
            Money, banques, SMS mentionnant un montant) ; les autres ne quittent pas l’appareil. Les notifications
            retenues sont envoyées à nos serveurs par une connexion chiffrée ; celles qui ne contiennent pas
            d’identifiant de transaction sont aussitôt écartées et ne sont pas conservées. Les autres deviennent des
            propositions que vous validez ou rejetez.
          </li>
          <li>
            <strong>SMS</strong> : l’application ne demande pas l’accès aux SMS et ne lit jamais votre boîte de
            réception. Un SMS d’opérateur n’est vu que sous la forme de la notification qu’il affiche, avec les
            règles ci-dessus.
          </li>
          <li>
            <strong>Appareil photo</strong> : uniquement quand vous scannez un ticket.
          </li>
          <li>
            <strong>Microphone</strong> : uniquement pendant que vous dictez une transaction. L’enregistrement est
            transcrit puis n’est pas conservé sur nos serveurs.
          </li>
          <li>
            <strong>Notifications et alarmes</strong> : pour vous prévenir d’une transaction à valider et vous
            envoyer le rappel du soir.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Intelligence artificielle">
        <p>
          Pour lire un ticket, transcrire une note vocale, analyser une notification ou rédiger le bilan mensuel, le
          texte, l’image ou l’enregistrement concerné est transmis à un service d’intelligence artificielle
          (OpenRouter, qui achemine la demande vers des modèles de Google ou d’OpenAI). Seul le contenu nécessaire
          au traitement est envoyé, sans votre nom ni votre adresse e-mail.
        </p>
      </LegalSection>

      <LegalSection title="8. Finalités">
        <ul>
          <li>Créer et sécuriser votre compte.</li>
          <li>Fournir le suivi de vos poches et la synchronisation entre vos appareils.</li>
          <li>Vous proposer des transactions détectées et pré-remplies.</li>
          <li>Traiter l’abonnement, lorsqu’il est souscrit.</li>
          <li>Assurer le support, la sécurité, la prévention de la fraude et le bon fonctionnement du service.</li>
          <li>Comprendre l’usage de l’application pour l’améliorer.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Base légale et conservation">
        <p>
          Le traitement repose sur l’exécution du contrat (fourniture du service), sur votre consentement pour les
          accès de l’appareil (que vous pouvez retirer), et sur notre intérêt légitime pour la sécurité et la
          prévention de la fraude. Les données de compte et financières sont conservées tant que le compte est actif.
        </p>
        <p>
          Pour éviter qu’un même utilisateur ouvre plusieurs essais gratuits, nous conservons après la suppression une
          empreinte chiffrée et irréversible (HMAC) de votre adresse e-mail, de votre identifiant Google le cas échéant
          et de l’identifiant d’installation. Ces empreintes ne permettent pas de retrouver vos données.
        </p>
      </LegalSection>

      <LegalSection title="10. Suppression du compte">
        <p>
          Vous pouvez supprimer votre compte à tout moment dans l’application (Plus → Profil → Effacer le compte) ou sur
          la page <Link href="/suppression-compte">Supprimer votre compte</Link>. Toutes vos données sont alors
          effacées de nos serveurs, à l’exception des empreintes décrites ci-dessus.
        </p>
      </LegalSection>

      <LegalSection title="11. Prestataires et destinataires">
        <p>
          Vos données ne sont accessibles qu’aux prestataires qui en ont besoin pour faire fonctionner le service, dans
          la limite de leur mission :
        </p>
        <ul>
          <li>hébergement de l’API : Railway ; base de données : MongoDB Atlas ; site web : Vercel ;</li>
          <li>stockage des images de poches et de catégories : UploadThing ;</li>
          <li>envoi des e-mails (vérification, codes, récupération) : Resend ;</li>
          <li>notifications push : Expo ;</li>
          <li>connexion avec Google : Google ;</li>
          <li>intelligence artificielle : OpenRouter, Google, OpenAI (section 7) ;</li>
          <li>paiement de l’abonnement sur le site ou l’APK : SasPay.</li>
        </ul>
        <p>
          Certains de ces prestataires sont situés hors de votre pays, notamment aux États-Unis et dans l’Union
          européenne ; les échanges se font par connexion chiffrée. Nous ne cédons pas vos données à des tiers à des
          fins commerciales.
        </p>
      </LegalSection>

      <LegalSection title="12. Sécurité">
        <p>
          Les échanges entre l’application, le site et nos serveurs sont chiffrés (HTTPS). Les mots de passe sont
          chiffrés, les sessions peuvent être révoquées et la double authentification par e-mail est disponible. Un
          cache local peut exister sur l’appareil pour le mode hors ligne. Aucun système n’étant infaillible, choisissez
          un mot de passe unique et n’installez MES POCHES que depuis Google Play ou ce site officiel.
        </p>
      </LegalSection>

      <LegalSection title="13. Vos droits">
        <p>
          Vous pouvez consulter et modifier vos informations dans l’application, exporter vos transactions selon votre
          forfait, retirer les accès de l’appareil et supprimer votre compte. Pour toute autre demande (accès, copie,
          rectification, opposition), écrivez à <a href={`mailto:${contactEmail}`}>{contactEmail}</a> ; nous répondons
          sous 30 jours.
        </p>
      </LegalSection>

      <LegalSection title="14. Mineurs">
        <p>
          Le service n’est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données
          concernant des mineurs.
        </p>
      </LegalSection>

      <LegalSection title="15. Modifications">
        <p>
          Cette politique peut être mise à jour pour refléter l’évolution du service ou de la réglementation. La date
          indiquée en tête de page fait foi ; en cas de changement important, nous vous prévenons dans l’application.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
