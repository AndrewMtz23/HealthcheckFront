import {loadTs} from './support/load-ts.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(fetch,token='synthetic'){
 return loadTs('services/historyService.ts',{process:{env:{NEXT_PUBLIC_NEWS_API_URL:'https://news.example.test/api'}},localStorage:{getItem:()=>token},fetch,console:{error(){}}});
}

test('history uses configured server, current dates, pagination and session; clear leaves no dates',async()=>{
 const requests=[];const api=load(async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>({status:'success',data:{history:[],total:0}})};});
 await api.getUserHistory(3,10,'2026-10-01','2026-10-07');await api.getUserHistory(1,10,'','');
 assert.equal(requests[0].url,'https://news.example.test/api/history?page=3&limit=10&startDate=2026-10-01&endDate=2026-10-07');assert.equal(requests[0].options.headers.Authorization,'Bearer synthetic');assert.equal(requests[1].url,'https://news.example.test/api/history?page=1&limit=10');
});
test('history rejects missing session and does not turn server errors into an empty history',async()=>{
 await assert.rejects(load(()=>assert.fail('unauthenticated request'),null).getUserHistory(),/autenticado/);
 await assert.rejects(load(async()=>({ok:false})).getUserHistory(),/historial/);
});
