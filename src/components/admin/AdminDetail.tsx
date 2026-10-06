'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { relatedNewsHref } from './navigation';
import type { Row, Section } from '@/types/admin';
import { adminRequest } from '@/services/adminService';
import { Dialog, State, Status, date, value } from './ui';
const names: Record<string, string> = { titulo: 'Título', nombre: 'Nombre', fuente: 'Fuente', tema: 'Tema', resultado: 'Resultado', confianza: 'Confianza', motivo: 'Motivo', estado: 'Estado', usuario_id: 'ID de usuario', noticia_id: 'ID de noticia', fecha_reporte: 'Fecha del reporte', fecha_revision: 'Revisión', fecha_publicacion: 'Publicación', fecha_creacion: 'Creación', fecha_envio: 'Envío', fecha_entrenamiento: 'Entrenamiento', tipo: 'Tipo', enviada: 'Enviada', version: 'Versión', precision: 'Precisión', recall: 'Recall', f1_score: 'F1', activo: 'Activo', modelo_base: 'Modelo base', recibir_notificaciones: 'Recibe notificaciones', frecuencia_notificaciones: 'Frecuencia', tipo_notificacion: 'Canal', temas: 'Temas', fecha: 'Fecha', confiabilidad: 'Confiabilidad', reportes: 'Reportes asociados', verificada: 'Verificada', palabras_clave: 'Palabras clave' };
export default function AdminDetail({ section, row, onClose }: {
    section: Section;
    row: Row;
    onClose: () => void;
}) {
    const [data, setData] = useState<Row>(row);
    const [loading, setLoading] = useState(section === 'news');
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => { if (section !== 'news')
        return; const controller = new AbortController(); setLoading(true); adminRequest<Row>('news', `/${row.id}`, { signal: controller.signal }).then(setData).catch(e => { if (e.name !== 'AbortError')
        setError(e.message); }).finally(() => { if (!controller.signal.aborted)
        setLoading(false); }); return () => controller.abort(); }, [section, row.id, attempt]);
    const related=relatedNewsHref({noticia_id:data.noticia_id});
    const url = String(data.url || '');
    const safeUrl = /^https?:\/\//i.test(url) && !url.startsWith('https://example.invalid/');
    return <Dialog title={section === 'news' ? 'Detalle de noticia' : 'Detalle del registro'} onClose={onClose}>{loading || error ? <State loading={loading} error={error} retry={() => { setError(''); setAttempt(n => n + 1); }}/> : <><dl className="a-detail-grid">{Object.entries(data).filter(([key]) => names[key]).map(([key, v]) => <div key={key}><dt>{names[key]}</dt><dd>{key.startsWith('fecha') ? date(v) : typeof v === 'boolean' ? v ? 'Sí' : 'No' : value(v)}</dd></div>)}</dl>{['contenido', 'descripcion', 'mensaje'].map(key => data[key] ? <p className="a-detail-text" key={key}>{String(data[key])}</p> : null)}{related&&<Link className="a-button" href={related} onClick={onClose}>Abrir noticia relacionada ↗</Link>}{safeUrl && <a className="a-button" href={url} target="_blank" rel="noreferrer">Abrir fuente original ↗</a>}{Array.isArray(data.keywords) && data.keywords.length > 0 && <p className="a-detail-text">Palabras clave: {(data.keywords as {
        palabra: string;
    }[]).map(k => k.palabra).join(', ')}</p>}{Array.isArray(data.classifications) && <><h3 style={{ marginTop: 24, fontWeight: 600 }}>Historial de clasificaciones</h3>{!data.classifications.length ? <p className="a-notice">Esta noticia todavía no tiene una clasificación.</p> : (data.classifications as Row[]).map(c => <div className="a-attention" key={c.id}><div><Status status={c.resultado}/><p>{date(c.fecha_clasificacion)} · Modelo: {value(c.modelo)} · Confianza: {value(c.confianza)}</p><p className="a-detail-text">{value(c.explicacion)}</p></div></div>)}</>}</>}</Dialog>;
}
