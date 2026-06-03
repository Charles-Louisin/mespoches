import Link from 'next/link';
import PageShell from '@/components/PageShell';
import Header from '@/components/Header';

interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <PageShell>
      <Header title={title} showBack />
      <main className="max-w-md mx-auto px-4 py-6 pb-12">
        <article className="prose-legal space-y-4 text-sm text-gray-700 leading-relaxed">
          {children}
        </article>
        <nav className="mt-8 pt-6 border-t border-gray-200 space-y-2 text-sm">
          <Link href="/legal/privacy" className="block text-primary-600 font-medium">
            Politique de confidentialité
          </Link>
          <Link href="/legal/terms" className="block text-primary-600 font-medium">
            Conditions d&apos;utilisation
          </Link>
          <Link href="/legal/mentions" className="block text-primary-600 font-medium">
            Mentions légales
          </Link>
          <Link href="/settings" className="block text-gray-500">
            Retour aux paramètres
          </Link>
        </nav>
      </main>
    </PageShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
