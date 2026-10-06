import {Suspense} from 'react';
import Dashboard from '@/components/admin/Dashboard';
export default function Page(){return <Suspense fallback={<p>Cargando panel…</p>}><Dashboard/></Suspense>;}
