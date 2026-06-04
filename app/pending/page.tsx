'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PageShell from '@/components/PageShell';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Select from '@/components/Select';
import {
  pendingTransactionApi,
  PendingTransaction,
  walletApi,
  categoryApi,
  Wallet,
  Category,
} from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Check, X, Pencil, Sparkles } from 'lucide-react';

function sourceLabel(source: PendingTransaction['source']) {
  switch (source) {
    case 'sms':
      return 'SMS Mobile Money';
    case 'notification':
      return 'Notification';
    case 'ai_scan':
      return 'Scan IA';
    default:
      return 'Manuel';
  }
}

function patternLabel(pattern?: PendingTransaction['pattern']) {
  switch (pattern) {
    case 'transfer_out':
      return 'Transfert envoyé';
    case 'transfer_in':
      return 'Transfert reçu';
    case 'payment':
      return 'Paiement marchand';
    case 'withdrawal':
      return 'Retrait espèces';
    default:
      return 'Mobile Money';
  }
}

export default function PendingTransactionsPage() {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [items, setItems] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    wallet_id: '',
    category_id: '',
    type: 'expense' as 'income' | 'expense',
  });
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, w, c] = await Promise.all([
        pendingTransactionApi.getAll('pending'),
        walletApi.getAll(),
        categoryApi.getAll(),
      ]);
      setItems(list);
      setWallets(w);
      setCategories(c);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (item: PendingTransaction) => {
    setEditingId(item._id);
    setForm({
      amount: String(item.amount),
      description: item.description,
      wallet_id:
        typeof item.wallet_id === 'object' && item.wallet_id
          ? item.wallet_id._id
          : String(item.wallet_id || wallets[0]?._id || ''),
      category_id:
        typeof item.category_id === 'object' && item.category_id
          ? item.category_id._id
          : String(item.category_id || ''),
      type: item.type,
    });
  };

  const validate = async (id: string) => {
    setBusy(id);
    try {
      const payload = editingId === id
        ? {
            amount: parseFloat(form.amount),
            description: form.description,
            wallet_id: form.wallet_id,
            category_id: form.category_id || null,
            type: form.type,
          }
        : undefined;
      await pendingTransactionApi.validate(id, payload);
      toast.success('Transaction enregistrée');
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Validation impossible');
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    setBusy(id);
    try {
      await pendingTransactionApi.reject(id);
      toast.success('Proposition ignorée');
      if (editingId === id) setEditingId(null);
      await load();
    } catch (e) {
      toast.error('Erreur');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Header title="À valider" showBack />
        <LoadingSpinner />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header title="Transactions à valider" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-gray-600">
          Propositions créées automatiquement depuis vos SMS Mobile Money ou scans IA.
          Vérifiez, modifiez si besoin, puis validez.
        </p>

        <Link
          href="/automation"
          className="text-sm font-medium text-primary-600 flex items-center gap-1"
        >
          <Sparkles size={16} /> Paramètres d&apos;automatisation →
        </Link>

        {items.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">
            Aucune transaction en attente.
          </div>
        ) : (
          items.map((item) => (
            <article key={item._id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                    {sourceLabel(item.source)}
                    {item.pattern && ` · ${patternLabel(item.pattern)}`}
                    {item.operator !== 'unknown' &&
                      ` · ${item.operator === 'orange' ? 'Orange' : 'MTN'}`}
                  </p>
                  {item.ai_enriched && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full mt-1">
                      <Sparkles size={10} /> Suggestion IA Premium
                    </span>
                  )}
                  {item.confidence >= 0.85 && !item.ai_enriched && (
                    <span className="inline-block text-[10px] text-emerald-600 mt-1">
                      Habitude reconnue
                    </span>
                  )}
                  <p className="font-semibold text-gray-900 mt-1">
                    {item.type === 'income' ? '+' : '−'}
                    {formatAmount(item.amount)}
                  </p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.counterparty && (
                    <p className="text-xs text-gray-500 mt-1">→ {item.counterparty}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="p-2 text-gray-400 hover:text-primary-600 touch-manipulation"
                  aria-label="Modifier"
                >
                  <Pencil size={18} />
                </button>
              </div>

              {editingId === item._id && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <Select
                    label="Type"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value as 'income' | 'expense' }))
                    }
                    options={[
                      { value: 'expense', label: 'Dépense' },
                      { value: 'income', label: 'Revenu' },
                    ]}
                  />
                  <label className="block text-sm font-medium text-gray-700">
                    Montant
                    <input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border rounded-xl"
                    />
                  </label>
                  <Select
                    label="Poche"
                    value={form.wallet_id}
                    onChange={(e) => setForm((f) => ({ ...f, wallet_id: e.target.value }))}
                    options={wallets.map((w) => ({ value: w._id, label: w.name }))}
                  />
                  <Select
                    label="Catégorie"
                    value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    options={[
                      { value: '', label: '—' },
                      ...categories.map((c) => ({ value: c._id, label: c.name })),
                    ]}
                  />
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                    <input
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border rounded-xl"
                    />
                  </label>
                </div>
              )}

              {item.raw_text && editingId !== item._id && (
                <p className="text-xs text-gray-400 line-clamp-2">{item.raw_text}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  fullWidth
                  onClick={() => validate(item._id)}
                  disabled={busy === item._id}
                  className="flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Valider
                </Button>
                <button
                  type="button"
                  onClick={() => reject(item._id)}
                  disabled={busy === item._id}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 touch-manipulation"
                >
                  <X size={18} />
                </button>
              </div>
            </article>
          ))
        )}

        <Button variant="secondary" fullWidth onClick={() => router.push('/')}>
          Retour à l&apos;accueil
        </Button>
      </main>
    </PageShell>
  );
}
