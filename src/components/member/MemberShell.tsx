'use client';
import {useEffect, useState, type ReactNode} from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {LayoutDashboard, ScanSearch, History, Tags, Bell, Settings2, UserRound, ArrowUpRight, PanelLeftClose, PanelLeftOpen, ShieldCheck, LoaderCircle} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import UserAvatar from '@/components/ui/UserAvatar';
import './member.css';
const links=[
  {href:'/dashboard',label:'Mi resumen',icon:LayoutDashboard},
  {href:'/dashboard/analyze',label:'Analizar noticia',icon:ScanSearch},
  {href:'/dashboard/history',label:'Mi historial',icon:History},
  {href:'/dashboard/topics',label:'Mis intereses',icon:Tags},
  {href:'/dashboard/notifications',label:'Notificaciones',icon:Bell},
  {href:'/dashboard/preferences',label:'Preferencias',icon:Settings2},
  {href:'/dashboard/profile',label:'Mi perfil',icon:UserRound},
];
export default function MemberShell({children}:{children:ReactNode}) {
  const {user,loading}=useAuth();const pathname=usePathname();const router=useRouter();
  const [collapsed,setCollapsed]=useState(false);
  useEffect(()=>{if(!loading&&!user)router.replace('/login');},[loading,user,router]);
  if(loading||!user)return <div className="m-loading" role="status"><LoaderCircle className="animate-spin"/>Cargando tu espacio…</div>;
  return <div className={`member-space ${collapsed?'m-collapsed':''}`}>
    <aside className="m-sidebar" aria-label="Mi espacio">
      <div className="m-sidebar-title"><span>MI ESPACIO</span><button onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expandir navegación':'Contraer navegación'} aria-expanded={!collapsed}>{collapsed?<PanelLeftOpen size={19}/>:<PanelLeftClose size={19}/>}</button></div>
      <div className="m-identity"><UserAvatar name={user.nombre} url={user.imagen_url} className="m-avatar"/><div><strong>{user.nombre}</strong><small>Tu cuenta de HealthCheck</small></div></div>
      <nav>{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={pathname===href?'active':''} aria-current={pathname===href?'page':undefined} title={collapsed?label:undefined} aria-label={label}><Icon size={19}/><span>{label}</span></Link>)}</nav>
      <div className="m-sidebar-bottom"><Link href="/news" aria-label="Explorar noticias"><ArrowUpRight size={18}/><span>Explorar noticias</span></Link>{user.rol==='admin'&&<Link href="/admin/dashboard" aria-label="Administración"><ShieldCheck size={18}/><span>Administración</span></Link>}</div>
    </aside>
    <div className="m-workspace"><div className="m-module" key={user.id}>{children}</div><footer className="m-footer"><span>HealthCheck · Tu información, con perspectiva.</span><Link href="/privacy">Privacidad</Link></footer></div>
  </div>;
}
