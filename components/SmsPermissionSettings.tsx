'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Shield, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import Button from './Button';
import { SmsMonitor } from '@/lib/capacitor/app-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

/**
 * Composant de gestion des permissions SMS
 * Affiche l'état actuel et permet l'activation/désactivation
 */
export default function SmsPermissionSettings() {
  const [listenerEnabled, setListenerEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      setLoading(false);
      return;
    }

    try {
      const status = await SmsMonitor.isNotificationListenerEnabled();
      setListenerEnabled(Boolean(status?.enabled));
    } catch {
      setListenerEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  const handleRequestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Fonctionnalité disponible uniquement sur mobile');
      return;
    }

    setChecking(true);
    try {
      // 1. Permission SMS
      await SmsMonitor.requestSmsPermission();
      
      // 2. Accès aux notifications (pour l'app SMS)
      await SmsMonitor.openNotificationAccessSettings();
      
      toast.success('Veuillez activer les permissions dans les paramètres système');
      
      // Revérifier après 2 secondes
      setTimeout(() => {
        void checkStatus();
      }, 2000);
    } catch (error) {
      toast.error('Impossible d\'ouvrir les paramètres');
    } finally {
      setChecking(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await SmsMonitor.openNotificationAccessSettings();
    } catch {
      toast.error('Impossible d\'ouvrir les paramètres');
    }
  };

  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return (
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-gray-400" />
          <h3 className="font-medium text-ink">Détection SMS</h3>
        </div>
        <p className="text-sm text-gray-500">
          Cette fonctionnalité est disponible uniquement sur Android.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="text-sm text-gray-600">Vérification des permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statut actuel */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-medium text-ink">Détection Automatique SMS</h3>
          </div>
          {listenerEnabled ? (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 size={16} />
              <span>Activée</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <AlertCircle size={16} />
              <span>Désactivée</span>
            </div>
          )}
        </div>

        <p className="text-sm text-ink-soft">
          {listenerEnabled
            ? 'L\'application capture automatiquement vos transactions depuis les SMS Mobile Money.'
            : 'Activez la détection pour capturer automatiquement vos transactions SMS.'}
        </p>
      </div>

      {/* Garanties de sécurité */}
      <div className="card p-4 space-y-3 bg-blue-50 border border-blue-100">
        <div className="flex items-center gap-2 text-blue-900 font-medium">
          <Shield size={18} />
          <span className="text-sm">Garanties de Sécurité</span>
        </div>
        <ul className="space-y-1.5 text-xs text-blue-800 ml-6">
          <li>✓ Lit uniquement les SMS de transactions (Orange Money, MTN, etc.)</li>
          <li>✓ Ne peut ni répondre, ni envoyer, ni modifier vos SMS</li>
          <li>✓ N&apos;accède à aucune autre notification ou application</li>
          <li>✓ Ne collecte aucune donnée personnelle</li>
          <li>✓ Traite les SMS reçus hors ligne au redémarrage</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!listenerEnabled ? (
          <Button
            fullWidth
            onClick={handleRequestPermissions}
            loading={checking}
            className="flex items-center justify-center gap-2"
          >
            <Shield size={18} />
            {checking ? 'Configuration...' : 'Activer la Détection SMS'}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="secondary"
            onClick={handleOpenSettings}
            className="flex items-center justify-center gap-2"
          >
            <Settings size={18} />
            Gérer les Permissions
          </Button>
        )}

        <button
          onClick={() => void checkStatus()}
          className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Rafraîchir l&apos;état
        </button>
      </div>

      {/* Instructions manuelles */}
      {!listenerEnabled && (
        <div className="card p-4 space-y-2 bg-amber-50 border border-amber-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-900">
                Configuration manuelle requise
              </p>
              <p className="text-xs text-amber-800">
                Si les permissions ne s&apos;activent pas automatiquement :
              </p>
              <ol className="text-xs text-amber-800 ml-4 space-y-0.5 list-decimal">
                <li>Ouvrez les Paramètres Android</li>
                <li>Applications → MES POCHES</li>
                <li>Permissions → SMS : Autoriser</li>
                <li>Accès spécial → Accès aux notifications : Activer</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Désactivation */}
      {listenerEnabled && (
        <div className="card p-3 bg-gray-50">
          <p className="text-xs text-gray-600">
            <strong>Pour désactiver :</strong> Paramètres Android → Applications → MES
            POCHES → Permissions → Désactiver SMS et Notifications
          </p>
        </div>
      )}
    </div>
  );
}
