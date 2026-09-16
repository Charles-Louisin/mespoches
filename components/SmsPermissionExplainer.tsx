'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, XCircle, CheckCircle } from 'lucide-react';
import Button from './Button';

interface SmsPermissionExplainerProps {
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * Composant d'explication des permissions SMS
 * Informe clairement l'utilisateur sur ce que l'application fait et ne fait pas
 */
export default function SmsPermissionExplainer({
  onAccept,
  onDecline,
}: SmsPermissionExplainerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-ink">
          Détection Automatique des Transactions SMS
        </h2>
        <p className="text-sm text-ink-soft">
          Capturez automatiquement vos transactions Mobile Money depuis vos SMS
        </p>
      </div>

      {/* Ce que l'application FAIT */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <CheckCircle size={20} />
          <span>Ce que l&apos;application fait</span>
        </div>
        <ul className="space-y-2 text-sm text-ink-soft ml-7">
          <li>✅ Lit uniquement vos SMS de transactions (Orange Money, MTN, etc.)</li>
          <li>✅ Extrait automatiquement : montant, date, type d&apos;opération</li>
          <li>✅ Vous suggère la transaction à valider</li>
          <li>✅ Fonctionne même pour les SMS reçus hors ligne</li>
        </ul>
      </div>

      {/* Ce que l'application NE FAIT PAS */}
      <div className="card p-4 space-y-3 border-2 border-red-100">
        <div className="flex items-center gap-2 text-red-700 font-medium">
          <XCircle size={20} />
          <span>Ce que l&apos;application NE fait PAS</span>
        </div>
        <ul className="space-y-2 text-sm text-ink-soft ml-7">
          <li>❌ Ne peut PAS répondre à vos SMS</li>
          <li>❌ Ne peut PAS envoyer de SMS</li>
          <li>❌ Ne peut PAS modifier ou supprimer vos SMS</li>
          <li>❌ Ne lit PAS vos SMS personnels</li>
          <li>❌ Ne lit PAS WhatsApp, Telegram ou autres apps</li>
          <li>❌ Ne collecte PAS vos numéros de téléphone</li>
          <li>❌ Ne partage PAS vos données avec des tiers</li>
        </ul>
      </div>

      {/* Détails techniques (collapsible) */}
      {expanded && (
        <div className="card p-4 space-y-4 bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm text-ink">Lecture Seule</h4>
                <p className="text-xs text-ink-soft mt-1">
                  L&apos;application utilise la permission RECEIVE_SMS (réception uniquement).
                  Elle ne peut ni envoyer ni modifier vos SMS.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm text-ink">Filtrage Intelligent</h4>
                <p className="text-xs text-ink-soft mt-1">
                  Seuls les SMS contenant des mots-clés monétaires (montant, paiement,
                  transfert, etc.) sont analysés. Vos SMS personnels sont ignorés.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm text-ink">Chiffrement</h4>
                <p className="text-xs text-ink-soft mt-1">
                  Vos données sont chiffrées localement avec AES-256. Seules les
                  informations de transaction sont envoyées de manière sécurisée.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour afficher les détails */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {expanded ? '− Masquer les détails techniques' : '+ Voir les détails techniques'}
      </button>

      {/* Avertissement légal */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>Conformité RGPD :</strong> Cette fonctionnalité respecte le principe de
        minimisation des données. Vous pouvez refuser ou désactiver cette permission à tout
        moment dans les paramètres de l&apos;application.
      </div>

      {/* Boutons d'action */}
      <div className="space-y-3">
        <Button fullWidth onClick={onAccept}>
          Autoriser la détection SMS
        </Button>
        <Button fullWidth variant="secondary" onClick={onDecline}>
          Continuer sans cette fonctionnalité
        </Button>
      </div>

      {/* Note de bas de page */}
      <p className="text-xs text-center text-gray-500">
        Vous pourrez activer cette fonctionnalité plus tard dans{' '}
        <span className="font-medium">Paramètres → Automatisation</span>
      </p>
    </div>
  );
}
