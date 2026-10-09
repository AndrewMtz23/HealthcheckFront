'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import AuthField from './AuthField';
import { EmailDivider, FormError, GoogleButton, SubmitButton } from './AuthActions';
import styles from './auth.module.css';

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordError = touched.password && password.length > 0 && (password.length < 8 || new TextEncoder().encode(password).length > 72) ? 'Usa al menos 8 caracteres y como máximo 72 bytes.' : '';
  const confirmError = touched.confirm && confirmPassword !== password ? 'Las contraseñas no coinciden.' : '';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setError('');
    setTouched({ password: true, confirm: true });
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) return;
    if (password !== confirmPassword) {
      event.currentTarget.querySelector<HTMLInputElement>('#confirmPassword')?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const response = await register(email.trim(), name.trim(), password, phone.trim());
      if (!response.data?.token || !response.data?.user) {
        throw new Error('No pudimos iniciar tu sesión. Intenta acceder con tu correo y contraseña.');
      }
      login(response.data.user, response.data.token);
      router.push(response.data.user.rol === 'admin' ? '/admin/dashboard' : '/news');
    } catch (err: unknown) {
      setError(err instanceof TypeError ? 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.' : err instanceof Error ? err.message : 'Ocurrió un error al crear tu cuenta. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContent}>
      <h1 className={styles.formTitle}>Empieza con HealthCheck</h1>
      <p className={styles.formDescription}>Crea tu cuenta y encuentra una nueva forma de informarte sobre salud.</p>
      <FormError message={error} />
      <form onSubmit={handleSubmit} className={`${styles.form} ${styles.registerForm}`} aria-busy={isLoading}>
        <AuthField id="name" name="name" label="Nombre completo" autoComplete="name" required pattern=".*\S.*" title="Escribe tu nombre" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading} placeholder="¿Cómo te llamas?" />
        <AuthField id="email" name="email" label="Correo electrónico" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} placeholder="tu@ejemplo.com" />
        <AuthField id="phone" name="phone" label="Teléfono" optional type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={isLoading} placeholder="+52 123 456 7890" />
        <div className={styles.passwordRow}>
          <AuthField id="password" name="password" label="Contraseña" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, password: true }))} disabled={isLoading} placeholder="Tu contraseña" hint="Al menos 8 caracteres; máximo 72 bytes." error={passwordError} />
          <AuthField id="confirmPassword" name="confirmPassword" label="Confirmar contraseña" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, confirm: true }))} disabled={isLoading} placeholder="Repítela" error={confirmError} />
        </div>
        <SubmitButton loading={isLoading} pending="Creando tu cuenta…">Crear mi cuenta</SubmitButton>
      </form>
      <EmailDivider />
      <GoogleButton disabled={isLoading} />
      <p className={styles.terms}>Consulta nuestros <Link href="/terms">términos de uso</Link> y el <Link href="/privacy">aviso de privacidad</Link>.</p>
      <p className={styles.switch}>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></p>
    </div>
  );
}
