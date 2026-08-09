'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, hasSchool } = useAuth();

  // Routes that should have sidebar spacing
  const shouldHaveSidebarSpacing = isAuthenticated && hasSchool && (
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

  return (
    <main className={`transition-all duration-300 ${shouldHaveSidebarSpacing ? 'lg:mr-72' : ''}`}>
      {children}
    </main>
  );
}
