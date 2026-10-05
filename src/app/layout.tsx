import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SiteLayout from '@/components/layout/SiteLayout';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { themeInitScript } from '@/lib/theme';

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
    <html lang="es" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider><AuthProvider>
          <SiteLayout>{children}</SiteLayout>
        </AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}
