'use client'

import Image from 'next/image'
import Link from 'next/link'
import { UploadButton } from '@/lib/uploadthing'
import { ImagePlus, X, Crown } from 'lucide-react'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  endpoint: 'categoryImage' | 'walletImage'
  label?: string
  premiumRequired?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  endpoint,
  label = 'Image',
  premiumRequired = false,
}: ImageUploadProps) {
  if (premiumRequired) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <Link
          href="/subscription"
          className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-primary-200 bg-primary-50/50"
        >
          <Crown size={20} className="text-primary-500 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">Images Premium</p>
            <p className="text-gray-500">Personnalisez vos poches et catégories avec Premium</p>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-xl bg-primary-50 border-2 border-dashed border-primary-200 overflow-hidden flex-shrink-0">
          {value ? (
            <>
              <Image
                src={value}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white touch-manipulation"
                aria-label="Supprimer l'image"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-300">
              <ImagePlus size={28} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <UploadButton
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) onChange(res[0].url)
            }}
            onUploadError={(error) => {
              console.error('Upload error:', error)
            }}
            appearance={{
              button:
                'ut-ready:bg-primary-500 ut-uploading:cursor-not-allowed rounded-xl bg-primary-500 text-sm font-semibold text-white px-4 py-2.5 transition hover:bg-primary-600',
              allowedContent: 'text-xs text-gray-500 mt-1',
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return 'Envoi...'
                if (ready) return value ? "Changer l'image" : 'Ajouter une image'
                return 'Chargement...'
              },
              allowedContent: 'PNG, JPG — max 4 Mo',
            }}
          />
        </div>
      </div>
    </div>
  )
}
