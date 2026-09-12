'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { walletApi } from '@/lib/api'
import { invalidateFinancialCaches } from '@/lib/cache'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ImageUpload from '@/components/ImageUpload'
import { useSubscription } from '@/hooks/useSubscription'
import { isPremiumRequiredError } from '@/lib/subscription'
import { getSetupStep, isSetupActive, setSetupStep } from '@/lib/setupGuide'

export default function NewWalletPage() {
  const router = useRouter()
  const { isPremium, requirePremium } = useSubscription()
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inSetup = isSetupActive()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }
    if (loading) return

    const balance = parseFloat(initialBalance.replace(',', '.'))
    if (initialBalance.trim() && (Number.isNaN(balance) || balance < 0)) {
      toast.error('Solde initial invalide')
      return
    }

    try {
      setLoading(true)
      await walletApi.create({
        name: name.trim(),
        image_url: imageUrl,
        initial_balance: initialBalance.trim() ? balance : 0,
      })
      toast.success('Poche créée')
      invalidateFinancialCaches()
      const step = getSetupStep()
      if (
        inSetup ||
        step === 'wallet-form' ||
        step === 'wallets-add' ||
        step === 'nav-wallets'
      ) {
        setSetupStep('nav-categories')
        router.push('/')
        return
      }
      router.push('/wallets')
    } catch (error: unknown) {
      if (isPremiumRequiredError(error)) {
        requirePremium(error.message)
        return
      }
      const message = error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <Header title="Nouvelle poche" showBack />

      <main className="mx-auto max-w-md px-4 py-4 space-y-4">
        <form
          onSubmit={handleSubmit}
          className="card space-y-5 p-4"
          data-coach="wallet-form"
        >
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            endpoint="walletImage"
            label="Icône"
            premiumRequired={!isPremium}
          />

          <Input
            label="Nom"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cash, MTN Money…"
            required
          />

          <Input
            label="Solde actuel"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0"
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? 'Création…' : 'Créer la poche'}
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
