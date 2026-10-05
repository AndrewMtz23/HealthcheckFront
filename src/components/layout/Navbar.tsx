'use client'
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiFileText, FiInfo, FiGrid, FiLogIn, FiUserPlus, FiMenu, FiX } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import BrandWordmark from './BrandWordmark';
import ThemeSelector from './ThemeSelector';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Function to check if a link is active
  const isActive = (path: string) => pathname === path;

  // Verificar si el usuario es administrador
  const isAdmin = user && user.rol === 'admin';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                <Image src="/Images/logoHC.png" alt="" width={640} height={449} priority className="h-auto w-12 shrink-0" />
                <BrandWordmark />
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:items-center">
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
                  }`}
                >
                  <FiHome aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Inicio
                </Link>
                <Link
                  href="/news"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith('/news') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
                  }`}
                >
                  <FiFileText aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Noticias
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith('/admin') 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                        : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
                    }`}
                  >
                  <FiGrid aria-hidden="true" className="h-4 w-4 shrink-0" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/about"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/about') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
                  }`}
                >
                  <FiInfo aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Acerca de
                </Link>
              </div>
            </div>
          </div>

          {/* User menu or Login/Register buttons */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <ThemeSelector />
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <FiLogIn aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="ml-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  <FiUserPlus aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeSelector />
            <button
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-500 dark:hover:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-800 focus:text-gray-500 dark:focus:text-slate-400"
            >
              {isMobileMenuOpen ? <FiX aria-hidden="true" className="h-6 w-6" /> : <FiMenu aria-hidden="true" className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-white dark:bg-slate-900 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiHome aria-hidden="true" className="h-4 w-4 shrink-0" />
              Inicio
            </Link>
            <Link
              href="/news"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                pathname.startsWith('/news') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiFileText aria-hidden="true" className="h-4 w-4 shrink-0" />
              Noticias
            </Link>
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith('/admin') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                    : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiGrid aria-hidden="true" className="h-4 w-4 shrink-0" />
                Admin
              </Link>
            )}
            <Link
              href="/about"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/about') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                  : 'text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiInfo aria-hidden="true" className="h-4 w-4 shrink-0" />
              Acerca de
            </Link>
            
            {/* User options for mobile */}
            {user ? (
              <UserMenu 
                mobile={true} 
                onMobileMenuClose={() => setIsMobileMenuOpen(false)} 
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiLogIn aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-950"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiUserPlus aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
