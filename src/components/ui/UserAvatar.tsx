'use client';
import {useState} from 'react';
export default function UserAvatar({name,url,className='',onImageError}:{name?:string;url?:string|null;className?:string;onImageError?:()=>void}){
 const [failed,setFailed]=useState<string|null>(null);const safe=!!url&&/^https?:\/\//i.test(url)&&failed!==url;
 const initials=(name||'Usuario').trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();
 return <span className={`user-avatar ${className}`} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0,borderRadius:'50%'}}>{safe?
 // Direct browser image: arbitrary user URLs are not fetched by the Next image proxy.
 // eslint-disable-next-line @next/next/no-img-element
 <img src={url!} alt={`Foto de ${name||'perfil'}`} referrerPolicy="no-referrer" decoding="async" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={()=>{setFailed(url!);onImageError?.();}}/>:<span aria-label={name||'Usuario'}>{initials}</span>}</span>;
}
