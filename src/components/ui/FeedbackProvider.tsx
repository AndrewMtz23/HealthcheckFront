'use client';
import {useEffect,useRef,useState,useSyncExternalStore,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {CheckCircle2,AlertCircle,Info,X,TriangleAlert} from 'lucide-react';
import {feedbackStore,emptyFeedback,type FeedbackDialog,type ToastItem} from '@/lib/feedback';
import './feedback.css';

function ToastCard({item}:{item:ToastItem}){
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[closing,setClosing]=useState(false);
 useEffect(()=>{
  if(hovered||focused||closing)return;
  const timer=setTimeout(()=>setClosing(true),item.kind==='error'?9000:5500);
  return ()=>clearTimeout(timer);
 },[item.id,item.kind,hovered,focused,closing]);
 useEffect(()=>{if(!closing)return;const timer=setTimeout(()=>feedbackStore.dismiss(item.id),200);return()=>clearTimeout(timer);},[closing,item.id]);
 const Icon=item.kind==='success'?CheckCircle2:item.kind==='error'?AlertCircle:Info;
 return <div className={`hc-toast hc-toast-${item.kind}${closing?' hc-toast-closing':''}`} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocus={()=>setFocused(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}>
  <Icon size={22} aria-hidden="true"/>
  <div role={item.kind==='error'?'alert':'status'} aria-atomic="true"><strong>{item.kind==='success'?'Listo':item.kind==='error'?'No se pudo completar':'Información'}</strong><p>{item.message}</p></div>
  <button type="button" aria-label="Cerrar mensaje" onClick={()=>setClosing(true)}><X size={17}/></button>
 </div>;
}

function Confirmation({dialog}:{dialog:FeedbackDialog}){
 const ref=useRef<HTMLDialogElement>(null),cancelRef=useRef<HTMLButtonElement>(null);
 const [value,setValue]=useState(dialog.initialValue||'');
 const finish=(result:boolean|string|null)=>{ref.current?.close();feedbackStore.resolve(dialog.id,result);};
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  const element=ref.current; element?.showModal();cancelRef.current?.focus();
  const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return ()=>{element?.close();document.body.style.overflow=previousOverflow;if(previous?.isConnected)previous.focus();};
 },[]);
 return <dialog ref={ref} className="hc-confirm" aria-labelledby="hc-confirm-title" aria-describedby="hc-confirm-description" onCancel={e=>{e.preventDefault();finish(false);}} onClose={()=>{if(!ref.current?.open)feedbackStore.resolve(dialog.id,false);}}>
  <form onSubmit={e=>{e.preventDefault();finish(dialog.kind==='prompt'?value:true);}}>
   <div className={`hc-confirm-icon ${dialog.danger?'hc-confirm-danger':''}`}>{dialog.danger?<TriangleAlert size={26}/>:<Info size={26}/>}</div>
   <h2 id="hc-confirm-title">{dialog.title}</h2><p id="hc-confirm-description">{dialog.message}</p>
   {dialog.kind==='prompt'&&<label className="hc-confirm-field">{dialog.inputLabel||'Valor'}<input type={dialog.inputType||'text'} required value={value} onChange={e=>setValue(e.target.value)}/></label>}
   <div className="hc-confirm-actions"><button ref={cancelRef} type="button" onClick={()=>finish(false)}>Cancelar</button><button type="submit" className={dialog.danger?'hc-danger-button':'hc-primary-button'}>{dialog.confirmLabel||'Confirmar'}</button></div>
  </form>
 </dialog>;
}

function ToastViewport({items}:{items:ToastItem[]}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=ref.current;
  if(items.length)element?.showPopover();else element?.hidePopover();
  return ()=>element?.hidePopover();
 },[items]);
 return <div ref={ref} popover="manual" className="hc-toast-viewport" aria-label="Mensajes de acciones">{items.map(item=><ToastCard key={item.id} item={item}/>)}</div>;
}

export default function FeedbackProvider({children}:{children:ReactNode}){
 const state=useSyncExternalStore(feedbackStore.subscribe,feedbackStore.getSnapshot,()=>emptyFeedback);
 const [mounted,setMounted]=useState(false),[toastHost,setToastHost]=useState<HTMLElement|null>(null);
 useEffect(()=>{
  setMounted(true);
  // Put notifications inside the active dialog so they remain accessible
  // when the browser makes the rest of the document inert.
  const updateHost=()=>{const dialogs=document.querySelectorAll<HTMLDialogElement>('dialog[open]');setToastHost(dialogs.length?dialogs[dialogs.length-1]:document.body);};
  updateHost();
  const observer=new MutationObserver(updateHost);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  return ()=>{observer.disconnect();feedbackStore.cancel();};
 },[]);
 return <>{children}{mounted&&state.dialog&&createPortal(<Confirmation key={state.dialog.id} dialog={state.dialog}/>,document.body)}{toastHost&&createPortal(<ToastViewport items={state.toasts}/>,toastHost)}</>;
}
