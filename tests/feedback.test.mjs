import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './support/load-ts.mjs';

test('feedback deduplicates active messages, bounds the stack and can dismiss each toast',()=>{
 const {createFeedbackStore}=loadTs('lib/feedback.ts');const store=createFeedbackStore();
 store.notify('success','Guardado');store.notify('success','Guardado');
 assert.equal(store.getSnapshot().toasts.length,1);
 for(let i=0;i<6;i++)store.notify('info',`Paso ${i}`);
 assert.equal(store.getSnapshot().toasts.length,3);
 const id=store.getSnapshot().toasts[0].id;store.dismiss(id);
 assert.equal(store.getSnapshot().toasts.some(t=>t.id===id),false);
});
test('confirmation cancellation and concurrent requests never authorize a mutation',async()=>{
 const {createFeedbackStore}=loadTs('lib/feedback.ts');const store=createFeedbackStore();
 const first=store.confirm({title:'Retirar noticia',message:'Dejará de estar publicada.'});
 assert.equal(await store.confirm({title:'Duplicada',message:'Segundo clic'}),false);
 const id=store.getSnapshot().dialog.id;store.resolve(id,false);
 assert.equal(await first,false);assert.equal(store.getSnapshot().dialog,null);
 const next=store.confirm({title:'Publicar',message:'Revisada'});
 store.resolve(id,true);assert.notEqual(store.getSnapshot().dialog,null);
 store.resolve(store.getSnapshot().dialog.id,true);assert.equal(await next,true);
});
test('prompt returns text only on confirmation, and cleanup cancels pending dialogs',async()=>{
 const {createFeedbackStore}=loadTs('lib/feedback.ts');const store=createFeedbackStore();
 const prompt=store.prompt({title:'Programar',message:'Elige la fecha'});
 store.resolve(store.getSnapshot().dialog.id,'2026-10-20T12:00');assert.equal(await prompt,'2026-10-20T12:00');
 const cancel=store.prompt({title:'Programar',message:'Elige la fecha'});store.cancel();assert.equal(await cancel,null);
});
