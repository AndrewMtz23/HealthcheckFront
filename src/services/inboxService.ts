import {sessionFetch} from '@/services/session';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
export type InboxItem={source:'system'|'news';id:number;title:string;body:string;kind:string;created_at:string;read_at:string|null;delivery_state:string|null;expires_at?:string|null};
export type InboxPage={items:InboxItem[];total:number;page:number;totalPages:number;unread_count:number};
async function request<T>(path:string,init:RequestInit={}):Promise<T>{const token=typeof window==='undefined'?'':localStorage.getItem('token')||'';const response=await sessionFetch(`${API}/auth${path}`,{...init,headers:{Authorization:`Bearer ${token}`,...init.headers},cache:'no-store'});const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||'No se pudo cargar el centro de avisos.');return data.data as T;}
export const getInbox=({limit=5,page=1}:{limit?:number;page?:number}={})=>request<InboxPage>(`/inbox?limit=${limit}&page=${page}`);
export const markSystemAnnouncementRead=(id:number)=>request<void>(`/system-announcements/${id}/read`,{method:'POST'});
export const getActiveMaintenance=()=>request<Pick<InboxItem,'id'|'title'|'body'|'kind'|'created_at'>[]>('/system-announcements/active');
