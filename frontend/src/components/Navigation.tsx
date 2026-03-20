'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { getPendingStudentsCount } from '@/lib/offlineStorage';
import Image from 'next/image';

// Profile Dropdown Component
const ProfileDropdown = ({ user, logout }: { user: any; logout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-lg font-medium text-green-100 hover:bg-green-700 hover:text-white focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold overflow-hidden">
          {user?.profile_image_url ? (
            <Image
              src={user.profile_image_url}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <span>{user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
        {/* <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg> */}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="flex flex-col absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <span className="text-2xl text-center text-black">{user?.full_name || user?.email}</span>
            <div className="py-1" role="menu">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>پروفائل سيٽنگس</span>
                </div>
              </Link>
              <Link
                href="/school-settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>اسڪول سيٽنگس</span>
                </div>
              </Link>
              <hr className="my-1" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="block w-full text-right px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>لاگ آئوٽ</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Navigation = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, isAuthenticated, hasSchool, logout } = useAuth();
  const { school } = useSchool();

  // Update pending count periodically
  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingStudentsCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Navigation links - only show if authenticated and has school
  const navLinks = isAuthenticated && hasSchool ? [
    { name: 'ڊيشبورڊ', href: '/dashboard' },
    { name: 'داخلا', href: '/admission' },
    { name: 'شاگرد', href: '/students' },
    { name: 'نتيجا', href: '/results' },
    { name: 'سرٽيفڪيٽ ٺاهيو', href: '/leaving-certificate' },
    { name: 'سرٽيفڪيٽ ڏسو', href: '/leaving-certificates' },
  ] : [];

  return (
    <nav className="bg-green-800 text-white shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* <Link href={isAuthenticated && hasSchool ? "/dashboard" : "/"} className="shrink-0 flex items-center">
              <span className="text-xl font-bold">
                {isAuthenticated && school?.school_name ? school.school_name : 'اسڪول مئنيجمينٽ سسٽم'}
              </span>
            </Link> */}
            
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4 md:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-lg font-medium ${pathname === link.href
                    ? 'bg-green-900 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Pending Students Link with Badge */}
            {isAuthenticated && hasSchool && pendingCount > 0 && (
              <Link
                href="/pending-students"
                className={`px-3 py-2 rounded-md text-lg font-medium relative ${pathname === '/pending-students'
                    ? 'bg-green-900 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
              >
                آف لائن
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              </Link>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <ProfileDropdown user={user} logout={logout} />
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded-md text-lg font-medium ${pathname === '/login' ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-700 hover:text-white'}`}
                >
                  لاگ ان
                </Link>
                <Link
                  href="/register"
                  className={`px-3 py-2 rounded-md text-lg font-medium ${pathname === '/register' ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-700 hover:text-white'}`}
                >
                  رجسٽر
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-green-100 hover:text-white hover:bg-green-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href
                    ? 'bg-green-900 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Pending Students Link */}
            {isAuthenticated && hasSchool && pendingCount > 0 && (
              <Link
                href="/pending-students"
                className={`block px-3 py-2 rounded-md text-base font-medium relative ${pathname === '/pending-students'
                    ? 'bg-green-900 text-white'
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                آف لائن شاگرد ({pendingCount})
              </Link>
            )}

            {/* Mobile Auth buttons */}
            {isAuthenticated ? (
              <div className="border-t border-green-700 pt-2 mt-2">
                <div className="px-3 py-2 text-green-100 text-sm">
                  {user?.full_name || user?.email}
                </div>
                <Link
                  href="/profile"
                  className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-green-100 hover:bg-green-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  پروفائل سيٽنگس
                </Link>
                <Link
                  href="/school-settings"
                  className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-green-100 hover:bg-green-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  اسڪول سيٽنگس
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-green-100 hover:bg-green-700 hover:text-white"
                >
                  لاگ آئوٽ
                </button>
              </div>
            ) : (
              <div className="border-t border-green-700 pt-2 mt-2 space-y-1">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-green-100 hover:bg-green-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  لاگ ان
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-green-900 text-white hover:bg-green-950"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  رجسٽر
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;