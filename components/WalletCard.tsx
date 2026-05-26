'use client'

import Link from 'next/link'
import { Wallet } from '@/lib/api'
import EntityAvatar from '@/components/EntityAvatar'
import { useCurrency } from '@/contexts/CurrencyContext'

interface WalletCardProps {
  wallet: Wallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  const { formatAmount } = useCurrency()

  return (
    <Link href={`/wallets/${wallet._id}`} className="block touch-manipulation">
      <div className="card px-4 py-3.5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <EntityAvatar
            imageUrl={wallet.image_url}
            name={wallet.name}
            type="wallet"
          />
          <span className="flex-1 font-medium text-gray-900">{wallet.name}</span>
          <span className="font-semibold text-gray-900">
            {formatAmount(wallet.current_balance)}
          </span>
        </div>
      </div>
    </Link>
  )
}
