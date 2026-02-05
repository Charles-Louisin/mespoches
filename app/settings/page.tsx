'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import ConfirmModal from '@/components/ConfirmModal'
import { Tag, LogOut, User, Info } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { confirm, confirmState, closeConfirm } = useConfirm()

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Se déconnecter ?',
      message: 'Êtes-vous sûr de vouloir vous déconnecter de votre compte ?',
      confirmText: 'Oui, se déconnecter',
      cancelText: 'Annuler',
      variant: 'warning'
    })

    if (!confirmed) return

    logout()
    toast.success('Déconnexion réussie')
    router.push('/login')
  }

  const menuItems = [
    {
      icon: Tag,
      label: 'Gérer les catégories',
      description: 'Créer et modifier vos catégories',
      href: '/categories',
      color: 'text-primary-500',
      bg: 'bg-primary-50'
    },
    {
      icon: User,
      label: 'Mon profil',
      description: 'Informations du compte',
      href: '/profile',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: Info,
      label: 'À propos',
      description: 'Version et informations',
      href: '/about',
      color: 'text-gray-500',
      bg: 'bg-gray-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Paramètres" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Menu */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
                  <Icon size={24} className={item.color} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )
          })}
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">Application</h3>
          <p className="text-sm text-gray-600">MES POCHES</p>
          <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
        </div>

        {/* Bouton de déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white rounded-lg p-4 font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors touch-manipulation"
        >
          <LogOut size={20} />
          Se déconnecter
        </button>
      </main>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />

      <BottomNav />
    </div>
  )
}
