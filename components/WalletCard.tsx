import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Wallet } from '@/lib/api'
import { ChevronRight } from 'lucide-react'

interface WalletCardProps {
  wallet: Wallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <Link href={`/wallets/${wallet._id}`}>
      <div className="bg-white rounded-lg p-4 border border-gray-200 active:bg-gray-50 touch-manipulation">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{wallet.name}</h3>
            <p className="text-2xl font-bold text-primary-600 mt-1">
              {formatCurrency(wallet.current_balance, wallet.currency)}
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>
    </Link>
  )
}
