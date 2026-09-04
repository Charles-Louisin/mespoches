import { PREMIUM_REQUIRED_CODE } from './planLimits';
import type { MeUser } from './api';

export class PremiumRequiredError extends Error {
  code = PREMIUM_REQUIRED_CODE;
  constructor(message: string) {
    super(message);
    this.name = 'PremiumRequiredError';
  }
}

export function isPremiumUser(user: MeUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.isPremium) return true;
  const plan = user.plan ?? 'free'
  if (plan === 'premium') {
    if (!user.premiumUntil) return true;
    return new Date(user.premiumUntil) > new Date();
  }
  if (user.premiumUntil && new Date(user.premiumUntil) > new Date()) {
    return true;
  }
  return false;
}

/** Essai Premium gratuit encore actif. */
export function isOnTrial(user: MeUser | null | undefined): boolean {
  if (!user || user.role === 'admin') return false;
  if (user.isOnTrial === true) return true;
  if (user.premiumSource !== 'trial') return false;
  return isPremiumUser(user);
}

/** Jours restants d'essai (arrondi supérieur), ou 0. */
export function getTrialDaysLeft(user: MeUser | null | undefined): number {
  if (!isOnTrial(user) || !user?.premiumUntil) return 0;
  const ms = new Date(user.premiumUntil).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function formatPremiumUntil(date: string | Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isPremiumRequiredError(err: unknown): err is PremiumRequiredError {
  return err instanceof PremiumRequiredError;
}

export function getUpgradePath(): string {
  return '/subscription';
}
