import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const ONBOARDING_KEY = 'onboarding_seen';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

// Gestion du token
export const setToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, { expires: 30 }); // 30 jours
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};

// Gestion de l'utilisateur
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Connexion
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (data.success) {
    setToken(data.data.token);
    setUser(data.data.user);
  }

  return data;
};

// Inscription
export const register = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  const data = await response.json();
  
  if (data.success) {
    setToken(data.data.token);
    setUser(data.data.user);
  }

  return data;
};

// Déconnexion
export const logout = (): void => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

// Vérification de l'authentification
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Gestion de l'onboarding
export const setOnboardingSeen = (): void => {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  // Ajouter aussi un cookie pour le middleware
  Cookies.set('onboarding_seen', 'true', { expires: 365 });
};

export const hasSeenOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true' || Cookies.get('onboarding_seen') === 'true';
};
