import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ONBOARDING_KEY = 'onboarding_seen';
const EMAIL_VERIFIED_KEY = 'email_verified';
const PENDING_EMAIL_KEY = 'pending_verification_email';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  Cookies.set(TOKEN_KEY, token, {
    expires: 30,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};

export const setEmailVerifiedCookie = (verified: boolean): void => {
  if (verified) {
    Cookies.set(EMAIL_VERIFIED_KEY, 'true', {
      expires: 30,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  } else {
    Cookies.remove(EMAIL_VERIFIED_KEY);
  }
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
  Cookies.set('pending_email', email, { expires: 1 });
};

export const getPendingVerificationEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem(PENDING_EMAIL_KEY) ||
    Cookies.get('pending_email') ||
    null
  );
};

export const clearPendingVerificationEmail = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
  Cookies.remove('pending_email');
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
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
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
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
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
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
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
  const response = await fetch(`${API_URL}/auth/resend-code`, {
    method: 'POST',
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
  window.location.href = '/';
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && Cookies.get(EMAIL_VERIFIED_KEY) === 'true';
};

export const setOnboardingSeen = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_KEY, 'true');
  Cookies.set('onboarding_seen', 'true', { expires: 365 });
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
  window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
};
