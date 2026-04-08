'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCluster?: boolean;
}

export default function ProtectedRoute({
  children,
  requireCluster = true
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasCluster } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requireCluster && !hasCluster) {
        router.push('/waiting');
      }
    }
  }, [loading, isAuthenticated, hasCluster, requireCluster, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or missing cluster
  if (!isAuthenticated || (requireCluster && !hasCluster)) {
    return null;
  }

  return <>{children}</>;
}
