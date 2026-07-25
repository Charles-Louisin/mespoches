'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  hydrateAuthSession,
  isAuthenticated,
  hasSeenOnboarding,
} from '@/lib/auth';
import LoadingSpinner from './LoadingSpinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      await hydrateAuthSession();
      if (cancelled) return;

      if (!isAuthenticated()) {
        if (!hasSeenOnboarding()) {
          router.push('/onboarding');
        } else {
          router.push('/login');
        }
      } else {
        setIsChecking(false);
      }
    };

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
