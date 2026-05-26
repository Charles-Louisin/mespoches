'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { subscriptionApi } from '@/lib/api'
import { SUBSCRIPTION_PLANS, type BillingPeriod } from '@/lib/planLimits'
import { useSubscription } from '@/hooks/useSubscription'
import { formatCurrency } from '@/lib/utils'
import { Check, Crown } from 'lucide-react'

const PREMIUM_FEATURES = [
  'Poches et catégories illimitées',
  'Historique complet (au-delà de 3 mois)',
  'Transferts entre poches',
  'Images personnalisées',
  'Analytics avancés et comparaisons',
  'Budgets mensuels par catégorie',
  'Objectifs d\'épargne',
  'Transactions récurrentes',
  'Export CSV de vos données',
]

export default function SubscriptionPage() {
  const router = useRouter()
  const { isPremium, loading: subLoading } = useSubscription()
  const [loading, setLoading] = useState(true)
  const [paymentAvailable, setPaymentAvailable] = useState(false)

  useEffect(() => {
    subscriptionApi
      .getPlans()
      .then((data) => setPaymentAvailable(data.paymentAvailable))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const choosePlan = (period: BillingPeriod) => {
    toast.info('Redirection vers la page de paiement…')
    router.push(`/subscription/payment?period=${period}`)
  }

  if (subLoading || loading) {
    return (
      <PageShell>
        <Header title="Premium" showBack />
        <LoadingSpinner />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Header title="MES POCHES Premium" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {isPremium ? (
          <div className="card p-5 bg-primary-50 border border-primary-100 text-center">
            <Crown className="mx-auto text-primary-500 mb-2" size={32} />
            <p className="font-semibold text-primary-800">Vous êtes déjà Premium</p>
            <p className="text-sm text-primary-600 mt-1">
              Merci pour votre soutien. Toutes les fonctionnalités sont débloquées.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center">
            Débloquez tout le potentiel de MES POCHES. Paiement par Mobile Money (MTN,
            Orange) ou carte bancaire via CinetPay.
          </p>
        )}

        <ul className="card p-4 space-y-2">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
              <Check size={18} className="text-primary-500 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          {(Object.keys(SUBSCRIPTION_PLANS) as BillingPeriod[]).map((key) => {
            const plan = SUBSCRIPTION_PLANS[key]
            return (
              <div
                key={key}
                className={`card p-5 ${key === 'yearly' ? 'ring-2 ring-primary-500' : ''}`}
              >
                {key === 'yearly' && 'savingsLabel' in plan && (
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {plan.savingsLabel}
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mt-2">{plan.label}</h3>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(plan.priceXaf)}
                  <span className="text-sm font-normal text-gray-500">
                    {plan.periodLabel}
                  </span>
                </p>
                {!isPremium && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => choosePlan(key)}
                  >
                    Choisir {plan.label.toLowerCase()}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {paymentAvailable ? (
          <p className="text-xs text-center text-gray-500">
            Paiement sécurisé · Mobile Money & carte · XAF
          </p>
        ) : (
          <p className="text-xs text-center text-gray-400">
            Paiement en ligne — configuration serveur requise (CinetPay)
          </p>
        )}
      </main>
    </PageShell>
  )
}
