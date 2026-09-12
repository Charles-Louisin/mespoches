import Link from 'next/link'
import AppLogo from '@/components/AppLogo'
import { FileText, Shield, Scale } from 'lucide-react'

export const metadata = {
  title: 'Informations légales — MES POCHES',
}

const links = [
  {
    href: '/legal/privacy',
    icon: Shield,
    title: 'Politique de confidentialité',
    description: 'Données collectées, finalités, vos droits',
  },
  {
    href: '/legal/terms',
    icon: FileText,
    title: "Conditions d'utilisation",
    description: 'Formules Gratuit et Premium, paiements, responsabilités',
  },
  {
    href: '/legal/mentions',
    icon: Scale,
    title: 'Mentions légales',
    description: 'Éditeur, hébergement, prestataires',
  },
]

export default function LegalIndexPage() {
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
      <main className="mx-auto max-w-3xl px-5 py-10 space-y-3">
        <h1 className="font-display text-3xl text-ink">Informations légales</h1>
        <p className="mb-6 text-sm text-gray-600">
          Documents requis pour l&apos;utilisation de MES POCHES et sa publication sur les
          stores.
        </p>
        {links.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="card flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50">
              <Icon size={22} className="text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
