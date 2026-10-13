import {test} from 'node:test';import assert from 'node:assert/strict';import {loadTs} from './support/load-ts.mjs';
const {notificationStatus,notificationDetail}=loadTs('components/profile/notificationState.ts');
test('delivery state never implies read status and legacy unsent records are not promised delivery',()=>{
 assert.equal(notificationStatus({tipo:'sms',enviada:true}),'SMS · canal retirado');
 assert.equal(notificationStatus({tipo:'email',enviada:false}),'Sin programación');
 assert.equal(notificationStatus({tipo:'email',delivery_state:'uncertain'}),'Entrega por confirmar');
 assert.equal(notificationStatus({tipo:'email',delivery_state:'failed'}),'No enviada');
 assert.equal(notificationStatus({tipo:'email',delivery_state:'retry'}),'Reintento programado');
 assert.match(notificationDetail({delivery_state:'uncertain'}),/no se reenviará automáticamente/);
});
