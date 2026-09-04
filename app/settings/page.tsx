'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/auth'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'
import PageShell from '@/components/PageShell'
import Header from '@/components/Header'
import ConfirmModal from '@/components/ConfirmModal'
import ExportAllModal from '@/components/ExportAllModal'
import { LogOut, User, Info, Crown, Download, Scale, Shield, FileText } from 'lucide-react'
import { ExportFormat } from '@/lib/api'
import { downloadBlob } from '@/lib/download'
import { useSubscription } from '@/hooks/useSubscription'
import { isPremiumRequiredError } from '@/lib/subscription'
import { exportApi } from '@/lib/api'
import ProBadge from '@/components/ProBadge'
import Select from '@/components/Select'
import AppLogo from '@/components/AppLogo'
import { useCurrency } from '@/contexts/CurrencyContext'
import { AppCurrency, WALLET_CURRENCIES } from '@/lib/currencies'

export default function SettingsPage() {
  const router = useRouter()
  const { confirm, confirmState, closeConfirm } = useConfirm()
  const { isPremium, isOnTrial, showProBadge, requirePremium } = useSubscription()
  const { currency, setCurrency, loading: currencyLoading } = useCurrency()
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [savingCurrency, setSavingCurrency] = useState(false)

  const handleCurrencyChange = async (value: string) => {
    try {
      setSavingCurrency(true)
      await setCurrency(value as AppCurrency)
    } catch {
      /* toast géré dans le contexte */
    } finally {
      setSavingCurrency(false)
    }
  }

  const handleExportAll = async (format: ExportFormat) => {
    if (!isPremium) {
      setExportModalOpen(false)
      requirePremium(`Export ${format.toUpperCase()} réservé aux abonnés Premium`)
      return
    }
    try {
      setExporting(format)
      const blob = await exportApi.downloadTransactions(format)
      const ext = format === 'xlsx' ? 'xlsx' : format
      await downloadBlob(blob, `mes-poches-${Date.now()}.${ext}`)
      toast.success('Fichier prêt')
      setExportModalOpen(false)
    } catch (e) {
      if (isPremiumRequiredError(e)) {
        setExportModalOpen(false)
        requirePremium(e.message)
      } else toast.error(e instanceof Error ? e.message : 'Erreur export')
    } finally {
      setExporting(null)
    }
  }

  const openExportModal = () => setExportModalOpen(true)

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

  const legalLinks = [
    { href: '/legal/privacy', label: 'Confidentialité', icon: Shield },
    { href: '/legal/terms', label: "Conditions d'utilisation", icon: FileText },
    { href: '/legal/mentions', label: 'Mentions légales', icon: Scale },
  ]

  const menuItems = [
    {
      icon: Crown,
      label: isOnTrial
        ? 'Mon essai Premium'
        : isPremium
          ? 'Mon abonnement Premium'
          : 'Passer à Premium',
      href: '/subscription',
      color: isOnTrial ? 'text-primary-600' : 'text-amber-600',
      bg: isOnTrial ? 'bg-primary-50' : 'bg-amber-50',
    },
    {
      icon: Download,
      label: 'Exporter tout',
      href: '#export',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      pro: true,
      onClick: openExportModal,
    },
    {
      icon: User,
      label: 'Mon profil',
      href: '/profile',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: Info,
      label: 'À propos',
      href: '/about',
      color: 'text-gray-500',
      bg: 'bg-gray-50'
    },
  ]

  return (
    <PageShell>
      <Header title="Paramètres" showBack />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500">Devise</h3>
          <Select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            options={WALLET_CURRENCIES.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            disabled={currencyLoading || savingCurrency}
          />
        </div>

        <div className="card overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const rowClass = `flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors w-full text-left ${
              index !== menuItems.length - 1 ? 'border-b border-gray-200' : ''
            }`
            const inner = (
              <>
                <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
                  <Icon size={24} className={item.color} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                    {item.label}
                    {'pro' in item && item.pro && showProBadge && <ProBadge />}
                  </p>
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
              </>
            )
            if ('onClick' in item && item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={rowClass}
                  disabled={!!exporting}
                >
                  {inner}
                </button>
              )
            }
            return (
              <Link key={item.href} href={item.href} className={rowClass}>
                {inner}
              </Link>
            )
          })}
        </div>

        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-primary-500" />
            <h3 className="text-sm font-semibold text-gray-900">Informations légales</h3>
          </div>
          <div className="space-y-1">
            <Link
              href="/legal"
              className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-primary-50 text-primary-700 font-semibold text-sm hover:bg-primary-100 transition-colors"
            >
              Tous les documents légaux
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white rounded-lg p-4 font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors touch-manipulation"
        >
          <LogOut size={20} />
          Se déconnecter
        </button>
      </main>

      <ExportAllModal
        isOpen={exportModalOpen}
        onClose={() => !exporting && setExportModalOpen(false)}
        onExport={handleExportAll}
        exporting={exporting}
        showProBadge={showProBadge}
      />

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
    </PageShell>
  )
}
