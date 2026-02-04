'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { offlineWalletApi } from '@/lib/offlineApi'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function NewWalletPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('XAF')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    try {
      setLoading(true)
      await offlineWalletApi.create({ name, currency })
      toast.success('Portefeuille créé avec succès !')
      router.push('/wallets')
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nouveau portefeuille" showBack />

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nom du portefeuille"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Espèces, Compte bancaire..."
            required
          />

          <Input
            label="Devise"
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="XAF"
            required
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer le portefeuille'}
          </Button>
        </form>
      </main>
    </div>
  )
}
