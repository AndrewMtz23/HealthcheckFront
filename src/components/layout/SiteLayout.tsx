'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatButton from '@/components/chat/ChatButton';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return <main className="min-w-0 flex-grow">{children}</main>;

  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-grow pt-16 bg-gray-50">{children}</main>
      <Footer />
      <ChatButton />
    </>
  );
}
