import { SUBSCRIPTION_PLANS, TRIAL_MONTHS } from '@/lib/planLimits'
import { formatCurrency } from '@/lib/utils'

const MONTHLY_EQ = Math.round(SUBSCRIPTION_PLANS.yearly.priceXaf / 12)

export default function PremiumOffer() {
  const monthly = SUBSCRIPTION_PLANS.monthly
  const yearly = SUBSCRIPTION_PLANS.yearly

  return (
    <section id="premium" className="store-why relative z-10 px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2563EB]">
          Plan Premium
        </p>
        <h2 className="mt-3 font-display text-[2.1rem] leading-[1.12] tracking-tight text-[#111] sm:text-5xl">
          Un mois offert.{' '}
          <em className="store-em">Ensuite, à votre rythme.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.7] text-[#4a4458]">
          Dès l’inscription, <span className="store-k">{TRIAL_MONTHS} mois d’essai gratuit</span> pour
          tester le scan, la dictée et les analyses. Après l’essai, le compte reste gratuit — ou
          vous passez Premium, sans surprise.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        <article className="premium-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            Flexibilité
          </p>
          <h3 className="mt-2 font-display text-2xl text-[#111]">{monthly.label}</h3>
          <p className="premium-price">
            {formatCurrency(monthly.priceXaf)}
            <span>{monthly.periodLabel}</span>
          </p>
          <p className="mt-2 text-sm text-[#5b5270]">Sans engagement · résiliable à tout moment</p>
        </article>

        <article className="premium-card premium-card-on">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
                Le plus choisi
              </p>
              <h3 className="mt-2 font-display text-2xl text-[#111]">{yearly.label}</h3>
            </div>
            <span className="premium-badge">{yearly.savingsLabel}</span>
          </div>
          <p className="premium-price">
            {formatCurrency(yearly.priceXaf)}
            <span>{yearly.periodLabel}</span>
          </p>
          <p className="mt-2 text-sm text-[#5b5270]">
            {MONTHLY_EQ.toLocaleString('fr-FR')} XAF / mois · facturé une fois
          </p>
        </article>
      </div>
    </section>
  )
}
