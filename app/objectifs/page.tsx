'use client'

import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import BudgetsSection from '@/components/BudgetsSection'
import SavingsGoalsSection from '@/components/SavingsGoalsSection'
import RecurringSection from '@/components/RecurringSection'
import { useSubscription } from '@/hooks/useSubscription'

export default function ObjectifsPage() {
  const { isPremium, handleApiError } = useSubscription()

  return (
    <PageShell>
      <Header title="Objectifs" />

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        <BudgetsSection isPremium={isPremium} onApiError={handleApiError} />
        <SavingsGoalsSection isPremium={isPremium} onApiError={handleApiError} />
        <RecurringSection isPremium={isPremium} onApiError={handleApiError} />
      </main>
    </PageShell>
  )
}
