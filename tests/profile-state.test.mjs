import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function state(){const exports={};const source=fs.readFileSync(new URL('../src/components/profile/state.ts',import.meta.url),'utf8');vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});return exports;}
test('topic updates preserve an unsaved notification preference draft',()=>{const {mergeTopicUpdate}=state();const draft={preferences:{frecuencia_notificaciones:'semanal'},topics:[],delivery_enabled:false};const response={preferences:{frecuencia_notificaciones:'diaria'},topics:[{tema_id:4}],delivery_enabled:false};const result=mergeTopicUpdate(draft,response);assert.equal(result.preferences.frecuencia_notificaciones,'semanal');assert.equal(result.topics[0].tema_id,4);});
test('notification refresh recovers when current page no longer exists',()=>{const {availablePage}=state();assert.equal(availablePage(2,1),1);assert.equal(availablePage(2,0),1);assert.equal(availablePage(2,3),2);});
test('retired SMS draft never subscribes to email or mutates the stored preference',()=>{
 const {editablePreferences}=state();const original={preferences:{tipo_notificacion:'sms',recibir_notificaciones:true},topics:[],delivery_enabled:false};
 const draft=editablePreferences(original);assert.equal(draft.preferences.tipo_notificacion,'email');assert.equal(draft.preferences.recibir_notificaciones,false);assert.equal(draft.legacy_sms,true);assert.equal(original.preferences.tipo_notificacion,'sms');assert.equal(original.preferences.recibir_notificaciones,true);
});
