import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,params=new URLSearchParams();
 for(const key of ['q','startDate','endDate','userId'])if(typeof query[key]==='string')params.set(key,query[key] as string);
 redirect('/admin/logs'+(params.size?'?'+params.toString():''));
}
