"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

type PublicView = 'student' | 'tutor';

type NavigationProps = {
  variant: 'public' | 'app';
  activeView?: PublicView;
  onToggleView?: (view: PublicView) => void;
  className?: string;
};

function combineClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default function Navigation({ variant, activeView, onToggleView, className }: NavigationProps) {
  const pathname = (usePathname as unknown as (() => string) | undefined)?.() ?? '';
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderPublicRight = () => (
    <div className="flex items-center space-x-4">
      <ThemeToggle />
      <Link 
        href={activeView === 'student' ? '/student-sign-in' : '/sign-in'}
        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-300"
      >
        Sign In
      </Link>
      <Link 
        href={activeView === 'student' ? '/student-sign-up' : '/sign-up'}
        className={combineClasses(
          'px-4 py-2 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
          activeView === 'student'
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700'
        )}
      >
        Get Started
      </Link>
    </div>
  );



  const renderAppLinks = () => (
    <>
      <Link
        href="/dashboard"
        className={combineClasses(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300',
          isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        )}
        aria-current={isActive('/dashboard') ? 'page' : undefined}
      >
        Dashboard
      </Link>
      <Link
        href="/students/new"
        className={combineClasses(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300',
          isActive('/students/new') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        )}
        aria-current={isActive('/students/new') ? 'page' : undefined}
      >
        New Student
      </Link>
      <Link
        href="/billing"
        className={combineClasses(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300',
          isActive('/billing') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        )}
        aria-current={isActive('/billing') ? 'page' : undefined}
      >
        Billing
      </Link>
    </>
  );

  const renderAppRight = () => (
    <div className="flex items-center space-x-4">
      {renderAppLinks()}
      <ThemeToggle />
      <form action="/api/auth/signout" method="post">
        <button
          type="submit"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
        >
          Sign Out
        </button>
      </form>
    </div>
  );

  const navClasses =
    variant === 'app'
      ? 'bg-gray-800/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 dark:border-gray-600'
      : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300';

  return (
    <nav className={combineClasses(navClasses, className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center">
            <Link href={variant === 'public' ? '/' : '/dashboard'} className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Nova
            </Link>
          </div>

          {/* Center section (empty for public, placeholder for app) */}
          <div className="hidden md:block" />

          {/* Right section */}
          <div className="flex items-center">
            <div className="hidden md:block">
              {variant === 'public' ? renderPublicRight() : renderAppRight()}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className={combineClasses('h-6 w-6', mobileOpen && 'hidden')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={combineClasses('h-6 w-6', !mobileOpen && 'hidden')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div id="mobile-menu" className="md:hidden mt-4 space-y-3">
            {variant === 'public' ? (
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <div className="space-x-3">
                  <Link href={activeView === 'student' ? '/student-sign-in' : '/sign-in'} className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
                    Sign In
                  </Link>
                  <Link href={activeView === 'student' ? '/student-sign-up' : '/sign-up'} className="px-3 py-2 text-white rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600">
                    Get Started
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-2">
                  {renderAppLinks()}
                </div>
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}


