'use client';
import { useState, type FormEvent } from 'react';
import type { Row, Section } from '@/types/admin';
import { adminRequest } from '@/services/adminService';
import { Dialog } from './ui';
import { UserRound, Mail, Phone, LockKeyhole, ShieldCheck, ImagePlus, Link2, Eye, Trash2, Save, X, LoaderCircle } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/services/authService';
export default function AdminEditor({ section, row, onClose, onSaved }: {
    section: Section;
    row?: Row;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const { user, updateUser } = useAuth();
    const [imageUrl, setImageUrl] = useState(String(row?.imagen_url || ''));
    const [preview, setPreview] = useState(String(row?.imagen_url || ''));
    const [previewKey, setPreviewKey] = useState(0);
    const [imageError, setImageError] = useState('');
    function previewImage() {
        try {
            const url = new URL(imageUrl);
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || imageUrl.length > 2048) throw new Error();
            setImageError(''); setPreview(url.href); setPreviewKey(n => n + 1);
        } catch { setImageError('Escribe una URL http o https válida, sin credenciales.'); }
    }
    const report = section === 'reports';
    const names: Partial<Record<Section, string>> = { users: 'usuario', sources: 'fuente', topics: 'tema', reports: 'reporte' };
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy)
            return;
        const form = new FormData(event.currentTarget);
        const data: Record<string, unknown> = {};
        for (const [key, val] of form.entries())
            data[key] = val;
        if (section === 'users') {
            data.activo = form.has('activo');
            if (!data.contrasena)
                delete data.contrasena;
        }
        if (section === 'topics')
            data.activo = form.has('activo');
        if (section === 'sources') {
            data.verificada = form.has('verificada');
            data.confiabilidad = Number(form.get('confiabilidad'));
        }
        if (row && section === 'users' && (data.rol !== row.rol || data.activo !== row.activo) && !window.confirm('¿Confirmas el cambio de rol o acceso de esta cuenta?'))
            return;
        if (report && data.estado === 'revisado' && !window.confirm('Marcar como revisado reducirá 0.1 la confiabilidad de la fuente una sola vez. ¿Continuar?'))
            return;
        setBusy(true);
        setError('');
        try {
            const saved = await adminRequest<User>(section, row ? `/${row.id}` : '', { method: row ? 'PATCH' : 'POST', body: JSON.stringify(data) });
            if (section === 'users' && user && saved.id === user.id) updateUser({ ...user, ...saved });
            onSaved();
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    const field = (key: string, label: string, type = 'text', required = false) => <label className="a-field" key={key}><span className="a-field-label">{section === 'users' && (key === 'email' ? <Mail size={15} aria-hidden="true"/> : key === 'telefono' ? <Phone size={15} aria-hidden="true"/> : key === 'contrasena' ? <LockKeyhole size={15} aria-hidden="true"/> : <UserRound size={15} aria-hidden="true"/>)}{label}</span><input name={key} type={type} required={required} defaultValue={String(row?.[key] ?? '')} maxLength={key === 'telefono' ? 40 : 255} autoComplete={key === 'contrasena' ? 'new-password' : 'off'} minLength={key === 'contrasena' ? 8 : undefined}/></label>;
    return <Dialog title={`${report ? 'Resolver' : row ? 'Editar' : 'Agregar'} ${names[section]}`} onClose={onClose} busy={busy}><form onSubmit={submit}><fieldset className="a-form" disabled={busy}>{error && <p role="alert" className="a-error">{error}</p>}{report ? <><p className="a-notice">Los reportes resueltos no se pueden reabrir desde este panel. Revisar reduce la confiabilidad de la fuente; desestimar no la modifica.</p><label className="a-field">Resolución<select name="estado" defaultValue="desestimado"><option value="desestimado">Desestimar</option><option value="revisado">Marcar revisado</option></select></label></> : <>{section === 'users' && <section className="a-user-photo" aria-label="Imagen del usuario">
        <div className="a-user-photo-heading"><UserAvatar key={previewKey} name={String(row?.nombre || 'Nuevo usuario')} url={preview} className="a-avatar a-avatar-preview" onImageError={() => setImageError('No se pudo cargar la imagen. Comprueba que la URL sea pública.')}/><div><strong><ImagePlus size={18} aria-hidden="true"/>Foto de perfil</strong><p>Una imagen para identificar esta cuenta.</p></div></div>
        <label className="a-field"><span className="a-field-label"><Link2 size={15} aria-hidden="true"/>URL de la imagen</span><input name="imagen_url" type="url" value={imageUrl} onChange={event => {setImageUrl(event.target.value); setImageError('');}} maxLength={2048} placeholder="https://ejemplo.com/foto.jpg" aria-describedby="admin-image-help"/></label>
        <p id="admin-image-help" className="a-photo-help">Opcional. Usa un enlace público http o https; no se suben archivos.</p>
        <div className="a-actions"><button type="button" className="a-button" disabled={!imageUrl.trim()} onClick={previewImage}><Eye size={15} aria-hidden="true"/>Vista previa</button><button type="button" className="a-button" disabled={!imageUrl && !preview} onClick={() => {setImageUrl(''); setPreview(''); setImageError('');}}><Trash2 size={15} aria-hidden="true"/>Quitar foto</button></div>
        {imageError && <p className="a-photo-error" role="status">{imageError}</p>}
    </section>}{field('nombre', 'Nombre', 'text', true)}{section === 'users' ? <>{field('email', 'Correo electrónico', 'email', true)}{field('telefono', 'Teléfono')}{!row && field('contrasena', 'Contraseña (mínimo 8 caracteres)', 'password', true)}<label className="a-field"><span className="a-field-label"><ShieldCheck size={15} aria-hidden="true"/>Rol</span><select name="rol" defaultValue={String(row?.rol || 'usuario')}><option value="usuario">Usuario</option><option value="admin">Administrador</option></select></label></> : <><label className="a-field">Descripción<textarea name="descripcion" defaultValue={String(row?.descripcion || '')} maxLength={20000}/></label>{section === 'sources' ? <>{field('url', 'URL del sitio', 'url')}<label className="a-field">Confiabilidad (0 a 1)<input type="number" name="confiabilidad" min="0" max="1" step="0.01" required defaultValue={String(row?.confiabilidad ?? 0.5)}/></label></> : <label className="a-field">Palabras clave<textarea name="palabras_clave" defaultValue={String(row?.palabras_clave || '')} maxLength={20000}/></label>}</>}<label className="a-check"><input type="checkbox" name={section === 'sources' ? 'verificada' : 'activo'} defaultChecked={row ? Boolean(row[section === 'sources' ? 'verificada' : 'activo']) : section !== 'sources'}/>{section === 'sources' ? 'Fuente verificada' : section === 'users' ? 'Cuenta activa' : 'Tema activo'}</label></>}</fieldset><div className="a-form-footer"><button type="button" className="a-button" disabled={busy} onClick={onClose}><X size={16} aria-hidden="true"/>Cancelar</button><button className="a-button a-primary" disabled={busy}>{busy ? <LoaderCircle size={16} className="a-spin" aria-hidden="true"/> : <Save size={16} aria-hidden="true"/>}{busy ? 'Guardando…' : 'Guardar cambios'}</button></div></form></Dialog>;
}
