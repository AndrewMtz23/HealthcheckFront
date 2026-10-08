import {notFound} from 'next/navigation';
import ProfileView from '@/components/profile/ProfileView';
import HistoryPage from '@/app/history/page';
import NewsVerifier from '@/components/home/NewsVerifier';
const profileTabs={profile:'general',preferences:'preferences',topics:'topics',notifications:'notifications'} as const;
const titles={profile:'Mi perfil',preferences:'Preferencias',topics:'Mis intereses',notifications:'Notificaciones'};
export const dynamicParams=false;
export function generateStaticParams(){return ['analyze','history',...Object.keys(profileTabs)].map(section=>({section}));}
export default async function MemberSection({params}:{params:Promise<{section:string}>}){
 const {section}=await params;
 if(section==='history')return <div className="m-history"><HistoryPage/></div>;
 if(section==='analyze')return <><header className="m-heading"><div><p className="m-eyebrow">LEE CON PERSPECTIVA</p><h1>Analizar una noticia</h1><p>Contrasta los resultados con fuentes confiables. La disponibilidad depende del servicio de análisis.</p></div></header><div className="m-verifier"><NewsVerifier/></div></>;
 if(Object.hasOwn(profileTabs,section))return <><header className="m-heading"><div><p className="m-eyebrow">MI ESPACIO / MI CUENTA</p><h1>{titles[section as keyof typeof titles]}</h1></div></header><div className="m-profile"><ProfileView initialTab={profileTabs[section as keyof typeof profileTabs]}/></div></>;
 notFound();
}
