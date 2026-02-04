'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Wallet, Transaction, walletApi } from '@/lib/api'
import { formatCurrency, groupTransactionsByDate } from '@/lib/utils'
import Header from '@/components/Header'
import TransactionItem from '@/components/TransactionItem'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function WalletDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWalletData()
  }, [id])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      const data = await walletApi.getHistory(id)
      setWallet(data.wallet)
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gray-50">
      <Header title={wallet.name} showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Solde du portefeuille */}
        <div className="bg-primary-500 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">Solde actuel</p>
          <h2 className="text-4xl font-bold">
            {formatCurrency(wallet.current_balance, wallet.currency)}
          </h2>
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
    </div>
  )
}
