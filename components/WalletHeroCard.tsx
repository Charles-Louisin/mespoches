'use client'

import Image from 'next/image'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import Button from '@/components/Button'
import { useCurrency } from '@/contexts/CurrencyContext'

interface WalletHeroCardProps {
  balance: number
  imageUrl?: string | null
  editing: boolean
  formData: {
    name: string
    image_url: string | null
  }
  onFormChange: (data: { name: string; image_url: string | null }) => void
  onEdit: () => void
  onDelete: () => void
  onSave: () => void
  onCancel: () => void
  premiumRequired?: boolean
  saving?: boolean
  deleting?: boolean
}

export default function WalletHeroCard({
  balance,
  imageUrl,
  editing,
  formData,
  onFormChange,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  premiumRequired = false,
  saving = false,
  deleting = false,
}: WalletHeroCardProps) {
  const { formatAmount } = useCurrency()
  const hasImage = !!imageUrl && !editing

  return (
    <div
      className={`relative rounded-[1.35rem] overflow-hidden shadow-soft min-h-[200px] ${
        hasImage ? '' : 'balance-gradient'
      }`}
    >
      {hasImage && (
        <>
          <Image
            src={imageUrl!}
            alt=""
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-primary-800/75 to-primary-950/90" />
        </>
      )}

      <div className="relative z-10 p-6 text-white">
        {!editing ? (
          <>
            <p className="text-sm text-white/85 mb-1">Solde actuel</p>
            <h2 className="text-4xl font-bold mb-4">{formatAmount(balance)}</h2>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onEdit}
                disabled={deleting}
                className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition touch-manipulation disabled:opacity-50"
                aria-label="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                aria-busy={deleting || undefined}
                className="relative bg-red-500/90 hover:bg-red-600 rounded-xl px-4 py-2 transition touch-manipulation disabled:opacity-50"
                aria-label="Supprimer"
              >
                {deleting && (
                  <span
                    className="pointer-events-none absolute inset-x-2 top-1.5 h-0.5 overflow-hidden rounded-full bg-white/25"
                    aria-hidden
                  >
                    <span className="loading-bar-indeterminate block h-full w-1/2 rounded-full bg-white" />
                  </span>
                )}
                <Trash2 size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => onFormChange({ ...formData, image_url: url })}
                endpoint="walletImage"
                label="Icône"
                premiumRequired={premiumRequired}
              />
            </div>
            <div>
              <label className="block text-sm text-white/85 mb-2">Nom de la poche</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl text-gray-900 font-semibold disabled:opacity-70"
                placeholder="Ex: Cash"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                fullWidth
                loading={saving}
                onClick={onSave}
                className="!bg-white !text-primary-700 hover:!bg-white/95 !shadow-none"
              >
                <Save size={18} className="mr-2" />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              <Button
                type="button"
                fullWidth
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                className="!border-white/30 !text-white hover:!bg-white/20 !shadow-none"
              >
                <X size={18} className="mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
