export function editorialLabels(news:{human_reviewed?:boolean;editorial_origin?:string;analysis_status?:string}){
 return {review:news.human_reviewed?'Revisión editorial registrada':'Sin revisión editorial registrada',
  analysis:news.analysis_status==='outdated'?'Análisis de una versión anterior':news.analysis_status==='current'?'Análisis automático':'Sin análisis automático vigente'};
}
