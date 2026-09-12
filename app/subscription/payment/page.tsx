'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { SUBSCRIPTION_PLANS, type BillingPeriod } from '@/lib/planLimits'
import { subscriptionApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { isAllowedPaymentUrl } from '@/lib/payment-url'
import { isSubscriptionPaymentEnabled } from '@/lib/subscription'
import { CreditCard, Smartphone, AlertCircle, FlaskConical } from 'lucide-react'

type PaymentMethodChoice = 'all' | 'orange' | 'mtn'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const period = (searchParams.get('period') as BillingPeriod) || 'monthly'
  const paymentFailed = searchParams.get('payment') === 'failed'
  const plan =
    period in SUBSCRIPTION_PLANS
      ? SUBSCRIPTION_PLANS[period]
      : SUBSCRIPTION_PLANS.monthly

  const [paymentAvailable, setPaymentAvailable] = useState<boolean | null>(null)
  const [sandbox, setSandbox] = useState(false)
  const [method, setMethod] = useState<PaymentMethodChoice>('all')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!isSubscriptionPaymentEnabled()) {
      toast.info('À venir')
      router.replace('/subscription')
    }
  }, [router])

  useEffect(() => {
    subscriptionApi
      .getPlans()
      .then((data) => {
        setPaymentAvailable(data.paymentAvailable)
        setSandbox(Boolean(data.sandbox))
      })
      .catch(() => setPaymentAvailable(false))
  }, [])

  useEffect(() => {
    if (paymentFailed) {
      toast.error('Le paiement a été annulé ou a échoué.')
    }
  }, [paymentFailed])

  const handlePay = async () => {
    if (!isSubscriptionPaymentEnabled()) {
      toast.info('À venir')
      return
    }
    if (!paymentAvailable || paying) {
      if (!paymentAvailable) {
        toast.error('Le paiement en ligne n\'est pas encore activé sur ce serveur.')
      }
      return
    }

    setPaying(true)
    try {
      const { paymentUrl } = await subscriptionApi.createCheckout(period, method)
      if (!isAllowedPaymentUrl(paymentUrl)) {
        throw new Error('URL de paiement non autorisée')
      }
      window.location.href = paymentUrl
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de démarrer le paiement'
      toast.error(message)
      setPaying(false)
    }
  }

  if (!isSubscriptionPaymentEnabled()) {
    return (
      <PageShell>
        <Header title="Paiement" showBack />
        <LoadingSpinner />
      </PageShell>
    )
  }

  if (paymentAvailable === null) {
    return (
      <PageShell>
        <Header title="Paiement" showBack />
        <LoadingSpinner />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Header title="Paiement" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-ink">Récapitulatif</h2>
          <div className="flex justify-between text-sm">
            <span className="text-ink-mute">Forfait</span>
            <span className="font-medium">{plan.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-mute">Total</span>
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(plan.priceXaf)}
              <span className="text-sm font-normal text-ink-mute">
                {plan.periodLabel}
              </span>
            </span>
          </div>
        </div>

        {!paymentAvailable && (
          <div className="card p-4 flex gap-3 bg-amber-50 border border-amber-100">
            <AlertCircle className="text-amber-600 shrink-0" size={22} />
            <div className="text-sm text-amber-900">
              <p className="font-semibold">Paiement non configuré</p>
              <p className="mt-1 text-amber-800">
                L&apos;administrateur doit configurer les clés CinetPay sur le serveur.
              </p>
            </div>
          </div>
        )}

        <div className="card p-5 space-y-3">
          <p className="text-sm font-medium text-ink-soft">Moyen de paiement</p>
          <div className="space-y-2">
            {(
              [
                {
                  id: 'all' as const,
                  label: 'Tous (recommandé)',
                  hint: 'Orange, MTN et carte sur la page CinetPay',
                  icon: CreditCard,
                },
                {
                  id: 'orange' as const,
                  label: 'Orange Money',
                  hint: 'Cameroun (OM_CM)',
                  icon: Smartphone,
                },
                {
                  id: 'mtn' as const,
                  label: 'MTN MoMo',
                  hint: 'Cameroun (MTN_CM)',
                  icon: Smartphone,
                },
              ] as const
            ).map(({ id, label, hint, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
                className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left touch-manipulation transition ${
                  method === id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-line'
                }`}
              >
                <Icon size={20} className="text-primary-500 shrink-0" />
                <div>
                  <span className="text-ink font-medium">{label}</span>
                  <p className="text-xs text-ink-mute">{hint}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-mute">
            Paiement sécurisé par CinetPay (XAF). Carte virtuelle disponible avec
            l&apos;option « Tous ».
          </p>
        </div>

        {sandbox && paymentAvailable && (
          <div className="card p-4 flex gap-3 bg-blue-50 border border-blue-100">
            <FlaskConical className="text-blue-600 shrink-0" size={22} />
            <div className="text-sm text-blue-900 space-y-1">
              <p className="font-semibold">Mode sandbox</p>
              <p className="text-blue-800">
                Orange : <strong>+237699990700</strong> (succès) · MTN :{' '}
                <strong>+237659990700</strong> (préfixe 65). Terminez par{' '}
                <strong>0700</strong> pour un succès immédiat, <strong>0703</strong>{' '}
                pour un échec.
              </p>
              <p className="text-xs text-blue-700">
                En local, exposez le webhook avec ngrok et définissez{' '}
                <code className="bg-blue-100 px-1 rounded">API_PUBLIC_URL</code>{' '}
                dans le backend.
              </p>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handlePay}
          loading={paying}
          disabled={!paymentAvailable}
        >
          {paying ? 'Redirection…' : `Payer ${formatCurrency(plan.priceXaf)}`}
        </Button>

        <button
          type="button"
          onClick={() => router.push('/subscription')}
          className="w-full text-sm text-ink-mute py-2"
          disabled={paying}
        >
          Retour aux offres
        </button>

        <Link href="/" className="block text-center text-sm text-primary-600">
          Retour à l&apos;accueil
        </Link>
      </main>
    </PageShell>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <Header title="Paiement" showBack />
          <div className="p-8 text-center text-ink-mute">Chargement…</div>
        </PageShell>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
