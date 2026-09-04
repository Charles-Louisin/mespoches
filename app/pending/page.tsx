'use client';

import { useCallback, useEffect, useState } from 'react';
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
  sanitizeLineItems,
  walletApi,
  categoryApi,
  Wallet,
  Category,
} from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Check, Trash2, Pencil, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import LineItemsCollapse from '@/components/LineItemsCollapse';

function sourceLabel(item: PendingTransaction) {
  if (item.source === 'voice' || item.source_type === 'voice') return 'Audio';
  if (item.source === 'ai_scan' || item.source_type === 'image') return 'Image';
  if (item.source === 'notification') {
    return item.source_type === 'ai' ? 'Notification (IA)' : 'Notification';
  }
  if (item.source === 'sms') return 'SMS';
  return 'Manuel';
}

function categoryName(item: PendingTransaction): string {
  if (typeof item.category_id === 'object' && item.category_id) {
    return item.category_id.name;
  }
  return '—';
}

function confidencePct(c: number) {
  return `${Math.round(Math.min(1, Math.max(0, c)) * 100)} %`;
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
    ai_items: [] as PendingTransaction['ai_items'],
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
      ai_items: (item.ai_items || []).map((line) => ({ ...line })),
    });
  };

  const cancelEdit = () => setEditingId(null);

  const toggleEdit = (item: PendingTransaction) => {
    if (editingId === item._id) {
      cancelEdit();
      return;
    }
    startEdit(item);
  };

  const updateLineDescription = (index: number, description: string) => {
    setForm((f) => ({
      ...f,
      ai_items: (f.ai_items || []).map((line, i) =>
        i === index ? { ...line, description } : line
      ),
    }));
  };

  const validate = async (id: string) => {
    setBusy(id);
    try {
      const payload =
        editingId === id
          ? {
              amount: parseFloat(form.amount),
              description: form.description,
              wallet_id: form.wallet_id,
              category_id: form.category_id || null,
              type: form.type,
              ...(form.ai_items && form.ai_items.length > 0
                ? { ai_items: sanitizeLineItems(form.ai_items) }
                : {}),
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
      toast.success('Supprimée');
      if (editingId === id) setEditingId(null);
      await load();
    } catch {
      toast.error('Erreur');
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Header title="Transactions à valider" showBack />
        <LoadingSpinner />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header title="Transactions à valider" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {items.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">
            Aucune transaction en attente.
          </div>
        ) : (
          items.map((item) => (
            <article key={item._id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                    {sourceLabel(item)}
                    {item.document_type ? ` · ${item.document_type}` : ''}
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {item.type === 'income' ? '+' : '−'}
                    {formatAmount(item.amount)}
                  </p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.ai_items && item.ai_items.length > 1 && editingId !== item._id && (
                    <div className="mt-2">
                      <LineItemsCollapse items={item.ai_items} />
                    </div>
                  )}
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500">
                    <div>
                      <dt className="inline text-gray-400">Type · </dt>
                      <dd className="inline">
                        {item.type === 'income' ? 'Revenu' : 'Dépense'}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline text-gray-400">Date · </dt>
                      <dd className="inline">
                        {format(new Date(item.date), 'd MMM yyyy', { locale: fr })}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline text-gray-400">Catégorie · </dt>
                      <dd className="inline">{categoryName(item)}</dd>
                    </div>
                    <div>
                      <dt className="inline text-gray-400">Confiance · </dt>
                      <dd className="inline">{confidencePct(item.confidence)}</dd>
                    </div>
                  </dl>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEdit(item)}
                  className="p-2 text-gray-400 hover:text-primary-600 touch-manipulation"
                  aria-label={editingId === item._id ? 'Fermer la modification' : 'Modifier'}
                  aria-expanded={editingId === item._id}
                >
                  {editingId === item._id ? <X size={18} /> : <Pencil size={18} />}
                </button>
              </div>

              {(item.low_confidence_warning || item.confidence < 0.75) && (
                <div className="flex gap-2 items-start rounded-xl bg-amber-50 text-amber-800 text-xs px-3 py-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {item.low_confidence_warning ||
                      "Certaines informations n'ont pas pu être reconnues avec certitude."}
                  </span>
                </div>
              )}

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
                  {form.ai_items && form.ai_items.length > 1 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Articles</p>
                      <LineItemsCollapse
                        items={form.ai_items}
                        editable
                        defaultOpen
                        onDescriptionChange={updateLineDescription}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  fullWidth
                  onClick={() => validate(item._id)}
                  disabled={busy === item._id}
                  className="flex items-center justify-center gap-2"
                  aria-label="Confirmer"
                >
                  <Check size={18} /> Confirmer
                </Button>
                <button
                  type="button"
                  onClick={() => toggleEdit(item)}
                  disabled={busy === item._id}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 touch-manipulation"
                  aria-label={editingId === item._id ? 'Fermer la modification' : 'Modifier'}
                  aria-expanded={editingId === item._id}
                >
                  {editingId === item._id ? <X size={18} /> : <Pencil size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => reject(item._id)}
                  disabled={busy === item._id}
                  className="px-4 py-2 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 touch-manipulation"
                  aria-label="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))
        )}

        <Button variant="secondary" fullWidth onClick={() => router.push('/')}>
          Retour
        </Button>
      </main>
    </PageShell>
  );
}
