import Cookies from 'js-cookie';

const USER_KEY = 'user_data';
const ONBOARDING_KEY = 'onboarding_seen';
const PENDING_EMAIL_KEY = 'pending_verification_email';

/**
 * État de session en mémoire, hydraté depuis /api/auth/token.
 * Le JWT lui-même ne quitte jamais le cookie HttpOnly : les appels backend
 * passent par /api/proxy qui pose l'en-tête Authorization côté serveur.
 */
let memorySignedIn = false;
let memoryEmailVerified = false;
let memoryRole: 'user' | 'admin' = 'user';
let hydratePromise: Promise<void> | null = null;

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  plan?: 'free' | 'premium';
  premiumUntil?: string | null;
  premiumSource?: 'trial' | 'paid' | null;
  isPremium?: boolean;
  isOnTrial?: boolean;
  emailVerified?: boolean;
  currency?: string;
  hidePlannedExpensesHelp?: boolean;
  lastLoginAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
  code?: string;
  needsVerification?: boolean;
}

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  return response.json();
}

/** Vrai dès qu'un cookie de session valide existe (indépendant de la vérif email). */
export const hasSession = (): boolean => {
  return memorySignedIn;
};

export const removeToken = (): void => {
  memorySignedIn = false;
  memoryEmailVerified = false;
  memoryRole = 'user';
};

/** Charge le JWT depuis le cookie HttpOnly (same-origin). */
export async function hydrateAuthSession(options?: {
  /** Si true, ne pas effacer un token déjà en mémoire (ex. juste après login). */
  preserveExisting?: boolean;
}): Promise<void> {
  if (typeof window === 'undefined') return;
  if (hydratePromise) return hydratePromise;

  const preserveExisting = options?.preserveExisting === true;
  const previousSignedIn = memorySignedIn;
  const previousVerified = memoryEmailVerified;
  const previousRole = memoryRole;

  const restore = () => {
    memorySignedIn = previousSignedIn;
    memoryEmailVerified = previousVerified;
    memoryRole = previousRole;
  };

  const clear = () => {
    memorySignedIn = false;
    memoryEmailVerified = false;
    memoryRole = 'user';
  };

  hydratePromise = (async () => {
    try {
      const res = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) {
        if (preserveExisting && previousSignedIn) restore();
        else clear();
        return;
      }
      const data = await res.json();
      if (data.success && data.authenticated === true) {
        memorySignedIn = true;
        memoryEmailVerified = Boolean(data.emailVerified);
        memoryRole = data.role === 'admin' ? 'admin' : 'user';
      } else if (preserveExisting && previousSignedIn) {
        restore();
      } else {
        clear();
      }
    } catch {
      if (preserveExisting && previousSignedIn) restore();
      else clear();
    }
  })();

  try {
    await hydratePromise;
  } finally {
    hydratePromise = null;
  }
}

export const setEmailVerifiedCookie = (verified: boolean): void => {
  memoryEmailVerified = verified;
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setEmailVerifiedCookie(!!user.emailVerified);
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  setEmailVerifiedCookie(false);
};

export const setPendingVerificationEmail = (email: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_EMAIL_KEY, email);
};

export const getPendingVerificationEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(PENDING_EMAIL_KEY);
};

export const clearPendingVerificationEmail = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
};

const persistAuth = (data: { user: User; token: string }) => {
  // Le cookie HttpOnly vient d'être posé par la route Next : on ne garde
  // en mémoire que l'état de session, jamais le token lui-même.
  memorySignedIn = true;
  memoryRole = data.user.role === 'admin' ? 'admin' : 'user';
  setUser(data.user);
  setOnboardingSeen();
  clearPendingVerificationEmail();
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseAuthResponse(response);

  if (data.success && data.data) {
    persistAuth(data.data);
    return data;
  }

  if (data.code === 'EMAIL_NOT_VERIFIED') {
    removeToken();
    removeUser();
  }

  return data;
};

export const register = async (
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await parseAuthResponse(response);

  if (data.success && data.data?.token) {
    persistAuth(data.data);
    return data;
  }

  if (data.success && data.needsVerification) {
    setPendingVerificationEmail(email);
  }

  return data;
};

export const verifyEmail = async (
  email: string,
  code: string
): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/verify-email', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  const data = await parseAuthResponse(response);

  if (data.success && data.data) {
    persistAuth(data.data);
  }

  return data;
};

export const resendVerificationCode = async (
  email: string
): Promise<AuthResponse & { cooldownSeconds?: number }> => {
  const response = await fetch('/api/auth/resend-code', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const json = await response.json();

  if (!json.success && json.code === 'RESEND_COOLDOWN') {
    return {
      ...json,
      cooldownSeconds: json.data?.cooldownSeconds ?? 60,
    };
  }

  return json;
};

export const forgotPassword = async (
  email: string
): Promise<AuthResponse & { cooldownSeconds?: number }> => {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await response.json();
  if (!json.success && json.code === 'RESEND_COOLDOWN') {
    return {
      ...json,
      cooldownSeconds: json.data?.cooldownSeconds ?? 60,
    };
  }
  return json;
};

export const resetPassword = async (
  email: string,
  code: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password }),
  });
  const data = await parseAuthResponse(response);
  if (data.success && data.data) {
    persistAuth(data.data);
  }
  return data;
};

export function homeAfterAuth(): string {
  return getUser()?.role === 'admin' ? '/admin' : '/compte?connected=1';
}

export function redirectAfterAuth(): void {
  window.location.assign(homeAfterAuth());
}

export const logout = (): void => {
  removeToken();
  removeUser();
  clearPendingVerificationEmail();
  void (async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } finally {
      window.location.href = '/';
    }
  })();
};

export const isAuthenticated = (): boolean => {
  return memorySignedIn && memoryEmailVerified;
};

/** Rôle issu du JWT vérifié côté serveur (pas du localStorage). */
export const isAdminSession = (): boolean => {
  return isAuthenticated() && memoryRole === 'admin';
};

export const setOnboardingSeen = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_KEY, 'true');
  Cookies.set('onboarding_seen', 'true', {
    expires: 365,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
};

export const hasSeenOnboarding = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem(ONBOARDING_KEY) === 'true' ||
    Cookies.get('onboarding_seen') === 'true'
  );
};

/** Disponibilité du nom public. L'email n'est pas vérifiable (anti-énumération). */
export async function checkRegisterAvailability(params: {
  name?: string;
}): Promise<{
  name?: { available: boolean };
}> {
  const { getClientApiUrl } = await import('./api-config');
  const API_URL = getClientApiUrl();
  const qs = new URLSearchParams();
  if (params.name?.trim()) qs.set('name', params.name.trim());

  const response = await fetch(
    `${API_URL}/auth/check-availability?${qs.toString()}`
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Erreur de vérification');
  }
  return data.data ?? {};
}

export const redirectToVerification = (email: string): void => {
  removeToken();
  removeUser();
  setPendingVerificationEmail(email);
  void fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  }).finally(() => {
    window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
  });
};
