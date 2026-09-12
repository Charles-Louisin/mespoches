'use client'

import {
  BellRing,
  ChevronRight,
  EyeOff,
  Home,
  History,
  Wallet,
  BarChart3,
  Target,
  Tag,
  Plus,
  Settings,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import EntityAvatar from '@/components/EntityAvatar'

const WALLETS = [
  { name: 'Cash', income: 0, expense: 18500, balance: 62000 },
  { name: 'MoMo', income: 85000, expense: 24100, balance: 121400 },
  { name: 'Banque', income: 0, expense: 12000, balance: 65100 },
]

const TRANSACTIONS = [
  { name: 'Courses', type: 'expense' as const, amount: '− 8 400 F', when: "Aujourd'hui" },
  { name: 'Salaire', type: 'income' as const, amount: '+ 85 000 F', when: 'Hier' },
  { name: 'Transport', type: 'expense' as const, amount: '− 1 500 F', when: 'Hier' },
]

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Home
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 py-2.5 ${
        active ? 'text-white' : 'text-white/70'
      }`}
    >
      <div className={`rounded-xl p-2 ${active ? 'bg-white/20' : ''}`}>
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span
        className={`w-full max-w-[52px] truncate text-center text-[10px] leading-tight ${
          active ? 'font-semibold' : 'font-medium'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

/** Copie visuelle de l’accueil actuel, figée pour la landing. */
export default function LandingHomePreview() {
  return (
    <div
      className="pointer-events-none flex h-full flex-col text-ink"
      style={{
        backgroundColor: '#eef1f5',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.06), transparent), linear-gradient(180deg, #f3f5f8 0%, #eef1f5 100%)',
      }}
    >
      <header className="shrink-0 px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-1.5 text-[15px] font-semibold text-gray-900">
            Salut, <span className="font-bold">John Doe</span>
          </h1>
          <Settings size={20} className="text-gray-600" strokeWidth={1.75} />
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-4 pb-2">
        <div className="balance-gradient relative overflow-hidden rounded-[1.35rem] p-4 text-white shadow-soft">
          <p className="mb-1 text-sm text-white/80">Solde total</p>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-[1.65rem] leading-none">248 500 F</p>
            <EyeOff size={18} className="text-white/85" />
          </div>
          <div className="flex justify-between gap-3 border-t border-white/15 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <TrendingDown size={13} className="text-rose-200" />
              </div>
              <div>
                <p className="text-[10px] text-white/70">Dépenses du mois</p>
                <p className="truncate text-xs font-semibold">54 600 F</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2">
              <div className="text-right">
                <p className="text-[10px] text-white/70">Revenus du mois</p>
                <p className="truncate text-xs font-semibold">85 000 F</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <TrendingUp size={13} className="text-emerald-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-3 border border-amber-200 bg-amber-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <BellRing size={18} className="text-amber-700" />
          </div>
          <p className="min-w-0 flex-1 text-[13px] font-semibold text-amber-900">
            2 transactions à valider
          </p>
          <ChevronRight size={18} className="shrink-0 text-amber-700" />
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="section-title">Mes poches</h3>
            <span className="link-muted text-xs">Voir tout</span>
          </div>
          <div className="space-y-2">
            {WALLETS.map((w) => (
              <div key={w.name} className="card px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <EntityAvatar name={w.name} type="wallet" size="sm" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-900">
                      {w.name}
                    </span>
                    <div className="mt-0.5 flex gap-2 text-[10px]">
                      <span className="font-medium text-green-600">
                        +{w.income.toLocaleString('fr-FR')} F
                      </span>
                      <span className="font-medium text-red-500">
                        −{w.expense.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {w.balance.toLocaleString('fr-FR')} F
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="section-title">Transactions récentes</h3>
            <span className="link-muted text-xs">Voir tout</span>
          </div>
          <div className="space-y-2">
            {TRANSACTIONS.map((t) => (
              <div key={t.name} className="card flex items-center gap-2.5 px-3 py-2.5">
                <EntityAvatar name={t.name} type="category" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.when}</p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    t.type === 'income' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="relative shrink-0 px-3 pb-3 pt-1">
        <div className="relative rounded-2xl px-1 pb-1 pt-2 nav-surface shadow-nav">
          <div className="flex items-end">
            <div className="flex min-w-0 flex-1">
              <NavItem icon={Home} label="Accueil" active />
              <NavItem icon={History} label="Historique" />
              <NavItem icon={Target} label="Objectifs" />
            </div>
            <div className="w-12 shrink-0" />
            <div className="flex min-w-0 flex-1">
              <NavItem icon={Wallet} label="Poches" />
              <NavItem icon={Tag} label="Catég." />
              <NavItem icon={BarChart3} label="Analyse" />
            </div>
          </div>
          <div className="absolute left-1/2 top-0 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-[3px] border-surface bg-primary-950 text-white">
            <Plus size={22} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[620px] w-[300px] lg:h-[680px] lg:w-[328px]">
      <div
        className="absolute inset-x-10 -bottom-6 h-14 rounded-[100%] bg-black/45 blur-2xl"
        aria-hidden
      />
      <div className="absolute inset-0 rounded-[2.55rem] border border-white/15 bg-[#111827] shadow-[0_44px_90px_-30px_rgba(0,0,0,0.8)]">
        <div className="absolute left-1/2 top-2.5 z-20 h-5 w-[88px] -translate-x-1/2 rounded-full bg-black/70" />
        <div className="absolute inset-[10px] overflow-hidden rounded-[2.05rem] bg-surface">
          {children}
        </div>
      </div>
    </div>
  )
}
