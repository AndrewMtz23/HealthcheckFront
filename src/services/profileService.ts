const API_URL=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
export interface Preferences {id:number|null;recibir_notificaciones:boolean;frecuencia_notificaciones:'diaria'|'semanal'|'inmediata';tipo_notificacion:'email'|'sms'}
export interface Topic {id:number;nombre:string;descripcion:string|null}
export interface SelectedTopic {id:number;tema_id:number;tema_nombre:string;activo:boolean}
export interface PreferencesData {preferences:Preferences;topics:SelectedTopic[];delivery_enabled:boolean}
export interface Notification {id:number;titulo:string;mensaje:string;tipo:'email'|'sms';enviada:boolean;fecha_creacion:string;fecha_envio:string|null;noticia_id:number|null;noticia_titulo:string|null}
export interface NotificationsData {items:Notification[];total:number;page:number;totalPages:number;delivery_enabled:boolean}
export async function profileRequest<T>(path:string,options:RequestInit={}):Promise<T>{
 const token=localStorage.getItem('token');if(!token)throw new Error('Tu sesión terminó. Vuelve a iniciar sesión.');
 let response:Response;try{response=await fetch(`${API_URL}/auth/profile${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...options.headers},cache:'no-store'});}catch(error){if((error as Error).name==='AbortError')throw error;throw new Error('No pudimos conectar. Revisa tu conexión e intenta de nuevo.');}
 const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(body?.message||'No se pudo guardar el cambio. Intenta nuevamente.');return body.data;
}
