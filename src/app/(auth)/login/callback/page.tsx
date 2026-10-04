'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Ocurrió un error durante la autenticación con Google.');
      return;
    }

    if (!token) {
      setError('No se recibió un token válido.');
      return;
    }

    // Guardar token en localStorage
    localStorage.setItem('token', token);
    
    // Intentar decodificar el token para obtener información básica del usuario
    try {
      // Nota: esto es una decodificación simple del JWT para obtener los datos del payload
      // No es una verificación criptográfica completa, eso se hace en el backend
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      localStorage.setItem('user', JSON.stringify({
        id: payload.id,
        email: payload.email,
        rol: payload.rol,
      }));
    } catch (err) {
      console.error('Error decodificando token:', err);
    }
    
    // Redireccionar al dashboard
    router.push('/dashboard');
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Error de autenticación</h2>
            <p className="mt-2 text-center text-sm text-gray-600">{error}</p>
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Autenticando...</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
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