'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSchool?: boolean;
}

export default function ProtectedRoute({ children, requireSchool = true }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasSchool } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not logged in - redirect to login
        router.push('/login');
        setShouldRender(false);
      } else if (requireSchool && !hasSchool) {
        // Logged in but no school - redirect to onboarding
        router.push('/onboarding');
        setShouldRender(false);
      } else {
        // All checks passed - allow rendering
        setShouldRender(true);
      }
    }
  }, [loading, isAuthenticated, hasSchool, requireSchool, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">لوڊ ٿي رهيو آهي...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authentication is verified AND we've decided to render
  if (!shouldRender || !isAuthenticated || (requireSchool && !hasSchool)) {
    return null;
  }

  return <>{children}</>;
}
