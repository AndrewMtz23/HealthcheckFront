import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(fetch) {
 const values=new Map([['token','current'],['user','{"rol":"admin"}']]),events=[];
 const exports={};
 const storage={getItem:key=>values.get(key)||null,removeItem:key=>values.delete(key)};
 const source=fs.readFileSync(new URL('../src/services/session.ts',import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
  {exports,fetch,Headers,localStorage:storage,window:{dispatchEvent:event=>events.push(event.type)},Event:class{constructor(type){this.type=type;}}});
 return {...exports,values,events};
}
test('authenticated 401 clears identity and notifies the context',async()=>{
 const api=load(async()=>({status:401}));
 await api.sessionFetch('/api/history',{headers:{Authorization:'Bearer current'}});
 assert.equal(api.values.has('token'),false);assert.equal(api.values.has('user'),false);
 assert.deepEqual(api.events,['healthcheck:session-ended']);
});
test('403 refreshes permissions without destroying a valid session; 503 preserves it',async()=>{
 for(const status of [403,503]) {
  const api=load(async()=>({status}));await api.sessionFetch('/api/admin',{headers:{Authorization:'Bearer current'}});
  assert.equal(api.values.get('token'),'current');
  assert.deepEqual(api.events,status===403?['healthcheck:permissions-changed']:[]);
 }
});
test('late response for a prior token and public login failure never clear a newer session',async()=>{
 const api=load(async()=>({status:401}));
 await api.sessionFetch('/api/history',{headers:{Authorization:'Bearer old'}});
 await api.sessionFetch('/api/auth/login',{method:'POST'});
 assert.equal(api.values.get('token'),'current');assert.deepEqual(api.events,[]);
});
