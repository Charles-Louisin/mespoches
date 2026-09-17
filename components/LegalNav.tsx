'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Scale, Shield } from 'lucide-react'

const ITEMS = [
  {
    href: '/legal/privacy',
    icon: Shield,
    title: 'Confidentialité',
    description: 'Données, permissions et vos droits',
  },
  {
    href: '/legal/terms',
    icon: FileText,
    title: 'Conditions d’utilisation',
    description: 'Service, compte et responsabilités',
  },
  {
    href: '/legal/mentions',
    icon: Scale,
    title: 'Mentions légales',
    description: 'Éditeur, hébergement et contact',
  },
] as const

export default function LegalNav({ variant = 'side' }: { variant?: 'side' | 'cards' }) {
  const path = usePathname()

  if (variant === 'cards') {
    return (
      <div className="legal-index-grid">
        {ITEMS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="legal-index-card">
            <span className="legal-index-icon">
              <Icon size={22} />
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <nav className="legal-side" aria-label="Documents légaux">
      <Link href="/legal" className={`legal-side-link ${path === '/legal' ? 'is-active' : ''}`}>
        Tous les documents
      </Link>
      {ITEMS.map(({ href, title }) => (
        <Link
          key={href}
          href={href}
          className={`legal-side-link ${path === href ? 'is-active' : ''}`}
        >
          {title}
        </Link>
      ))}
    </nav>
  )
}
