'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Pencil,History,ShieldCheck,ArrowRight} from 'lucide-react';
import {confirmAction,toast} from '@/lib/feedback';
import {Dialog,State,Badge,date,Status} from './ui';
import NewsEditor from './NewsEditor';
import {loadEditorialNews,transitionEditorialNews,type EditorialNews,type EditorialAction} from '@/services/editorialService';
export const editorialStateLabels:Record<string,string>={draft:'Borrador',in_review:'En revisión',published:'Publicada',withdrawn:'Retirada'};
export const editorialStateTones:Record<string,string>={draft:'editorial-draft',in_review:'editorial-review',published:'editorial-published',withdrawn:'editorial-withdrawn'};
const actions:Record<EditorialAction,string>={submit:'Enviar a revisión',publish:'Publicar tras revisión',withdraw:'Retirar del sitio',reopen:'Volver a borrador'};
export default function NewsEditorialPanel({id,onClose,onSaved}:{id:number;onClose:()=>void;onSaved:()=>void}){
 const [news,setNews]=useState<EditorialNews|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[editing,setEditing]=useState(false),[reason,setReason]=useState(''),[action,setAction]=useState<EditorialAction|null>(null),[refresh,setRefresh]=useState(0);const pending=useRef(false);
 useEffect(()=>{let live=true;setError('');loadEditorialNews(id).then(n=>{if(live)setNews(n);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[id,refresh]);
 async function submit(e:FormEvent){
  e.preventDefault();if(!news||!action||pending.current)return;
  pending.current=true;setBusy(true);setError('');
  try{
   if(['publish','withdraw'].includes(action)&&!await confirmAction({title:action==='publish'?'Publicar noticia':'Retirar noticia',message:action==='publish'?'La noticia aparecerá públicamente. ¿Confirmas la revisión de esta versión?':'La noticia dejará de estar disponible públicamente. ¿Confirmas el retiro?',confirmLabel:action==='publish'?'Publicar':'Retirar',danger:action==='withdraw'}))return;
   await transitionEditorialNews(id,action,news.editorial_version,reason);
   toast.success(({submit:'Noticia enviada a revisión.',publish:'Noticia publicada.',withdraw:'Noticia retirada.',reopen:'Noticia devuelta a borrador.'})[action]);
   setAction(null);setReason('');setNews({...news,available_actions:[]});onSaved();
   try{setNews(await loadEditorialNews(id));}catch(e){const message='El cambio se guardó, pero no se pudo actualizar el detalle. '+(e as Error).message;setError(message);toast.error(message);}
  }catch(e){setError((e as Error).message);toast.error((e as Error).message);}finally{pending.current=false;setBusy(false);}
 }
 if(editing&&news)return <NewsEditor row={news} onClose={()=>setEditing(false)} onSaved={()=>{setEditing(false);setRefresh(n=>n+1);onSaved();}}/>;
 return <Dialog title="Revisión de noticia" onClose={onClose} busy={busy}>{!news?<State loading={!error} error={error} retry={()=>setRefresh(n=>n+1)}/>:<>
 <div className="a-editorial-intro"><ShieldCheck size={26}/><div><Badge tone={editorialStateTones[news.editorial_state]||'neutral'}>{editorialStateLabels[news.editorial_state]}</Badge><p>Versión editorial {news.editorial_version} · Texto {news.content_version}{news.editorial_origin==='legacy'?' · Contenido heredado':''}</p></div><button className="a-button" disabled={busy} onClick={()=>setEditing(true)}><Pencil size={16}/>Corregir</button></div>
 <h2 className="a-editorial-title">{news.titulo}</h2><p className="a-editorial-content">{news.contenido}</p>
 <dl className="a-detail-grid"><div><dt>Fecha de la fuente</dt><dd>{date(news.fecha_publicacion)}</dd></div><div><dt>Publicación editorial</dt><dd>{date(news.editorial_published_at)}</dd></div></dl>
 {news.url&&/^https?:\/\//.test(news.url)&&<a className="a-button" href={news.url} target="_blank" rel="noreferrer">Consultar fuente original ↗</a>}
 <section className="a-editorial-section"><h3>Análisis automático</h3><p className="a-notice">La revisión editorial autoriza publicar; no certifica la veracidad de las afirmaciones.</p>{!news.classifications.length?<p>Sin análisis automático.</p>:news.classifications.map(c=><article key={c.id} className="a-attention"><div><Status status={c.resultado}/><small>{c.content_version===news.content_version?'Texto actual':'Versión anterior'} · {date(c.fecha_clasificacion)} · {c.modelo||'Modelo no disponible'}</small><p>{c.explicacion}</p></div></article>)}</section>
 {error&&<p role="alert" className="a-error">{error}<button className="a-button" disabled={busy} onClick={()=>setRefresh(n=>n+1)}>Actualizar detalle</button></p>}
 <section className="a-editorial-section"><h3>Siguiente paso</h3>{action?<form onSubmit={submit} className="a-form"><label className="a-field">{action==='publish'?'Resumen de la revisión':'Motivo'}<textarea required maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)} disabled={busy}/></label><div className="a-actions"><button type="button" className="a-button" disabled={busy} onClick={()=>setAction(null)}>Cancelar</button><button className="a-button a-primary" disabled={busy}>{busy?'Guardando…':actions[action]}</button></div></form>:<div className="a-actions">{news.available_actions.map(a=><button key={a} className="a-button a-primary" disabled={busy} onClick={()=>setAction(a)}>{actions[a]}<ArrowRight size={16}/></button>)}</div>}</section>
 <section className="a-editorial-section"><h3><History size={18}/>Historial editorial</h3>{!news.editorial_events.length?<p>Sin revisión editorial registrada.</p>:<ol className="a-editorial-timeline">{news.editorial_events.map(e=><li key={e.id}><strong>{e.action==='create'?'Alta':e.action==='edit'?'Corrección':actions[e.action as EditorialAction]||e.action}</strong><small>{date(e.created_at)} · Versión {e.version} · {e.actor_id?`Administrador #${e.actor_id}`:'Cuenta eliminada'}</small><p>{e.reason}</p></li>)}</ol>}</section></>}</Dialog>;
}
