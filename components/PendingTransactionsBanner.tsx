'use client';

import Link from 'next/link';
import { BellRing, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { pendingTransactionApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function PendingTransactionsBanner() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!getToken()) return;
    pendingTransactionApi
      .getCount()
      .then(({ count: c }) => setCount(c))
      .catch(() => {});
  }, []);

  if (count <= 0) return null;

  return (
    <Link
      href="/pending"
      className="card p-4 flex items-center gap-3 bg-amber-50 border border-amber-200 hover:bg-amber-100/80 transition-colors"
    >
      <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <BellRing size={22} className="text-amber-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900">
          {count === 1
            ? '1 transaction à valider'
            : `${count} transactions à valider`}
        </p>
        <p className="text-sm text-amber-800/80">
          Détectées automatiquement (SMS, reçus…) — vérifiez et confirmez
        </p>
      </div>
      <ChevronRight className="text-amber-700 shrink-0" size={20} />
    </Link>
  );
}
