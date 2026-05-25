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

export default function NewWalletPage() {
  const router = useRouter()
  const { isPremium, requirePremium } = useSubscription()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('XAF')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Veuillez entrer un nom')
      return
    }

    try {
      setLoading(true)
      await walletApi.create({ name, currency, image_url: imageUrl })
      toast.success('Poche créée avec succès !')
      invalidateFinancialCaches()
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

      <main className="max-w-md mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="card p-4 space-y-6">
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            endpoint="walletImage"
            label="Icône de la poche"
            premiumRequired={!isPremium}
          />

          <Input
            label="Nom de la poche"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Cash, MTN Money..."
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

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Création...' : 'Créer la poche'}
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
