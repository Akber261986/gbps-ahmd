// Authentication utilities for token management and API calls

export type Role = "SUPER_ADMIN" | "CLUSTER_HEAD" | "SCHOOL_ADMIN";

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  school_id: number | null;
  cluster_id: number | null;
  role: Role;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  profile_image_url: string | null;
  oauth_provider: string | null;
  oauth_provider_id: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Token management
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// User data management
export const setUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Check if user has completed school onboarding
export const hasSchool = (): boolean => {
  const user = getUser();
  return user !== null && user.school_id !== null;
};

// Get authorization header
export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
};
