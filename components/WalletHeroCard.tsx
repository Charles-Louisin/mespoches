'use client'

import Image from 'next/image'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
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
}: WalletHeroCardProps) {
  const { formatAmount } = useCurrency()
  const hasImage = !!imageUrl && !editing

  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-lg min-h-[200px] ${
        hasImage ? 'shadow-primary-900/20' : 'balance-gradient shadow-primary-500/25'
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
                className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 transition touch-manipulation"
                aria-label="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="bg-red-500/90 hover:bg-red-600 rounded-xl px-4 py-2 transition touch-manipulation"
                aria-label="Supprimer"
              >
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
                className="w-full px-4 py-3 rounded-xl text-gray-900 font-semibold"
                placeholder="Ex: Cash"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onSave}
                className="flex-1 bg-white text-primary-700 rounded-xl px-4 py-3 font-semibold flex items-center justify-center gap-2 touch-manipulation"
              >
                <Save size={18} />
                Enregistrer
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 font-semibold flex items-center justify-center gap-2 touch-manipulation"
              >
                <X size={18} />
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
