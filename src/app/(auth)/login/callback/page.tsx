'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProfile } from '@/services/authService';

export default function GoogleCallback() {
  return <Suspense fallback={<div role="status" className="p-12 text-center">Cargando autenticación…</div>}><GoogleCallbackContent /></Suspense>;
}

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    const errorParam = searchParams.get('error');
    window.history.replaceState(null, '', window.location.pathname);

    if (errorParam) {
      setError('Ocurrió un error durante la autenticación con Google.');
      return;
    }

    if (!token) {
      setError('No se recibió un token válido.');
      return;
    }

    localStorage.setItem('token', token);
    void getProfile().then(profile => {
      if (localStorage.getItem('token') !== token) return;
      login(profile, token);
      router.replace(profile.rol === 'admin' ? '/admin/dashboard' : '/dashboard');
    }).catch(() => {
      if (localStorage.getItem('token') === token) {
        localStorage.removeItem('token'); localStorage.removeItem('user');
      }
      setError('No pudimos validar la sesión de Google. Vuelve a iniciar sesión.');
    });
  }, [router, searchParams, login]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">Error de autenticación</h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-300">{error}</p>
          </div>
          <div className="mt-5">
            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">Autenticando...</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-300">
            Por favor, espere mientras completamos su inicio de sesión.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}
