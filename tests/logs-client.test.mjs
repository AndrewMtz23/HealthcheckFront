import {test} from 'node:test';import assert from 'node:assert/strict';import {loadTs} from './support/load-ts.mjs';
test('Logs client rejects forbidden access and discards a response after session changes',async()=>{
 let token='first',events=[];
 const globals={URLSearchParams,localStorage:{getItem:()=>token},window:{dispatchEvent:e=>events.push(e)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},require(name){if(name==='@/services/session')return {sessionFetch:async()=>({ok:false,status:403,json:async()=>({message:'Denied'})})};if(name.includes('/state'))return {encodeQuery:()=>''};throw Error(name);}};
 const api=loadTs('services/logService.ts',globals);
 await assert.rejects(()=>api.getLogs({}),e=>e.status===403);assert.equal(events.length,1);
 const changed=loadTs('services/logService.ts',{...globals,require(name){if(name==='@/services/session')return {sessionFetch:async()=>{token='second';return {ok:true,status:200,json:async()=>({data:{secret:'old'}})};}};return globals.require(name);}});
 await assert.rejects(()=>changed.getLog('1'),e=>e.name==='AbortError');
});
test('Logs discards JSON consumed after the session changes',async()=>{
 let token='old';
 const api=loadTs('services/logService.ts',{localStorage:{getItem:()=>token},require(name){
  if(name==='@/services/session')return {sessionFetch:async()=>({ok:true,json:async()=>{token='new';return {data:'previous-session-data'};}})};
  if(name.includes('/state'))return {encodeQuery:()=>''};throw Error(name);
 }});
 await assert.rejects(()=>api.getLog('1'),e=>e.name==='AbortError');
});
