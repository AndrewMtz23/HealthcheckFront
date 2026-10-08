'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight, ArrowRight, ScanSearch, History, Tags, Bell, RefreshCw, BookOpenCheck, AlertCircle} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import {getUserHistory,type HistoryResponse} from '@/services/historyService';
import {profileRequest,type PreferencesData,type NotificationsData} from '@/services/profileService';
type Resource<T>={data:T|null;error:string;loading:boolean};
const empty=<T,>():Resource<T>=>({data:null,error:'',loading:true});
function LoadError({message}:{message:string}){return <p className="m-error" role="alert"><AlertCircle size={18}/>{message}</p>;}
function date(value:string){const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'Fecha no disponible':parsed.toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'});}
export default function MemberOverview(){
 const {user}=useAuth();const userId=user?.id;const [revision,setRevision]=useState(0);
 const [history,setHistory]=useState<Resource<HistoryResponse>>(empty);
 const [preferences,setPreferences]=useState<Resource<PreferencesData>>(empty);
 const [notifications,setNotifications]=useState<Resource<NotificationsData>>(empty);
 useEffect(()=>{
  if(!userId)return;const controller=new AbortController();const {signal}=controller;
  setHistory(empty());setPreferences(empty());setNotifications(empty());
  const settle=<T,>(promise:Promise<T>,set:(value:Resource<T>)=>void)=>promise.then(data=>{if(!signal.aborted)set({data,error:'',loading:false});}).catch(()=>{if(!signal.aborted)set({data:null,error:'No pudimos cargar esta sección. Usa Actualizar para reintentar.',loading:false});});
  void settle(getUserHistory(1,4,undefined,undefined,signal),setHistory);
  void settle(profileRequest<PreferencesData>('/preferences',{signal}),setPreferences);
  void settle(profileRequest<NotificationsData>('/notifications?limit=3',{signal}),setNotifications);
  return()=>controller.abort();
 },[userId,revision]);
 const stats=[{label:'Consultas en tu historial',value:history.data?.total,icon:History,href:'/dashboard/history'},{label:'Temas que sigues',value:preferences.data?.topics.length,icon:Tags,href:'/dashboard/topics'},{label:'Notificaciones registradas',value:notifications.data?.total,icon:Bell,href:'/dashboard/notifications'}];
 return <>
  <header className="m-heading"><div><p className="m-eyebrow">UNA MIRADA MÁS CLARA</p><h1>Hola, {user?.nombre.split(' ')[0] || 'bienvenido'}<span>.</span></h1><p>Retoma tus lecturas y dedica un momento a contrastar lo que compartes.</p></div><button className="m-button" onClick={()=>setRevision(v=>v+1)} disabled={history.loading||preferences.loading||notifications.loading}><RefreshCw size={16}/>Actualizar</button></header>
  <section className="m-feature"><div><span className="m-pill"><ScanSearch size={15}/>LECTURA CON CRITERIO</span><h2>Antes de compartir,<br/>dale una segunda mirada.</h2><p>Revisa una noticia, consulta el resultado del análisis y compáralo con la fuente original.</p><Link className="m-button m-primary" href="/dashboard/analyze">Analizar una noticia<ArrowUpRight size={18}/></Link></div><div className="m-feature-aside"><BookOpenCheck size={54} strokeWidth={1.2}/><strong>Lee. Contrasta. Comparte.</strong><p>Un análisis automatizado es un punto de partida, no una garantía de veracidad.</p></div></section>
  <div className="m-stats">{stats.map(({label,value,icon:Icon,href})=><Link className="m-stat" href={href} key={href}><span className="m-stat-icon"><Icon size={21}/></span><div><strong>{value??'—'}</strong><p>{label}</p></div><ArrowUpRight size={16}/></Link>)}</div>
  <div className="m-columns"><section className="m-card"><header><div><span className="m-eyebrow">CONTINÚA DONDE LO DEJASTE</span><h2>Lecturas recientes</h2></div><Link href="/dashboard/history" aria-label="Ver todo el historial"><ArrowRight size={20}/></Link></header>
   {history.loading?<p className="m-empty" role="status">Cargando tus consultas…</p>:history.error?<LoadError message={history.error}/>:!history.data?.history.length?<div className="m-empty"><History size={30}/><h3>Tu próxima lectura empieza aquí</h3><p>Las noticias que consultes con tu cuenta aparecerán en este espacio.</p><Link className="m-button" href="/news">Explorar noticias<ArrowRight size={16}/></Link></div>:<div className="m-reading-list">{history.data.history.map(item=><Link href={`/news/${item.noticia_id}`} key={item.id}><span className="m-reading-icon"><BookOpenCheck size={20}/></span><div><small>{date(item.fecha_consulta)} · {item.noticia?.tema?.nombre||'Lectura de noticias'}</small><h3>{item.noticia?.titulo||'Consultar noticia'}</h3><span>{item.noticia?.clasificaciones?.[0]?.resultado ? `Clasificación del modelo: ${item.noticia.clasificaciones[0].resultado}`:'Sin clasificación registrada'}</span></div><ArrowUpRight size={18}/></Link>)}</div>}
  </section><section className="m-card"><header><div><span className="m-eyebrow">A TU MEDIDA</span><h2>Tus intereses</h2></div><Tags size={22}/></header>{preferences.loading?<p className="m-empty" role="status">Cargando tus temas…</p>:preferences.error?<LoadError message={preferences.error}/>:<div className="m-card-body"><p>Sigue los temas que te importan y explora sus noticias.</p>{preferences.data?.topics.length?<div className="m-topics">{preferences.data.topics.map(topic=>topic.activo?<Link href={`/news?temaId=${topic.tema_id}`} key={topic.tema_id}>{topic.tema_nombre}<ArrowUpRight size={14}/></Link>:<span key={topic.tema_id}>{topic.tema_nombre} · Inactivo</span>)}</div>:<p className="m-muted">Todavía no has elegido temas. Puedes añadirlos cuando haya temas disponibles.</p>}<Link className="m-text-link" href="/dashboard/topics">Elegir mis intereses<ArrowRight size={16}/></Link></div>}</section></div>
  <section className="m-card"><header><div><span className="m-eyebrow">TU BUZÓN PERSONAL</span><h2>Últimas notificaciones</h2></div><Link className="m-text-link" href="/dashboard/notifications">Ver historial<ArrowRight size={16}/></Link></header>{notifications.loading?<p className="m-empty" role="status">Cargando notificaciones…</p>:notifications.error?<LoadError message={notifications.error}/>:!notifications.data?.items.length?<div className="m-inline-empty"><Bell size={24}/><p>No tienes notificaciones registradas. Aquí podrás consultar tus novedades.</p></div>:<div className="m-notifications">{notifications.data.items.map(item=><article key={item.id}><Bell size={20}/><div><h3>{item.titulo}</h3><p>{item.mensaje}</p><small>{date(item.fecha_creacion)} · {item.tipo==='sms'?'SMS histórico · canal retirado':item.enviada?'Enviada':'Pendiente de envío'}</small></div>{item.noticia_id&&<Link href={`/news/${item.noticia_id}`} aria-label={`Ver noticia: ${item.titulo}`}><ArrowUpRight size={18}/></Link>}</article>)}</div>}</section>
 </>;
}
