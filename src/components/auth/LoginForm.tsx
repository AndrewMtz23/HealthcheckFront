'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login as loginRequest } from '@/services/authService';
import AuthField from './AuthField';
import { EmailDivider, FormError, GoogleButton, SubmitButton } from './AuthActions';
import styles from './auth.module.css';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('error');
    const messages: Record<string,string> = {
      'google-cancelado':'Cancelaste el acceso con Google. Puedes intentarlo de nuevo.',
      'metodo-original':'Usa el método con el que creaste tu cuenta. Por seguridad, no vinculamos cuentas automáticamente.',
      'google-no-disponible':'El acceso con Google no está disponible temporalmente.',
      'autenticacion-fallida':'No se pudo validar el acceso con Google. Inicia el proceso de nuevo.',
      'cuenta-inactiva':'No se puede acceder a esta cuenta.',
    };
    if (reason) {setError(messages[reason] || 'No se pudo completar el acceso. Intenta de nuevo.');window.history.replaceState(null,'',window.location.pathname);}
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await loginRequest(email.trim(), password);
      if (!response.data?.user || !response.data?.token) {
        throw new Error('No pudimos completar el acceso. Inténtalo de nuevo.');
      }
      login(response.data.user, response.data.token);
      router.push(response.data.user.rol === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: unknown) {
      setError(err instanceof TypeError ? 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.' : err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContent}>
      <h1 className={styles.formTitle}>Bienvenido a HealthCheck</h1>
      <p className={styles.formDescription}>Qué bueno tenerte de vuelta. Sigue explorando información para tu bienestar.</p>
      <FormError message={error} />
      <form onSubmit={handleSubmit} className={styles.form} aria-busy={isLoading}>
        <AuthField id="email" name="email" label="Correo electrónico" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} placeholder="tu@ejemplo.com" />
        <AuthField id="password" name="password" label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} placeholder="Escribe tu contraseña" />
        <SubmitButton loading={isLoading} pending="Iniciando sesión…">Iniciar sesión</SubmitButton>
      </form>
      <p className={styles.switch}><Link href="/forgot-password">¿Olvidaste tu contraseña?</Link></p>
      <EmailDivider />
      <GoogleButton disabled={isLoading} />
      <p className={styles.switch}>¿Aún no tienes cuenta? <Link href="/register">Crea tu cuenta</Link></p>
    </div>
  );
}
