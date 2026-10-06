'use client';
import Link from 'next/link';
import Image from 'next/image';
import AdminFooter from './AdminFooter';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen, LayoutDashboard, Users, Newspaper, Globe, Tags, Flag, History, Boxes, Bell, LogOut, ArrowUpRight, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getProfile } from '@/services/authService';
import { State } from './ui';
import UserAvatar from '@/components/ui/UserAvatar';
import { manageDrawerFocus } from './navigation';
const groups = [{ name: 'Gestión', items: [['dashboard', 'Vista general', LayoutDashboard], ['users', 'Usuarios', Users]] }, { name: 'Contenido', items: [['news', 'Noticias', Newspaper], ['sources', 'Fuentes', Globe], ['topics', 'Temas', Tags]] }, { name: 'Control', items: [['reports', 'Reportes', Flag], ['activity', 'Actividad', History]] }, { name: 'Sistema', items: [['models', 'Modelos', Boxes], ['notifications', 'Notificaciones', Bell]] }] as const;
export default function AdminShell({ children }: {
    children: ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const panel=useRef<HTMLElement>(null);
    const trigger=useRef<HTMLButtonElement>(null);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    useEffect(() => { if (loading)
        return; if (!user) {
        router.replace('/login');
        return;
    } let live = true; setVerified(false); getProfile().then(profile => { if (!live)
        return; if (profile.rol !== 'admin')
        setError('Tu cuenta no tiene permisos de administración.');
    else {
        setError('');
        setVerified(true);
    } }).catch(() => { if (live)
        setError('No pudimos validar tu sesión. Inicia sesión de nuevo o reintenta.'); }); return () => { live = false; }; }, [loading, user, retry, router]);
    useEffect(() => { const handler = () => { setVerified(false); setError('Tu sesión expiró o ya no tiene permisos administrativos.'); }; window.addEventListener('admin-access-error', handler); return () => window.removeEventListener('admin-access-error', handler); }, []);
    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => { if (!open || !panel.current) return; const cleanup=manageDrawerFocus(panel.current,document,trigger.current,()=>setOpen(false));const media=window.matchMedia('(min-width:761px)');const resize=()=>{if(media.matches)setOpen(false);};media.addEventListener('change',resize);return()=>{cleanup();media.removeEventListener('change',resize);}; }, [open]);
    if (!verified)
        return <div className="admin-app a-access"><State loading={!error} error={error} retry={() => setRetry(v => v + 1)}/>{error && <Link href="/login" className="a-button">Iniciar sesión</Link>}</div>;
    return <div className={`admin-app ${collapsed ? 'a-collapsed' : ''}`}><a href="#admin-main" className="a-skip">Saltar al contenido</a><header className="a-mobile" inert={open}><Link href="/admin/dashboard"><Image src="/Images/logoHC.png" alt="" width={640} height={449} className="a-logo"/> HealthCheck</Link><button className="a-icon" ref={trigger} aria-label="Abrir navegación" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button></header>{open && <button className="a-backdrop" aria-label="Cerrar navegación" onClick={() => setOpen(false)}/>}
 <aside id="admin-sidebar" ref={panel} role={open?"dialog":undefined} aria-modal={open||undefined} className={`a-sidebar ${open ? 'is-open' : ''}`} aria-label="Administración"><div className="a-sidebar-heading"><Link className="a-brand" href="/admin/dashboard" aria-label="HealthCheck: vista general"><Image src="/Images/logoHC.png" alt="" width={640} height={449} className="a-logo" priority/><b>HealthCheck</b></Link><button className="a-collapse a-icon" aria-controls="admin-sidebar" aria-expanded={!collapsed} aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"} title={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"} onClick={() => setCollapsed(value => !value)}>{collapsed ? <PanelLeftOpen size={19}/> : <PanelLeftClose size={19}/>}</button></div><button className="a-close a-icon" aria-label="Cerrar navegación" onClick={() => setOpen(false)}><X /></button><div className="a-sidebar-label">ADMINISTRACIÓN</div><nav className="a-full-nav">{groups.map(group => <details open key={group.name}><summary>{group.name}<ChevronDown size={14}/></summary><div className="a-nav-group">{group.items.map(([key, label, Icon]) => <Link key={key} href={`/admin/${key}`} aria-current={pathname === `/admin/${key}` ? 'page' : undefined} className={pathname === `/admin/${key}` ? 'active' : ''}><Icon size={17}/>{label}</Link>)}</div></details>)}</nav><nav className="a-compact-nav" aria-label="Módulos administrativos">{groups.map(group => <div className="a-compact-group" key={group.name}>{group.items.map(([key, label, Icon]) => <Link key={key} href={`/admin/${key}`} aria-label={label} title={label} aria-current={pathname === `/admin/${key}` ? "page" : undefined} className={pathname === `/admin/${key}` ? "active" : ""}><Icon size={20} aria-hidden="true"/></Link>)}</div>)}</nav><div className="a-sidebar-bottom"><Link className="a-site-link" href="/" aria-label="Ir al sitio público" title="Ir al sitio público"><span>Ir al sitio público</span><ArrowUpRight size={17}/></Link><div className="a-session"><button onClick={() => logout()} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17}/><span>Cerrar sesión</span></button><button className="a-icon" aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button></div><div className="a-profile"><UserAvatar name={user?.nombre} url={user?.imagen_url} className="a-avatar"/><div><strong>{user?.nombre}</strong><small>Administrador</small></div></div></div></aside><div inert={open} id="admin-main" className="a-main" tabIndex={-1}><main className="a-module-content">{children}</main><AdminFooter/></div></div>;
}
