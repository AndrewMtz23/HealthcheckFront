export type Section='users'|'news'|'sources'|'topics'|'reports'|'activity'|'models'|'notifications'|'preferences';
export type Row={id:number|string;[key:string]:unknown};
export interface PageData {items:Row[];total:number;page:number;limit:number;totalPages:number}
export interface Summary {totals:{users:number;news:number;unclassified:number;reports:number;models:number;notifications:number};distribution:{resultado:string;total:number}[];trend:{fecha:string;total:number}[];recent:Row[];activity:Row[];range:{start:string;end:string}}
