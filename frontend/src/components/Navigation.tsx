'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const pathname = usePathname();
  const { isAuthenticated, hasSchool } = useAuth();

  // Don't show navigation bar when sidebar is present (authenticated users with schools)
  const shouldShowNav = isAuthenticated && hasSchool && (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admission') ||
    pathname.startsWith('/students') ||
    pathname.startsWith('/results') ||
    pathname.startsWith('/leaving-certificate') ||
    pathname.startsWith('/gr') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/school-settings') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/pending-students')
  );

  if (shouldShowNav) {
    return null; // Hide navigation when sidebar is present
  }

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Auth buttons for non-authenticated users */}
          {!isAuthenticated && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Link
                href="/login"
                className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
                  pathname === '/login'
                    ? 'bg-green-900 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-600 hover:text-white'
                }`}
              >
                لاگ ان
              </Link>
              <Link
                href="/register"
                className={`px-4 py-2 rounded-lg text-base font-medium bg-white text-green-800 hover:bg-green-50 shadow-md transition-all ${
                  pathname === '/register' ? 'ring-2 ring-green-900' : ''
                }`}
              >
                رجسٽر
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
