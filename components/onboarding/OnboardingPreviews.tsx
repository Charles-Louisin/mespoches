'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  EyeOff,
  History,
  Home,
  MousePointer2,
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, operationsLabel } from '@/lib/utils'

/* ——— Cadre téléphone ——— */

export function PhoneFrame({
  children,
  height = 300,
}: {
  children: React.ReactNode
  height?: number
}) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-b from-primary-200/40 to-primary-500/10 blur-xl" />
      <div className="relative rounded-[1.75rem] border border-white/80 bg-white p-2 shadow-[0_20px_50px_-12px_rgba(99,91,255,0.35)]">
        <div className="flex items-center justify-center gap-1 pb-2 pt-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
        <div
          className="overflow-hidden rounded-2xl bg-surface relative"
          style={{ height }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/* ——— Répliques UI (mêmes classes que l’app) ——— */

function PreviewEntityAvatar({
  name,
  type = 'wallet',
}: {
  name: string
  type?: 'wallet' | 'category'
}) {
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        type === 'wallet' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {type === 'wallet' ? <WalletIcon size={18} /> : <Tag size={18} />}
    </div>
  )
}

/** BalanceCard — app/page.tsx */
function PreviewBalanceCard() {
  return (
    <div className="balance-gradient rounded-3xl p-3.5 text-white shadow-lg shadow-primary-500/25">
      <p className="text-[10px] text-white/85 mb-0.5">Solde Total :</p>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-lg font-bold tracking-tight">1 245 800 XAF</h2>
        <div className="p-1 text-white/90">
          <EyeOff size={16} />
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-2.5 border-t border-white/20">
        <div className="flex items-center gap-1.5 flex-1">
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
            <TrendingDown size={12} className="text-red-300" />
          </div>
          <div>
            <p className="text-[8px] text-white/75">Dépense ce mois</p>
            <p className="font-semibold text-[10px]">185 000 XAF</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <div className="text-right">
            <p className="text-[8px] text-white/75">Revenu ce mois</p>
            <p className="font-semibold text-[10px]">320 000 XAF</p>
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
            <TrendingUp size={12} className="text-green-300" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** WalletCard — components/WalletCard.tsx */
function PreviewWalletCard({
  name,
  balance,
  highlighted,
}: {
  name: string
  balance: number
  highlighted?: boolean
}) {
  return (
    <div
      className={`card px-3 py-2.5 transition-shadow relative ${
        highlighted ? 'ring-2 ring-primary-400 shadow-md shadow-primary-500/15' : ''
      }`}
    >
      <div className="flex items-center gap-2.5">
        <PreviewEntityAvatar name={name} type="wallet" />
        <span className="flex-1 font-medium text-gray-900 text-xs">{name}</span>
        <span className="font-semibold text-gray-900 text-xs">
          {formatCurrency(balance)}
        </span>
      </div>
    </div>
  )
}

/** Header — components/Header.tsx */
function PreviewAppHeader({ title }: { title: string }) {
  return (
    <header className="bg-surface/95 border-b border-gray-100/80 shrink-0">
      <div className="flex items-center h-9 px-2.5">
        <h1 className="text-xs font-bold text-gray-900 truncate">{title}</h1>
      </div>
    </header>
  )
}

/** TransactionItem (partie lien) — components/TransactionItem.tsx */
function PreviewTransactionItem({
  type,
  categoryName,
  walletName,
  amount,
  dateLabel,
}: {
  type: 'income' | 'expense'
  categoryName: string
  walletName: string
  amount: number
  dateLabel: string
}) {
  const typeLabel = type === 'income' ? 'Revenu' : 'Dépense'
  const amountColor = type === 'income' ? 'text-green-600' : 'text-red-500'
  const prefix = type === 'expense' ? '-' : '+'

  return (
    <div className="card px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <PreviewEntityAvatar name={categoryName} type="category" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate text-[11px]">
            {typeLabel} &gt; {categoryName}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5 truncate">
            {dateLabel} &gt; {walletName}
          </p>
        </div>
        <p className={`font-bold text-xs flex-shrink-0 ${amountColor}`}>
          {prefix}
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  )
}

/** BottomNav — components/BottomNav.tsx (statique, sans animation) */
function PreviewBottomNav({ activeHref }: { activeHref: string }) {
  const leftItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/transactions', icon: History, label: 'Historique' },
  ]
  const rightItems = [
    { href: '/wallets', icon: WalletIcon, label: 'Portefeuilles' },
    { href: '/analytics', icon: BarChart3, label: 'Analyse' },
  ]

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string
    icon: typeof Home
    label: string
  }) => {
    const isActive = href === activeHref
    return (
      <div
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 ${
          isActive ? 'text-white' : 'text-white/70'
        }`}
      >
        <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
          <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-[7px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="shrink-0 px-1.5 pb-1.5 pt-0.5 bg-surface">
      <div className="relative nav-gradient rounded-xl shadow-nav px-1 pt-1 pb-0.5">
        <div className="flex items-end">
          <div className="flex flex-1">
            {leftItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
          <div className="w-10 flex-shrink-0" />
          <div className="flex flex-1">
            {rightItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-3.5 w-9 h-9 rounded-full bg-primary-800 shadow-lg flex items-center justify-center text-white border-[3px] border-surface"
          aria-hidden
        >
          <Plus size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

/** CategoryBlock — app/analytics/page.tsx */
function PreviewCategoryBlock({
  title,
  stats,
  color,
}: {
  title: string
  stats: { category: string; total: number; count: number }[]
  color: 'red' | 'green'
}) {
  const total = stats.reduce((sum, s) => sum + s.total, 0)
  const bar = color === 'red' ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className="card p-3">
      <h3 className="text-[11px] font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-2">
        {stats.map((stat) => {
          const percentage = total > 0 ? (stat.total / total) * 100 : 0
          return (
            <div key={stat.category}>
              <div className="flex justify-between mb-0.5">
                <span className="text-[10px] font-medium">{stat.category}</span>
                <span className="text-[10px] font-bold">
                  {formatCurrency(stat.total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  className={`${bar} h-1.5 rounded-full`}
                  animate={{ width: ['0%', `${percentage}%`, `${percentage}%`, '0%'] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.35, 0.65, 1],
                  }}
                />
              </div>
              <p className="text-[8px] text-gray-500 mt-0.5">
                {percentage.toFixed(0)} % · {operationsLabel(stat.count)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Résumé mensuel — app/analytics/page.tsx */
function PreviewMonthSummary() {
  return (
    <div className="card p-3">
      <h2 className="text-[11px] font-semibold text-gray-900 mb-2">Mai 2026</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500">Revenus</p>
              <p className="text-xs font-bold text-green-600">
                {formatCurrency(720000)}
              </p>
            </div>
          </div>
          <span className="text-[9px] text-gray-500">{operationsLabel(8)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown size={14} className="text-red-600" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500">Dépenses</p>
              <p className="text-xs font-bold text-red-600">
                {formatCurrency(485000)}
              </p>
            </div>
          </div>
          <span className="text-[9px] text-gray-500">{operationsLabel(14)}</span>
        </div>
        <div className="pt-2 border-t border-gray-200 flex justify-between">
          <p className="text-[10px] font-semibold text-gray-900">Solde du mois</p>
          <p className="text-sm font-bold text-green-600">
            +{formatCurrency(235000)}
          </p>
        </div>
      </div>
    </div>
  )
}

/* Curseur simulé */

function MockCursor({
  x,
  y,
  clicking,
}: {
  x: number
  y: number
  clicking: boolean
}) {
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      animate={{ top: y, left: x }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        animate={clicking ? { scale: [1, 0.88, 1] } : { scale: 1 }}
        transition={{ duration: 0.22 }}
      >
        <MousePointer2
          className="w-5 h-5 text-gray-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
          fill="white"
          strokeWidth={1.5}
        />
      </motion.div>
      <AnimatePresence>
        {clicking && (
          <motion.span
            className="absolute top-3 left-3 w-5 h-5 rounded-full border-2 border-primary-400 bg-primary-400/20"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ——— Previews exportés ——— */

const PREVIEW_WALLETS = [
  { name: 'Compte courant', balance: 845200 },
  { name: 'Épargne', balance: 400600 },
] as const

export function WelcomePreview() {
  const [phase, setPhase] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const walletRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const [cursorPos, setCursorPos] = useState({ x: 24, y: 120 })

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 4), 2200)
    return () => clearInterval(id)
  }, [])

  const cursorWallet: 0 | 1 = phase >= 2 ? 1 : 0
  const clicking = phase === 1 || phase === 3
  const activeWallet = phase === 1 ? 0 : phase === 3 ? 1 : -1

  useEffect(() => {
    const container = containerRef.current
    const target = walletRefs[cursorWallet].current
    if (!container || !target) return

    const cRect = container.getBoundingClientRect()
    const tRect = target.getBoundingClientRect()
    setCursorPos({
      x: tRect.left - cRect.left + tRect.width * 0.35,
      y: tRect.top - cRect.top + tRect.height * 0.45,
    })
  }, [cursorWallet, phase])

  return (
    <PhoneFrame height={296}>
      <div
        ref={containerRef}
        className="relative h-full p-2.5 flex flex-col gap-2 overflow-hidden"
      >
        <PreviewBalanceCard />

        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="section-title text-[9px]">Mes poches</h3>
            <span className="link-muted text-[9px]">Voir tout</span>
          </div>
          <div className="space-y-1.5 relative">
            {PREVIEW_WALLETS.map((w, i) => (
              <div key={w.name} ref={walletRefs[i]}>
                <PreviewWalletCard
                  name={w.name}
                  balance={w.balance}
                  highlighted={activeWallet === i}
                />
              </div>
            ))}
          </div>
        </div>

        <MockCursor x={cursorPos.x} y={cursorPos.y} clicking={clicking} />
      </div>
    </PhoneFrame>
  )
}

const TX_LOOP = [
  {
    id: 'salaire',
    type: 'income' as const,
    categoryName: 'Salaire',
    walletName: 'Compte courant',
    amount: 450000,
    dateLabel: "Aujourd'hui",
  },
  {
    id: 'courses',
    type: 'expense' as const,
    categoryName: 'Courses',
    walletName: 'Compte courant',
    amount: 28500,
    dateLabel: 'Hier',
  },
  {
    id: 'loyer',
    type: 'expense' as const,
    categoryName: 'Loyer',
    walletName: 'Compte courant',
    amount: 120000,
    dateLabel: '12 mai 2026',
  },
]

export function TransactionsPreview() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1800)
    return () => clearInterval(id)
  }, [])

  const visibleCount = step === 0 ? 1 : step === 1 ? 2 : 3
  const visible = [...TX_LOOP].reverse().slice(0, visibleCount)

  return (
    <PhoneFrame height={318}>
      <div className="h-full flex flex-col">
        <PreviewAppHeader title="Historique" />

        <div className="flex-1 overflow-hidden px-2 py-1.5 space-y-1.5 min-h-0">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              >
                <PreviewTransactionItem {...t} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <PreviewBottomNav activeHref="/transactions" />
      </div>
    </PhoneFrame>
  )
}

const EXPENSE_STATS = [
  { category: 'Alimentation', total: 125000, count: 6 },
  { category: 'Transport', total: 85000, count: 4 },
  { category: 'Loyer', total: 120000, count: 1 },
]

const INCOME_STATS = [
  { category: 'Salaire', total: 450000, count: 1 },
  { category: 'Freelance', total: 50000, count: 2 },
]

export function AnalyticsPreview() {
  return (
    <PhoneFrame height={332}>
      <div className="h-full flex flex-col overflow-hidden">
        <PreviewAppHeader title="Analyse" />
        <div className="flex-1 overflow-hidden px-2 py-1.5 space-y-1.5 min-h-0">
          <PreviewMonthSummary />
          <PreviewCategoryBlock
            title="Dépenses par catégorie"
            stats={EXPENSE_STATS}
            color="red"
          />
          <PreviewCategoryBlock
            title="Revenus par catégorie"
            stats={INCOME_STATS}
            color="green"
          />
        </div>
      </div>
    </PhoneFrame>
  )
}
