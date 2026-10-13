import {sessionFetch} from '@/services/session';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
export type AnnouncementKind='informativo'|'advertencia'|'mantenimiento';
export type AnnouncementDraftInput={title:string;body:string;kind:AnnouncementKind;publish_at:string|null;expires_at:string|null;maintenance_start_at:string|null;maintenance_end_at:string|null};
export type Announcement={id:number;title:string;body:string;kind:AnnouncementKind;status:string;publish_at:string|null;expires_at:string|null;published_at:string|null;maintenance_start_at:string|null;maintenance_end_at:string|null;audience_count:number;delivery_counts?:Record<string,number>};
export type AnnouncementPage={items:Announcement[];total:number;page:number;totalPages:number};
async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{const token=typeof window==='undefined'?'':localStorage.getItem('token')||'';const response=await sessionFetch(`${API}/auth/admin/announcements${path}`,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:'no-store'});const payload=await response.json().catch(()=>null);if(!response.ok){if(response.status===401||response.status===403)window.dispatchEvent(new CustomEvent('admin-access-error',{detail:response.status}));throw new Error(payload?.message||'No se pudo completar la operación.');}return payload.data as T;}
export const listAnnouncements=(query='?page=1&limit=20')=>request<AnnouncementPage>(query);
export const createAnnouncementDraft=(input:AnnouncementDraftInput)=>request<Announcement>('','POST',input);
export const updateAnnouncementDraft=(id:number,input:AnnouncementDraftInput)=>request<Announcement>(`/${id}`,'PATCH',input);
export const scheduleAnnouncement=(id:number,publishAt:string)=>request<Announcement>(`/${id}/schedule`,'POST',{publish_at:publishAt});
export const previewAnnouncement=(id:number)=>request<{id:number;eligibleAccounts:number}>(`/${id}/preview`);
export const publishAnnouncement=(id:number)=>request<Announcement>(`/${id}/publish`,'POST',{});
export const withdrawAnnouncement=(id:number)=>request<Announcement>(`/${id}/withdraw`,'POST',{});
