import {loadTs} from './support/load-ts.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const load=loadTs;

test('profile client uses authenticated own-profile route and returns actual data',async()=>{
 let captured;const {profileRequest}=load('services/profileService.ts',{localStorage:{getItem:()=> 'synthetic-token'},fetch:async(url,options)=>{captured={url,options};return {ok:true,json:async()=>({data:{topics:[{tema_id:3}]}})};}});
 const data=await profileRequest('/topics',{method:'POST',body:JSON.stringify({tema_id:3})});assert.equal(captured.url,'http://localhost:4000/api/auth/profile/topics');assert.equal(captured.options.headers.Authorization,'Bearer synthetic-token');assert.equal(captured.options.method,'POST');assert.equal(data.topics[0].tema_id,3);
});
test('profile errors are actionable and missing session never issues a request',async()=>{
 const api=load('services/profileService.ts',{localStorage:{getItem:()=>null},fetch:()=>assert.fail('must not fetch')});await assert.rejects(api.profileRequest('/preferences'),/sesión/);
 const failed=load('services/profileService.ts',{localStorage:{getItem:()=> 'synthetic-token'},fetch:async()=>({ok:false,json:async()=>({message:'Agrega un teléfono'})})});await assert.rejects(failed.profileRequest('/preferences'),/Agrega un teléfono/);
});
test('avatar uses URL images without referrer and falls back to initials for unsafe sources',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');const Avatar=load('components/ui/UserAvatar.tsx').default;
 const image=renderToStaticMarkup(React.createElement(Avatar,{name:'Test User',url:'https://example.invalid/avatar.png'}));assert.match(image,/<img/);assert.match(image,/referrerPolicy="no-referrer"/);
 const fallback=renderToStaticMarkup(React.createElement(Avatar,{name:'Test User',url:'javascript:alert(1)'}));assert(!fallback.includes('<img'));assert(fallback.includes('TU'));
});
