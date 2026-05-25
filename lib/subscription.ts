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

export function isPremiumRequiredError(err: unknown): err is PremiumRequiredError {
  return err instanceof PremiumRequiredError;
}

export function getUpgradePath(): string {
  return '/subscription';
}
