import {editorialLabels} from './editorialLabels';
export default function EditorialStatus({news}:{news:{human_reviewed?:boolean;editorial_origin?:string;analysis_status?:string}}){
 const labels=editorialLabels(news);
 return <aside className="my-3 border-l-2 border-blue-500 pl-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300" aria-label="Revisión y análisis"><p className="font-medium">{labels.review}{news.editorial_origin==='legacy'?' · Contenido heredado':''}</p><p>{labels.analysis}. La publicación no certifica la veracidad de sus afirmaciones.</p></aside>;
}
