'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X, Inbox, AlertCircle, LoaderCircle } from 'lucide-react';
export const labels: Record<string, string> = { admin: 'Administrador', usuario: 'Usuario', true: 'Activa', false: 'Inactiva', verdadera: 'Verdadera', falsa: 'Falsa', dudosa: 'Dudosa', sin_clasificar: 'Sin clasificar', pendiente: 'Pendiente', revisado: 'Revisado', desestimado: 'Desestimado', consulta: 'Consulta', compartir: 'Compartir', marcar_confiable: 'Marcada confiable', marcar_dudosa: 'Marcada dudosa' };
export const value = (v: unknown) => v === null || v === undefined || v === '' ? '—' : String(v);
export function date(v: unknown) { if (!v)
    return 'Sin fecha'; const d = new Date(String(v)); return Number.isNaN(d.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City' }).format(d); }
export function Badge({ children, tone = 'neutral' }: {
    children: ReactNode;
    tone?: string;
}) { return <span className={`a-badge a-badge-${tone}`}>{children}</span>; }
export function Status({ status }: {
    status: unknown;
}) { const key = String(status); return <Badge tone={['true', 'verdadera', 'revisado'].includes(key) ? 'green' : key === 'falsa' ? 'red' : ['pendiente', 'dudosa'].includes(key) ? 'amber' : key === 'admin' ? 'blue' : 'neutral'}>{labels[key] || key}</Badge>; }
export function State({ loading, error, retry, empty }: {
    loading?: boolean;
    error?: string;
    retry?: () => void;
    empty?: string;
}) { return <div className="a-state" role={error ? 'alert' : 'status'}>{loading ? <LoaderCircle className="a-spin" size={28}/> : error ? <AlertCircle size={28}/> : <Inbox size={28}/>}<strong>{loading ? 'Cargando información…' : error ? 'No se pudo cargar la información' : empty || 'Todavía no hay registros'}</strong>{error && <><p>{error}</p><button className="a-button" onClick={retry}>Volver a intentar</button></>}</div>; }
export function Dialog({ title, children, onClose, busy = false }: {
    title: string;
    children: ReactNode;
    onClose: () => void;
    busy?: boolean;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const previous = useRef<HTMLElement | null>(null);
    useEffect(() => { previous.current = document.activeElement as HTMLElement; ref.current?.showModal(); return () => { previous.current?.focus(); }; }, []);
    return <dialog ref={ref} className="a-dialog" aria-labelledby="admin-dialog-title" onCancel={e => { e.preventDefault(); if (!busy)
        onClose(); }}><div className="a-dialog-heading"><h2 id="admin-dialog-title">{title}</h2><button className="a-icon" aria-label="Cerrar diálogo" disabled={busy} onClick={onClose}><X size={20}/></button></div>{children}</dialog>;
}
