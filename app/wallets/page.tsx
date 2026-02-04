'use client'

import { useEffect, useState } from 'react'
import { Wallet } from '@/lib/api'
import { offlineWalletApi } from '@/lib/offlineApi'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import WalletCard from '@/components/WalletCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import Button from '@/components/Button'
import Link from 'next/link'
import { Wallet as WalletIcon, Plus } from 'lucide-react'

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWallets()
  }, [])

  const loadWallets = async () => {
    try {
      setLoading(true)
      const data = await offlineWalletApi.getAll()
      setWallets(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Portefeuilles" />
        <LoadingSpinner />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title="Portefeuilles"
        action={
          <Link href="/wallets/new">
            <button className="p-2 touch-manipulation">
              <Plus size={24} className="text-primary-500" />
            </button>
          </Link>
        }
      />

      <main className="max-w-md mx-auto px-4 py-6">
        {wallets.length === 0 ? (
          <EmptyState
            icon={<WalletIcon size={48} />}
            title="Aucun portefeuille"
            description="Créez votre premier portefeuille pour commencer à gérer vos finances"
            action={
              <Link href="/wallets/new">
                <Button>Créer un portefeuille</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <WalletCard key={wallet._id} wallet={wallet} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
