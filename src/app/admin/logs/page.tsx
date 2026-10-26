import {Suspense} from 'react';
import LogsView from '@/components/admin/logs/LogsView';
import {State} from '@/components/admin/ui';
export default function Page(){return <Suspense fallback={<State loading/>}><LogsView/></Suspense>;}
