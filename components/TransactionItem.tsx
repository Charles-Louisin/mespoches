'use client'

import Link from 'next/link'
import { Transaction, Wallet, Category } from '@/lib/api'
import { formatCurrency, formatRelativeDate, getTransactionTypeLabel } from '@/lib/utils'
import EntityAvatar from '@/components/EntityAvatar'
import TransactionExportButtons from '@/components/TransactionExportButtons'

interface TransactionItemProps {
  transaction: Transaction
  isPremium?: boolean
  onRequirePremium?: (message?: string) => void
}

export default function TransactionItem({
  transaction,
  isPremium = false,
  onRequirePremium,
}: TransactionItemProps) {
  const wallet =
    typeof transaction.wallet_id === 'object'
      ? (transaction.wallet_id as Wallet)
      : null

  const category =
    transaction.category_id && typeof transaction.category_id === 'object'
      ? (transaction.category_id as Category)
      : null

  const typeLabel = getTransactionTypeLabel(transaction.type)
  const categoryName = category?.name ?? transaction.description ?? typeLabel

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-500'
      case 'transfer':
        return 'text-gray-700'
    }
  }

  const amountPrefix =
    transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''

  return (
    <div className="card px-4 py-3.5 active:scale-[0.99] transition-transform">
      <Link
        href={`/transactions/${transaction._id}`}
        className="flex items-center gap-3 touch-manipulation"
      >
        <EntityAvatar
          imageUrl={category?.image_url}
          name={categoryName}
          type="category"
          size="sm"
        />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {typeLabel} &gt; {categoryName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {formatRelativeDate(transaction.date)} &gt; {wallet?.name ?? '—'}
          </p>
        </div>

        <p className={`font-bold text-base flex-shrink-0 ${getAmountColor()}`}>
          {amountPrefix}
          {formatCurrency(transaction.amount, wallet?.currency || 'XAF')}
        </p>
      </Link>
      <div
        className="mt-2 pt-2 border-t border-gray-100"
        onClick={(e) => e.preventDefault()}
      >
        <TransactionExportButtons
          transactionId={transaction._id}
          isPremium={isPremium}
          onRequirePremium={onRequirePremium}
          layout="row"
        />
      </div>
    </div>
  )
}
