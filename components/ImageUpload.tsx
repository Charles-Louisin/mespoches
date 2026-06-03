'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { UploadButton, useUploadThing } from '@/lib/uploadthing'
import { ImagePlus, X, Crown, Camera as CameraIcon } from 'lucide-react'
import { toast } from 'sonner'
import { isNativeApp, requestCameraAndGalleryPermission } from '@/lib/capacitor/native-permissions'

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
  const [nativeUploading, setNativeUploading] = useState(false)
  const { startUpload, isUploading } = useUploadThing(endpoint)

  const pickNativePhoto = async (source: CameraSource) => {
    try {
      setNativeUploading(true)
      await requestCameraAndGalleryPermission()
      const check = await Camera.checkPermissions()
      if (check.camera !== 'granted' && source === CameraSource.Camera) {
        toast.error('Autorisez la caméra dans les paramètres du téléphone')
        return
      }
      if (check.photos !== 'granted' && source === CameraSource.Photos) {
        toast.error('Autorisez l’accès aux photos dans les paramètres du téléphone')
        return
      }
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source,
      })
      if (!photo.dataUrl) {
        toast.error('Aucune image sélectionnée')
        return
      }
      const blob = await fetch(photo.dataUrl).then((r) => r.blob())
      const file = new File([blob], `mes-poches-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const uploaded = await startUpload([file])
      if (uploaded?.[0]?.url) {
        onChange(uploaded[0].url)
        toast.success('Image ajoutée')
      }
    } catch (e) {
      console.error(e)
      toast.error('Impossible de récupérer la photo')
    } finally {
      setNativeUploading(false)
    }
  }

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

  const uploading = isUploading || nativeUploading

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
        <div className="flex-1 min-w-0 space-y-2">
          {isNativeApp() ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => pickNativePhoto(CameraSource.Camera)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 text-sm font-semibold text-white px-4 py-2.5 hover:bg-primary-600 disabled:opacity-50 touch-manipulation"
              >
                <CameraIcon size={16} />
                {uploading ? 'Envoi…' : 'Prendre une photo'}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => pickNativePhoto(CameraSource.Photos)}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white text-sm font-semibold text-primary-600 px-4 py-2.5 hover:bg-primary-50 disabled:opacity-50 touch-manipulation"
              >
                Galerie
              </button>
            </div>
          ) : (
            <UploadButton
              endpoint={endpoint}
              onClientUploadComplete={(res) => {
                if (res?.[0]?.url) onChange(res[0].url)
              }}
              onUploadError={(error) => {
                console.error('Upload error:', error)
                toast.error("Erreur lors de l'envoi")
              }}
              appearance={{
                button:
                  'ut-ready:bg-primary-500 ut-uploading:cursor-not-allowed rounded-xl bg-primary-500 text-sm font-semibold text-white px-4 py-2.5 transition hover:bg-primary-600',
                allowedContent: 'text-xs text-gray-500 mt-1',
              }}
              content={{
                button({ ready, isUploading: utBusy }) {
                  if (utBusy) return 'Envoi...'
                  if (ready) return value ? "Changer l'image" : 'Ajouter une image'
                  return 'Chargement...'
                },
                allowedContent: 'PNG, JPG — max 4 Mo',
              }}
            />
          )}
          <p className="text-xs text-gray-500">PNG, JPG — max 4 Mo</p>
        </div>
      </div>
    </div>
  )
}
