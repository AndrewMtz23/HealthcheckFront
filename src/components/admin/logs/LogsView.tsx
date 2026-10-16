'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {ScrollText,RefreshCw,Download,ChartNoAxesCombined,ShieldCheck} from 'lucide-react';
import {toast} from '@/lib/feedback';
import {getLogs,getLogSummary,getLogTrend,getLogCatalog,downloadLogs,LogsError} from '@/services/logService';
import type {LogsQuery,LogsPage,LogSummary,LogTrendData,LogCatalog} from '@/types/logs';
import {decodeQuery,encodeQuery,changeFilters,entities,logDate} from './state';
import {State} from '../ui';
import LogFilters from './LogFilters';
import LogTable from './LogTable';
import LogDetail from './LogDetail';
import LogTrend from './LogTrend';
import './logs.css';
export default function LogsView(){
 const router=useRouter(),params=useSearchParams(),search=params.toString();
 const query=useMemo(()=>decodeQuery(new URLSearchParams(search)),[search]);
 const [draft,setDraft]=useState(query),[bundle,setBundle]=useState<{list:LogsPage;summary:LogSummary;trend:LogTrendData;catalog:LogCatalog}|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0),[showTrend,setShowTrend]=useState(false),[detail,setDetail]=useState<string|null>(null),[exporting,setExporting]=useState(false);
 const generation=useRef(0),exportPending=useRef(false);
 function navigate(next:LogsQuery){router.replace('/admin/logs?'+encodeQuery(next),{scroll:false});}
 useEffect(()=>setDraft(query),[query]);
 useEffect(()=>{
  const controller=new AbortController(),current=++generation.current;setLoading(true);setError('');
  Promise.all([getLogs(query,controller.signal),getLogSummary(query,controller.signal),getLogTrend(query,controller.signal),getLogCatalog(controller.signal)]).then(([list,summary,trend,catalog])=>{
   if(controller.signal.aborted||current!==generation.current)return;
   if(list.page>Math.max(1,list.totalPages)){router.replace('/admin/logs?'+encodeQuery({...query,page:String(Math.max(1,list.totalPages))}),{scroll:false});return;}
   setBundle({list,summary,trend,catalog});
  }).catch(e=>{if(controller.signal.aborted||current!==generation.current||e.name==='AbortError')return;setError(e.message);if(e instanceof LogsError&&[401,403].includes(e.status)){setBundle(null);setDetail(null);}}).finally(()=>{if(!controller.signal.aborted&&current===generation.current)setLoading(false);});
  return()=>controller.abort();
 },[query,revision,router]);
 async function exportFile(){if(exportPending.current)return;exportPending.current=true;setExporting(true);try{await downloadLogs(query);toast.success('Excel generado. La descarga está lista.');}catch(e){toast.error(e instanceof Error?e.message:'No se pudo exportar.');}finally{exportPending.current=false;setExporting(false);}}
 const stats=bundle?.summary;
 return <section className="logs-view"><header className="a-heading"><div><h1><ScrollText/>Logs</h1><p>Quién hizo qué, cuándo y sobre qué registro.</p></div><div className="logs-actions"><button className="a-button" onClick={()=>setShowTrend(v=>!v)} aria-expanded={showTrend}><ChartNoAxesCombined size={16}/>{showTrend?'Ocultar gráfica':'Ver gráfica'}</button><button className="a-button" disabled={loading} onClick={()=>setRevision(v=>v+1)}><RefreshCw size={16} className={loading?'a-spin':''}/>Actualizar</button><button className="a-button primary" disabled={exporting||loading} onClick={()=>void exportFile()}><Download size={16}/>{exporting?'Generando…':'Exportar Excel'}</button></div></header>
 <div className="logs-purpose"><ShieldCheck size={19}/><p>Actividad y auditoría de HealthCheck. Los eventos sensibles se identifican por reglas del sistema.</p><span>SOLO ADMINISTRADORES</span></div>
 <div className="logs-metrics">{[['Registros',stats?.total],['Actividad de hoy',stats?.todayCount],['Entidad más activa',stats?.topEntity?entities[stats.topEntity]||stats.topEntity:'—'],['Eventos sensibles',stats?.sensitiveCount],['Usuarios únicos hoy',stats?.uniqueActorsToday]].map(([label,value])=><article key={label}><span>{label}</span><strong>{value??'—'}</strong></article>)}</div>
 <LogFilters value={draft} onChange={setDraft} onApply={()=>navigate(changeFilters(query,draft))} onReset={()=>navigate(decodeQuery(new URLSearchParams()))} catalog={bundle?.catalog||null} busy={loading}/>
 {error&&<div className="logs-error" role="alert"><div><strong>{error}</strong>{bundle&&<p>Se conservan los resultados anteriores. No corresponden necesariamente a los filtros actuales.</p>}</div><button className="a-button" onClick={()=>setRevision(v=>v+1)}>Reintentar</button></div>}
 {showTrend&&bundle&&<LogTrend data={bundle.trend} catalog={bundle.catalog}/>}
 <section className="a-panel logs-results" aria-busy={loading}><div className="a-panel-heading"><div><h2>Eventos registrados</h2><small>{bundle?`${bundle.list.total.toLocaleString('es-MX')} resultados · Calculado ${logDate(bundle.list.calculatedAt)}`:'Consultando registros…'}</small></div><span className="logs-zone">Ciudad de México</span></div>
 {!bundle?<State loading={loading} error={error} retry={()=>setRevision(v=>v+1)}/>:bundle.list.items.length?<LogTable data={bundle.list} catalog={bundle.catalog} onDetail={setDetail}/>:<State empty="No hay eventos con estos filtros"/>}
 {bundle&&<footer className="logs-pagination"><label>Mostrar <select aria-label="Registros por página" value={query.limit} disabled={loading} onChange={e=>navigate(changeFilters(query,{limit:e.target.value}))}>{[25,50,100].map(n=><option key={n}>{n}</option>)}</select></label><span>Página {bundle.list.page} de {Math.max(1,bundle.list.totalPages)}</span><div><button className="a-button" disabled={loading||Number(query.page)<=1} onClick={()=>navigate({...query,page:String(Number(query.page)-1)})}>Anterior</button><button className="a-button" disabled={loading||Number(query.page)>=bundle.list.totalPages} onClick={()=>navigate({...query,page:String(Number(query.page)+1)})}>Siguiente</button></div></footer>}
 </section><p className="logs-footnote">Todos los indicadores siguen los filtros aplicados. Excel admite hasta 5,000 registros. Los datos no registrados se muestran como tales.</p>
 {detail&&<LogDetail key={detail} id={detail} catalog={bundle?.catalog||null} onClose={()=>setDetail(null)}/>}</section>;
}
