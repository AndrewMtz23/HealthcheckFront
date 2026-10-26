export type ToastKind = 'success' | 'error' | 'info';
export type ToastItem = {id:number;kind:ToastKind;message:string};
export type ConfirmOptions = {title:string;message:string;confirmLabel?:string;danger?:boolean};
export type PromptOptions = ConfirmOptions & {inputLabel?:string;inputType?:'text'|'datetime-local';initialValue?:string};
export type FeedbackDialog = PromptOptions & {id:number;kind:'confirm'|'prompt'};
type Snapshot = {toasts:ToastItem[];dialog:FeedbackDialog|null};
export const emptyFeedback:Snapshot = {toasts:[],dialog:null};

/** Shared by actions and the root viewport; no network or browser APIs here. */
export function createFeedbackStore() {
 let snapshot:Snapshot = emptyFeedback;
 let sequence=0;
 let pending:((value:boolean|string|null)=>void)|null=null;
 const listeners=new Set<()=>void>();
 function emit(next:Snapshot){snapshot=next;listeners.forEach(listener=>listener());}
 function request(options:PromptOptions,kind:'confirm'|'prompt'):Promise<boolean|string|null>{
  // A second click must never queue a second destructive operation.
  if(snapshot.dialog)return Promise.resolve(kind==='confirm'?false:null);
  return new Promise(resolve=>{pending=resolve;emit({...snapshot,dialog:{...options,kind,id:++sequence}});});
 }
 function resolve(id:number,value:boolean|string|null){
  if(snapshot.dialog?.id!==id)return;
  const done=pending,kind=snapshot.dialog.kind;pending=null;
  emit({...snapshot,dialog:null});
  done?.(kind==='confirm'?value===true:typeof value==='string'?value:null);
 }
 return {
  getSnapshot:()=>snapshot,
  subscribe(listener:()=>void){listeners.add(listener);return ()=>{listeners.delete(listener);};},
  notify(kind:ToastKind,message:string){
   if(!message.trim())return;
   const existing=snapshot.toasts.find(t=>t.kind===kind&&t.message===message);
   if(existing)return existing.id;
   const id=++sequence;
   emit({...snapshot,toasts:[...snapshot.toasts,{id,kind,message}].slice(-3)});
   return id;
  },
  dismiss(id:number){emit({...snapshot,toasts:snapshot.toasts.filter(t=>t.id!==id)});},
  confirm:(options:ConfirmOptions)=>request(options,'confirm') as Promise<boolean>,
  prompt:(options:PromptOptions)=>request(options,'prompt') as Promise<string|null>,
  resolve,
  cancel(){if(snapshot.dialog)resolve(snapshot.dialog.id,false);},
 };
}
export const feedbackStore=createFeedbackStore();
export const toast={
 success:(message:string)=>feedbackStore.notify('success',message),
 error:(message:string)=>feedbackStore.notify('error',message),
 info:(message:string)=>feedbackStore.notify('info',message),
};
export const confirmAction=feedbackStore.confirm;
export const promptAction=feedbackStore.prompt;
