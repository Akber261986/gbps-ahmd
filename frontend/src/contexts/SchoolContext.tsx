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

  const fetchSchool = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedSchool = localStorage.getItem('school_data');
        const cachedTimestamp = localStorage.getItem('school_data_timestamp');

        if (cachedSchool && cachedTimestamp) {
          const now = Date.now();
          const tenMinutes = 10 * 60 * 1000;
          const isStale = (now - parseInt(cachedTimestamp)) > tenMinutes;

          if (!isStale) {
            // Use cached data
            setSchool(JSON.parse(cachedSchool));
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from server
      const response = await schoolApi.getMySchool();
      setSchool(response.data);

      // Cache the data
      localStorage.setItem('school_data', JSON.stringify(response.data));
      localStorage.setItem('school_data_timestamp', Date.now().toString());
    } catch (err: any) {
      // If 401 (unauthenticated), keep school as null - don't show any school data
      if (err.response?.status === 401) {
        setSchool(null);
        localStorage.removeItem('school_data');
        localStorage.removeItem('school_data_timestamp');
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
      fetchSchool(false);
    } else {
      // Clear school data when user is not authenticated
      setSchool(null);
      setLoading(false);
      localStorage.removeItem('school_data');
      localStorage.removeItem('school_data_timestamp');
    }
  }, [isAuthenticated]);

  const refreshSchool = async () => {
    await fetchSchool(true); // Force refresh
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
