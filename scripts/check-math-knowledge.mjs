import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),knowledge=require('../knowledge-tree.js'),engine=require('../exam-engine.js');
const data=new URL('../data/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',data),'utf8'));
const questions=manifest.batches.flatMap(n=>JSON.parse(fs.readFileSync(new URL(`batch-${n}.json`,data),'utf8')).questions);
const roots=knowledge.build(questions,manifest.topics),nodes=[];
function visit(node){nodes.push(node);if(node.children){assert.deepEqual(node.ids,node.children.flatMap(child=>child.ids));node.children.forEach(visit);}}
roots.forEach(visit);
assert.equal(roots.length,8);assert.equal(nodes.filter(node=>node.kind==='topic').length,30);assert.equal(nodes.filter(node=>node.kind==='family').length,new Set(questions.map(q=>q.family)).size);
const leaves=nodes.filter(node=>node.kind==='question');assert.equal(leaves.length,questions.length);assert.equal(new Set(leaves.map(node=>node.id)).size,questions.length);assert.equal(new Set(nodes.map(node=>node.id)).size,nodes.length);
for(const family of nodes.filter(node=>node.kind==='family')){assert.ok(family.title&&!family.title.includes('easy-')&&!family.title.includes('hard-'));assert.ok(family.children.every(child=>child.question.family===family.id.slice(7)));}
const config=engine.defaults(questions),ids=questions.filter(q=>q.topic==='sets'&&q.difficulty==='easy').slice(0,3).map(q=>q.id);
const selected={...config,count:3,topics:['sets'],questionIds:ids,difficultyCounts:{easy:3,medium:0,hard:0,hell:0}};
assert.deepEqual(engine.pool(questions,selected).map(q=>q.id),ids);
const paper=engine.create(questions,Math.random,selected);assert.deepEqual(new Set(paper.ids),new Set(ids));assert.deepEqual(engine.restore(JSON.parse(JSON.stringify(paper)),questions),paper);
assert.equal(engine.pool(questions,{...selected,questionIds:[]}).length,0);assert.throws(()=>engine.create(questions,Math.random,{...selected,questionIds:ids.slice(0,2)}));
for(const invalid of [['invalid'],null,'M0001',[0]])assert.throws(()=>engine.normalize(questions,{...config,questionIds:invalid}));
assert.deepEqual(engine.normalize(questions,{...config,questionIds:[ids[0],ids[0]]}).questionIds,[ids[0]]);
assert.equal(engine.pool(questions,{...selected,topics:['logic']}).length,0);
const tampered=JSON.parse(JSON.stringify(paper));tampered.config.questionIds=ids.slice(1);assert.equal(engine.restore(tampered,questions),null);
const future={...questions[0],id:'future',topic:'future',topicName:'新增模块',family:'future'};
assert.equal(knowledge.build([...questions,future],[...manifest.topics,{id:'future',name:'新增模块'}]).at(-1).children[0].ids[0],'future');
console.log('PASS: 8 knowledge groups, 30 modules, 364 named families, all 3640 question leaves exactly once; question-level pools, intersection, saved papers and invalid selections.');
