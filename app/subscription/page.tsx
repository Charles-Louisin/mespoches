'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import TrialBanner from '@/components/TrialBanner'
import { subscriptionApi } from '@/lib/api'
import { SUBSCRIPTION_PLANS, type BillingPeriod } from '@/lib/planLimits'
import { useSubscription } from '@/hooks/useSubscription'
import { formatCurrency } from '@/lib/utils'
import {
  formatPremiumUntil,
  getTrialDaysLeft,
} from '@/lib/subscription'
import { Check, Crown, Gift, Shield } from 'lucide-react'

const PREMIUM_FEATURES = [
  'Catégories illimitées',
  'Historique complet (au-delà de 3 mois)',
  'Transferts entre poches',
  'Images personnalisées',
  'Analytics avancés et comparaisons',
  'Budgets mensuels par catégorie',
  'Objectifs d\'épargne',
  'Transactions récurrentes',
  'Export CSV de vos données',
]

const JOURNEY_STEPS = [
  {
    icon: Gift,
    title: 'Découvrir',
    text: '1 mois Premium offert dès l\'inscription.',
  },
  {
    icon: Crown,
    title: 'Profiter',
    text: 'Explorez budgets, objectifs, analytics et exports à votre rythme.',
  },
  {
    icon: Shield,
    title: 'Choisir',
    text: 'Après l\'essai, souscrivez pour garder le Pro — ou restez en gratuit.',
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isPremium, isOnTrial, loading: subLoading } = useSubscription()
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

  const daysLeft = getTrialDaysLeft(user)
  const paidPremium = isPremium && !isOnTrial

  return (
    <PageShell>
      <Header title="MES POCHES Premium" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {isOnTrial ? (
          <TrialBanner user={user} />
        ) : paidPremium ? (
          <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-amber-50/50 p-5 text-center">
            <Crown className="mx-auto text-primary-500 mb-2" size={32} />
            <p className="font-semibold text-primary-800">Vous êtes Premium</p>
            <p className="text-sm text-primary-600 mt-1">
              {user?.premiumUntil
                ? `Abonnement actif jusqu'au ${formatPremiumUntil(user.premiumUntil)}.`
                : 'Toutes les fonctionnalités Pro sont débloquées.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm text-gray-600">
              Débloquez tout le potentiel de MES POCHES. Paiement par Mobile Money (MTN,
              Orange) ou carte bancaire.
            </p>
            <p className="text-xs text-primary-600 font-medium">
              Les nouveaux comptes bénéficient d&apos;1 mois Premium offert.
            </p>
          </div>
        )}

        {!paidPremium && (
          <section aria-label="Parcours essai Premium" className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Pensé pour vous accompagner
            </h2>
            <ol className="space-y-2">
              {JOURNEY_STEPS.map((step, i) => {
                const Icon = step.icon
                const active =
                  isOnTrial && i === 1
                    ? true
                    : !isPremium && i === 0
                      ? true
                      : false
                return (
                  <li
                    key={step.title}
                    className={`flex gap-3 rounded-xl p-3 ${
                      active ? 'bg-primary-50/80 ring-1 ring-primary-100' : 'bg-gray-50'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-500 ring-1 ring-gray-200'
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {i + 1}. {step.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">{step.text}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            {isOnTrial && (
              <p className="text-xs text-center text-gray-500">
                {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant
                {daysLeft > 1 ? 's' : ''} — aucun prélèvement automatique.
              </p>
            )}
          </section>
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
                {!paidPremium && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => choosePlan(key)}
                  >
                    {isOnTrial
                      ? `Continuer avec le ${plan.label.toLowerCase()}`
                      : `Choisir ${plan.label.toLowerCase()}`}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {paymentAvailable ? (
          <p className="text-xs text-center text-gray-500">
            Paiement sécurisé · Mobile Money & carte · XAF · Pas de renouvellement auto
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
