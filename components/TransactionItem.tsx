import { Transaction, Wallet, Category } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const wallet = typeof transaction.wallet_id === 'object' 
    ? transaction.wallet_id as Wallet 
    : null

  const destWallet = transaction.destination_wallet_id && typeof transaction.destination_wallet_id === 'object'
    ? transaction.destination_wallet_id as Wallet
    : null

  const category = transaction.category_id && typeof transaction.category_id === 'object'
    ? transaction.category_id as Category
    : null

  const getIcon = () => {
    switch (transaction.type) {
      case 'income':
        return <ArrowDownRight size={20} className="text-green-600" />
      case 'expense':
        return <ArrowUpRight size={20} className="text-red-600" />
      case 'transfer':
        return <ArrowRightLeft size={20} className="text-blue-600" />
    }
  }

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
    }
  }

  const getTitle = () => {
    if (transaction.description) return transaction.description
    if (category) return category.name
    switch (transaction.type) {
      case 'income':
        return 'Revenu'
      case 'expense':
        return 'Dépense'
      case 'transfer':
        return destWallet ? `Vers ${destWallet.name}` : 'Transfert'
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{getTitle()}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {wallet?.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>{formatCurrency(transaction.balance_before, wallet?.currency || 'XAF')}</span>
            <span>→</span>
            <span>{formatCurrency(transaction.balance_after, wallet?.currency || 'XAF')}</span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-lg font-bold ${getAmountColor()}`}>
            {transaction.type === 'expense' && '-'}
            {transaction.type === 'income' && '+'}
            {formatCurrency(transaction.amount, wallet?.currency || 'XAF')}
          </p>
        </div>
      </div>
    </div>
  )
}
