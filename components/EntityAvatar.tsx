'use client'

import Image from 'next/image'
import { Wallet as WalletIcon, Tag } from 'lucide-react'

interface EntityAvatarProps {
  imageUrl?: string | null
  name: string
  type?: 'wallet' | 'category'
  size?: 'sm' | 'md'
}

export default function EntityAvatar({
  imageUrl,
  name,
  type = 'wallet',
  size = 'md',
}: EntityAvatarProps) {
  const dims = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'
  const iconSize = size === 'sm' ? 18 : 22

  if (imageUrl) {
    return (
      <div className={`relative ${dims} rounded-xl overflow-hidden flex-shrink-0 bg-primary-50`}>
        <Image src={imageUrl} alt={name} fill className="object-cover" unoptimized />
      </div>
    )
  }

  return (
    <div
      className={`${dims} rounded-xl flex items-center justify-center flex-shrink-0 ${
        type === 'wallet' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {type === 'wallet' ? <WalletIcon size={iconSize} /> : <Tag size={iconSize} />}
    </div>
  )
}
