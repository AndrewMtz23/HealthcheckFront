import {test} from 'node:test';import assert from 'node:assert/strict';import {loadTs} from './support/load-ts.mjs';
test('monitor uses admin API and never submits arbitrary URLs or actor IDs',async()=>{
 const calls=[];const api=loadTs('services/linkMonitorService.ts',{fetch:async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify({status:'success',data:{created:true,run:{id:'r',state:'queued'}}}),{status:202});},localStorage:{getItem:()=> 'session'},window:{dispatchEvent(){}},Headers,Response,AbortController,AbortSignal});
 const result=await api.startLinkMonitor();assert.equal(result.run.id,'r');assert.equal(calls[0].url,'http://localhost:3003/api/admin/link-monitor/runs');assert.equal(calls[0].init.headers.Authorization,'Bearer session');assert.equal(calls[0].init.body,'{}');
});
test('stale results never receive current availability labels and unsafe URLs are not clickable',()=>{
 const state=loadTs('components/admin/linkMonitorState.ts',{URL});
 assert.equal(state.resultLabel({freshness:'stale',result:{status:'available'}}),'Desactualizado');
 assert.equal(state.resultLabel({freshness:'unchecked',result:null}),'Sin revisar');
 assert.equal(state.safeLink('javascript:alert(1)'),null);assert.equal(state.safeLink('https://example.com/a'),'https://example.com/a');
});
test('polling rejects stale responses and stops after authorization revocation',()=>{
 const {RequestGeneration}=loadTs('components/admin/linkMonitorState.ts',{URL});const state=new RequestGeneration();const first=state.begin();const second=state.begin();assert.equal(state.accepts(first),false);assert.equal(state.accepts(second),true);state.stop();assert.equal(state.accepts(second),false);
});

test('late authorization failure from an older session does not revoke a new login',async()=>{
 let token='old',finish;const events=[];
 const api=loadTs('services/linkMonitorService.ts',{fetch:()=>new Promise(resolve=>{finish=resolve;}),localStorage:{getItem:()=>token,removeItem(){}},window:{dispatchEvent:e=>events.push(e)},Headers,Response,Event,CustomEvent:class extends Event{constructor(type,init){super(type);this.detail=init?.detail;}}});
 const pending=api.getLinkMonitorRun();token='new';finish(new Response(JSON.stringify({message:'Expired'}),{status:401}));await assert.rejects(pending,error=>error.name==='AbortError');assert.equal(events.length,0);
});
