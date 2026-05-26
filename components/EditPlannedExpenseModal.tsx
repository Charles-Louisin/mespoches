'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import {
  PlannedExpense,
  Wallet,
  Category,
  walletApi,
  categoryApi,
  plannedExpenseApi,
} from '@/lib/api'
import { getMinFutureUtcDateInputValue } from '@/lib/plannedExpenseDates'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'

interface EditPlannedExpenseModalProps {
  item: PlannedExpense | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function EditPlannedExpenseModal({
  item,
  isOpen,
  onClose,
  onSaved,
}: EditPlannedExpenseModalProps) {
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!item || !isOpen) return
    setAmount(String(item.amount))
    setWalletId(
      typeof item.wallet_id === 'object' ? item.wallet_id._id : String(item.wallet_id)
    )
    setCategoryId(
      item.category_id
        ? typeof item.category_id === 'object'
          ? item.category_id._id
          : String(item.category_id)
        : ''
    )
    setDescription(item.description || '')
    setScheduledDate(item.scheduled_date.slice(0, 10))
  }, [item, isOpen])

  useEffect(() => {
    if (!isOpen) return
    Promise.all([walletApi.getAll(), categoryApi.getAll('expense')])
      .then(([w, c]) => {
        setWallets(w)
        setCategories(c)
      })
      .catch(() => {})
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    try {
      setLoading(true)
      await plannedExpenseApi.update(item._id, {
        amount: parseFloat(amount),
        wallet_id: walletId,
        category_id: categoryId || null,
        description: description || undefined,
        scheduled_date: scheduledDate,
      })
      toast.success('Dépense prévue modifiée')
      onSaved()
      onClose()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur lors de la modification'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (typeof document === 'undefined' || !item) return null

  const walletOptions = [
    { value: '', label: 'Sélectionner une poche' },
    ...wallets.map((w) => ({ value: w._id, label: w.name })),
  ]

  const categoryOptions = [
    { value: '', label: 'Aucune catégorie' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ]

  const minDate = getMinFutureUtcDateInputValue()

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto w-full max-w-md card p-5 shadow-xl max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-labelledby="edit-planned-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 id="edit-planned-title" className="text-lg font-bold text-gray-900">
                  Modifier la dépense prévue
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-gray-400 touch-manipulation"
                  aria-label="Fermer"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Montant"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <Select
                  label="Poche"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  options={walletOptions}
                  required
                />
                <Select
                  label="Catégorie (optionnel)"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={categoryOptions}
                />
                <Input
                  label="Description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                  label="Date prévue (UTC)"
                  type="date"
                  value={scheduledDate}
                  min={minDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="secondary" fullWidth onClick={onClose}>
                    Annuler
                  </Button>
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
