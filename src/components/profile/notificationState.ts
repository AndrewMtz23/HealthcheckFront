import type {Notification} from '@/services/profileService';
export function notificationStatus(item: Pick<Notification,'tipo'|'enviada'|'delivery_state'>): string {
  if(item.tipo==='sms')return 'SMS · canal retirado';
  const labels: Record<string,string>={pending:'Programada',retry:'Reintento programado',sending:'En proceso',sent:'Enviada',failed:'No enviada',cancelled:'Cancelada',uncertain:'Entrega por confirmar',legacy:'Sin programación'};
  return labels[item.delivery_state || (item.enviada?'sent':'legacy')] || 'Sin programación';
}
export function notificationDetail(item: Pick<Notification,'delivery_state'|'attempts'|'next_attempt_at'>): string {
  switch(item.delivery_state){
    case 'uncertain':return 'No se pudo confirmar el resultado; no se reenviará automáticamente.';
    case 'failed':return 'El envío se detuvo. Revisa tu correo y tus preferencias.';
    case 'cancelled':return 'El aviso ya no coincide con tu cuenta, preferencias o contenido vigente.';
    case 'legacy':return 'Registro anterior sin entrega programada.';
    case 'retry':return `Intento ${item.attempts || 0} de 3. Se volverá a intentar${item.next_attempt_at ? ` el ${new Intl.DateTimeFormat('es-MX',{timeZone:'America/Mexico_City',dateStyle:'short',timeStyle:'short'}).format(new Date(item.next_attempt_at))} (hora de Ciudad de México)` : ' más tarde'}.`;
    default:return '';
  }
}
