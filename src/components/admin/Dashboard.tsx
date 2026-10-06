'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Newspaper, ScanSearch, Flag, RefreshCw, Boxes, Bell, CheckCircle } from 'lucide-react';
import { adminRequest } from '@/services/adminService';
import type { Summary, Row } from '@/types/admin';
import { State, Status, date, value, labels } from './ui';
import AdminDetail from './AdminDetail';
import {useRouter,useSearchParams} from 'next/navigation';
import {readPeriod,periodQuery} from './navigation';
export default function Dashboard() {
    const [data, setData] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params=useSearchParams();const router=useRouter();
    const {days,start,end}=readPeriod(new URLSearchParams(params.toString()));
    const updatePeriod=(updates:Partial<{days:string;start:string;end:string}>)=>router.push(`/admin/dashboard?${periodQuery(params.toString(),{days,start,end,...updates})}`,{scroll:false});
    const setDays=(days:string)=>updatePeriod({days});
    const setStart=(start:string)=>updatePeriod({start});
    const setEnd=(end:string)=>updatePeriod({end});
    const [refresh, setRefresh] = useState(0);
    const [detail, setDetail] = useState<Row | null>(null);
    useEffect(() => { const controller = new AbortController(); if (days === 'custom' && (!start || !end))
        return; setLoading(true); setError(''); const query = days === 'custom' ? new URLSearchParams({ startDate: start, endDate: end }) : new URLSearchParams({ days }); adminRequest<Summary>('summary', `?${query}`, { signal: controller.signal }).then(setData).catch(e => { if (e.name !== 'AbortError')
        setError(e.message); }).finally(() => { if (!controller.signal.aborted)
        setLoading(false); }); return () => controller.abort(); }, [days, start, end, refresh]);
    const stats = data ? [{ label: 'Usuarios activos', count: data.totals.users, icon: Users, link: 'users?activo=true' }, { label: 'Noticias registradas', count: data.totals.news, icon: Newspaper, link: 'news' }, { label: 'Sin clasificación', count: data.totals.unclassified, icon: ScanSearch, link: 'news?resultado=sin_clasificar' }, { label: 'Reportes pendientes', count: data.totals.reports, icon: Flag, link: 'reports?estado=pendiente' }] : [];
    const daily: {
        fecha: string;
        total: number;
    }[] = [];
    if (data) {
        const from = new Date(data.range.start + 'T12:00:00Z'), to = new Date(data.range.end + 'T12:00:00Z');
        for (let d = from; d <= to && daily.length < 3660; d = new Date(d.getTime() + 86400000)) {
            const fecha = d.toISOString().slice(0, 10);
            daily.push({ fecha, total: data.trend.find(v => v.fecha === fecha)?.total || 0 });
        }
    }
    const maximum = Math.max(1, ...daily.map(d => d.total));
    const points = daily.map((d, i) => `${20 + i / Math.max(1, daily.length - 1) * 560},${160 - d.total / maximum * 130}`).join(' ');
    return <><header className="a-heading"><div><div className="a-eyebrow">HEALTHCHECK / ADMINISTRACIÓN</div><h1><LayoutDashboard />Vista general</h1><p>Una mirada al contenido, la comunidad y lo que requiere atención.</p></div><button className="a-button" disabled={loading} onClick={() => setRefresh(n => n + 1)}><RefreshCw size={15}/>Actualizar</button></header>
 <div className="a-heading"><span className="a-count">Los indicadores muestran el estado actual del sistema.</span><div className="a-period"><label className="a-field">Periodo de tendencias<select value={days} onChange={e => setDays(e.target.value)}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="custom">Personalizado</option></select></label>{days === 'custom' && <><label className="a-field">Desde<input type="date" value={start} onChange={e => setStart(e.target.value)}/></label><label className="a-field">Hasta<input type="date" value={end} onChange={e => setEnd(e.target.value)}/></label></>}</div></div>
 {days === 'custom' && (!start || !end) && <p className="a-notice">Selecciona ambas fechas para consultar el periodo.</p>}
 {days === 'custom' && (!start || !end) ? <State empty="Selecciona el inicio y el final del periodo"/> : loading || error || !data ? <State loading={loading} error={error} retry={() => setRefresh(n => n + 1)}/> : <><section className="a-stats" aria-label="Indicadores actuales">{stats.map(s => <Link className="a-stat" key={s.label} href={`/admin/${s.link}`}><s.icon size={23}/><small>ACTUAL ↗</small><strong>{s.count.toLocaleString('es-MX')}</strong><span>{s.label}</span></Link>)}</section>
 <div className="a-grid"><section className="a-panel"><div className="a-panel-heading"><div><h2>Publicación de noticias</h2><small>{data.range.start} — {data.range.end} · Fecha de publicación</small></div><Link href={`/admin/news?startDate=${data.range.start}&endDate=${data.range.end}`}>Ver noticias ↗</Link></div><div className="a-panel-body">{!data.trend.length ? <State empty="Sin publicaciones en este periodo"/> : <><svg viewBox="0 0 600 190" className="a-chart" role="img" aria-label={`${daily.reduce((a, d) => a + d.total, 0)} noticias publicadas en el periodo`}><title>Noticias por día</title>{[0, .5, 1].map(v => <g key={v}><line x1="20" x2="580" y1={160 - v * 130} y2={160 - v * 130} stroke="currentColor" opacity=".1"/><text x="0" y={164 - v * 130} fill="currentColor" fontSize="10">{Math.round(maximum * v)}</text></g>)}<polygon points={`20,160 ${points} 580,160`} fill="currentColor" opacity=".08"/><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>{daily.filter(d => d.total > 0).map(d => <circle key={d.fecha} cx={20 + daily.indexOf(d) / Math.max(1, daily.length - 1) * 560} cy={160 - d.total / maximum * 130} r="4" fill="currentColor"><title>{d.fecha}: {d.total}</title></circle>)}<text x="20" y="185" fill="currentColor" fontSize="10">{data.range.start}</text><text x="580" y="185" fill="currentColor" fontSize="10" textAnchor="end">{data.range.end}</text></svg><details className="a-advanced"><summary>Ver datos de la gráfica</summary><table className="a-table"><thead><tr><th>Fecha</th><th>Noticias</th></tr></thead><tbody>{data.trend.map(d => <tr key={d.fecha}><td>{d.fecha}</td><td>{d.total}</td></tr>)}</tbody></table></details></>}</div></section>
 <section className="a-panel"><div className="a-panel-heading"><div><h2>Clasificación del contenido</h2><small>Último resultado por noticia · Estado actual</small></div></div><div className="a-panel-body a-distribution">{['verdadera', 'falsa', 'dudosa', 'sin_clasificar'].map(key => { const count = data.distribution.find(d => d.resultado === key)?.total || 0; return <div key={key}><div><Link href={`/admin/news?resultado=${key}`}>{labels[key]}</Link><strong>{count}</strong></div><div className="a-track"><span style={{ width: `${count / Math.max(1, data.totals.news) * 100}%`, background: key === 'verdadera' ? 'var(--success)' : key === 'falsa' ? 'var(--danger)' : key === 'dudosa' ? 'var(--warning)' : 'var(--muted)' }}/></div></div>; })}</div></section></div>
 <div className="a-grid"><section className="a-panel"><div className="a-panel-heading"><h2>Noticias recientes</h2><Link href="/admin/news">Ver todas ↗</Link></div>{!data.recent.length ? <State empty="Todavía no hay noticias"/> : data.recent.map(r => <button key={r.id} className="a-recent" style={{ width: '100%', textAlign: 'left' }} onClick={() => setDetail(r)}><div><strong className="a-truncate">{value(r.titulo)}</strong><small>{value(r.fuente)} · {date(r.fecha_publicacion)}{String(r.url || '').startsWith('https://example.invalid/') ? ' · Demostración' : ''}</small></div><Status status={r.resultado}/></button>)}</section><section className="a-panel"><div className="a-panel-heading"><h2>Requiere atención</h2></div><div className="a-panel-body">{data.totals.reports > 0 && <Link className="a-attention" href="/admin/reports?estado=pendiente"><Flag size={20}/><div><strong>{data.totals.reports} reportes por revisar</strong><p>Consulta los motivos y registra una resolución.</p></div></Link>}{!data.totals.models && <Link className="a-attention" href="/admin/models"><Boxes size={20}/><div><strong>No hay un modelo activo registrado</strong><p>Consulta el inventario de modelos disponible.</p></div></Link>}{data.totals.notifications > 0 && <Link className="a-attention" href="/admin/notifications?enviada=false"><Bell size={20}/><div><strong>{data.totals.notifications} notificaciones pendientes</strong><p>No tienen un envío registrado.</p></div></Link>}{!data.totals.reports && data.totals.models > 0 && !data.totals.notifications && <div className="a-attention"><CheckCircle size={20}/><div><strong>Sin pendientes en estos indicadores</strong></div></div>}</div></section></div>
 <section className="a-panel"><div className="a-panel-heading"><div><h2>Actividad reciente</h2><small>Consultas e interacciones del periodo</small></div><Link href={`/admin/activity?startDate=${data.range.start}&endDate=${data.range.end}`}>Ver actividad ↗</Link></div>{!data.activity.length ? <State empty="No hay actividad registrada en este periodo"/> : data.activity.map(r => <div className="a-recent" key={r.id}><div><Status status={r.tipo}/><small>{value(r.titulo)}</small></div><span>{date(r.fecha)}</span></div>)}</section></>}{detail && <AdminDetail section="news" row={detail} onClose={() => setDetail(null)}/>}</>;
}
