'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user, loading, isAuthenticated, hasCluster } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!hasCluster) {
        router.push('/waiting');
      } else {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, hasCluster, router]);

  return <LoadingSpinner fullPage message="Redirecting..." />;
}
