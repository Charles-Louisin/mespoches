'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { subscriptionApi } from '@/lib/api'
import { getUser, setUser } from '@/lib/auth'
import { useSubscription } from '@/hooks/useSubscription'
import { formatDate } from '@/lib/utils'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

type VerifyState = 'loading' | 'success' | 'pending' | 'error'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refresh } = useSubscription()
  const transactionId = searchParams.get('transaction_id')?.trim() || ''

  const [state, setState] = useState<VerifyState>('loading')
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const runVerify = async () => {
    if (!transactionId) {
      setState('error')
      return
    }

    try {
      const data = await subscriptionApi.verifyPayment(transactionId)

      if (data.user) {
        const stored = getUser()
        if (stored) {
          setUser({
            ...stored,
            plan: data.user.plan,
            premiumUntil: data.user.premiumUntil,
            isPremium: data.user.isPremium,
            currency: data.user.currency,
          })
        }
      }

      await refresh()

      if (data.isPremium) {
        setPremiumUntil(data.premiumUntil)
        setState('success')
        toast.success('Bienvenue dans MES POCHES Premium !')
      } else if (data.status === 'failed') {
        setState('error')
        toast.error('Le paiement a échoué ou a été annulé.')
      } else if (data.status === 'pending') {
        setState('pending')
      } else {
        setState('pending')
      }
    } catch (err) {
      console.error(err)
      setState('error')
    }
  }

  useEffect(() => {
    runVerify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId])

  const handleRetry = async () => {
    setRetrying(true)
    await runVerify()
    setRetrying(false)
  }

  return (
    <PageShell>
      <Header title="Paiement" showBack />

      <main className="max-w-md mx-auto px-4 py-8 space-y-6 text-center">
        {state === 'loading' && (
          <>
            <LoadingSpinner />
            <p className="text-sm text-gray-500">Vérification du paiement en cours…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle size={56} className="mx-auto text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Paiement confirmé</h2>
            <p className="text-sm text-gray-600">
              Votre abonnement Premium est actif
              {premiumUntil ? ` jusqu'au ${formatDate(premiumUntil)}` : ''}.
            </p>
            <Button className="w-full" onClick={() => router.push('/')}>
              Retour à l&apos;accueil
            </Button>
          </>
        )}

        {state === 'pending' && (
          <>
            <Clock size={56} className="mx-auto text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Paiement en cours</h2>
            <p className="text-sm text-gray-600">
              Si vous avez validé sur votre téléphone, attendez quelques secondes puis
              actualisez.
            </p>
            <Button className="w-full" onClick={handleRetry} disabled={retrying}>
              {retrying ? 'Vérification…' : 'Vérifier à nouveau'}
            </Button>
            <Link href="/" className="block text-sm text-primary-600">
              Retour à l&apos;accueil
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <XCircle size={56} className="mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Vérification impossible</h2>
            <p className="text-sm text-gray-600">
              {!transactionId
                ? 'Référence de transaction manquante.'
                : 'Le paiement n\'a pas pu être confirmé. Contactez le support si vous avez été débité.'}
            </p>
            {transactionId && (
              <Button className="w-full" onClick={handleRetry} disabled={retrying}>
                {retrying ? 'Vérification…' : 'Réessayer'}
              </Button>
            )}
            <Link href="/subscription" className="block text-sm text-primary-600">
              Retour aux offres
            </Link>
          </>
        )}
      </main>
    </PageShell>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <Header title="Paiement" showBack />
          <LoadingSpinner />
        </PageShell>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
