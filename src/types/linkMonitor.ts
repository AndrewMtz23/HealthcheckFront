export type RunState='queued'|'running'|'completed'|'interrupted'|'failed';
export interface MonitorRun{id:string;state:RunState;created_at:string;started_at:string|null;finished_at:string|null;heartbeat_at:string|null;total_urls:number;processed_urls:number;skipped_news:number;error_code:string|null}
export type ResultStatus='available'|'not_found'|'restricted'|'rate_limited'|'site_error'|'connection_failed'|'uncheckable';
export interface CheckResult{status:ResultStatus;http_status:number|null;final_url:string;redirect_count:number;checked_at:string;duration_ms:number;error_code?:string}
export interface ResultRow{news_id:number;title:string;current_url:string;checked_url:string|null;freshness:'current'|'stale'|'unchecked';pending:boolean;result:CheckResult|null}
export interface ResultsPage{items:ResultRow[];page:number;limit:number;total:number;summary:Partial<Record<ResultStatus|'stale'|'unchecked',number>>}
export interface StartResult{run:MonitorRun;created:boolean}
