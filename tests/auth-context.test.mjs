import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {loadTs} from './support/load-ts.mjs';
const require=createRequire(import.meta.url);
// Drive the provider's actual effects with a deferred network response. This is
// a state/race regression, not a browser-rendering assertion.
function provider(getProfile) {
 const state=[],effects=[],values=new Map([['token','old'],['user','{"rol":"admin"}']]);let cursor=0;
 const react={createContext:()=>({Provider:()=>null}),useContext(){},
  useState(initial){const index=cursor++;state[index]=initial;return [initial,value=>{state[index]=value;}];},
  useEffect(effect){effects.push(effect);}};
 const globals={localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},
  window:{addEventListener(){},removeEventListener(){},setInterval(){return 1;},clearInterval(){}},
  require(name){
   if(name==='react')return {__esModule:true,default:react,...react};
   if(name==='next/navigation')return {useRouter:()=>({replace(){}})};
   if(name==='@/services/authService')return {getProfile};
   if(name==='@/services/session')return {clearSession(){assert.fail('unexpected clear');}};
   return require(name);
  }};
 const {AuthProvider}=loadTs('context/AuthContext.tsx',globals);
 const element=AuthProvider({children:null});effects[0]();
 return {state,values,login:element.props.value.login};
}
test('a failed refresh from an old token cannot erase a successful newer login',async()=>{
 let reject;const pending=new Promise((_,r)=>{reject=r;});
 const app=provider(()=>pending);
 app.login({id:2,rol:'usuario',nombre:'Synthetic'},'new');
 reject(new Error('Old connection failed'));await pending.catch(()=>{});await new Promise(setImmediate);
 assert.equal(app.state[0]?.id,2);assert.equal(app.values.get('token'),'new');assert.equal(app.state[2],null);
});
test('startup failure never restores cached administrative privileges',async()=>{
 const app=provider(async()=>{throw Error('Service unavailable');});await new Promise(setImmediate);
 assert.equal(app.state[0],null);assert.equal(app.state[1],false);assert.equal(app.values.get('token'),'old');
});
