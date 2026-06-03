import Link from 'next/link';
import PageShell from '@/components/PageShell';
import Header from '@/components/Header';
import { FileText, Shield, Scale } from 'lucide-react';

export const metadata = {
  title: 'Informations légales — MES POCHES',
};

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
];

export default function LegalIndexPage() {
  return (
    <PageShell>
      <Header title="Informations légales" showBack />
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        <p className="text-sm text-gray-600 px-1 mb-4">
          Documents requis pour l&apos;utilisation de MES POCHES et sa publication sur les
          stores.
        </p>
        {links.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <Icon size={22} className="text-primary-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </Link>
        ))}
      </main>
    </PageShell>
  );
}
