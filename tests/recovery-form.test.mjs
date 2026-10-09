import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {loadTs} from './support/load-ts.mjs';
const require=createRequire(import.meta.url);
function form(mode,services={}) {
 const state=[],effects=[],replaced=[];let cursor=0;
 const react={useState(value){const i=cursor++;if(!(i in state))state[i]=value;return [state[i],v=>state[i]=v];},useRef(value){const i=cursor++;if(!(i in state))state[i]={current:value};return state[i];},useEffect(fn){effects.push(fn);}};
 const Form=loadTs('components/auth/PasswordForm.tsx',{Error,TypeError,TextEncoder,URLSearchParams,window:{location:{hash:'#token='+'a'.repeat(64),pathname:'/reset-password'},history:{replaceState:(_a,_b,path)=>replaced.push(path)}},require(name){
  if(name==='react')return react;
  if(name==='@/context/AuthContext')return {useAuth:()=>({user:{id:1,password_enabled:true},loading:false})};
  if(name==='@/services/recoveryService')return services;
  if(name==='./AuthField')return {__esModule:true,default:'input'};
  if(name==='./AuthActions')return {FormError:'error',SubmitButton:'submit'};
  if(name.endsWith('.css'))return {__esModule:true,default:{}};
  if(name==='next/link')return {__esModule:true,default:'a'};
  return require(name);
 }}).default;
 function render(){cursor=0;return Form({mode});}
 const find=(el,type,id)=>{if(!el||typeof el!=='object')return; if(el.type===type&&(!id||el.props.id===id))return el;for(const child of [el.props?.children].flat(Infinity)){const hit=find(child,type,id);if(hit)return hit;}};
 return {render,find,effects,state,replaced};
}
test('reset form removes the secret from browser history and survives repeated effect setup',()=>{
 const f=form('reset');f.render();f.effects[0]();f.effects[0]();const tree=f.render();
 assert.deepEqual(f.replaced,['/reset-password']);assert(f.find(tree,'form'));assert.equal(f.state[4],'a'.repeat(64));
});
test('password mismatch prevents request; server expiration remains visible with a retry path',async()=>{
 let calls=0;const f=form('reset',{resetPassword:async()=>{calls++;throw Error('El enlace ha vencido');}});
 f.render();f.effects[0]();let tree=f.render();
 f.find(tree,'input','new-password').props.onChange({target:{value:'valid-password'}});
 f.find(tree,'input','confirm-password').props.onChange({target:{value:'different-password'}});
 await f.find(f.render(),'form').props.onSubmit({preventDefault(){}});assert.equal(calls,0);
 f.find(f.render(),'input','confirm-password').props.onChange({target:{value:'valid-password'}});
 await f.find(f.render(),'form').props.onSubmit({preventDefault(){}});assert.equal(calls,1);
 assert.equal(f.find(f.render(),'error').props.message,'El enlace ha vencido');assert(f.find(f.render(),'form'));
});
