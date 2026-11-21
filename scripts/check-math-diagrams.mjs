import assert from 'node:assert/strict';
import fs from 'node:fs';
import {legacyScene} from './math/legacy-diagrams.mjs';
import {expansionScene} from './math/expansion-diagrams.mjs';
import {sceneSVG} from './math/geometry.mjs';
import {near} from './math/audit-tex.mjs';
const root=new URL('../',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('data/manifest.json',root),'utf8')),all=manifest.batches.flatMap(n=>JSON.parse(fs.readFileSync(new URL(`data/batch-${n}.json`,root),'utf8')).questions),figures=all.filter(q=>q.diagram),legacy=figures.filter(q=>q.batch<=9);
assert.equal(legacy.length,550);assert.equal(new Set(legacy.map(q=>q.family)).size,55);assert.equal(figures.length,1010);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const point=(scene,name)=>scene.objects.find(o=>o.type==='point'&&o.label===name)?.points[0];
for(const q of figures){
 assert.match(q.diagram.src,/^assets\/geometry\/M\d{4}\.svg$/);assert.ok(q.diagram.alt.length>5);
 const svg=fs.readFileSync(new URL(q.diagram.src,root),'utf8');assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 420 325"/);assert.match(svg,/<title[^>]*>[^<]+<\/title>/);assert.ok(!/NaN|undefined|<script|foreignObject|<image|href=|url\(/.test(svg),q.id);
 if(q.batch<=9||q.batch>=13){const scene=q.batch<=9?legacyScene(q):expansionScene(q.figure);assert.equal(svg,sceneSVG(scene),q.id+' stale diagram');for(const o of scene.objects)for(const p of o.points)assert.ok(p.every(Number.isFinite),q.id);}
 if(q.batch>9)continue;
 const scene=legacyScene(q),f=q.family,a=q.variant+1;
 if(f==='triangle-easy-1'){const lines=scene.objects.filter(o=>o.type==='line');near(dist(...lines[0].points),3*a,q.id);near(dist(...lines[1].points),4*a,q.id);near(dist(...lines[2].points),5*a,q.id);}
 if(f==='triangle-medium-1'){const A=point(scene,'A'),B=point(scene,'B'),C=point(scene,'C');near(dist(A,C),a,q.id);near(dist(B,C),a,q.id);near(dist(A,B),a+1,q.id);}
 if(f==='triangle-medium-2'){const A=point(scene,'A = 60°'),B=point(scene,'B'),C=point(scene,'C');near(dist(A,B),a,q.id);near(dist(A,C),a+1,q.id);near((B[0]*C[0]+B[1]*C[1])/(dist(A,B)*dist(A,C)),.5,q.id);}
 if(f.startsWith('triangle-hard')){const A=point(scene,'A = 60°'),B=point(scene,'B'),C=point(scene,'C'),circle=scene.objects.find(o=>o.type==='ellipse'),I=circle.points[0];if(f==='triangle-hard-1')near(dist(A,B)+dist(A,C),2*a,q.id);else near(circle.rx,a,q.id);for(const [p,r] of [[A,B],[A,C],[B,C]])near(Math.abs((r[0]-p[0])*(I[1]-p[1])-(r[1]-p[1])*(I[0]-p[0]))/dist(p,r),circle.rx,q.id);}
 if(f==='vectors-medium-1'){const u=point(scene,'u'),v=point(scene,'v');near(u[0]*v[0]+u[1]*v[1],0,q.id);}
 if(f.startsWith('ellipse-')){const ellipse=scene.objects.find(o=>o.type==='ellipse');for(const name of ['A','B','P']){const p=point(scene,name);if(p)near(p[0]**2/ellipse.rx**2+p[1]**2/ellipse.ry**2,1,q.id);}}
 if(f==='hyperbola-hard-1'||f==='hyperbola-hard-2'){const p=point(scene,'P');near(f==='hyperbola-hard-1'?p[0]**2/(a*a)-p[1]**2:p[0]**2-p[1]**2/(a*a),1,q.id);}
 if(f.startsWith('parabola-'))for(const name of ['A','B','P']){const p=point(scene,name);if(p)near(p[1]**2,4*a*p[0],q.id);}
 if(f==='line-circle-hard-2'){const A=point(scene,'A'),B=point(scene,'B'),P=point(scene,'P');for(const T of [A,B]){near(Math.hypot(...T),a,q.id);near(T[0]*(P[0]-T[0])+T[1]*(P[1]-T[1]),0,q.id);}}
 if(f==='hell-17'){const fractions=[[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6]],p=point(scene,'P'),A=point(scene,'A'),B=point(scene,'B'),T=point(scene,'T');near(p[0],fractions[q.variant-1][0]/fractions[q.variant-1][1],q.id);for(const v of [A,B]){near(Math.hypot(...v),1,q.id);near(v[0]*(T[0]-v[0])+v[1]*(T[1]-v[1]),0,q.id);}}
}
// Optional comparison with the snapshot made before this expansion: adding
// diagrams must not change old stems, answers, versions or IDs.
const snapshot=new URL('.cache/pre-expansion-bank.json',root);
if(fs.existsSync(snapshot)){const old=JSON.parse(fs.readFileSync(snapshot,'utf8')),map=new Map(all.map(q=>[q.id,q]));for(const q of old){const {diagram,difficulty,difficultyLabel,targetSeconds,difficultyReview,...before}=q,{diagram:afterDiagram,difficulty:afterLevel,difficultyLabel:afterLabel,targetSeconds:afterTime,difficultyReview:afterReview,...after}=map.get(q.id);assert.deepEqual(after,before,q.id+' old content changed');}}
console.log('PASS: 550 retrofitted diagrams across 55 old families; 1010 local SVGs, synchronized parameters, conic incidences, triangle dimensions, tangencies, perpendicularity and preserved old questions.');
