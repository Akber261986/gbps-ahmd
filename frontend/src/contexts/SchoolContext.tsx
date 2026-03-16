'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { schoolApi, School } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface SchoolContextType {
  school: School | null;
  loading: boolean;
  error: string | null;
  refreshSchool: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchSchool = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await schoolApi.getMySchool();
      setSchool(response.data);
    } catch (err: any) {
      // If 401 (unauthenticated), keep school as null - don't show any school data
      if (err.response?.status === 401) {
        setSchool(null);
      } else {
        // For other errors, log and set error message
        console.error('Failed to fetch school data:', err);
        setError(err.response?.data?.detail || 'Failed to load school information');
        setSchool(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchool();
    } else {
      // Clear school data when user is not authenticated
      setSchool(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshSchool = async () => {
    await fetchSchool();
  };

  return (
    <SchoolContext.Provider value={{ school, loading, error, refreshSchool }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
