import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {loadTs} from './support/load-ts.mjs';
const require=createRequire(import.meta.url);
function harness(api,initial={}){
 const notices=[];const values=[];let cursor=0,effect,cleanup;const timers=new Map(),events={};let id=0;
 const react={useState(value){const i=cursor++;if(!(i in values))values[i]=i in initial?initial[i]:value;return [values[i],next=>{values[i]=typeof next==='function'?next(values[i]):next;}];},useRef(value){const i=cursor++;if(!(i in values))values[i]={current:value};return values[i];},useEffect(fn){effect=fn;}};
 const doc={hidden:false,addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]};
 const Component=loadTs('components/admin/LinkMonitor.tsx',{AbortController,document:doc,setTimeout:(fn)=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key),require(name){if(name==='@/lib/feedback')return {toast:{success:message=>notices.push(['success',message]),error:message=>notices.push(['error',message])}};if(name==='react')return react;if(name==='@/services/linkMonitorService')return api;if(name==='./linkMonitorState')return loadTs('components/admin/linkMonitorState.ts',{URL});return require(name);}}).default;
 return {notices,values,timers,doc,events,render(){cursor=0;return Component();},mount(){this.render();cleanup=effect();},cleanup(){cleanup?.();}};
}
const running={id:'r',state:'running',created_at:'2026-10-14T18:00:00Z',total_urls:10,processed_urls:2,skipped_news:0};
const empty={items:[],total:0,summary:{}};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
class LinkMonitorError extends Error{constructor(status){super('Unavailable');this.status=status;}}
test('component stops hidden polling, resumes visibility and clears timers on unmount',async()=>{
 let calls=0;const h=harness({LinkMonitorError,getLinkMonitorRun:async()=>{calls++;return running;},listLinkMonitorResults:async()=>empty});h.mount();await flush();assert.equal(calls,1);assert.equal(h.timers.size,1);h.doc.hidden=true;h.events.visibilitychange();assert.equal(h.timers.size,0);h.doc.hidden=false;h.events.visibilitychange();await flush();assert.equal(calls,2);h.cleanup();assert.equal(h.timers.size,0);
});
test('component keeps active-run polling after transient errors',async()=>{
 const h=harness({LinkMonitorError,getLinkMonitorRun:async()=>{throw new LinkMonitorError(503);},listLinkMonitorResults:async()=>empty},{0:running});h.mount();await flush();assert.equal(h.timers.size,1);h.cleanup();
});
test('component returns to first page when filtered results shrink',async()=>{
 const h=harness({LinkMonitorError,getLinkMonitorRun:async()=>running,listLinkMonitorResults:async()=>({...empty,total:3})},{2:2});h.mount();await flush();assert.equal(h.values[2],1);h.cleanup();
});

function button(tree,label){if(!tree||typeof tree!=='object')return;const children=[tree.props?.children].flat(Infinity);if(tree.type==='button'&&children.includes(label))return tree;for(const child of children){const found=button(child,label);if(found)return found;}}
test('monitor reports only the completion of a run started in this view, once',async()=>{
 let current=null;const h=harness({LinkMonitorError,getLinkMonitorRun:async()=>current,listLinkMonitorResults:async()=>empty,startLinkMonitor:async()=>{current=running;return {run:running,created:true};}});
 h.mount();await flush();assert.equal(h.notices.length,0);
 await button(h.render(),'Revisar enlaces').props.onClick();await flush();assert.equal(h.notices.length,1);
 h.cleanup();h.mount();await flush();current={...running,state:'completed'};const poll=[...h.timers.values()][0];await poll();await flush();assert.equal(h.notices.length,2);assert.match(h.notices[1][1],/completada/);
 await poll();await flush();assert.equal(h.notices.length,2);h.cleanup();
});
test('monitor loaded with a completed run does not toast',async()=>{const h=harness({LinkMonitorError,getLinkMonitorRun:async()=>({...running,state:'completed'}),listLinkMonitorResults:async()=>empty});h.mount();await flush();assert.equal(h.notices.length,0);h.cleanup();});
