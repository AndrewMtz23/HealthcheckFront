import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {loadTs} from './support/load-ts.mjs';
const require=createRequire(import.meta.url);
function find(tree,type,text){
 if(!tree||typeof tree!=='object')return;
 const children=[tree.props?.children].flat(Infinity);
 if(tree.type===type&&(!text||children.includes(text)))return tree;
 for(const child of children){const hit=find(child,type,text);if(hit)return hit;}
}
async function editorial({confirm,transition,reloadFails=false}){
 const values=[],effects=[],notices=[];let cursor=0,loads=0;
 const react={useState(initial){const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return [values[i],v=>values[i]=typeof v==='function'?v(values[i]):v];},useRef(initial){const i=cursor++;if(!(i in values))values[i]={current:initial};return values[i];},useEffect(fn){effects.push(fn);}};
 const news={id:1,titulo:'Synthetic',contenido:'Text',editorial_state:'published',editorial_version:1,content_version:1,classifications:[],editorial_events:[],available_actions:['withdraw']};
 const Panel=loadTs('components/admin/NewsEditorialPanel.tsx',{Error,require(name){
  if(name==='react')return react;
  if(name==='./ui')return {Dialog:'dialog',State:'state',Badge:'badge',Status:'status',date:()=>''};
  if(name==='./NewsEditor')return {default:'editor'};
  if(name==='@/lib/feedback')return {confirmAction:confirm,toast:{success:m=>notices.push(['success',m]),error:m=>notices.push(['error',m])}};
  if(name==='@/services/editorialService')return {loadEditorialNews:async()=>{if(++loads>1&&reloadFails)throw Error('Sin conexión');return news;},transitionEditorialNews:transition};
  return require(name);
 }}).default;
 const render=()=>{cursor=0;return Panel({id:1,onClose(){},onSaved(){}});};
 render();effects[0]();await new Promise(setImmediate);
 find(render(),'button','Retirar del sitio').props.onClick();
 return {submit:()=>find(render(),'form').props.onSubmit({preventDefault(){}}),notices};
}
test('canceling the news modal sends no mutation and a second submit cannot queue another',async()=>{
 let resolve,confirmations=0,mutations=0;
 const h=await editorial({confirm:()=>{confirmations++;return new Promise(r=>resolve=r);},transition:async()=>mutations++});
 const pending=h.submit();await h.submit();assert.equal(confirmations,1);assert.equal(mutations,0);
 resolve(false);await pending;assert.equal(mutations,0);assert.deepEqual(h.notices,[]);
});
test('failed withdrawal produces an error without announcing success',async()=>{
 const h=await editorial({confirm:async()=>true,transition:async()=>{throw Error('Conflicto de versión');}});
 await h.submit();assert.deepEqual(h.notices,[['error','Conflicto de versión']]);
});
test('successful withdrawal remains reported as saved when refreshing its detail fails',async()=>{
 const h=await editorial({confirm:async()=>true,transition:async()=>{},reloadFails:true});await h.submit();
 assert.equal(h.notices[0][0],'success');assert.equal(h.notices[0][1],'Noticia retirada.');assert.match(h.notices[1][1],/se guardó, pero/);
});
