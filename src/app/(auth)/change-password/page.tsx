import AuthShell from '@/components/auth/AuthShell';
import PasswordForm from '@/components/auth/PasswordForm';
export const metadata = {title: 'Cambiar contraseña | HealthCheck', robots: {index: false, follow: false}};
export default function Page() {return <AuthShell variant="login"><PasswordForm mode="change"/></AuthShell>;}
