import Cookies from 'js-cookie';

const USER_KEY = 'user_data';
const ONBOARDING_KEY = 'onboarding_seen';
const PENDING_EMAIL_KEY = 'pending_verification_email';

/** Token en mémoire uniquement (pas dans document.cookie). Hydraté depuis /api/auth/token. */
let memoryToken: string | undefined;
let memoryEmailVerified = false;
let hydratePromise: Promise<void> | null = null;

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  plan?: 'free' | 'premium';
  premiumUntil?: string | null;
  isPremium?: boolean;
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

export const setToken = (token: string): void => {
  memoryToken = token;
};

export const getToken = (): string | undefined => {
  return memoryToken;
};

export const removeToken = (): void => {
  memoryToken = undefined;
  memoryEmailVerified = false;
};

/** Charge le JWT depuis le cookie HttpOnly (same-origin). */
export async function hydrateAuthSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    try {
      const res = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) {
        memoryToken = undefined;
        memoryEmailVerified = false;
        return;
      }
      const data = await res.json();
      if (data.success && typeof data.token === 'string') {
        memoryToken = data.token;
        memoryEmailVerified = Boolean(data.emailVerified);
      } else {
        memoryToken = undefined;
        memoryEmailVerified = false;
      }
    } catch {
      memoryToken = undefined;
      memoryEmailVerified = false;
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
  setToken(data.token);
  setUser(data.user);
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

export const logout = (): void => {
  removeToken();
  removeUser();
  clearPendingVerificationEmail();
  void (async () => {
    try {
      const { syncSmsMonitorToken } = await import('./capacitor/app-notifications');
      await syncSmsMonitorToken(undefined);
    } catch {
      /* ignore */
    }
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
  return !!getToken() && memoryEmailVerified;
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

export async function checkRegisterAvailability(params: {
  email?: string;
  name?: string;
}): Promise<{
  email?: { available: boolean };
  name?: { available: boolean };
}> {
  const { getClientApiUrl } = await import('./api-config');
  const API_URL = getClientApiUrl();
  const qs = new URLSearchParams();
  if (params.email?.trim()) qs.set('email', params.email.trim());
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
