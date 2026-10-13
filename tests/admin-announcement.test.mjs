import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './support/load-ts.mjs';
function service({fetch,events=[]}){const localStorage={getItem:key=>key==='token'?'admin-token':null};const window={dispatchEvent:event=>events.push(event)};return loadTs('services/announcementService.ts',{fetch,localStorage,window,Headers,Response,Event,CustomEvent:class CustomEvent extends Event{constructor(type,init){super(type);this.detail=init?.detail;}}});}
test('draft, preview, and publish use authenticated admin endpoints',async()=>{
 const calls=[];const api=service({fetch:async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify({data:url.endsWith('/preview')?{eligibleAccounts:3}:{id:9,status:'draft'}}),{status:200,headers:{'content-type':'application/json'}});}});
 await api.createAnnouncementDraft({title:'Mantenimiento',body:'Sin servicio',kind:'mantenimiento',publish_at:null,expires_at:null,maintenance_start_at:null,maintenance_end_at:null});
 const preview=await api.previewAnnouncement(9);await api.publishAnnouncement(9);
 assert.equal(calls[0].url,'http://localhost:4000/api/auth/admin/announcements');assert.equal(calls[0].init.headers.Authorization,'Bearer admin-token');assert.equal(JSON.parse(calls[0].init.body).kind,'mantenimiento');assert.equal(preview.eligibleAccounts,3);assert.equal(calls[2].url,'http://localhost:4000/api/auth/admin/announcements/9/publish');
});
test('authorization errors do not reveal submitted content',async()=>{
 const api=service({fetch:async()=>new Response(JSON.stringify({message:'No tienes permiso',debug:'SECRET BODY'}),{status:403,headers:{'content-type':'application/json'}})});
 await assert.rejects(api.publishAnnouncement(1),error=>error.message==='No tienes permiso'&&!error.message.includes('SECRET BODY'));
});
