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
        className="flex items-center space-x-2 space-x-reverse px-1 py-2 rounded-lg text-lg font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-green-800 font-bold overflow-hidden border-2 border-green-600">
          {user?.profile_image_url ? (
            <Image
              src={user.profile_image_url}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-lg">{user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className=" absolute -right-24 mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
              <p className="text-white font-bold text-lg truncate">{user?.full_name || user?.email}</p>
              <p className="text-green-100 text-sm truncate">{user?.email}</p>
            </div>
            <div className="py-2" role="menu">
              <Link
                href="/profile"
                className="block px-4 py-3 text-base text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>پروفائل سيٽنگس</span>
                </div>
              </Link>
              <Link
                href="/school-settings"
                className="block px-4 py-3 text-base text-gray-700 hover:bg-green-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>اسڪول سيٽنگس</span>
                </div>
              </Link>
              <hr className="my-2 border-gray-200" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="block w-full text-right px-4 py-3 text-base text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
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
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
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

  // Close mobile menus when clicking outside
  useEffect(() => {
    if (mobileMenuOpen || mobileProfileOpen) {
      const handleClickOutside = () => {
        setMobileMenuOpen(false);
        setMobileProfileOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen, mobileProfileOpen]);

  // Navigation links - only show if authenticated and has school
  const navLinks = isAuthenticated && hasSchool ? [
    { name: 'ڊيشبورڊ', href: '/dashboard' },
    { name: 'داخلا', href: '/admission' },
    { name: 'شاگرد', href: '/students' },
    { name: 'نمبر داخل ڪريو', href: '/results/simple-entry' },
    { name: 'رزلٽ شيٽ', href: '/results/manage' },
    { name: 'سرٽيفڪيٽ ٺاهيو', href: '/leaving-certificate' },
    { name: 'سرٽيفڪيٽ ڏسو', href: '/leaving-certificates' },
  ] : [];

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-white transition-all"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileProfileOpen(false);
              }}
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

          {/* Center - Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-2 md:space-x-reverse">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-green-900 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-600 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Pending Students Link with Badge */}
            {isAuthenticated && hasSchool && pendingCount > 0 && (
              <Link
                href="/pending-students"
                className={`px-4 py-2 rounded-lg text-base font-medium relative transition-all ${
                  pathname === '/pending-students'
                    ? 'bg-green-900 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-600 hover:text-white'
                }`}
              >
                آف لائن
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {pendingCount}
                </span>
              </Link>
            )}
          </div>

          {/* Right side - Profile/Auth */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                {/* Desktop Profile Dropdown */}
                <div className="hidden md:block">
                  <ProfileDropdown user={user} logout={logout} />
                </div>

                {/* Mobile Profile Button */}
                <div className="md:hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileProfileOpen(!mobileProfileOpen);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center p-2 rounded-lg text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-green-800 font-bold overflow-hidden border-2 border-green-600">
                      {user?.profile_image_url ? (
                        <Image
                          src={user.profile_image_url}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">{user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                  </button>
                </div>
              </>
            ) : (
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
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-green-600" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-green-900 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-600 hover:text-white'
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
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  pathname === '/pending-students'
                    ? 'bg-green-900 text-white shadow-md'
                    : 'text-green-50 hover:bg-green-600 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>آف لائن شاگرد</span>
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {pendingCount}
                  </span>
                </div>
              </Link>
            )}

            {/* Mobile Auth buttons for non-authenticated users */}
            {!isAuthenticated && (
              <div className="border-t border-green-600 pt-2 mt-2 space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-green-50 hover:bg-green-600 hover:text-white transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  لاگ ان
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 rounded-lg text-base font-medium bg-white text-green-800 hover:bg-green-50 shadow-md transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  رجسٽر
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Profile Menu */}
      {mobileProfileOpen && isAuthenticated && (
        <div className="md:hidden border-t border-green-600" id="mobile-profile">
          <div className="px-2 pt-2 pb-3">
            <div className="bg-green-900 rounded-lg px-4 py-3 mb-2">
              <p className="text-white font-bold text-base truncate">{user?.full_name || user?.email}</p>
              <p className="text-green-200 text-sm truncate">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <Link
                href="/profile"
                className="flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-base font-medium text-green-50 hover:bg-green-600 hover:text-white transition-all"
                onClick={() => setMobileProfileOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>پروفائل سيٽنگس</span>
              </Link>
              <Link
                href="/school-settings"
                className="flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-base font-medium text-green-50 hover:bg-green-600 hover:text-white transition-all"
                onClick={() => setMobileProfileOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>اسڪول سيٽنگس</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileProfileOpen(false);
                }}
                className="flex items-center space-x-3 space-x-reverse w-full px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-900 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>لاگ آئوٽ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;