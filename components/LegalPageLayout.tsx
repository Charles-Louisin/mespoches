import Link from 'next/link'
import AppLogo from '@/components/AppLogo'
import LegalBackLink from '@/components/LegalBackLink'

interface LegalPageLayoutProps {
  title: string
  children: React.ReactNode
}

export default function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-dvh bg-[#f4f6f9] text-ink">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/download" className="flex items-center gap-2.5">
            <AppLogo size="xs" />
            <span className="font-display text-[15px]">MES POCHES</span>
          </Link>
          <Link href="/download" className="text-sm font-medium text-primary-700">
            Télécharger
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 pb-16">
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        <article className="prose-legal mt-6 space-y-4 text-sm leading-relaxed text-gray-700">
          {children}
        </article>
        <nav className="mt-10 space-y-2 border-t border-gray-200 pt-6 text-sm">
          <Link href="/legal/privacy" className="block font-medium text-primary-600">
            Politique de confidentialité
          </Link>
          <Link href="/legal/terms" className="block font-medium text-primary-600">
            Conditions d&apos;utilisation
          </Link>
          <Link href="/legal/mentions" className="block font-medium text-primary-600">
            Mentions légales
          </Link>
          <Link href="/legal" className="block text-gray-500">
            Toutes les infos légales
          </Link>
          <LegalBackLink />
        </nav>
      </main>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-gray-900">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
