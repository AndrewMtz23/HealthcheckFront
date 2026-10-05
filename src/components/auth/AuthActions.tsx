'use client';

import { AlertCircle, LoaderCircle } from 'lucide-react';
import styles from './auth.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function GoogleButton({ disabled }: { disabled: boolean }) {
  return <button type="button" className={styles.google} disabled={disabled} onClick={() => { window.location.href = `${API_URL}/auth/google`; }}>
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92A6 6 0 0 1 6.09 12c0-.67.11-1.32.31-1.92V7.49H3.06A10 10 0 0 0 2 12c0 1.61.38 3.14 1.06 4.51l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59C7.19 7.72 9.4 5.96 12 5.96Z"/></svg>
    Continuar con Google
  </button>;
}

export function SubmitButton({ loading, children, pending }: { loading: boolean; children: React.ReactNode; pending: string }) {
  return <button type="submit" disabled={loading} className={styles.submit}><span aria-live="polite">{loading ? pending : children}</span>{loading && <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />}</button>;
}

export function FormError({ message }: { message: string }) {
  return message ? <div className={styles.error} role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{message}</span></div> : null;
}

export function EmailDivider() {
  return <div className={styles.divider}><span>o continúa con</span></div>;
}
