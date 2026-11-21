import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),engine=require('../exam-engine.js');
const root=new URL('../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const manifest=read('data/manifest.json'),all=manifest.batches.flatMap(n=>read(`data/batch-${n}.json`).questions),bank=all.filter(q=>q.provenance&&q.batch<=12),byId=new Map(all.map(q=>[q.id,q]));
const close=(a,b)=>Math.abs(a-b)<1e-7*Math.max(1,Math.abs(b));
const near=(a,b,id)=>assert.ok(close(a,b),`${id}: ${a} != ${b}`);
// Small arithmetic parser for stored TeX choices; no generator imports.
function value(tex,vars={}){
 tex=tex.replace(/\\cos(\d+)\^\\circ/g,(_,deg)=>String(Math.cos(+deg*Math.PI/180))).replace(/\\(?:left|right|,|;|!)/g,'').replace(/\s/g,'');let i=0;
 function group(){assert.equal(tex[i++],'{',tex);const v=add();assert.equal(tex[i++],'}',tex);return v;}
 const arg=()=>tex[i]==='{'?group():atom();
 function atom(){let v;
  if(tex.startsWith('\\frac',i)){i+=5;v=arg()/arg();}
  else if(tex.startsWith('\\sqrt',i)){i+=5;v=Math.sqrt(arg());}
  else if(tex[i]==='{')v=group();
  else if(tex[i]==='('){i++;v=add();assert.equal(tex[i++],')',tex);}
  else if(/[0-9.]/.test(tex[i]||'')){const m=tex.slice(i).match(/^\d+(?:\.\d+)?(?:e[+-]?\d+)?/);assert.ok(m,tex);v=+m[0];i+=m[0].length;}
  else {v=vars[tex[i++]];assert.notEqual(v,undefined,tex);}
  if(tex[i]==='^'){i++;v**=tex[i]==='{'?group():unary();}return v;
 }
 function unary(){if(tex[i]==='-'){i++;return -unary();}if(tex[i]==='+'){i++;return unary();}return atom();}
 function mul(){let v=unary();while(i<tex.length&&!/[+\-})=]/.test(tex[i])){if(tex[i]==='/'){i++;v/=unary();}else v*=unary();}return v;}
 function add(){let v=mul();while(tex[i]==='+'||tex[i]==='-'){const sign=tex[i++];v+=(sign==='+'?1:-1)*mul();}return v;}
 const v=add();assert.equal(i,tex.length,tex);assert.ok(Number.isFinite(v),tex);return v;
}
function numeric(q,expected,cases=[{}],transform=x=>x){
 const values=q.options.map(option=>cases.map(vars=>value(transform(option),vars)));
 const targets=cases.map(vars=>typeof expected==='function'?expected(vars):expected);
 const valid=values.map(row=>row.every((v,i)=>close(v,targets[i])));
 assert.equal(valid.filter(Boolean).length,1,q.id+' ambiguous or missing answer');assert.ok(valid[q.answer],q.id+' wrong answer');
 for(let i=0;i<4;i++)for(let j=0;j<i;j++)assert.ok(values[i].some((v,k)=>!close(v,values[j][k])),q.id+' equivalent options');
}
function predicate(q,fn){const valid=q.options.map(fn);assert.equal(valid.filter(Boolean).length,1,q.id);assert.ok(valid[q.answer],q.id);}
const factorial=n=>{let v=1;for(let j=2;j<=n;j++)v*=j;return v;};
function sampleWhite(red,white,draw){let dist=[1];for(let n=0;n<draw;n++){const next=Array(n+2).fill(0);dist.forEach((prob,k)=>{next[k]+=prob*(red-(n-k))/(red+white-n);next[k+1]+=prob*(white-k)/(red+white-n);});dist=next;}return dist[1];}
function binomialShots(p,q){let dist=[1];for(const hit of [p,p,p,q,q,q]){const next=Array(dist.length+1).fill(0);dist.forEach((prob,k)=>{next[k]+=prob*(1-hit);next[k+1]+=prob*hit;});dist=next;}return dist[4];}
function integrate(fn,a,b,n=200){const h=(b-a)/n;let sum=fn(a)+fn(b);for(let i=1;i<n;i++)sum+=(i%2?4:2)*fn(a+i*h);return sum*h/3;}
assert.equal(bank.length,240);assert.equal(new Set(bank.map(q=>q.family)).size,24);
for(const exam of ['dse','macau','gaokao']){
 const group=bank.filter(q=>q.exam===exam);assert.equal(group.length,80);assert.equal(group.filter(q=>q.provenance.kind==='adapted').length,8);
 const config={...engine.defaults(all),sources:[exam],count:8};assert.equal(engine.pool(all,config).length,all.filter(q=>q.exam===exam).length);
 const paper=engine.create(all,Math.random,config);assert.equal(new Set(paper.ids.map(id=>byId.get(id).family)).size,8);assert.deepEqual(engine.restore(paper,all),paper);
}
for(const q of bank){
 const p=q.params,source=q.provenance,base=byId.get(source.baseId);assert.equal(base.family,q.family);assert.equal(base.variant,1);assert.equal(source.kind,q.variant===1?'adapted':'variant');assert.equal(source.url,manifest.examSources[q.exam].url);assert.ok(source.question&&source.page&&source.year);assert.equal(source.checkedDate,'2026-11-20');
 const u=new URL(source.url);assert.equal(u.protocol,'https:');assert.ok(['www.hkeaa.edu.hk','reg.um.edu.mo','gaokao.neea.edu.cn'].includes(u.hostname));
 switch(q.family){
  case 'dse-subject':numeric(q,({A,B,C})=>{const x=C/(p.k*B-A);near((A*x+C)/B,p.k*x,q.id);return x;},[{A:1,B:2,C:3},{A:2,B:5,C:7},{A:-2,B:1,C:-5}]);break;
  case 'dse-inequality':{let n=-20;while(!((5*n+p.b)/4-1<2*n&&3*n+9>=0))n++;numeric(q,n);break;}
  case 'dse-profit':predicate(q,tex=>{const price=value(tex),cost=price/1.4;return close(price*.75-cost,p.profit);});break;
  case 'dse-polar':{const points=[11,60,144].map((r,i)=>{const theta=[59,149,239][i]*Math.PI/180;return [r*p.scale*Math.cos(theta),r*p.scale*Math.sin(theta)];});const perimeter=points.reduce((sum,a,i)=>{const b=points[(i+1)%3];return sum+Math.hypot(a[0]-b[0],a[1]-b[1]);},0);numeric(q,perimeter);break;}
  case 'dse-frequency':predicate(q,tex=>{const k=value(tex);return close((4+k)/(30+k),(4+p.k)/(30+p.k));});break;
  case 'dse-linear':numeric(q,({x})=>x===-3?p.y1:p.y2,[{x:-3},{x:7}]);break;
  case 'dse-frustum':numeric(q,integrate(z=>(p.a*z/p.H)**2,p.h,p.H));break;
  case 'dse-cups':numeric(q,sampleWhite(p.red,p.white,p.draw));break;
  case 'macau-sets':{const B=[-p.r,-2,0,3],expected=B.filter(x=>x*x+(p.r-1)*x-p.r>=0).sort((a,b)=>a-b);predicate(q,tex=>JSON.stringify(tex.replace(/\\[{}]/g,'').split(',').map(Number).sort((a,b)=>a-b))===JSON.stringify(expected));break;}
  case 'macau-reciprocal':{const D=Math.sqrt(p.b*p.b+8),r1=(-p.b+D)/4,r2=(-p.b-D)/4;numeric(q,2**(1/r1+1/r2+2));break;}
  case 'macau-cylinder':{const r=5,h=9;numeric(q,(Math.PI*(r*(1+p.percent/100))**2*(.7*h)/(Math.PI*r*r*h)-1)*100);break;}
  case 'macau-absolute':{const points=[-10,-1,-.99,0,1.99,2,2.01,2.99,3,3.01,5.99,6,6.01,12].map(x=>x+p.shift);predicate(q,tex=>{const intervals=[...tex.matchAll(/\(([^,]+),([^\)]+)\)/g)].map(m=>m.slice(1).map(x=>x.includes('infty')?(x[0]==='-'?-Infinity:Infinity):+x));return points.every(x=>intervals.some(([lo,hi])=>x>lo&&x<hi)===(Math.abs((x-p.shift)*(x-p.shift-5))<6));});break;}
  case 'macau-seating':{const memo=new Map();const count=(g,b,last)=>{if(!g&&!b)return 1;const key=[g,b,last].join();if(memo.has(key))return memo.get(key);const n=(g?count(g-1,b,false):0)+(b&&!last?count(g,b-1,true):0);memo.set(key,n);return n;};numeric(q,count(p.girls,p.boys,false)*factorial(p.girls)*factorial(p.boys));break;}
  case 'macau-chord':{let shortest=Infinity;for(let j=0;j<=4000;j++){const t=j*Math.PI/4000,d=Math.abs(-Math.sin(t)-Math.cos(t));shortest=Math.min(shortest,2*Math.sqrt(p.r*p.r-d*d));}numeric(q,shortest);break;}
  case 'macau-focus':predicate(q,tex=>{const parameter=value(tex),x=Math.sqrt(7*parameter);return close(Math.hypot(x,-7+parameter/4),p.L);});break;
  case 'macau-shooters':numeric(q,binomialShots(p.pNumerator/p.pDenominator,p.qNumerator/p.qDenominator));break;
  case 'gaokao-power':predicate(q,tex=>{const expr=tex.replace('f(x)=',''),f=x=>value(expr,{x}),derivative=x=>{const h=1e-4;return(f(x+h)-f(x-h))/(2*h);};return [[2,3],[-1,2],[-2,-3]].every(([a,b])=>close(f(a*b),f(a)*f(b)))&&[.5,1,2].every(x=>derivative(x)>0&&close(derivative(x),-derivative(-x)));});break;
  case 'gaokao-triangle':{const a=4*p.d,b=a+p.d,c=a+2*p.d,cos=(b*b+c*c-a*a)/(2*b*c);assert.ok(a+b>c);numeric(q,b*c*Math.sqrt(1-cos*cos)/2);break;}
  case 'gaokao-locus':predicate(q,tex=>[.5,1,2].every(y=>{const c=Math.sqrt(p.c2),x=Math.sqrt(1+y*y/(p.c2-1));near(Math.abs(Math.hypot(x+c,y)-Math.hypot(x-c,y)),2,q.id);return close(value(tex.split('=')[0],{x,y}),1);}));break;
  case 'gaokao-branching':{const outcomes=p.weights.flatMap((n,k)=>Array(n).fill(k));assert.equal(outcomes.length,p.denominator);numeric(q,outcomes.reduce((a,b)=>a+b,0)/outcomes.length);break;}
  case 'gaokao-earthquake':predicate(q,tex=>close(5+Math.log10(value(tex)),+p.level));break;
  case 'gaokao-normal':{const mu=p.mu,fmt=x=>Number(x.toFixed(5));const falseStatement=`P(${fmt(mu-.1)}<X<${fmt(mu+.2)})=P(${fmt(mu)}<X<${fmt(mu+.3)})`;predicate(q,tex=>tex===falseStatement);for(const sigma of [.2,1,3]){const pdf=x=>Math.exp(-0.5*((x-mu)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI));assert.ok(integrate(pdf,mu-.1,mu+.2)>integrate(pdf,mu,mu+.3));near(integrate(pdf,mu-8*sigma,mu),.5,q.id);}break;}
  case 'gaokao-unit-vectors':{const rad=x=>x*Math.PI/180,a=p.beta,b=p.alpha+p.beta;numeric(q,Math.cos(rad(a))*Math.cos(rad(b))+Math.sin(rad(a))*Math.sin(rad(b)));break;}
  case 'gaokao-cube':{let max=0;for(let i=0;i<=20;i++)for(let j=0;j<=20;j++){const AB=[p.a,0,0],AP=[p.a,p.a*i/20,p.a*j/20],cross=[0,-AB[0]*AP[2],AB[0]*AP[1]];max=Math.max(max,Math.hypot(...cross)/2);}numeric(q,max);break;}
  default:throw Error('Unaudited family '+q.family);
 }
 if(q.diagram){assert.match(q.diagram.src,/^assets\/geometry\/M\d{4}\.svg$/);const svg=fs.readFileSync(new URL(q.diagram.src,root),'utf8');assert.match(svg,/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 420 325"/);assert.match(svg,/<title[^>]*>[^<]+<\/title>/);assert.ok(!/NaN|undefined|<script|<image|foreignObject|href=|url\(/.test(svg),q.id);}
}
assert.equal(bank.filter(q=>q.diagram).length,80);
// Old saved papers keep their original three sources and remain restorable.
const old=all.filter(q=>q.batch<=9),legacy=engine.create(old,Math.random,{...engine.defaults(old),count:7});assert.deepEqual(engine.restore(legacy,all),legacy);
console.log('PASS: 24 sourced families / 240 questions; independent numerical, enumeration and boundary audits; 80 local SVGs; attribution, variants, source pools and old saved papers.');
