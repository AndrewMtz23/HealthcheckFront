// src/components/layout/UserMenu.tsx
'use client'
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiGrid } from 'react-icons/fi';
import UserAvatar from '@/components/ui/UserAvatar';

interface UserMenuProps {
  mobile?: boolean;
  onMobileMenuClose?: () => void;
}

const UserMenu = ({ mobile = false, onMobileMenuClose }: UserMenuProps) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setIsProfileDropdownOpen(false);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  // Effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Si es la versión móvil, mostrar una versión diferente
  if (mobile) {
    return (
      <div className="border-t border-gray-200 dark:border-slate-700 pt-4 pb-3">
        <div className="flex items-center px-4">
          <div className="flex-shrink-0">
            <UserAvatar name={user?.nombre} url={user?.imagen_url} className="h-10 w-10 bg-blue-600 text-white text-lg font-medium" />
          </div>
          <div className="ml-3">
            <div className="text-base font-medium text-gray-800 dark:text-slate-100">{user?.nombre}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{user?.email}</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {user && (
            <Link
              href={user.rol==='admin'?'/admin/dashboard':'/dashboard'}
              className="flex items-center px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={onMobileMenuClose}
            >
              <FiGrid aria-hidden="true" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" />
              {user.rol==='admin'?'Dashboard':'Mi espacio'}
            </Link>
          )}
          <Link
            href="/profile"
            className="flex items-center px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={onMobileMenuClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mi perfil
          </Link>
          
          {/* Agregar enlace al historial de consultas */}
          <Link
            href="/history"
            className="flex items-center px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={onMobileMenuClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial
          </Link>
          
          <button
            className="flex items-center w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Versión de escritorio
  return (
    <div className="ml-3 relative" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          id="user-menu"
          aria-expanded={isProfileDropdownOpen}
          aria-haspopup="true"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        >
          <span className="sr-only">Abrir menú de usuario</span>
          <UserAvatar name={user?.nombre} url={user?.imagen_url} className="h-8 w-8 bg-blue-600 text-white text-sm font-medium" />
        </button>
      </div>
      
      {/* Dropdown menu */}
      {isProfileDropdownOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-xl py-1 bg-white dark:bg-slate-900 ring-1 ring-gray-100 dark:ring-slate-800 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <UserAvatar name={user?.nombre} url={user?.imagen_url} className="h-10 w-10 bg-blue-600 text-white text-lg font-medium" />
              <div>
                <div className="font-medium text-gray-900 dark:text-slate-100">{user?.nombre}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[180px]">{user?.email}</div>
              </div>
            </div>
          </div>
          
          <div className="py-1">
            {user && (
              <Link
                href={user.rol==='admin'?'/admin/dashboard':'/dashboard'}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                role="menuitem"
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <FiGrid aria-hidden="true" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" />
                {user.rol==='admin'?'Dashboard':'Mi espacio'}
              </Link>
            )}
            <Link
              href="/profile"
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              role="menuitem"
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi perfil
            </Link>
            
            {/* Agregar enlace al historial de consultas */}
            <Link
              href="/history"
              className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              role="menuitem"
              onClick={() => setIsProfileDropdownOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial
            </Link>
            
            <button
              className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              role="menuitem"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
