import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import AuthShell from '@/components/auth/AuthShell';

export const metadata: Metadata = { title: 'Iniciar sesión | HealthCheck' };

export default function LoginPage() {
  return <AuthShell variant="login"><LoginForm /></AuthShell>;
}
