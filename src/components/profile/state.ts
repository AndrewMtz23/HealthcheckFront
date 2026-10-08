import type {PreferencesData} from '@/services/profileService';
export function mergeTopicUpdate(draft:PreferencesData|null,response:PreferencesData):PreferencesData{return draft?{...draft,topics:response.topics}:response;}
export function availablePage(current:number,totalPages:number){return Math.min(current,Math.max(1,totalPages));}
// Viewing a retired SMS subscription must never opt the person into email.
export function editablePreferences(data:PreferencesData):PreferencesData {
 return data.preferences.tipo_notificacion==='sms'
  ? {...data,preferences:{...data.preferences,tipo_notificacion:'email',recibir_notificaciones:false},legacy_sms:true}
  : data;
}
