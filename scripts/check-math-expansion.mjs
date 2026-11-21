import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {value,close,near,numeric,predicate,coord,integrate,choose,bernoulli} from './math/audit-tex.mjs';
const root=new URL('../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8')),manifest=read('data/manifest.json'),all=manifest.batches.flatMap(n=>read(`data/batch-${n}.json`).questions),bank=all.filter(q=>q.batch>=13),byId=new Map(all.map(q=>[q.id,q]));
const require=createRequire(import.meta.url),engine=require('../exam-engine.js');
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),norm=a=>Math.hypot(...a);
const line=(tex,points)=>{const [lhs,rhs]=tex.split('=');return points.every(([x,y])=>close(value(lhs,{x,y}),value(rhs,{x,y})));};
const exact=(q,expected)=>predicate(q,x=>x===expected);
assert.equal(bank.length,1000);assert.equal(new Set(bank.map(q=>q.family)).size,100);assert.equal(new Set(bank.map(q=>q.strategy)).size,100);
for(const q of bank){
 const p=q.params,s=q.variant-1,f=+q.family.split('-')[1],source=q.provenance,doc=manifest.sourceDocuments[source.documentId];assert.ok(doc,q.id);assert.equal(source.url,doc.url);assert.equal(source.year,doc.year);assert.equal(q.exam,doc.exam);assert.equal(source.checkedDate,'2026-11-21');assert.equal(byId.get(source.baseId).family,q.family);assert.ok(source.page&&source.question);assert.ok(source.adaptation);assert.equal(source.kind==='variant',s>0);
 switch(f){
 case 1:numeric(q,({m})=>(m**(p.k-.5)-m**-.5)/(Math.sqrt(m)+m**-.5),[{m:.7},{m:1.4},{m:2.1}]);break;
 case 2:numeric(q,Math.log(7/(5*p.b))/Math.log(p.b),[{p:Math.log(5)/Math.log(p.b),q:Math.log(7)/Math.log(p.b)}]);break;
 case 3:{const x=p.median+1,vals=[2,3,4,-4,-5,-6].map(v=>v+x).sort((a,b)=>a-b);near((vals[2]+vals[3])/2,p.median,q.id);numeric(q,vals.reduce((a,b)=>a+b)/6);break;}
 case 4:{let poly=[1];for(let i=0;i<p.n;i++){const next=Array(poly.length+1).fill(0);poly.forEach((v,j)=>{next[j]+=v;next[j+1]+=v;});poly=next;}numeric(q,poly[5]+poly[2]);break;}
 case 5:{const a=p.a,d=-a/2,sn=n=>Array.from({length:n},(_,i)=>a+i*d).reduce((a,b)=>a+b,0);near(2*sn(3)**2,3*sn(2)*sn(4),q.id);numeric(q,a+6*d);break;}
 case 6:{const vertices=[[-3*p.k,-p.k],[11*p.k/3,-p.k],[p.k,p.k]];for(const [x,y] of vertices){assert.ok(3*x+4*y<=7*p.k+1e-7&&x-2*y>=-p.k-1e-7&&y>=-p.k);}numeric(q,Math.max(...vertices.map(([x,y])=>3*x+y)));break;}
 case 7:{let x=p.n/2;while(x<4)x+=2;while(x>6)x-=2;numeric(q,1+Math.abs(x-5));break;}
 case 8:numeric(q,({n})=>(n*n+p.b*n)-((n-1)**2+p.b*(n-1)),[{n:1},{n:3},{n:9}]);break;
 case 9:{let sum=0;for(let k=1;k<=p.n;k++)sum+=2*(2*k+1)*3**(k-1);numeric(q,sum);break;}
 case 10:predicate(q,tex=>{const qv=value(tex);return close(10*(5-qv),p.remainder);});break;
 case 11:{const D=p.q*p.q-24;assert.ok(D>0);numeric(q,2);break;}
 case 12:{const C=2*Math.atan(2/p.k);near(Math.sin(C),p.k*Math.sin(C/2)**2,q.id);numeric(q,Math.cos(C));break;}
 case 13:{const C=2*Math.atan(2/p.k),B=Math.PI-Math.PI/4-C;assert.ok(B>0);numeric(q,Math.sin(2*B));break;}
 case 14:predicate(q,tex=>{if(!tex.includes('x\\ne'))return false;return [.4,.7,1.2].every(t=>{const x=Math.sqrt(p.c2)*Math.cos(t),y=Math.sqrt(p.c2/2)*Math.sin(t);near(y*y/(x*x-p.c2),-.5,q.id);return line(tex.split(',')[0],[[x,y]]);});});break;
 case 15:{const a=1/8+p.k*p.k/4,b=p.k/2,c=-.75,D=b*b-4*a*c,x1=(-b+Math.sqrt(D))/(2*a),x2=(-b-Math.sqrt(D))/(2*a),xm=(x1+x2)/2,ym=p.k*xm+1;numeric(q,ym/xm);break;}
 case 16:{const t=p.t;exact(q,`[${t-2},${t}]`);for(const x of [t-2-.01,t-2,t,t+.01,t+1,t+2])assert.equal((x-(t-2))*(x-(t+1))<=0&&Math.abs(x-t-1)>=1,x>=t-2&&x<=t);break;}
 case 17:predicate(q,tex=>{const x=value(tex);return close((3*x+5)/(2-x),p.c);});break;
 case 18:{const a=-p.c,b=-p.k;for(const x of [-3,0,8])near(p.k*x-a,p.c-b*x,q.id);numeric(q,a-b);break;}
 case 19:{exact(q,`k<${p.h*p.h}`);for(const k of [p.h*p.h-1,p.h*p.h,p.h*p.h+1])assert.equal(4*p.h*p.h-4*k>0,k<p.h*p.h);break;}
 case 20:{const expected=(1n+3n**BigInt(p.n+1))/4n;predicate(q,tex=>{const m=tex.match(/^\\frac\{1\+3\^\{(\d+)\}\}\{4\}$/);return !!m&&(1n+3n**BigInt(m[1]))/4n===expected;});break;}
 case 21:{const D=Math.sqrt(p.b*p.b-8),r1=(p.b+D)/4,r2=(p.b-D)/4;numeric(q,r1*r1+r2*r2);break;}
 case 22:{const a=2,b=a**(p.x-1);numeric(q,Math.log(a*b)/Math.log(b));break;}
 case 23:{const k=p.k,T=[-4*k,-k],C=[-k,3*k],dir=[4,-3];near(Math.hypot(T[0]-C[0],T[1]-C[1]),5*k,q.id);predicate(q,tex=>line(tex,[T,[T[0]+dir[0],T[1]+dir[1]]]));break;}
 case 24:{const a=3,b=(p.y+36-8*a)/2,f=x=>a*x**3-8*x*x+b*x-4;near(f(2),p.y,q.id);numeric(q,f(-2));break;}
 case 25:{let count=0;const n=p.boys+4;for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++)for(let d=c+1;d<n;d++)for(let e=d+1;e<n;e++){const boys=[a,b,c,d,e].filter(v=>v<p.boys).length;if(boys>=3&&boys<=4)count++;}numeric(q,count);break;}
 case 26:{const roots=[0,3].map(v=>v+p.t);for(const x of roots){const u=x-p.t;near(Math.sqrt(3*u*u-4*u+1)-Math.sqrt(3*u*u-2*u+4),-1,q.id);}exact(q,`\\{${p.t},${p.t+3}\\}`);break;}
 case 27:{const t=(-p.k-1)/(1-p.k),sin=2*t/(1+t*t),cos=(1-t*t)/(1+t*t);near((1+t)/(1-t),-p.k,q.id);numeric(q,(1-sin)/cos);break;}
 case 28:{const a=p.sum/(3**2+3**4),seq=n=>a*3**(n-1);near(2*(seq(1)+seq(2)+seq(3)),seq(4)-seq(1),q.id);numeric(q,seq(5)+seq(7));break;}
 case 29:{exact(q,`a\\le${1-p.k}`);for(const a of [1-p.k-1,1-p.k,2-p.k]){const x=-1+1e-4,der=-2*p.k*x+2*(a-1);assert.equal(der<0,a<=1-p.k);}break;}
 case 30:exact(q,'[0,+\\infty)');break;
 case 31:numeric(q,bernoulli([(p.den-1)/p.den,2/3,1/2])[2]);break;
 case 32:{const A=bernoulli([3/4,2/3,1/2]),B=bernoulli(Array(3).fill((p.den-1)/p.den));let result=0;for(let a=0;a<=3;a++)for(let b=0;b<=3;b++)if(a+b===3&&b>a)result+=A[a]*B[b];numeric(q,result);break;}
 case 33:{const c=p.c;exact(q,`P(0,${c}),\\ Q(2,${c+4})`);for(const x of [0,1,2,3,4])assert.ok(-x*x+4*x+c<=c+4);break;}
 case 34:{const A=[0,p.c],B=[2,p.c+4],x=p.c/(p.c+2),min=Math.hypot(x,p.c)+Math.hypot(2-x,p.c+4);numeric(q,min);break;}
 case 35:{const a=12*p.scale,d=8*p.scale;near(a+4*d,44*p.scale,q.id);near(Array.from({length:5},(_,i)=>a+i*d).reduce((a,b)=>a+b),140*p.scale,q.id);numeric(q,({n})=>a+(n-1)*d,[{n:1},{n:5},{n:9}]);break;}
 case 36:{let sum=0;for(let i=1;i<=p.n;i++)sum+=1/(4*i*(i+2));numeric(q,sum);break;}
 case 37:{const bound=3/(4*p.k),partial=Array.from({length:50000},(_,i)=>1/(p.k*(i+1)*(i+3))).reduce((a,b)=>a+b);assert.ok(partial<bound&&bound-partial<1e-5);numeric(q,bound);break;}
 case 38:{const t=p.t;predicate(q,tex=>line(tex,[[2*t*Math.sqrt(3),2*t],[2*t,0]]));break;}
 case 39:{let x=p.k/2;for(let i=1;i<5;i++)x=p.k*x/(x+p.k);numeric(q,x);break;}
 case 40:{const x=Math.sqrt(p.k),g=x=>p.k*x/(x*x+p.k);for(const y of [.1,1,x,10,30])assert.ok(g(y)<=g(x)+1e-8);numeric(q,g(x));break;}
 case 41:numeric(q,Math.sqrt(p.a*p.a-(p.a/2)**2));break;
 case 42:{const A=[p.a,0,0],D=[0,p.a,0],V=[0,p.a/2,p.a*Math.sqrt(3)/2];numeric(q,Math.abs(dot(A,cross(D,V)))/3);break;}
 case 43:{const V=[0,.5,Math.sqrt(3)/2],D=[0,1,0],B=[1,0,0],normal=cross(sub(V,D),sub(B,D)),c=Math.abs(normal[0])/norm(normal);numeric(q,Math.sqrt(1-c*c)/c);break;}
 case 44:{const a=p.a,V=[0,a/2,a*Math.sqrt(3)/2],base=[[0,0,0],[a,0,0],[a,a,0],[0,a,0]];let area=a*a;for(let i=0;i<4;i++)area+=norm(cross(sub(base[i],V),sub(base[(i+1)%4],V)))/2;numeric(q,area);break;}
 case 45:{const a=p.a,fn=x=>x**3+3*a*x*x-4*a**3;near(fn(a),0,q.id);near(fn(-2*a),0,q.id);exact(q,`x=${a}\\ (\\text{单根}),\\ x=-${2*a}\\ (\\text{二重根})`);break;}
 case 46:{const a=p.a;predicate(q,tex=>{const vals=tex.split(',').map(x=>value(x));return close(vals[0],0)&&close(vals[1],-4*a**3);});break;}
 case 47:predicate(q,tex=>{const [x,y]=coord(tex),a=p.a;return close(6*x+6*a,0)&&close(y,x**3+3*a*x*x-4*a**3);});break;
 case 48:{const a=p.a;numeric(q,integrate(x=>Math.abs((x**3+3*a*x*x-4*a**3)-(x**3-3*a*a*x+2*a**3)),-2*a,a));break;}
 case 49:predicate(q,tex=>line(tex,[[0,-p.t],[2*p.t,p.t]]));break;
 case 50:predicate(q,tex=>{const [x1,y1,x2,y2]=coord(tex);return close(y1,0)&&close(y2,0)&&close(x1,-p.t)&&close(x2,p.t);});break;
 case 51:predicate(q,tex=>{const [a,b]=coord(tex);return a>b&&close(b,p.t)&&close(a*a-b*b,p.t*p.t);});break;
 case 52:predicate(q,tex=>{const m=value(tex.replace('m=\\pm',''));return close(m*m,3*p.t*p.t);});break;
 case 53:{const zRe=-p.r/2;numeric(q,2*zRe);break;}
 case 54:{const n=p.n;predicate(q,tex=>{const m=tex.match(/^8\^\{(\d+)\}(z(?:\^2)?)?$/);return !!m&&3*+m[1]+(m[2]==='z^2'?2:m[2]?1:0)===n;});break;}
 case 55:{const m=p.m,roots=new Set();for(let j=1;j<2*m;j++)roots.add((j/m).toFixed(14));for(let j=1;j<2*m+1;j++)roots.add((2*j/(2*m+1)).toFixed(14));for(const r of roots){const theta=+r*Math.PI;near(Array.from({length:2*m},(_,j)=>Math.sin((j+1)*theta)).reduce((a,b)=>a+b),0,q.id);}numeric(q,roots.size);break;}
 case 56:{const a=p.a,E=[0,0,a],C=[a,a,0],G=[a,a,a],u=sub(E,C);numeric(q,Math.abs(dot(sub(G,C),u))/norm(u));break;}
 case 57:{const a=p.a,E=[0,0,a],B=[a,0,0],D=[0,a,0],G=[a,a,a],n=cross(sub(D,B),sub(G,B));numeric(q,Math.abs(dot(sub(E,B),n))/norm(n));break;}
 case 58:{const a=p.a,side=a*Math.sqrt(2),R=side/Math.sqrt(3),H=2*a/Math.sqrt(3);numeric(q,Math.PI*R*R*H/3);break;}
 case 59:exact(q,`(-\\infty,-${p.a===3?'1':p.a%3===0?String(p.a/3):'\\frac{'+p.a+'}{3}'})\\quad\\text{和}\\quad(${p.a},+\\infty)`);break;
 case 60:predicate(q,tex=>{const [x,y]=coord(tex),a=p.a;return close(6*x-2*a,0)&&close(y,x**3-a*x*x-a*a*x);});break;
 case 61:{const a=p.a,x=2*a;numeric(q,-(x**3-a*x*x-a*a*x));break;}
 case 62:{const a=p.a,fn=x=>x**3-a*x*x-2*a*a*x;numeric(q,integrate(fn,-a,0)-integrate(fn,0,2*a));break;}
 case 63:predicate(q,tex=>{const [x,y]=coord(tex),t=p.t;return x>0&&y>0&&close(x*x+y*y,5*t*t)&&close(x*x/(9*t*t)+y*y/(4*t*t),1);});break;
 case 64:predicate(q,tex=>{const [x,y]=coord(tex),t=p.t;return !close(x,3*t/Math.sqrt(5))&&close(y,-2*x+2*t*Math.sqrt(5))&&close(x*x/(9*t*t)+y*y/(4*t*t),1);});break;
 case 65:{const t=p.t,Q=[3*t/Math.sqrt(5),4*t/Math.sqrt(5)],M=[6*t/Math.sqrt(5),-2*t/Math.sqrt(5)],F=[-t*Math.sqrt(5),0],u=sub(Q,M),v=sub(F,M);numeric(q,Math.abs(u[0]*v[1]-u[1]*v[0])/dot(u,v));break;}
 case 66:{const t=p.t,Q=[3*t/Math.sqrt(5),4*t/Math.sqrt(5)],M=[6*t/Math.sqrt(5),-2*t/Math.sqrt(5)],F=[-t*Math.sqrt(5),0],u=sub(Q,M),v=sub(F,M);numeric(q,Math.abs(u[0]*v[1]-u[1]*v[0])/norm(v));break;}
 case 67:numeric(q,Math.acos(Math.cos(Math.PI/p.n)));break;
 case 68:numeric(q,Math.acos(Math.cos(Math.PI/p.n))/2);break;
 case 69:numeric(q,p.k*Math.cos(Math.PI/12));break;
 case 70:{const c=p.c,mat=[[1,1,1],[1,2,16],[1,c,c**4]],D=mat[0][0]*(mat[1][1]*mat[2][2]-mat[1][2]*mat[2][1])-mat[0][1]*(mat[1][0]*mat[2][2]-mat[1][2]*mat[2][0])+mat[0][2]*(mat[1][0]*mat[2][1]-mat[1][1]*mat[2][0]);numeric(q,D);break;}
 case 71:numeric(q,({k})=>(3*p.a+k*k)/(p.a-k),[{k:1},{k:2},{k:-2}]);break;
 case 72:numeric(q,({x,y})=>x**(-p.a)*y/(x**7*y**9)**-6,[{x:1.1,y:1.2},{x:.9,y:1.1}]);break;
 case 73:exact(q,`[${215*p.n},${225*p.n})`);break;
 case 74:{let count=0;for(let x=-100;x<0;x++)if(3*x+2>(4*x-p.k)/2&&3*x-2<7)count++;numeric(q,count);break;}
 case 75:predicate(q,tex=>{const men=value(tex),women=men*1.4;return close(men,(women-p.leave)*1.4)&&women-p.leave>=0;});break;
 case 76:predicate(q,tex=>{const c=value(tex),a=6/7,b=1;return close((4*a-3*c)/(2*b-c),p.k);});break;
 case 77:numeric(q,(p.k*6+8*7)/(7*7+3*17));break;
 case 78:numeric(q,49-p.range-20);assert.ok(value(q.options[q.answer])>=0&&value(q.options[q.answer])<=9);break;
 case 79:{const freq=new Map();for(const v of p.values)freq.set(v,(freq.get(v)||0)+1);const max=Math.max(...freq.values()),modes=[...freq].filter(([,n])=>n===max);assert.equal(modes.length,1);numeric(q,modes[0][0]);break;}
 case 80:{const counts={};p.values.forEach(v=>counts[v]=(counts[v]||0)+1);const mode=+Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];numeric(q,p.values.filter(v=>v>mode).length/p.values.length);break;}
 case 81:predicate(q,tex=>line(tex,[[p.t,0],[p.t,3],[p.t,-7]]));break;
 case 82:predicate(q,tex=>line(tex,[[2+p.t,-4],[8+p.t,-2]]));break;
 case 83:{const A=[2+p.t,-4],B=[8+p.t,-2];predicate(q,tex=>line(tex,[A,B,[5+p.t,-3+Math.sqrt(10)]]));break;}
 case 84:predicate(q,tex=>{const n=value(tex);return close((8+2*p.b+3*n+4)/(8+p.b+n+1),2);});break;
 case 85:{const vals=[...Array(8).fill(1),...Array(p.b).fill(2),...Array(6).fill(3),4],mean=vals.reduce((a,b)=>a+b)/vals.length;numeric(q,vals.reduce((sum,x)=>sum+(x-mean)**2,0)/vals.length);break;}
 case 86:numeric(q,({x})=>3*x+p.k,[{x:-1},{x:0},{x:2}]);break;
 case 87:{assert.ok(!Number.isInteger(Math.sqrt(73)));numeric(q,2);break;}
 case 88:numeric(q,Math.sqrt((700*p.t*p.t/(14*p.t))**2-(14*p.t)**2));break;
 case 89:{const t=p.t,H=48*t,r=14*t;numeric(q,integrate(z=>Math.PI*(r*z/H)**2,H/4,H));break;}
 case 90:{const r=p.r,b=4;let sum=0,total=0;for(let i=0;i<r+b;i++)for(let j=i+1;j<r+b;j++){const reds=8+Number(i<r)+Number(j<r);sum+=choose(reds,3)/choose(10,3);total++;}numeric(q,sum/total);break;}
 case 91:numeric(q,Array.from({length:8},(_,i)=>p.a+i*p.a).at(-1));break;
 case 92:numeric(q,({n})=>p.a*(n*n-(n-1)**2),[{n:1},{n:3},{n:8}]);break;
 case 93:predicate(q,tex=>{const x=value(tex.replace('x_0=',''));return x!==0&&close(x*Math.exp(x)-2*p.a*x,0);});break;
 case 94:{const a=p.a,d=x=>x*(Math.exp(x)-2*a);assert.ok(d(-.001)>0&&d(.001)<0);exact(q,'\\text{局部极大值点}');break;}
 case 95:{let n=0;for(let a=1;a<1000;a++){const b=a+p.d,c=a+2*p.d;if(a+b>c&&c*c>a*a+b*b)n++;}numeric(q,n);break;}
 case 96:{let x=0;for(let i=0;i<150;i++)x=1/p.n+(p.n-1)/p.n*x*x;numeric(q,x);break;}
 case 97:{const distribution=bernoulli([]),m=[.4,.3,.2,.1].reduce((a,b,i)=>a+i*b,0);numeric(q,p.k*m*m);break;}
 case 98:{let sizes=[[20*p.k,12*p.k]];for(let i=0;i<2;i++)sizes=sizes.flatMap(([w,h])=>[[w/2,h],[w,h/2]]);numeric(q,new Set(sizes.map(pair=>pair.sort((a,b)=>a-b).join(','))).size);break;}
 case 99:{const a=p.a*Math.PI/180,b=p.b*Math.PI/180;numeric(q,(Math.cos(a)-Math.cos(b))**2+(Math.sin(a)-Math.sin(b))**2);break;}
 case 100:{let max=0;for(const y of [0,p.a])for(const z of [0,p.a])max=Math.max(max,Math.hypot(p.a,y,z-p.a));numeric(q,max);break;}
 default:throw Error('Unaudited '+f);
 }
}
for(const exam of ['dse','macau','gaokao']){
 const pool=all.filter(q=>q.exam===exam),config={...engine.defaults(all),sources:[exam],count:20};assert.equal(engine.pool(all,config).length,pool.length);const paper=engine.create(all,Math.random,config);assert.deepEqual(engine.restore(paper,all),paper);
}
console.log('PASS: 100 expansion families / 1000 questions, all variants independently audited, unique choices, source documents, restrictions, enumeration, geometry, integrals and source-specific papers.');
