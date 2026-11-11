import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout'
import AccountDeletionPanel from '@/components/AccountDeletionPanel'

export const metadata = {
  title: 'Supprimer votre compte — MES POCHES',
  description:
    'Comment supprimer votre compte MES POCHES et vos données, depuis l’application ou depuis le site, et ce qui est effacé.',
  alternates: { canonical: '/suppression-compte' },
}

const CONTACT = 'contact@mespoches.store'

export default function AccountDeletionPage() {
  return (
    <LegalPageLayout
      title="Supprimer votre compte MES POCHES"
      updated="11 novembre 2026"
      intro="Vous pouvez supprimer votre compte MES POCHES et toutes les données associées à tout moment, depuis l’application ou depuis cette page. La suppression est immédiate et définitive."
    >
      <LegalSection title="1. Depuis l’application">
        <ol>
          <li>Ouvrez MES POCHES et connectez-vous.</li>
          <li>Touchez l’onglet « Plus », puis « Profil ».</li>
          <li>Touchez « Effacer le compte », puis confirmez.</li>
        </ol>
      </LegalSection>

      <LegalSection title="2. Depuis ce site">
        <p>Si l’application n’est plus installée, connectez-vous ici puis confirmez la suppression.</p>
        <AccountDeletionPanel />
      </LegalSection>

      <LegalSection title="3. Par e-mail">
        <p>
          Écrivez à <a href={`mailto:${CONTACT}?subject=Suppression%20de%20compte`}>{CONTACT}</a> depuis l’adresse
          de votre compte, avec l’objet « Suppression de compte ». La demande est traitée sous 30 jours au plus ; nous
          vous confirmons la suppression par retour d’e-mail.
        </p>
      </LegalSection>

      <LegalSection title="4. Données supprimées">
        <ul>
          <li>votre compte : adresse e-mail, nom, mot de passe chiffré, préférences et réglages de sécurité ;</li>
          <li>vos poches, transactions et leurs tâches, catégories, budgets, objectifs d’épargne, récurrences et dépenses prévues ;</li>
          <li>les propositions de transactions détectées (notifications, tickets, notes vocales) et les habitudes apprises ;</li>
          <li>l’historique de vos paiements d’abonnement, vos messages au support et vos statistiques d’usage.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Données conservées">
        <p>
          Seule une empreinte chiffrée et irréversible (HMAC) de votre adresse e-mail, de votre identifiant Google et de
          l’identifiant d’installation est conservée, pour éviter qu’un même utilisateur obtienne plusieurs essais
          gratuits. Elle ne permet pas de retrouver vos informations. Les éventuelles copies de sauvegarde de
          l’hébergeur disparaissent au fil de leur rotation normale.
        </p>
        <p>
          Les données enregistrées par le prestataire de paiement (SasPay) lors d’un achat restent soumises à sa propre
          politique et à ses obligations légales.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
