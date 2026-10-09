import AuthShell from '@/components/auth/AuthShell';
import PasswordForm from '@/components/auth/PasswordForm';
export const metadata = {title: 'Nueva contraseña | HealthCheck', robots: {index: false, follow: false}, referrer: 'no-referrer' as const};
export default function Page() {return <AuthShell variant="login"><PasswordForm mode="reset"/></AuthShell>;}
