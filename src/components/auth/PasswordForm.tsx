'use client';

import {useEffect, useRef, useState, type FormEvent} from 'react';
import Link from 'next/link';
import {useAuth} from '@/context/AuthContext';
import {changePassword, requestRecovery, resetPassword} from '@/services/recoveryService';
import AuthField from './AuthField';
import {FormError, SubmitButton} from './AuthActions';
import styles from './auth.module.css';

export default function PasswordForm({mode}: {mode: 'forgot' | 'reset' | 'change'}) {
  const {user, loading, error: sessionError} = useAuth();
  const [email, setEmail] = useState(''), [actual, setActual] = useState('');
  const [password, setPassword] = useState(''), [confirm, setConfirm] = useState('');
  const [token, setToken] = useState(''), [ready, setReady] = useState(mode !== 'reset');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const initialized = useRef(false);
  useEffect(() => {
    if (mode !== 'reset' || initialized.current) return;
    initialized.current = true;
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
    window.history.replaceState(null, '', window.location.pathname);
    setToken(/^[a-f0-9]{64}$/.test(value) ? value : ''); setReady(true);
  }, [mode]);

  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setError('');
    if (mode !== 'forgot' && (password !== confirm || password.length < 8 || new TextEncoder().encode(password).length > 72)) {
      setError('Las contraseñas deben coincidir y tener al menos 8 caracteres y como máximo 72 bytes.'); return;
    }
    setBusy(true);
    try {
      setMessage(mode === 'forgot' ? await requestRecovery(email.trim()) : mode === 'reset' ? await resetPassword(token, password) : await changePassword(actual, password));
      setActual('');setPassword('');setConfirm('');setToken('');
    } catch (e) {setError(e instanceof TypeError ? 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.' : e instanceof Error ? e.message : 'No se pudo completar la solicitud.');}
    finally {setBusy(false);}
  }

  const title = mode === 'forgot' ? 'Recupera tu acceso' : mode === 'reset' ? 'Elige tu nueva contraseña' : 'Cambia tu contraseña';
  if (message) return <div className={styles.formContent}><h1 className={styles.formTitle}>{mode === 'forgot' ? 'Revisa tu correo' : 'Contraseña actualizada'}</h1><p className={styles.formDescription} role="status">{message}</p><p className={styles.switch}><Link href="/login">Volver a iniciar sesión</Link></p>{mode === 'forgot' && <button className={styles.submit} onClick={() => setMessage('')}>Solicitar otro enlace</button>}</div>;
  if (!ready || (mode === 'change' && loading)) return <p role="status">Cargando…</p>;
  if (mode === 'change' && !user) return <div className={styles.formContent}><FormError message={sessionError || 'Inicia sesión para cambiar tu contraseña.'}/>{sessionError && <button className={styles.submit} onClick={() => window.dispatchEvent(new Event('healthcheck:permissions-changed'))}>Volver a intentar</button>}<p className={styles.switch}><Link href="/login">Iniciar sesión</Link></p></div>;
  if (mode === 'change' && user?.password_enabled === false) return <div className={styles.formContent}><h1 className={styles.formTitle}>Tu acceso es con Google</h1><p className={styles.formDescription}>Administra tu contraseña desde tu cuenta de Google.</p><p className={styles.switch}><Link href="/profile">Volver a mi cuenta</Link></p></div>;
  if (mode === 'reset' && !token) return <div className={styles.formContent}><h1 className={styles.formTitle}>Necesitas un enlace válido</h1><p className={styles.formDescription}>Abre el enlace completo del correo o solicita uno nuevo.</p><p className={styles.switch}><Link href="/forgot-password">Solicitar un enlace</Link></p></div>;
  return <div className={styles.formContent}>
    <h1 className={styles.formTitle}>{title}</h1>
    <p className={styles.formDescription}>{mode === 'forgot' ? 'Escribe el correo de tu cuenta. Te enviaremos un enlace que vence en 15 minutos. Si accedes con Google, recupera tu cuenta desde Google.' : 'Al guardar se cerrarán las sesiones de todos tus dispositivos. Usa al menos 8 caracteres.'}</p>
    <FormError message={error}/>
    <form className={styles.form} onSubmit={submit} aria-busy={busy}>
      {mode === 'forgot' ? <AuthField id="recovery-email" label="Correo electrónico" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/> : <>
        {mode === 'change' && <AuthField id="current-password" label="Contraseña actual" type="password" autoComplete="current-password" required value={actual} onChange={e=>setActual(e.target.value)} disabled={busy}/>}
        <AuthField id="new-password" label="Nueva contraseña" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/>
        <AuthField id="confirm-password" label="Confirma la nueva contraseña" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirm} onChange={e=>setConfirm(e.target.value)} disabled={busy}/>
      </>}
      <SubmitButton loading={busy} pending={mode === 'forgot' ? 'Solicitando enlace…' : 'Guardando contraseña…'}>{mode === 'forgot' ? 'Enviar enlace' : 'Guardar contraseña'}</SubmitButton>
    </form>
    <p className={styles.switch}><Link href={mode === 'change' ? '/profile' : '/login'}>{mode === 'change' ? 'Volver a mi cuenta' : 'Volver a iniciar sesión'}</Link></p>
    {mode === 'reset' && <p className={styles.switch}><Link href="/forgot-password">Solicitar otro enlace</Link></p>}
  </div>;
}
