import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {difficultyRevision,difficultyLevels,difficultyReviews} from './math/difficulty-review.mjs';
const root=new URL('../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8')),manifest=read('data/manifest.json'),all=manifest.batches.flatMap(n=>read(`data/batch-${n}.json`).questions),reviewed=all.filter(q=>q.batch>=10),byId=new Map(all.map(q=>[q.id,q]));
const require=createRequire(import.meta.url),engine=require('../exam-engine.js');
assert.equal(manifest.difficultyRevision,difficultyRevision);assert.equal(engine.difficultyRevision,difficultyRevision);
assert.equal(Object.keys(difficultyReviews).length,124);assert.equal(reviewed.length,1240);
const counts={easy:0,medium:0,hard:0,hell:0};let changed=0;
for(const q of reviewed){const review=difficultyReviews[q.family],old=q.difficultyReview;assert.ok(review,q.id);assert.equal(q.difficulty,review.level);assert.equal(q.difficultyLabel,difficultyLevels[review.level].label);assert.equal(q.targetSeconds,difficultyLevels[review.level].seconds);assert.equal(old.reason,review.reason);assert.equal(old.revision,difficultyRevision);assert.ok(Object.hasOwn(difficultyLevels,old.previousLevel));assert.ok(old.reason.length>15);assert.equal(q.contentRevision,1,q.id+' content version must not change for a rating change');counts[q.difficulty]++;if(q.difficulty!==old.previousLevel)changed++;}
assert.deepEqual(counts,{easy:60,medium:750,hard:410,hell:20});assert.equal(changed,620);
assert.deepEqual([...new Set(reviewed.filter(q=>q.difficulty==='hell').map(q=>q.family))],['expansion-55','expansion-58']);
for(const q of all.filter(q=>q.batch<=9))assert.equal(q.difficultyReview,undefined);
const snapshots=['.cache/pre-difficulty-review-bank.json'];
for(const path of snapshots){const url=new URL(path,root);if(!fs.existsSync(url))continue;const old=read(path);assert.equal(old.length,all.length);for(const q of old){const {difficulty,difficultyLabel,targetSeconds,difficultyReview,...before}=q,{difficulty:nextLevel,difficultyLabel:nextLabel,targetSeconds:nextTime,difficultyReview:nextReview,...after}=byId.get(q.id);assert.deepEqual(after,before,q.id+' changed question content');if(nextReview)assert.equal(nextReview.previousLevel,difficulty);else{assert.equal(nextLevel,difficulty);assert.equal(nextTime,targetSeconds);}}}
const previous=all.map(q=>q.difficultyReview?{...q,difficulty:q.difficultyReview.previousLevel}:q);
const oldPaper=(options)=>{const raw=engine.create(previous,()=>.37,options);delete raw.difficultyRevision;return raw;};
// One newly promoted family and one newly demoted family; old exact quotas
// and range must validate using the prior metadata before migration.
const defaultOld=engine.defaults(previous);
for(const submitted of [false,true]){
 const old=oldPaper({...defaultOld,count:2,levels:['hard'],questionIds:['M3181','M3241'],difficultyCounts:{easy:0,medium:0,hard:2,hell:0}});old.answers={M3181:byId.get('M3181').answer};old.elapsed=12345;old.submitted=submitted;
 const migrated=engine.restore(JSON.parse(JSON.stringify(old)),all);assert.ok(migrated);assert.equal(migrated.difficultyMigrated,true);assert.equal(migrated.difficultyRevision,1);assert.deepEqual(migrated.ids,old.ids);assert.deepEqual(migrated.answers,old.answers);assert.equal(migrated.elapsed,old.elapsed);assert.equal(migrated.submitted,submitted);assert.equal(migrated.createdAt,old.createdAt);assert.deepEqual(migrated.revisions,old.revisions);assert.deepEqual(migrated.config.difficultyCounts,{easy:1,medium:0,hard:0,hell:1});assert.equal(migrated.config.mode,'custom');assert.deepEqual(engine.grade(migrated,all),engine.grade(old,previous));assert.deepEqual(engine.restore(JSON.parse(JSON.stringify(migrated)),all),migrated);
 const invalid=JSON.parse(JSON.stringify(old));invalid.config.sources=['gaokao'];assert.equal(engine.restore(invalid,all),null);
 const changedAnswer=JSON.parse(JSON.stringify(old));changedAnswer.revisions.M3181=99;assert.equal(engine.restore(changedAnswer,all),null);
 const wrongQuota=JSON.parse(JSON.stringify(old));wrongQuota.config.difficultyCounts={easy:0,medium:1,hard:1,hell:0};wrongQuota.config.levels=['medium','hard'];assert.equal(engine.restore(wrongQuota,all),null);
}
const fixed=oldPaper({mode:'standard'}),restoredFixed=engine.restore(fixed,all);assert.ok(restoredFixed);assert.deepEqual(restoredFixed.ids,fixed.ids);assert.equal(engine.grade(restoredFixed,all).score,0);
const unchanged=oldPaper({...defaultOld,count:2,questionIds:['M0001','M0002'],levels:['easy'],difficultyCounts:{easy:2,medium:0,hard:0,hell:0}}),unchangedRestored=engine.restore(unchanged,all);assert.ok(unchangedRestored);assert.deepEqual(unchangedRestored.config,unchanged.config);assert.equal(unchangedRestored.difficultyMigrated,undefined);
const future={...unchanged,difficultyRevision:999};assert.equal(engine.restore(future,all),null);
const newHell=engine.create(all,Math.random,{...engine.defaults(all),count:20,levels:['hell'],sources:['macau'],difficultyCounts:{easy:0,medium:0,hard:0,hell:20}});assert.ok(newHell.ids.every(id=>byId.get(id).difficulty==='hell'));assert.equal(engine.target(newHell,all),12000);assert.deepEqual(engine.restore(newHell,all),newHell);
console.log('PASS: 124 manually reviewed families; 620 reclassified questions, 20 new hell questions, labels/times and content preserved; old exact-quota papers migrated, grading/answers/timing preserved, invalid data rejected.');
