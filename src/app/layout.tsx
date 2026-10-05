import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SiteLayout from '@/components/layout/SiteLayout';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HealthCheck - Detecta noticias falsas sobre salud',
  description: 'Plataforma para detectar y combatir la desinformación en temas de salud usando inteligencia artificial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <SiteLayout>{children}</SiteLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
