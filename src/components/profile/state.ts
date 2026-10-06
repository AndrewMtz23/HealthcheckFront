import type {PreferencesData} from '@/services/profileService';
export function mergeTopicUpdate(draft:PreferencesData|null,response:PreferencesData):PreferencesData{return draft?{...draft,topics:response.topics}:response;}
export function availablePage(current:number,totalPages:number){return Math.min(current,Math.max(1,totalPages));}
