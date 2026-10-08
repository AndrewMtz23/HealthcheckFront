'use client';
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {User, getProfile, logout as logoutService} from '@/services/authService';
import {clearSession} from '@/services/session';
import {useRouter} from 'next/navigation';

interface AuthContextType {
  user: User | null; loading: boolean; error: string | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>; updateUser: (user: User) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    let sequence = 0;
    const ended = () => {
      sequence++;
      setUser(null); setLoading(false);
      setError('Tu sesión terminó. Vuelve a iniciar sesión.');
      router.replace('/login');
    };
    const refresh = async () => {
      const current = ++sequence;
      const token = localStorage.getItem('token');
      if (!token) {setUser(null); setLoading(false); return;}
      try {
        const profile = await getProfile();
        if (live && current === sequence && token === localStorage.getItem('token')) {
          setUser(profile); setError(null);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch {
        if (live && current === sequence && token === localStorage.getItem('token')) {
          // Never restore permissions from cached localStorage after a failed check.
          setUser(null);
          setError('No pudimos validar tu sesión. Reintenta cuando haya conexión.');
        }
      } finally {if (live && current === sequence && token === localStorage.getItem('token')) setLoading(false);}
    };
    window.addEventListener('healthcheck:session-ended', ended);
    window.addEventListener('healthcheck:permissions-changed', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    void refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => {
      live = false; window.clearInterval(timer);
      window.removeEventListener('healthcheck:session-ended', ended);
      window.removeEventListener('healthcheck:permissions-changed', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!Number.isFinite(payload.exp)) {clearSession(); return;}
      // UI cleanup only. The server independently verifies expiry and revocation.
      const timer = window.setTimeout(() => {
        if (localStorage.getItem('token') === token) clearSession();
      }, Math.max(0, Math.min(payload.exp * 1000 - Date.now(), 2147483647)));
      return () => window.clearTimeout(timer);
    } catch {clearSession();}
  }, [user]);

  const login = (profile: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile); setError(null); setLoading(false);
  };
  const logout = async () => {
    try {await logoutService(); setError(null);}
    catch {setError('No se pudo cerrar la sesión en el servidor. Intenta de nuevo.');}
  };
  const updateUser = (profile: User) => {
    setUser(profile); localStorage.setItem('user', JSON.stringify(profile));
  };
  return <AuthContext.Provider value={{user, loading, error, login, logout, updateUser}}>
    {error && <div role="alert" className="px-4 py-2 text-center">{error}</div>}
    {children}
  </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
