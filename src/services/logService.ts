import {sessionFetch} from '@/services/session';
import type {LogsQuery,LogsPage,LogEntry,LogSummary,LogTrendData,LogCatalog} from '@/types/logs';
import {encodeQuery} from '@/components/admin/logs/state';
export class LogsError extends Error {constructor(public status:number,message:string){super(message);}}
async function request(path:string,signal?:AbortSignal){
 const token=localStorage.getItem('token');
 const response=await sessionFetch(`${process.env.NEXT_PUBLIC_NEWS_API_URL||'http://localhost:3003/api'}/admin/logs${path}`,{signal,headers:{Authorization:`Bearer ${token||''}`},cache:'no-store'});
 if(localStorage.getItem('token')!==token)throw Object.assign(new Error('La sesión cambió.'),{name:'AbortError'});
 if(!response.ok){const body=await response.json().catch(()=>null);if(localStorage.getItem('token')!==token)throw Object.assign(new Error('La sesión cambió.'),{name:'AbortError'});if([401,403].includes(response.status))window.dispatchEvent(new CustomEvent('admin-access-error',{detail:response.status}));throw new LogsError(response.status,body?.message||'No se pudieron consultar los Logs.');}
 return response;
}
async function data<T>(path:string,signal?:AbortSignal):Promise<T>{
 const token=localStorage.getItem('token'),body=await (await request(path,signal)).json();
 if(localStorage.getItem('token')!==token)throw Object.assign(new Error('La sesión cambió.'),{name:'AbortError'});
 return body.data;
}
export const getLogs=(q:LogsQuery,signal?:AbortSignal)=>data<LogsPage>('?'+encodeQuery(q),signal);
export const getLogSummary=(q:LogsQuery,signal?:AbortSignal)=>data<LogSummary>('/summary?'+encodeQuery(q),signal);
export const getLogTrend=(q:LogsQuery,signal?:AbortSignal)=>data<LogTrendData>('/trend?'+encodeQuery(q),signal);
export const getLogCatalog=(signal?:AbortSignal)=>data<LogCatalog>('/catalog',signal);
export const getLog=(id:string,signal?:AbortSignal)=>data<LogEntry>('/'+encodeURIComponent(id),signal);
export async function downloadLogs(q:LogsQuery){
 const token=localStorage.getItem('token'),response=await request('/export?'+encodeQuery(q)),blob=await response.blob();
 if(localStorage.getItem('token')!==token)throw new LogsError(401,'La sesión cambió. Vuelve a iniciar sesión.');
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`HealthCheck-Logs-${q.startDate}-${q.endDate}.xlsx`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
