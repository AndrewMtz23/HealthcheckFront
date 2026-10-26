import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './support/load-ts.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
test('editorial import matches only an existing source host and rejects old-session data',async()=>{
 let token='first';
 const api=loadTs('services/editorialImport.ts',{URL,localStorage:{getItem:()=>token},require(name){if(name==='@/services/session')return {sessionFetch:async()=>({ok:true,json:async()=>{token='second';return {data:{titulo:'Old'}};}})};throw Error(name);}});
 assert.equal(api.matchEditorialSource('https://www.example.org/story',[{id:2,url:'https://example.org'}]),'2');
 assert.equal(api.matchEditorialSource('https://evil-example.org/story',[{id:2,url:'https://example.org'}]),'');
 await assert.rejects(()=>api.extractEditorialPreview('https://example.org'),/sesión/);
});
test('editor preview requires overwrite confirmation, suppresses duplicates and keeps fields on failure',async()=>{
 const state=[];let cursor=0,calls=0,saves=0,resolve,reject,confirmed=true;const notices=[];
 const react={useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},useRef(initial){const i=cursor++;if(!(i in state))state[i]={current:initial};return state[i];},useEffect(){}};
 const Editor=loadTs('components/admin/NewsEditor.tsx',{URL,AbortController,require(name){
  if(name==='react')return react;if(name==='./ui')return {Dialog:'dialog'};
  if(name==='@/lib/feedback')return {confirmAction:async()=>confirmed,toast:{success:s=>notices.push(s),error:s=>notices.push(s)}};
  if(name==='@/services/editorialImport')return {matchEditorialSource:()=>'',extractEditorialPreview:()=>{calls++;return new Promise((r,j)=>{resolve=r;reject=j;});}};
  if(name==='@/services/editorialService')return {saveEditorialNews:async()=>{saves++;}};
  if(name==='@/services/adminService')return {};return require(name);
 }}).default;
 const render=()=>{cursor=0;return Editor({row:null,onClose(){},onSaved(){}});};
 const find=(node,predicate)=>{if(!node||typeof node!=='object')return;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const result=find(child,predicate);if(result)return result;}};
 const input=(tree,name)=>find(tree,n=>n.props?.name===name),button=tree=>find(tree,n=>n.type==='button'&&n.props.onClick?.toString().includes('fillFromUrl'));
 let tree=render();input(tree,'url').props.onChange({target:{value:'https://example.org/article'}});tree=render();button(tree).props.onClick();button(tree).props.onClick();assert.equal(calls,1);
 await find(render(),n=>n.type==='form').props.onSubmit({preventDefault(){}});assert.equal(saves,0);
 resolve({titulo:'Extracted',contenido:'Complete article body',fecha_publicacion:'2026-10-15'});await new Promise(setImmediate);tree=render();assert.equal(input(tree,'titulo').props.value,'Extracted');assert.equal(input(tree,'fecha_publicacion').props.value,'2026-10-15');
 confirmed=false;button(tree).props.onClick();await new Promise(setImmediate);assert.equal(calls,1);
 confirmed=true;button(render()).props.onClick();await new Promise(setImmediate);assert.equal(calls,2);reject(Error('Source blocked'));await new Promise(setImmediate);
 assert.equal(input(render(),'contenido').props.value,'Complete article body');assert(notices.includes('Source blocked'));assert.equal(saves,0);
});
