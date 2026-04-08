'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken, getToken, setUser, getUser, clearAuth } from '@/lib/auth';
import type { User, LoginCredentials, SignupData } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasCluster: boolean;
  isClusterHead: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(storedUser);

        // Refresh user data from server
        try {
          const response = await authApi.getMe();
          setUser(response.data);
          setUserState(response.data);
        } catch (error) {
          // Token might be expired, clear auth
          clearAuth();
          setTokenState(null);
          setUserState(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Step 1: Login and get token
      const loginResponse = await authApi.login(credentials);
      const { access_token } = loginResponse.data;

      // Step 2: Store token
      setToken(access_token);
      setTokenState(access_token);

      // Step 3: Fetch user data
      const userResponse = await authApi.getMe();
      const userData = userResponse.data;

      // Step 4: Store user data
      setUser(userData);
      setUserState(userData);

      // Step 5: Redirect based on cluster assignment
      if (!userData.cluster_id) {
        router.push('/waiting');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      await authApi.signup(data);
      // After successful signup, redirect to login
      router.push('/login');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  };

  const logout = () => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data);
      setUserState(response.data);
    } catch (error) {
      // If refresh fails, logout
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!token,
    hasCluster: !!user?.cluster_id,
    isClusterHead: user?.role === 'CLUSTER_HEAD',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
