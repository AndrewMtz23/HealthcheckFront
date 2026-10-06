'use client';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';
import { useEffect, useState, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Users, Newspaper, Globe, Tags, Flag, History, Boxes, Bell, Plus, RefreshCw, Pencil, Eye, CheckCircle, UserPlus, Search, Filter, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { PageData, Row, Section } from '@/types/admin';
import { adminRequest } from '@/services/adminService';
import { State, Status, Badge, date, value, labels } from './ui';
import AdminEditor from './AdminEditor';
import AdminDetail from './AdminDetail';
import { TopicFilter } from './TopicFilter';
export const modules = {
    users: { title: 'Control de usuarios', description: 'Administra las cuentas, sus roles y su acceso a HealthCheck.', icon: Users, columns: ['Identidad', 'Correo electrónico', 'Rol', 'Estado', 'Registro / acceso'], filters: [['rol', 'Rol', 'admin', 'usuario'], ['activo', 'Estado', 'true', 'false']] },
    news: { title: 'Noticias', description: 'Consulta el contenido registrado y su historial de clasificación.', icon: Newspaper, columns: ['Noticia', 'Fuente / tema', 'Resultado actual', 'Publicación'], filters: [['resultado', 'Resultado', 'sin_clasificar', 'verdadera', 'falsa', 'dudosa'], ['tema_id', 'Tema']] },
    sources: { title: 'Fuentes de información', description: 'Gestiona los sitios de origen y revisa su confiabilidad.', icon: Globe, columns: ['Fuente', 'Sitio web', 'Confiabilidad', 'Verificación', 'Reportes'], filters: [['verificada', 'Verificación', 'true', 'false']] },
    topics: { title: 'Temas de salud', description: 'Organiza los temas y las palabras clave del contenido.', icon: Tags, columns: ['Tema', 'Descripción', 'Palabras clave', 'Estado'], filters: [['activo', 'Estado', 'true', 'false']] },
    reports: { title: 'Reportes de fuentes', description: 'Revisa los reportes de la comunidad y registra su resolución.', icon: Flag, columns: ['Motivo', 'Fuente', 'Estado', 'Reporte / revisión'], filters: [['estado', 'Estado', 'pendiente', 'revisado', 'desestimado']] },
    activity: { title: 'Actividad de la comunidad', description: 'Consultas e interacciones registradas. Esta vista no es una auditoría de seguridad.', icon: History, columns: ['Actividad', 'Noticia', 'Usuario', 'Fecha'], filters: [['tipo', 'Tipo', 'consulta', 'marcar_confiable', 'marcar_dudosa', 'compartir']] },
    models: { title: 'Modelos de clasificación', description: 'Consulta las versiones y métricas registradas de los modelos.', icon: Boxes, columns: ['Modelo', 'Versión', 'Precisión / F1', 'Estado', 'Entrenamiento'], filters: [['activo', 'Estado', 'true', 'false']] },
    notifications: { title: 'Notificaciones', description: 'Consulta las entregas registradas y las preferencias de la comunidad.', icon: Bell, columns: ['Notificación', 'Destinatario', 'Canal', 'Entrega', 'Creación / envío'], filters: [['enviada', 'Entrega', 'true', 'false'], ['tipo', 'Canal', 'email', 'sms']] },
    preferences: { title: 'Preferencias de notificación', description: 'Configuración existente de la comunidad; consulta sin crear preferencias.', icon: Bell, columns: ['Usuario', 'Suscripción', 'Frecuencia', 'Canal', 'Temas'], filters: [] }
} as const;
export default function AdminList({ section }: {
    section: Section;
}) {
    const config = modules[section];
    const Icon = config.icon;
    const params = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const query = params.toString();
    const [data, setData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [editor, setEditor] = useState<Row | null | false>(false);
    const [detail, setDetail] = useState<Row | null>(null);
    const [message, setMessage] = useState('');
    const [topics, setTopics] = useState<Row[]>([]);
    const [selectedTopic,setSelectedTopic]=useState(params.get('tema_id')||'');
    useEffect(()=>setSelectedTopic(params.get('tema_id')||''),[params]);
    useEffect(()=>{const id=Number(params.get('detail'));if(section==='news'&&Number.isSafeInteger(id)&&id>0)setDetail({id});},[section,params]);
    function closeDetail(){setDetail(null);if(params.has('detail')){const next=new URLSearchParams(query);next.delete('detail');router.replace(`${pathname}?${next}`);}}
    useEffect(() => { const controller = new AbortController(); setLoading(true); setError(''); adminRequest<PageData>(section, `?${query}`, { signal: controller.signal }).then(setData).catch(e => { if (e.name !== 'AbortError')
        setError(e.message); }).finally(() => { if (!controller.signal.aborted)
        setLoading(false); }); return () => controller.abort(); }, [section, query, refresh]);
    useEffect(() => { if (section !== 'news')
        return; const controller = new AbortController(); async function load() { let page = 1; const all: Row[] = []; while (true) {
        const result = await adminRequest<PageData>('topics', `?limit=100&page=${page}`, { signal: controller.signal });
        all.push(...result.items);
        if (page >= result.totalPages)
            break;
        page++;
    } setTopics(all); } load().catch(() => { }); return () => controller.abort(); }, [section]);
    function filter(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const next = new URLSearchParams(); new FormData(e.currentTarget).forEach((v, k) => { if (String(v))
        next.set(k, String(v)); }); router.push(`${pathname}?${next}`); }
    function page(n: number) { const next = new URLSearchParams(query); next.set('page', String(n)); router.push(`${pathname}?${next}`); }
    const editable = ['users', 'sources', 'topics'].includes(section);
    const label = (key: string, v: string) => key === 'enviada' ? (v === 'true' ? 'Enviada' : 'Pendiente') : key === 'verificada' ? (v === 'true' ? 'Verificada' : 'Sin verificar') : labels[v] || v;
    function cells(r: Row) {
        switch (section) {
            case 'users': return <><td><div className="a-identity"><UserAvatar name={String(r.nombre)} url={r.imagen_url ? String(r.imagen_url) : null} className="a-avatar"/><div><strong>{value(r.nombre)}</strong><small>#{r.id}{Number(r.id) === user?.id ? ' · Tu cuenta' : ''}</small></div></div></td><td>{value(r.email)}</td><td><Status status={r.rol}/></td><td><Status status={r.activo}/></td><td>{date(r.fecha_registro)}<small>Acceso: {r.ultima_conexion ? date(r.ultima_conexion) : 'Sin acceso registrado'}</small></td></>;
            case 'news': return <><td><strong className="a-truncate">{value(r.titulo)}</strong><small>#{r.id} {String(r.url || '').startsWith('https://example.invalid/') && <Badge>Demostración</Badge>}</small></td><td>{value(r.fuente)}<small>{value(r.tema)}</small></td><td><Status status={r.resultado}/></td><td>{date(r.fecha_publicacion)}</td></>;
            case 'sources': return <><td><strong>{value(r.nombre)}</strong></td><td><span className="a-truncate">{value(r.url)}</span></td><td>{value(r.confiabilidad)} / 1</td><td><Badge tone={r.verificada ? 'green' : 'neutral'}>{r.verificada ? 'Verificada' : 'Sin verificar'}</Badge></td><td>{value(r.reportes)}</td></>;
            case 'topics': return <><td><strong>{value(r.nombre)}</strong></td><td><span className="a-truncate">{value(r.descripcion)}</span></td><td><span className="a-truncate">{value(r.palabras_clave)}</span></td><td><Status status={r.activo}/></td></>;
            case 'reports': return <><td><strong className="a-truncate">{value(r.motivo)}</strong><small>Reporte #{r.id}</small></td><td>{value(r.fuente)}</td><td><Status status={r.estado}/></td><td>{date(r.fecha_reporte)}<small>Revisión: {r.fecha_revision ? date(r.fecha_revision) : 'Pendiente'}</small></td></>;
            case 'activity': return <><td><Status status={r.tipo}/></td><td><span className="a-truncate">{value(r.titulo)}</span></td><td>#{value(r.usuario_id)}</td><td>{date(r.fecha)}</td></>;
            case 'models': return <><td><strong>{value(r.nombre)}</strong></td><td>{value(r.version)}</td><td>{value(r.precision)} / {value(r.f1_score)}</td><td><Status status={r.activo}/></td><td>{date(r.fecha_entrenamiento)}</td></>;
            case 'notifications': return <><td><strong className="a-truncate">{value(r.titulo)}</strong></td><td>Usuario #{value(r.usuario_id)}</td><td>{value(r.tipo)}</td><td><Badge tone={r.enviada ? 'green' : 'amber'}>{r.enviada ? 'Enviada' : 'Pendiente'}</Badge></td><td>{date(r.fecha_creacion)}<small>Envío: {r.fecha_envio ? date(r.fecha_envio) : 'Sin envío registrado'}</small></td></>;
            case 'preferences': return <><td>Usuario #{value(r.usuario_id)}</td><td>{r.recibir_notificaciones ? 'Suscrito' : 'Desactivada'}</td><td>{value(r.frecuencia_notificaciones)}</td><td>{value(r.tipo_notificacion)}</td><td><span className="a-truncate">{value(r.temas)}</span></td></>;
        }
    }
    return <><header className="a-heading"><div><h1><Icon />{config.title}</h1><p>{config.description}</p></div><div className="a-actions">{editable && <button className="a-button a-primary" onClick={() => setEditor(null)}>{section === 'users' ? <UserPlus size={17} aria-hidden="true"/> : <Plus size={17} aria-hidden="true"/>}Agregar {section === 'users' ? 'usuario' : section === 'sources' ? 'fuente' : 'tema'}</button>}<button className="a-button" onClick={() => setRefresh(n => n + 1)} disabled={loading}><RefreshCw size={15}/>Actualizar</button></div></header>
 {(section === 'notifications' || section === 'preferences') && <nav className="a-tabs" aria-label="Notificaciones"><Link className={section === 'notifications' ? 'active' : ''} href="/admin/notifications">Entregas</Link><Link className={section === 'preferences' ? 'active' : ''} href="/admin/preferences">Preferencias</Link></nav>}
 {['models', 'notifications', 'preferences'].includes(section) && <p className="a-notice">Vista de consulta. {section === 'models' ? 'El entrenamiento y la activación no se ejecutan desde este panel.' : 'No se realizan envíos. Pendiente indica que no hay un envío registrado, no necesariamente un fallo.'}</p>}
 <div className="a-count" aria-live="polite">{loading ? 'Consultando registros…' : error ? 'Consulta no disponible' : `${data?.total || 0} registros encontrados`}</div><form className="a-filters" onSubmit={filter} key={`${section}-${query}`}><div className="a-filter-grid"><label className="a-field"><span className="a-field-label"><Search size={15} aria-hidden="true"/>Buscar</span><input name="q" defaultValue={params.get('q') || ''} placeholder={section === 'users' ? 'Nombre o correo electrónico' : 'Buscar en este módulo…'}/></label>{config.filters.map(filter => { const [key, title, ...options] = filter; return <label className="a-field" key={key}>{title}{key==='tema_id'?<TopicFilter selected={selectedTopic} topics={topics} onChange={setSelectedTopic}/>:<select name={key} defaultValue={params.get(key) || ''}><option value="">Todos</option>{options.map(v => <option key={v} value={v}>{label(key, v)}</option>)}</select>}</label>; })}</div>{section !== 'topics' && <details className="a-advanced"><summary>Fechas y orden</summary><div className="a-filter-grid"><label className="a-field">Desde<input type="date" name="startDate" defaultValue={params.get('startDate') || ''}/></label><label className="a-field">Hasta<input type="date" name="endDate" defaultValue={params.get('endDate') || ''}/></label>{['users', 'sources', 'models'].includes(section) && <label className="a-field">Orden<select name="sort" defaultValue={params.get('sort') || ''}><option value="">Orden predeterminado</option><option value="nombre">Nombre A–Z</option></select></label>}</div></details>}<div className="a-actions"><button className="a-button a-primary"><Filter size={15} aria-hidden="true"/>Aplicar filtros</button><button type="button" className="a-button" onClick={() => router.push(pathname)}><RotateCcw size={15} aria-hidden="true"/>Limpiar</button></div></form>
 {message && <p className="a-notice" role="status">{message}</p>}<div className="a-panel">{loading || error || !data?.items.length ? <State loading={loading} error={error} retry={() => setRefresh(n => n + 1)} empty={query ? 'No hay registros que coincidan con estos filtros' : 'Todavía no hay registros en este módulo'}/> : <div className="a-table-wrap"><table className="a-table"><thead><tr>{config.columns.map(c => <th scope="col" key={c}>{c}</th>)}<th scope="col">Acciones</th></tr></thead><tbody>{data.items.map(r => <tr key={r.id}>{cells(r)}<td><div className="a-actions">{editable ? <button className="a-icon" title="Editar" aria-label={`Editar ${r.nombre}`} onClick={() => setEditor(r)}><Pencil size={17}/></button> : <button className="a-icon" title="Ver detalle" aria-label={`Ver detalle ${r.id}`} onClick={() => setDetail(r)}><Eye size={17}/></button>}{section === 'sources' && <button className="a-icon" title="Ver detalle" aria-label={`Detalle de ${r.nombre}`} onClick={() => setDetail(r)}><Eye size={17}/></button>}{section === 'reports' && r.estado === 'pendiente' && <button className="a-icon" title="Resolver reporte" aria-label={`Resolver reporte ${r.id}`} onClick={() => setEditor(r)}><CheckCircle size={17}/></button>}</div></td></tr>)}</tbody></table></div>}</div>
 {!error && data && <footer className="a-pagination"><button className="a-button" disabled={loading || data.page <= 1} onClick={() => page(data.page - 1)}>Anterior</button><span>Página {data.page} de {Math.max(1, data.totalPages)}</span><button className="a-button" disabled={loading || data.page >= data.totalPages} onClick={() => page(data.page + 1)}>Siguiente</button></footer>}
 {editor !== false && <AdminEditor section={section} row={editor || undefined} onClose={() => setEditor(false)} onSaved={() => { setEditor(false); setMessage('Cambios guardados correctamente.'); setRefresh(n => n + 1); }}/>}{detail && <AdminDetail section={section} row={detail} onClose={closeDetail}/>}</>;
}
