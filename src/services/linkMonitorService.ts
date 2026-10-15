import {sessionFetch} from '@/services/session';
import type {MonitorRun,ResultsPage,StartResult} from '@/types/linkMonitor';
export class LinkMonitorError extends Error{constructor(public status:number,message:string){super(message);}}
async function request<T>(path:string,options:RequestInit={}):Promise<T>{
 const base=process.env.NEXT_PUBLIC_NEWS_API_URL||'http://localhost:3003/api';
 const token=localStorage.getItem('token');
 const response=await sessionFetch(`${base}/admin/link-monitor${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token||''}`},cache:'no-store'});
 const body=await response.json().catch(()=>null);
 if(localStorage.getItem('token')!==token)throw Object.assign(new Error('La sesión cambió durante la consulta.'),{name:'AbortError'});
 if(!response.ok){if((response.status===401||response.status===403)&&localStorage.getItem('token')===token)window.dispatchEvent(new CustomEvent('admin-access-error',{detail:response.status}));throw new LinkMonitorError(response.status,body?.message||'No se pudo consultar el monitor.');}
 return body.data;
}
export const startLinkMonitor=()=>request<StartResult>('/runs',{method:'POST',body:'{}'});
export const getLinkMonitorRun=(signal?:AbortSignal)=>request<MonitorRun|null>('/runs/current',{signal});
export const listLinkMonitorResults=(query:{page:number;status:string},signal?:AbortSignal)=>request<ResultsPage>('/results?'+new URLSearchParams({page:String(query.page),limit:'25',status:query.status}),{signal});
