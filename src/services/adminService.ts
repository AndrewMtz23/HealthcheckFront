import { sessionFetch } from '@/services/session';
import type {Section} from '@/types/admin';
const auth=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
const news=process.env.NEXT_PUBLIC_NEWS_API_URL||'http://localhost:3003/api';
export class AdminApiError extends Error {constructor(public status:number,message:string){super(message);}}
export async function adminRequest<T>(section:Section|'summary',suffix='',options:RequestInit={}):Promise<T>{
 const base=section==='users'?`${auth}/auth/admin/users`:`${news}/admin/${section}`;
 const response=await sessionFetch(base+suffix,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${localStorage.getItem('token')||''}`,...options.headers},cache:'no-store'});
 const body=await response.json().catch(()=>null);
 if(!response.ok){if(response.status===401||response.status===403)window.dispatchEvent(new CustomEvent('admin-access-error',{detail:response.status}));throw new AdminApiError(response.status,body?.message||'No se pudo conectar con el servicio');}
 return body.data;
}
