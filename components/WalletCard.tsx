'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wallet } from '@/lib/api'
import EntityAvatar from '@/components/EntityAvatar'
import { useCurrency } from '@/contexts/CurrencyContext'

interface WalletCardProps {
  wallet: Wallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const { formatAmount } = useCurrency()
  const monthIncome = wallet.month_income ?? 0
  const monthExpense = wallet.month_expense ?? 0

  return (
    <Link href={`/wallets/${wallet._id}`} className="block touch-manipulation">
      <motion.div
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        className="card px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <EntityAvatar
            imageUrl={wallet.image_url}
            name={wallet.name}
            type="wallet"
          />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900 block truncate">{wallet.name}</span>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <span className="text-green-600 font-medium">
                +{formatAmount(monthIncome)}
              </span>
              <span className="text-red-500 font-medium">
                −{formatAmount(monthExpense)}
              </span>
              <span className="text-gray-400">ce mois</span>
            </div>
          </div>
          <span className="font-semibold text-gray-900 shrink-0">
            {formatAmount(wallet.current_balance)}
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
