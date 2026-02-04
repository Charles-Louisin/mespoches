'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Wallet, Category } from '@/lib/api'
import { offlineWalletApi, offlineTransactionApi, offlineCategoryApi } from '@/lib/offlineApi'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function NewTransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>(
    (typeParam as 'income' | 'expense') || 'expense'
  )
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [destinationWalletId, setDestinationWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    loadData()
  }, [type])

  const loadData = async () => {
    try {
      const walletsData = await offlineWalletApi.getAll()
      setWallets(walletsData)
      
      if (walletsData.length > 0 && !walletId) {
        setWalletId(walletsData[0]._id)
      }

      if (type !== 'transfer') {
        const categoriesData = await offlineCategoryApi.getAll(type)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !walletId) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    try {
      setLoading(true)

      const data = {
        amount: parseFloat(amount),
        wallet_id: walletId,
        category_id: categoryId || undefined,
        description: description || undefined,
        date: new Date(date).toISOString(),
      }

      if (type === 'income') {
        await offlineTransactionApi.createIncome(data)
        toast.success('Revenu enregistré avec succès !')
      } else if (type === 'expense') {
        await offlineTransactionApi.createExpense(data)
        toast.success('Dépense enregistrée avec succès !')
      } else if (type === 'transfer') {
        if (!destinationWalletId) {
          toast.error('Veuillez sélectionner un portefeuille de destination')
          return
        }
        await offlineTransactionApi.createTransfer({
          ...data,
          destination_wallet_id: destinationWalletId,
        })
        toast.success('Transfert effectué avec succès !')
      }

      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const walletOptions = [
    { value: '', label: 'Sélectionner un portefeuille' },
    ...wallets.map(w => ({ value: w._id, label: w.name }))
  ]

  const categoryOptions = [
    { value: '', label: 'Sélectionner une catégorie (optionnel)' },
    ...categories.map(c => ({ value: c._id, label: c.name }))
  ]

  const destinationWalletOptions = [
    { value: '', label: 'Sélectionner la destination' },
    ...wallets.filter(w => w._id !== walletId).map(w => ({ value: w._id, label: w.name }))
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nouvelle transaction" showBack />

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de transaction */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-3 rounded-lg font-semibold touch-manipulation ${
                type === 'income'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Revenu
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-3 rounded-lg font-semibold touch-manipulation ${
                type === 'expense'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Dépense
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-3 rounded-lg font-semibold touch-manipulation ${
                type === 'transfer'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              Transfert
            </button>
          </div>

          {/* Montant */}
          <div>
            <Input
              label="Montant"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="text-2xl font-bold text-center"
            />
          </div>

          {/* Portefeuille source */}
          <Select
            label={type === 'transfer' ? 'Depuis' : 'Portefeuille'}
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            options={walletOptions}
            required
          />

          {/* Portefeuille destination (transfert uniquement) */}
          {type === 'transfer' && (
            <Select
              label="Vers"
              value={destinationWalletId}
              onChange={(e) => setDestinationWalletId(e.target.value)}
              options={destinationWalletOptions}
              required
            />
          )}

          {/* Catégorie (sauf transfert) */}
          {type !== 'transfer' && (
            <Select
              label="Catégorie"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
            />
          )}

          {/* Description */}
          <Input
            label="Description (optionnel)"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Courses du mois"
          />

          {/* Date */}
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {/* Bouton de soumission */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </main>
    </div>
  )
}
