import {sessionFetch} from '@/services/session';
export interface EditorialPreview {titulo:string;contenido:string;url:string;fecha_publicacion:string|null}
export function matchEditorialSource(url:string,sources:{id:number;url?:string|null}[]):string{
 try{const host=(value:string)=>new URL(value).hostname.toLowerCase().replace(/^www\./,'');const target=host(url);
  return String(sources.find(source=>{try{return !!source.url&&host(source.url)===target;}catch{return false;}})?.id||'');
 }catch{return '';}
}
export async function extractEditorialPreview(url:string,signal?:AbortSignal):Promise<EditorialPreview>{
 const token=localStorage.getItem('token');
 const response=await sessionFetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api'}/ml/classify/extract`,{method:'POST',signal,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token||''}`},body:JSON.stringify({url})});
 const body=await response.json().catch(()=>null);
 if(localStorage.getItem('token')!==token)throw new Error('La sesión cambió. Vuelve a iniciar sesión.');
 if(!response.ok)throw new Error(body?.message||body?.error||'No se pudo extraer la noticia. Reintenta o completa los campos manualmente.');
 if(!body?.data||typeof body.data.titulo!=='string'||typeof body.data.contenido!=='string')throw new Error('La respuesta del extractor está incompleta.');
 return body.data;
}
