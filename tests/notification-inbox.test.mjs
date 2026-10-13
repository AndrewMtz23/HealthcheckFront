import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './support/load-ts.mjs';

function service({fetch,events=[]}){
 const localStorage={getItem:key=>key==='token'?'synthetic-token':null};
 const window={dispatchEvent:event=>events.push(event)};
 return loadTs('services/inboxService.ts',{fetch,localStorage,window,Headers,Response,Event,CustomEvent:class CustomEvent extends Event{constructor(type,init){super(type);this.detail=init?.detail;}}});
}
test('inbox requests carry the current session and preserve source/read/delivery fields',async()=>{
 let request;const api=service({fetch:async(url,init)=>{request={url,init};return new Response(JSON.stringify({data:{items:[{source:'system',id:4,title:'Mantenimiento',body:'Aviso',kind:'mantenimiento',created_at:'2026-10-12T10:00:00Z',read_at:null,delivery_state:'queued'}],total:1,page:1,totalPages:1,unread_count:1}}),{status:200,headers:{'content-type':'application/json'}});}});
 const data=await api.getInbox({limit:5,page:1});assert.match(request.url,/\/auth\/inbox\?limit=5&page=1$/);assert.equal(request.init.headers.Authorization,'Bearer synthetic-token');assert.equal(data.items[0].source,'system');assert.equal(data.items[0].delivery_state,'queued');assert.equal(data.unread_count,1);
});
test('read action scopes to the system notice endpoint and active maintenance is separate',async()=>{
 const calls=[];const api=service({fetch:async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify({data:url.endsWith('/active')?[{id:7,title:'Mantenimiento'}]:{read_at:'2026-10-12T10:00:00Z'}}),{status:200,headers:{'content-type':'application/json'}});}});
 await api.markSystemAnnouncementRead(7);const active=await api.getActiveMaintenance();assert.equal(calls[0].url,'http://localhost:4000/api/auth/system-announcements/7/read');assert.equal(calls[0].init.method,'POST');assert.equal(active[0].id,7);
});
