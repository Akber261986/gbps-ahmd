'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  FileText,
  Award,
  FileCheck,
  BookOpen,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  User,
  Building2,
  LogOut
} from 'lucide-react';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { isAuthenticated, hasSchool, user, logout } = useAuth();
  const { school } = useSchool();

  const navItems: NavItem[] = [
    { name: 'ڊيشبورڊ', href: '/dashboard', icon: LayoutDashboard },
    { name: 'داخلا', href: '/admission', icon: UserPlus },
    { name: 'شاگرد', href: '/students', icon: Users },
    { name: 'نمبر داخل ڪريو', href: '/results/simple-entry', icon: ClipboardList },
    { name: 'رزلٽ شيٽ', href: '/results/manage', icon: FileText },
    { name: 'سرٽيفڪيٽ ٺاهيو', href: '/leaving-certificate', icon: Award },
    { name: 'سرٽيفڪيٽ ڏسو', href: '/leaving-certificates', icon: FileCheck },
    { name: 'جنرل رجسٽر', href: '/gr', icon: BookOpen },
    { name: 'ڪلاس مئنيجمينٽ', href: '/admin/classes', icon: GraduationCap },
  ];

  // Routes that should show the sidebar
  const shouldShowSidebar = isAuthenticated && hasSchool && (
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

  if (!shouldShowSidebar) {
    return null;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors print:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 print:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed right-0 top-0 h-screen bg-gradient-to-b from-green-50 to-white border-l border-gray-200 shadow-xl z-40 transition-all duration-300 ease-in-out print:hidden flex flex-col
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          ${isMobileOpen ? 'w-72 translate-x-0' : 'w-72 translate-x-full lg:translate-x-0'}
        `}
      >
        {/* School Info Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 flex-shrink-0">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-white text-sm truncate">
                  {school?.school_name || 'اسڪول سسٽم'}
                </h2>
                <p className="text-xs text-green-100 truncate">مئنيجمينٽ سسٽم</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                  ${active
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-green-600'}`} />
                {!isCollapsed && (
                  <span className="font-medium text-base truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-3 flex-shrink-0 bg-white">
          {!isCollapsed ? (
            <div className="space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-green-600">
                  {user?.profile_image_url ? (
                    <Image
                      src={user.profile_image_url}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-green-700">
                      {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Profile Links */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
              >
                <User className="w-5 h-5 text-green-600" />
                <span className="font-medium text-base">پروفائل سيٽنگس</span>
              </Link>

              <Link
                href="/school-settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
              >
                <Building2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-base">اسڪول سيٽنگس</span>
              </Link>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-base">لاگ آئوٽ</span>
              </button>
            </div>
          ) : (
            /* Collapsed User Menu */
            <div className="space-y-2">
              <Link
                href="/profile"
                className="flex justify-center items-center p-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
                title="پروفائل سيٽنگس"
              >
                <User className="w-5 h-5 text-green-600" />
              </Link>

              <Link
                href="/school-settings"
                className="flex justify-center items-center p-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
                title="اسڪول سيٽنگس"
              >
                <Building2 className="w-5 h-5 text-green-600" />
              </Link>

              <button
                onClick={logout}
                className="w-full flex justify-center items-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                title="لاگ آئوٽ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-green-600 text-white items-center justify-center rounded-l-lg shadow-lg hover:bg-green-700 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}
