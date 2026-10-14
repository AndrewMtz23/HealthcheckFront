import {adminRequest} from '@/services/adminService';
export type EditorialState='draft'|'in_review'|'published'|'withdrawn';
export type EditorialAction='submit'|'publish'|'withdraw'|'reopen';
export interface EditorialNews {
 id:number;titulo:string;contenido:string;url:string|null;fuente_id:number|null;tema_id:number|null;fecha_publicacion:string|null;
 editorial_state:EditorialState;editorial_origin:string;editorial_version:number;content_version:number;editorial_published_at:string|null;
 available_actions:EditorialAction[];
 classifications:{id:number;resultado:string;confianza:number;explicacion:string;modelo:string;content_version:number;fecha_clasificacion:string}[];
 editorial_events:{id:number;actor_id:number|null;action:string;reason:string;version:number;created_at:string}[];
}
export const loadEditorialNews=(id:number)=>adminRequest<EditorialNews>('news',`/${id}`);
export const saveEditorialNews=(id:number|null,data:Record<string,unknown>)=>adminRequest<EditorialNews>('news',id?`/${id}`:'',{method:id?'PATCH':'POST',body:JSON.stringify(data)});
export const transitionEditorialNews=(id:number,action:EditorialAction,version:number,reason:string)=>adminRequest<EditorialNews>('news',`/${id}/editorial`,{method:'POST',body:JSON.stringify({action,expected_version:version,reason})});
