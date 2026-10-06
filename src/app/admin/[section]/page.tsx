'use client';
import {Suspense,use} from 'react';
import AdminList,{modules} from '@/components/admin/AdminList';
import type {Section} from '@/types/admin';
import {State} from '@/components/admin/ui';
export default function Page({params}:{params:Promise<{section:string}>}){const {section}=use(params);if(!(section in modules))return <State empty="Módulo no encontrado"/>;return <Suspense fallback={<State loading/>}><AdminList key={section} section={section as Section}/></Suspense>;}
