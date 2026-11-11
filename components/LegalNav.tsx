'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  {
    href: '/legal/privacy',
    title: 'Confidentialité',
    description: 'Les données traitées, les permissions demandées et vos droits.',
  },
  {
    href: '/legal/terms',
    title: 'Conditions d’utilisation',
    description: 'Le service, votre compte, les forfaits et les responsabilités.',
  },
  {
    href: '/legal/mentions',
    title: 'Mentions légales',
    description: 'L’éditeur, l’hébergement, les prestataires et le contact.',
  },
  {
    href: '/suppression-compte',
    title: 'Suppression du compte',
    description: 'Effacer votre compte et vos données, depuis l’app ou ce site.',
  },
] as const

export default function LegalNav({ variant = 'side' }: { variant?: 'side' | 'cards' }) {
  const path = usePathname()

  if (variant === 'cards') {
    return (
      <ul className="lp-legal-cards">
        {ITEMS.map(({ href, title, description }) => (
          <li key={href}>
            <Link href={href} className="lp-legal-card">
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="lp-legal-card-go" aria-hidden>
                Lire
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <nav className="lp-legal-nav" aria-label="Documents légaux">
      {ITEMS.map(({ href, title }) => (
        <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
          {title}
        </Link>
      ))}
      <Link href="/legal" aria-current={path === '/legal' ? 'page' : undefined}>
        Tous les documents
      </Link>
    </nav>
  )
}
