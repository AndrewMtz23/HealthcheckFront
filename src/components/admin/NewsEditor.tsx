'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Save,FilePenLine} from 'lucide-react';
import {Dialog} from './ui';
import {adminRequest} from '@/services/adminService';
import {saveEditorialNews,type EditorialNews} from '@/services/editorialService';
export default function NewsEditor({row,onSaved,onClose}:{row:EditorialNews|null;onSaved:()=>void;onClose:()=>void}){
 const [values,setValues]=useState(()=>({titulo:row?.titulo||'',contenido:row?.contenido||'',url:row?.url||'',fuente_id:row?.fuente_id?String(row.fuente_id):'',tema_id:row?.tema_id?String(row.tema_id):'',fecha_publicacion:row?.fecha_publicacion?.slice(0,10)||'',reason:''}));
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const pending=useRef(false);
 const [sources,setSources]=useState<{id:number;nombre:string}[]>([]),[topics,setTopics]=useState<{id:number;nombre:string}[]>([]),[lookupError,setLookupError]=useState('');
 useEffect(()=>{const control=new AbortController();async function load(section:'sources'|'topics'){const all:{id:number;nombre:string}[]=[];for(let page=1;;page++){const data=await adminRequest<{items:typeof all;totalPages:number}>(section,`?limit=100&page=${page}`,{signal:control.signal});all.push(...data.items);if(page>=data.totalPages)return all;}}
 Promise.all([load('sources'),load('topics')]).then(([s,t])=>{setSources(s);setTopics(t);}).catch(e=>{if(e.name!=='AbortError')setLookupError('No se pudieron cargar fuentes y temas. Cierra y vuelve a abrir el editor.');});return()=>control.abort();},[]);
 const field=(name:keyof typeof values)=>(event:{target:{value:string}})=>setValues(v=>({...v,[name]:event.target.value}));
 async function submit(e:FormEvent){e.preventDefault();if(pending.current)return;pending.current=true;setBusy(true);setError('');
  try{await saveEditorialNews(row?.id||null,{titulo:values.titulo,contenido:values.contenido,url:values.url||null,fuente_id:values.fuente_id?Number(values.fuente_id):null,tema_id:values.tema_id?Number(values.tema_id):null,fecha_publicacion:values.fecha_publicacion||null,...(row?{expected_version:row.editorial_version,reason:values.reason}:{})});onSaved();}
  catch(e){const err=e as Error&{status?:number};setError(err.message+(err.status===409?' Tus cambios permanecen aquí. Conserva el texto y vuelve a abrir la noticia para consultar la versión actual.':''));}
  finally{pending.current=false;setBusy(false);}}
 return <Dialog title={row?'Editar noticia':'Nueva noticia'} onClose={onClose} busy={busy}><form onSubmit={submit}><div className="a-editorial-intro"><FilePenLine size={24}/><div><strong>{row?`Versión ${row.editorial_version}`:'Entrada editorial'}</strong><p>Guardar no publica. Los cambios sustanciales requieren una nueva revisión.</p></div></div>
 {error&&<p role="alert" className="a-error">{error}</p>}{lookupError&&<p role="alert" className="a-error">{lookupError}</p>}
 <fieldset disabled={busy} className="a-form"><label className="a-field">Título<input name="titulo" value={values.titulo} onChange={field('titulo')} required maxLength={500}/></label>
 <label className="a-field">Contenido<textarea className="a-editorial-body" name="contenido" value={values.contenido} onChange={field('contenido')} required maxLength={100000} rows={12}/><small>Texto plano. El análisis automático se conserva por separado.</small></label>
 <label className="a-field">URL de origen (opcional)<input name="url" type="url" value={values.url} onChange={field('url')} maxLength={2048}/><small>Se registra el enlace; no se descarga su contenido.</small></label>
 <div className="a-filter-grid"><label className="a-field">Fuente<select name="fuente_id" value={values.fuente_id} onChange={field('fuente_id')}><option value="">Sin fuente asociada</option>{sources.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label><label className="a-field">Tema<select name="tema_id" value={values.tema_id} onChange={field('tema_id')}><option value="">Sin tema</option>{topics.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}</select></label><label className="a-field">Fecha de la fuente<input name="fecha_publicacion" type="date" value={values.fecha_publicacion} onChange={field('fecha_publicacion')}/></label></div>
 {row&&<label className="a-field">Motivo de la corrección<textarea name="reason" value={values.reason} onChange={field('reason')} required maxLength={2000}/></label>}</fieldset>
 <div className="a-form-footer"><button type="button" className="a-button" onClick={onClose} disabled={busy}>Cancelar</button><button className="a-button a-primary" disabled={busy||!!lookupError}><Save size={16}/>{busy?'Guardando…':row?'Guardar corrección':'Crear borrador'}</button></div></form></Dialog>;
}
