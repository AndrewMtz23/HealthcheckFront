'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getProfile, logout as logoutService, isAuthenticated, getCurrentUser } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al inicio
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Primero verificamos si hay un token
        if (!isAuthenticated()) {
          setLoading(false);
          return;
        }

        // Obtenemos el usuario guardado en localStorage
        const storedUser = getCurrentUser();
        
        if (storedUser) {
          setUser(storedUser);
        }

        // Intentamos obtener perfil completo del usuario desde la API
        try {
          const userData = await getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Error al cargar perfil completo:', error);
          // Si hay error pero tenemos datos básicos, usamos esos
          if (!storedUser) {
            await handleLogout();
          }
        }
      } catch (error) {
        setError((error as Error).message);
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función para iniciar sesión
  const handleLogin = (user: User, token: string) => {
    // Guardar token y datos básicos del usuario
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Actualizar estado
    setUser(user);
    setError(null);
    
    console.log('Login successful, user state updated:', user);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logoutService();
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Incluso si hay error, limpiamos el estado local
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setError((error as Error).message);
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};