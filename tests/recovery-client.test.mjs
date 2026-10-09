import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './support/load-ts.mjs';
function setup(status=200,changeToken=false){
 const values=new Map([['token','current'],['user','{}']]),requests=[],events=[];
 const api=loadTs('services/recoveryService.ts',{localStorage:{getItem:k=>values.get(k)||null,removeItem:k=>values.delete(k)},window:{dispatchEvent:e=>events.push(e.type)},Event:class{constructor(type){this.type=type;}},fetch:async(url,init)=>{requests.push({url,init});if(changeToken)values.set('token','new-device');return {status,ok:status<400,json:async()=>({message:status<400?'Accepted':'Temporary failure'})};}});
 return {api,values,requests,events};
}
test('public recovery sends no bearer token and places recovery secret only in body',async()=>{
 const s=setup();await s.api.requestRecovery('local@example.invalid');await s.api.resetPassword('secret','password123');
 assert(!s.requests[0].init.headers.Authorization);assert(!s.requests[1].url.includes('secret'));
 assert.equal(JSON.parse(s.requests[1].init.body).token,'secret');assert.equal(s.values.get('token'),'current');
});
test('password change clears only its session after success, never on temporary error or a newer login',async()=>{
 const ok=setup();await ok.api.changePassword('old','password123');assert(!ok.values.has('token'));
 const fail=setup(503);await assert.rejects(fail.api.changePassword('old','password123'));assert.equal(fail.values.get('token'),'current');
 const late=setup(200,true);await late.api.changePassword('old','password123');assert.equal(late.values.get('token'),'new-device');
});
