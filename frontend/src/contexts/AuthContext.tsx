'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  setToken,
  getToken,
  removeToken,
  setUser as saveUser,
  getUser as getSavedUser,
  getAuthHeader
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasSchool: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = getToken();
      const savedUser = getSavedUser();

      if (savedToken && savedUser) {
        setTokenState(savedToken);
        setUser(savedUser);
        // Optionally refresh user data from server
        try {
          const response = await axios.get<User>('/api/auth/me', {
            headers: getAuthHeader()
          });
          setUser(response.data);
          saveUser(response.data);
        } catch (error: any) {
          console.error('Failed to refresh user data:', error);
          // Only clear token if we get 401 (unauthorized), not for network errors
          if (error.response?.status === 401) {
            removeToken();
            setUser(null);
            setTokenState(null);
          }
          // For other errors (network issues, timeouts), keep the user logged in with cached data
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', credentials);
      const { access_token } = response.data;

      setToken(access_token);
      setTokenState(access_token);

      // Fetch user data
      const userResponse = await axios.get<User>('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setUser(userResponse.data);
      saveUser(userResponse.data);

      // Small delay to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on school onboarding status
      if (userResponse.data.school_id) {
        router.push('/');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/google', { token });
      const { access_token } = response.data;

      setToken(access_token);
      setTokenState(access_token);

      // Fetch user data
      const userResponse = await axios.get<User>('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setUser(userResponse.data);
      saveUser(userResponse.data);

      // Small delay to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on school onboarding status
      if (userResponse.data.school_id) {
        router.push('/');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await axios.post('/api/auth/register', data);
      // After registration, automatically log in
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get<User>('/api/auth/me', {
        headers: getAuthHeader()
      });
      setUser(response.data);
      saveUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    googleLogin,
    register,
    logout,
    refreshUser,
    isAuthenticated: user !== null,
    hasSchool: user !== null && user.school_id !== null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
