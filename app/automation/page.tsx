'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Camera, MessageSquare, Sparkles, Brain } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { pendingTransactionApi } from '@/lib/api';
import { useSubscription } from '@/hooks/useSubscription';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativeApp } from '@/lib/capacitor/native-permissions';
import ProBadge from '@/components/ProBadge';

export default function AutomationPage() {
  const { isPremium, showProBadge, requirePremium } = useSubscription();
  const [smsText, setSmsText] = useState('');
  const [loading, setLoading] = useState<'sms' | 'ai' | null>(null);
  const [habitsInfo, setHabitsInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!isPremium) return;
    pendingTransactionApi
      .getHabitsSummary()
      .then((d) => {
        if (d.recurrenceAnalysis) setHabitsInfo(d.recurrenceAnalysis);
        else if (d.total > 0)
          setHabitsInfo(`${d.total} habitude(s) apprise(s) depuis vos validations SMS.`);
      })
      .catch(() => {});
  }, [isPremium]);

  const parseSms = async () => {
    if (!smsText.trim()) {
      toast.error('Collez le texte du SMS');
      return;
    }
    setLoading('sms');
    try {
      await pendingTransactionApi.parseSms(smsText.trim());
      toast.success('Transaction proposée — consultez « À valider »');
      setSmsText('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'SMS non reconnu');
    } finally {
      setLoading(null);
    }
  };

  const scanReceipt = async () => {
    if (!isPremium) {
      requirePremium('L\'analyse IA de reçus est réservée aux abonnés Premium');
      return;
    }
    setLoading('ai');
    try {
      if (isNativeApp()) {
        const photo = await CapCamera.getPhoto({
          quality: 90,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
        });
        if (!photo.dataUrl) throw new Error('Aucune image');
        const mime = photo.format === 'png' ? 'image/png' : 'image/jpeg';
        const created = await pendingTransactionApi.aiScan(photo.dataUrl, mime);
        toast.success(`${created.length} transaction(s) proposée(s)`);
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const dataUrl = reader.result as string;
              const created = await pendingTransactionApi.aiScan(dataUrl, file.type);
              toast.success(`${created.length} transaction(s) proposée(s)`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Erreur IA');
            } finally {
              setLoading(null);
            }
          };
          reader.readAsDataURL(file);
        };
        input.click();
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Analyse impossible');
    } finally {
      setLoading(null);
    }
  };

  return (
    <PageShell>
      <Header title="Automatisation" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <p className="text-sm text-gray-600">
          Lecture SMS Orange / MTN : <strong>gratuite</strong>. L&apos;IA apprend de vos
          validations (Premium) pour pré-remplir poche, catégorie et libellé plus vite.
        </p>

        {isPremium && habitsInfo && (
          <div className="card p-4 bg-violet-50 border border-violet-100 space-y-2">
            <div className="flex items-center gap-2 text-violet-800 font-semibold text-sm">
              <Brain size={18} /> Apprentissage IA
            </div>
            <p className="text-xs text-violet-900/80 whitespace-pre-line">{habitsInfo}</p>
          </div>
        )}

        {showProBadge && (
          <p className="text-xs text-gray-500 card p-3 bg-gray-50">
            Passez Premium pour activer l&apos;IA : elle analyse vos habitudes à chaque
            validation SMS et adapte les prochaines transactions automatiquement.
          </p>
        )}

        <section className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900">SMS Orange / MTN</h2>
          </div>
          <p className="text-xs text-gray-500">
            Formats reconnus : transferts, paiements marchands (ex. ETS L ECLAT),
            retraits espèces. Montant = « Montant Transaction » (pas les frais).
          </p>
          <textarea
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            rows={4}
            placeholder="Collez ici le SMS Orange Money ou MTN MoMo…"
            className="w-full px-3 py-2 border rounded-xl text-sm resize-none"
          />
          <Button fullWidth onClick={parseSms} disabled={loading === 'sms'}>
            {loading === 'sms' ? 'Analyse…' : 'Analyser le SMS'}
          </Button>
        </section>

        <section className="card p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles size={20} className="text-primary-500" />
            <h2 className="font-semibold text-gray-900">Scan IA (reçus, factures)</h2>
            {showProBadge && <ProBadge />}
          </div>
          <p className="text-xs text-gray-500">
            Photographiez un ticket, une facture ou une liste de courses. Gemini extrait
            les montants et crée des propositions (Premium).
          </p>
          <Button
            fullWidth
            onClick={scanReceipt}
            disabled={loading === 'ai'}
            className="flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            {loading === 'ai' ? 'Analyse IA…' : 'Photographier / importer'}
          </Button>
          {!isPremium && !showProBadge && (
            <p className="text-xs text-gray-400 text-center">Chargement du statut…</p>
          )}
        </section>

        <Link
          href="/pending"
          className="block card p-4 text-center font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
        >
          Voir les transactions à valider →
        </Link>

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Rappel quotidien à 20h pour enregistrer vos dépenses (app mobile)</p>
          <p>• Notification quand de nouvelles propositions sont détectées</p>
        </div>
      </main>
    </PageShell>
  );
}
