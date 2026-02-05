'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Wallet, Transaction, walletApi } from '@/lib/api'
import { formatCurrency, groupTransactionsByDate } from '@/lib/utils'
import { useConfirm } from '@/hooks/useConfirm'
import Header from '@/components/Header'
import TransactionItem from '@/components/TransactionItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfirmModal from '@/components/ConfirmModal'
import { Pencil, Trash2, Save, X } from 'lucide-react'

export default function WalletDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { confirm, confirmState, closeConfirm } = useConfirm()

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    currency: ''
  })

  useEffect(() => {
    loadWalletData()
  }, [id])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      const data = await walletApi.getHistory(id)
      setWallet(data.wallet)
      setTransactions(data.transactions)
      setFormData({
        name: data.wallet.name,
        currency: data.wallet.currency
      })
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancelEdit = () => {
    if (wallet) {
      setFormData({
        name: wallet.name,
        currency: wallet.currency
      })
    }
    setEditing(false)
  }

  const handleUpdate = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Le nom est requis')
        return
      }

      await walletApi.update(id, formData)
      toast.success('Portefeuille modifié avec succès !')
      await loadWalletData()
      setEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la modification')
    }
  }

  const handleDelete = async () => {
    if (transactions.length > 0) {
      toast.error('Impossible de supprimer un portefeuille avec des transactions')
      return
    }

    const confirmed = await confirm({
      title: 'Supprimer le portefeuille ?',
      message: `Êtes-vous sûr de vouloir supprimer "${wallet?.name}" ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      variant: 'danger'
    })

    console.log('Confirmation:', confirmed)

    if (!confirmed) {
      console.log('Suppression annulée')
      return
    }

    console.log('Suppression confirmée, appel API...')

    try {
      await walletApi.delete(id)
      toast.success('Portefeuille supprimé avec succès !')
      router.push('/wallets')
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Portefeuille" showBack />
        <LoadingSpinner />
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Portefeuille" showBack />
        <div className="max-w-md mx-auto px-4 py-6">
          <p className="text-center text-gray-500">Portefeuille introuvable</p>
        </div>
      </div>
    )
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title={editing ? 'Modifier' : wallet.name} showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Solde du portefeuille */}
        <div className="bg-primary-500 rounded-2xl p-6 text-white">
          {!editing ? (
            <>
              <p className="text-sm opacity-90 mb-1">Solde actuel</p>
              <h2 className="text-4xl font-bold mb-4">
                {formatCurrency(wallet.current_balance, wallet.currency)}
              </h2>
              
              {/* Boutons d'action */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleEdit}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-2 font-semibold transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 font-semibold transition flex items-center justify-center touch-manipulation"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm opacity-90 mb-2">Nom du portefeuille</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 font-semibold text-lg"
                  placeholder="Ex: Espèces"
                />
              </div>
              
              <div>
                <label className="block text-sm opacity-90 mb-2">Devise</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 font-semibold"
                  placeholder="XAF"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-white hover:bg-gray-100 text-primary-600 rounded-lg px-4 py-3 font-semibold transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Save size={18} />
                  Enregistrer
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-3 font-semibold transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <X size={18} />
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Historique */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Historique des transactions
          </h3>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
              <p className="text-gray-500">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, items]) => (
                <div key={date}>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                    {date}
                  </h4>
                  <div className="space-y-3">
                    {items.map((transaction) => (
                      <TransactionItem key={transaction._id} transaction={transaction} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </div>
  )
}
