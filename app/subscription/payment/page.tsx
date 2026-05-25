'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import Button from '@/components/Button'
import { SUBSCRIPTION_PLANS, type BillingPeriod } from '@/lib/planLimits'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, AlertCircle } from 'lucide-react'

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const period = (searchParams.get('period') as BillingPeriod) || 'monthly'
  const plan =
    period in SUBSCRIPTION_PLANS
      ? SUBSCRIPTION_PLANS[period]
      : SUBSCRIPTION_PLANS.monthly

  const handlePay = () => {
    toast.info(
      'Le paiement n\'est pas encore activé. Vous serez notifié dès que le service sera disponible.',
      { duration: 5000 }
    )
  }

  return (
    <PageShell>
      <Header title="Paiement" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-gray-900">Récapitulatif</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Forfait</span>
            <span className="font-medium">{plan.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="text-xl font-bold text-primary-600">
              {formatCurrency(plan.priceXaf)}
              <span className="text-sm font-normal text-gray-500">
                {plan.periodLabel}
              </span>
            </span>
          </div>
        </div>

        <div className="card p-4 flex gap-3 bg-amber-50 border border-amber-100">
          <AlertCircle className="text-amber-600 shrink-0" size={22} />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Paiement pas encore disponible</p>
            <p className="mt-1 text-amber-800">
              L&apos;intégration Mobile Money et carte bancaire est en cours. Vous
              pourrez finaliser votre abonnement ici très prochainement.
            </p>
          </div>
        </div>

        <div className="card p-5 opacity-60 pointer-events-none space-y-3">
          <p className="text-sm font-medium text-gray-500">Moyens de paiement (à venir)</p>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <CreditCard size={20} className="text-gray-400" />
            <span className="text-gray-600">Carte bancaire</span>
          </div>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <span className="text-gray-400 font-bold text-xs">MM</span>
            <span className="text-gray-600">Mobile Money (MTN / Orange)</span>
          </div>
        </div>

        <Button className="w-full" onClick={handlePay}>
          Payer {formatCurrency(plan.priceXaf)}
        </Button>

        <button
          type="button"
          onClick={() => router.push('/subscription')}
          className="w-full text-sm text-gray-500 py-2"
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
          <div className="p-8 text-center text-gray-500">Chargement…</div>
        </PageShell>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}
