'use client';
import {useEffect,useState} from 'react';
import {Dialog,State} from '../ui';
import {getLog} from '@/services/logService';
import {toast} from '@/lib/feedback';
import type {LogEntry,LogCatalog} from '@/types/logs';
import {actorLabel,logDate,outcomes,entities} from './state';
export default function LogDetail({id,catalog,onClose}:{id:string;catalog:LogCatalog|null;onClose:()=>void}){
 const [log,setLog]=useState<LogEntry|null>(null),[error,setError]=useState(''),[revision,setRevision]=useState(0),[copying,setCopying]=useState(false);
 useEffect(()=>{const controller=new AbortController();setError('');getLog(id,controller.signal).then(value=>{if(!controller.signal.aborted)setLog(value);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});return()=>controller.abort();},[id,revision]);
 async function copy(){if(!log||copying)return;setCopying(true);try{await navigator.clipboard.writeText(JSON.stringify(log,null,2));toast.success('Detalle copiado.');}catch{toast.error('No se pudo copiar el detalle.');}finally{setCopying(false);}}
 return <Dialog title={`Log #${id}`} onClose={onClose}>{error||!log?<State loading={!error} error={error} retry={()=>setRevision(v=>v+1)}/>:<><p className="logs-detail-title">{catalog?.actions[log.action]?.label||log.action}</p><dl className="a-detail-grid">{Object.entries({'Usuario':actorLabel(log),'Correo':log.user_email,'Rol al actuar':log.actor_role,'Fecha del evento':logDate(log.occurred_at),'Fecha de registro':logDate(log.recorded_at),'Resultado':outcomes[log.outcome],'Entidad':entities[log.entity]||log.entity,'Registro afectado':log.entity_id,'Servicio':log.service,'IP':log.ip_address,'Navegador / dispositivo':log.user_agent,'Origen':log.origin==='imported'?'Histórico importado':'En vivo','Correlación':log.request_id,'Referencia':log.source_reference}).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'No registrado'}</dd></div>)}</dl><p className="a-detail-text">{log.description}</p>{!log.occurred_at&&<p className="a-notice">La fecha original no pudo confirmarse. El listado usa la fecha de importación.</p>}<h3>Información adicional</h3><pre className="logs-metadata">{JSON.stringify(log.metadata||{},null,2)}</pre><button className="a-button primary" disabled={copying} onClick={()=>void copy()}>{copying?'Copiando…':'Copiar detalle'}</button></>}</Dialog>;
}
