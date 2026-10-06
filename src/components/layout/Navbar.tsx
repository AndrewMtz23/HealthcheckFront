'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Newspaper, Info, ShieldCheck, FileText, Mail, ChevronDown, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import BrandWordmark from './BrandWordmark';
import ThemeSelector from './ThemeSelector';
import styles from './Navbar.module.css';
const information = [
  { href: '/about', label: 'Acerca de HealthCheck', icon: Info },
  { href: '/contact', label: 'Contacto y ayuda', icon: Mail },
  { href: '/privacy', label: 'Política de privacidad', icon: ShieldCheck },
  { href: '/terms', label: 'Términos y condiciones', icon: FileText },
];
export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobile, setMobile] = useState(false);
  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMobile(false); setMore(false); }, [pathname]);
  useEffect(() => {
    if (!more) return;
    const outside = (e: PointerEvent) => { if (!moreRef.current?.contains(e.target as Node)) setMore(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMore(false); moreButton.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [more]);
  const active = (href: string) => href === '/' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
  const navLinks = <><Link href="/" aria-current={active('/') ? 'page' : undefined} className={active('/') ? styles.active : ''} onClick={() => setMobile(false)}><Home size={17}/>Inicio</Link><Link href="/news" aria-current={active('/news') ? 'page' : undefined} className={active('/news') ? styles.active : ''} onClick={() => setMobile(false)}><Newspaper size={17}/>Noticias</Link></>;
  return <header className={styles.header}>
    <div className={styles.bar}>
      <Link href="/" className={styles.brand} aria-label="HealthCheck: inicio"><Image src="/Images/logoHC.png" alt="" width={640} height={449} priority/><BrandWordmark/></Link>
      <nav className={styles.navigation} aria-label="Navegación principal">{navLinks}
        <div ref={moreRef} className={styles.more} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMore(false); }}>
          <button ref={moreButton} className={information.some(item => active(item.href)) ? styles.active : ''} aria-expanded={more} aria-controls="more-navigation" onClick={() => setMore(value => !value)}><Info size={17}/>Más<ChevronDown size={15} className={more ? styles.rotated : ''}/></button>
          {more && <div id="more-navigation" className={styles.dropdown}>{information.map(({href,label,icon:Icon}) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} onClick={() => setMore(false)}><Icon size={17}/>{label}</Link>)}</div>}
        </div>
      </nav>
      <div className={styles.account}><ThemeSelector/><div className={styles.desktopAccount}>{user ? <UserMenu/> : <><Link href="/login" className={styles.login}><LogIn size={16}/>Iniciar sesión</Link><Link href="/register" className={styles.register}><UserPlus size={16}/>Registrarse</Link></>}</div><button className={styles.mobileToggle} aria-label={mobile ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={() => setMobile(value => !value)}>{mobile ? <X/> : <Menu/>}</button></div>
    </div>
    {mobile && <nav id="mobile-navigation" className={styles.mobileNavigation} aria-label="Navegación móvil">{navLinks}<details><summary><Info size={17}/>Más<ChevronDown size={15}/></summary><div>{information.map(({href,label,icon:Icon}) => <Link href={href} key={href} aria-current={active(href) ? 'page' : undefined} onClick={() => setMobile(false)}><Icon size={17}/>{label}</Link>)}</div></details>{user ? <UserMenu mobile onMobileMenuClose={() => setMobile(false)}/> : <><Link href="/login" onClick={() => setMobile(false)}><LogIn size={17}/>Iniciar sesión</Link><Link href="/register" onClick={() => setMobile(false)}><UserPlus size={17}/>Registrarse</Link></>}</nav>}
  </header>;
}
