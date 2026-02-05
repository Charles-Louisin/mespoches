'use client'

import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import { User, Mail, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Récupérer les infos utilisateur depuis le token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch (error) {
        console.error('Erreur décodage token:', error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Mon profil" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Card profil */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {user?.name || 'Utilisateur'}
          </h2>
          <p className="text-sm text-gray-500">{user?.email || 'Non disponible'}</p>
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3">
            <Mail size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email || 'Non disponible'}</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-3">
            <Calendar size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Membre depuis</p>
              <p className="font-medium text-gray-900">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('fr-FR') 
                  : 'Non disponible'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Astuce</strong> : Vos données sont stockées localement et synchronisées avec le serveur. 
            Vous pouvez utiliser l'application hors ligne !
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
