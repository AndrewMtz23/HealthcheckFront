import type {LogsQuery,LogEntry} from '@/types/logs';
const keys=['q','action','entity','service','outcome','sensitivity','userId','startDate','endDate','page','limit'] as const;
export function decodeQuery(params:URLSearchParams,now=new Date()):LogsQuery{
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const result=Object.fromEntries(keys.map(key=>[key,params.get(key)||''])) as LogsQuery;
 result.page=result.page||'1';result.limit=result.limit||'25';result.endDate=result.endDate||today;
 result.startDate=result.startDate||new Date(Date.parse(today+'T00:00:00Z')-13*86400000).toISOString().slice(0,10);
 return result;
}
export const encodeQuery=(query:LogsQuery)=>new URLSearchParams(Object.entries(query).filter(([,v])=>v!=='')).toString();
export const changeFilters=(query:LogsQuery,patch:Partial<LogsQuery>):LogsQuery=>({...query,...patch,page:'1'});
export const actorLabel=(entry:Pick<LogEntry,'actor_type'|'user_name'>)=>entry.actor_type==='system'?'Sistema':entry.actor_type==='anonymous'?'Anónimo':entry.user_name||'Cuenta eliminada';
export const outcomes:Record<string,string>={started:'Iniciado',success:'Completado',failure:'Fallido',denied:'Denegado'};
export const entities:Record<string,string>={auth:'Acceso',user:'Usuarios',source:'Fuentes',topic:'Temas',news:'Noticias',report:'Reportes',analysis:'Análisis',scraping:'Scraping',model:'Modelos',link_monitor:'Monitor de enlaces',announcement:'Avisos',notification:'Notificaciones',delivery:'Entregas',log:'Logs'};
export const logDate=(value:string|null)=>value?new Intl.DateTimeFormat('es-MX',{dateStyle:'medium',timeStyle:'medium',timeZone:'America/Mexico_City'}).format(new Date(value)):'No registrado';
