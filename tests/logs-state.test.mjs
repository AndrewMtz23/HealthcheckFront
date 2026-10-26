import {test} from 'node:test';import assert from 'node:assert/strict';import {loadTs} from './support/load-ts.mjs';
const state=loadTs('components/admin/logs/state.ts',{URLSearchParams,Intl,Date});
test('Logs filters round trip and reset pagination on changes',()=>{
 const query=state.decodeQuery(new URLSearchParams('q=perfil&page=4&limit=50'),new Date('2026-10-16T12:00:00Z'));
 assert.equal(query.page,'4');assert.equal(query.startDate,'2026-10-03');
 assert.deepEqual(state.decodeQuery(new URLSearchParams(state.encodeQuery(query))),query);
 assert.equal(state.changeFilters(query,{q:'otra'}).page,'1');
});
test('actor labels distinguish missing accounts from system and anonymous actors',()=>{
 assert.equal(state.actorLabel({actor_type:'user',user_name:null}),'Cuenta eliminada');
 assert.equal(state.actorLabel({actor_type:'system'}),'Sistema');
 assert.equal(state.actorLabel({actor_type:'anonymous'}),'Anónimo');
});
