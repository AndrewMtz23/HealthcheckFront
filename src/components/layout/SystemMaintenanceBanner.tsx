'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {getActiveMaintenance,type InboxItem} from '@/services/inboxService';
import styles from './NotificationCenter.module.css';
export default function SystemMaintenanceBanner(){const {user}=useAuth();const [items,setItems]=useState<Pick<InboxItem,'id'|'title'|'body'>[]>([]);useEffect(()=>{if(!user){setItems([]);return;}let active=true;const load=()=>getActiveMaintenance().then(value=>{if(active)setItems(value);}).catch(()=>{if(active)setItems([]);});void load();const timer=window.setInterval(load,60000);return()=>{active=false;window.clearInterval(timer);};},[user]);if(!items.length)return null;return <aside className={styles.banner} role="status"><strong>Mantenimiento en curso</strong><span>{items[0].title}: {items[0].body}</span><Link href="/notifications">Más información</Link></aside>;}
