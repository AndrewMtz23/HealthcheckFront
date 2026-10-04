import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthContext';
import ChatButton from '@/components/chat/ChatButton';

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
          <Navbar />
          <main className="flex-grow pt-16 bg-gray-50">{children}</main>
          <Footer />
          <ChatButton />
        </AuthProvider>
      </body>
    </html>
  );
}