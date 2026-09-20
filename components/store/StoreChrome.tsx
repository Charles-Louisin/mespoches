import Link from 'next/link'
import AppLogo from '@/components/AppLogo'
import StoreAuthActions from '@/components/store/StoreAuthActions'

export default function StoreChrome({
  children,
  compact = false,
  bare = false,
}: {
  children: React.ReactNode
  compact?: boolean
  bare?: boolean
}) {
  return (
    <div className="store-root min-h-dvh text-[#1b1630]">
      {bare ? null : (
      <header className="store-chrome-header">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <AppLogo size="sm" priority />
          <span className="font-display truncate text-lg tracking-wide">MES POCHES</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-sm text-[#3f3358]">
          <Link href="/" className="hover:text-[#2563EB]">
            Accueil
          </Link>
          <Link href="/legal" className="hover:text-[#2563EB]">
            Informations légales
          </Link>
          <StoreAuthActions />
        </nav>
      </header>
      )}

      {children}

      {bare ? null : (
      <footer className="relative z-10 border-t border-black/[0.06] bg-white/50">
        <div
          className={`mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[#707070] md:flex-row md:items-center md:justify-between lg:px-10 ${
            compact ? 'py-6' : ''
          }`}
        >
          <p>© {new Date().getFullYear()} MES POCHES</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/legal" className="hover:text-[#2563EB]">
              Informations légales
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#2563EB]">
              Confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-[#2563EB]">
              Conditions
            </Link>
            <Link href="/legal/mentions" className="hover:text-[#2563EB]">
              Mentions
            </Link>
          </nav>
        </div>
      </footer>
      )}
    </div>
  )
}
