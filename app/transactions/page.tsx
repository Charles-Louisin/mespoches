'use client'

import { useEffect, useState } from 'react'
import { Transaction } from '@/lib/api'
import { offlineTransactionApi } from '@/lib/offlineApi'
import { groupTransactionsByDate } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import TransactionItem from '@/components/TransactionItem'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import Link from 'next/link'
import { History, Plus } from 'lucide-react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await offlineTransactionApi.getAll()
      setTransactions(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Historique" />
        <LoadingSpinner />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title="Historique" 
        action={
          <Link href="/transactions/new">
            <button className="p-2 touch-manipulation">
              <Plus size={24} className="text-primary-500" />
            </button>
          </Link>
        }
      />

      <main className="max-w-md mx-auto px-4 py-6">
        {transactions.length === 0 ? (
          <EmptyState
            icon={<History size={48} />}
            title="Aucune transaction"
            description="Commencez par ajouter votre première transaction"
            action={
              <Link href="/transactions/new">
                <Button>Ajouter une transaction</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                  {date}
                </h3>
                <div className="space-y-3">
                  {items.map((transaction) => (
                    <TransactionItem key={transaction._id} transaction={transaction} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
