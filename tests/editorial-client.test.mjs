import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {loadTs} from './support/load-ts.mjs';
test('editorial requests carry version and reason and preserve conflict errors',async()=>{
 assert(fs.existsSync('src/services/editorialService.ts'),'editorial client must exist');const calls=[];
 const api=loadTs('services/editorialService.ts',{require(name){if(name==='@/services/adminService')return {adminRequest:async(section,path,options)=>{calls.push({section,path,options});if(path==='/9')throw Object.assign(new Error('Reload'),{status:409});return {id:1};}};throw Error(name);}});
 await api.saveEditorialNews(null,{titulo:'New',contenido:'Text'});await api.transitionEditorialNews(1,'publish',3,'Source checked');
 assert.equal(calls[1].path,'/1/editorial');assert.deepEqual(JSON.parse(calls[1].options.body),{action:'publish',expected_version:3,reason:'Source checked'});
 await assert.rejects(api.saveEditorialNews(9,{expected_version:2,reason:'Correction'}),e=>e.status===409);
});
