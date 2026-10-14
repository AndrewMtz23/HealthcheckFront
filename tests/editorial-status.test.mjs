import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {loadTs} from './support/load-ts.mjs';
test('editorial labels never turn publication or model output into human verification',()=>{
 assert(fs.existsSync('src/components/news/editorialLabels.ts'),'editorial labels must exist');const {editorialLabels}=loadTs('components/news/editorialLabels.ts');
 const legacy=editorialLabels({editorial_origin:'legacy',human_reviewed:false,analysis_status:'outdated'});assert.match(legacy.review,/Sin revisión/);assert.match(legacy.analysis,/anterior/);
 const reviewed=editorialLabels({human_reviewed:true,analysis_status:'none'});assert.match(reviewed.review,/Revisión editorial/);assert.match(reviewed.analysis,/Sin análisis/);assert(!reviewed.review.includes('verificada'));
});
