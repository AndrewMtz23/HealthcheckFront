'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatButton from '@/components/chat/ChatButton';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage || pathname === '/admin' || pathname.startsWith('/admin/')) return <main className="min-w-0 flex-grow">{children}</main>;
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return <><Navbar/><main className="min-w-0 flex-grow pt-16">{children}</main></>;

  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-grow pt-16 bg-gray-50 dark:bg-slate-950">{children}</main>
      <Footer />
      <ChatButton />
    </>
  );
}
