import {sceneSVG,segment as S,point as P,poly,ellipse as E,curve,axes,project,cubeScene,conicScene} from './geometry.mjs';
const evalPoly=(coeff,x)=>coeff.reduceRight((v,c)=>v*x+c,0);
export function expansionScene(f){
 const {kind}=f;let objects=[],title='题目示意图',note='';
 if(kind==='linear-region'){
  const k=f.k,pts=[[-3*k,-k],[11*k/3,-k],[k, k]];objects=[...axes(4*k,2*k),poly(pts,true),...pts.map((p,i)=>P(p,['A','B','C'][i]))];title='半平面约束的可行区域';note='阴影为三条边界围成的可行区域';
 }else if(kind==='slope-ellipse'){
  const a=Math.sqrt(f.c2),b=a/Math.sqrt(2),pt=[a*.6,b*.8];objects=conicScene('ellipse',a,b).objects;objects.push(P([-a,0],'A'),P([a,0],'B'),P(pt,'M'),S([-a,0],pt),S([a,0],pt));title='定点连线的斜率乘积';
 }else if(kind==='ellipse-chord'){
  const {A2,B2,k,b}=f,a=Math.sqrt(A2),bb=Math.sqrt(B2),A=1/A2+k*k/B2,B=2*k*b/B2,C=b*b/B2-1,D=B*B-4*A*C,x1=(-B+Math.sqrt(D))/(2*A),x2=(-B-Math.sqrt(D))/(2*A),p1=[x1,k*x1+b],p2=[x2,k*x2+b],mid=[(p1[0]+p2[0])/2,(p1[1]+p2[1])/2];objects=conicScene('ellipse',a,bb).objects;objects.push(S(p1,p2),P(p1,'P'),P(p2,'Q'),P(mid,'D'),S([0,0],mid,'',true));title='椭圆弦与中点';
 }else if(kind==='tangent-circle'){
  const {center:c,r,T}=f,n=[T[0]-c[0],T[1]-c[1]],v=[-n[1]*.9,n[0]*.9];objects=[E(c,r,r),S(c,T,'',true),S([T[0]-v[0],T[1]-v[1]],[T[0]+v[0],T[1]+v[1]]),P(c,'C'),P(T,'T')];title='圆的切线与半径';
 }else if(kind==='quadratic'||kind==='polynomial'||kind==='absolute-polynomial'||kind==='bounded-polynomials'){
  let coeff=f.coeff;if(kind==='quadratic')coeff=[f.c,f.b,f.a];if(kind==='absolute-polynomial')coeff=[0,-f.a*f.a,-f.a,1];if(kind==='bounded-polynomials')coeff=f.coeff1;
  const scale=f.a||Math.max(1,Math.abs(coeff[2]||0)/3),lo=f.lo??-2.2*scale,hi=f.hi??2.2*scale,fn=x=>evalPoly(coeff,x),xs=Array.from({length:101},(_,i)=>lo+(hi-lo)*i/100),maxY=Math.max(...xs.map(x=>Math.abs(fn(x))),1),yscale=(hi-lo)*.75/maxY;
  const map=(x,y)=>[x,y*yscale],plotFn=kind==='absolute-polynomial'?x=>-fn(Math.abs(x)):fn;
  objects=[S([lo,0],[hi,0],'x',true),S([0,-maxY*yscale*.2],[0,maxY*yscale],'y',true),curve(x=>map(x,plotFn(x)),lo,hi)];
  if(kind==='bounded-polynomials'){const g=x=>evalPoly(f.coeff2,x);objects.unshift(poly([...xs.map(x=>map(x,fn(x))),...xs.toReversed().map(x=>map(x,g(x)))],true));objects.push(curve(x=>map(x,g(x)),lo,hi));title='两曲线所围区域';}else title='函数图像';
  note='横纵轴采用独立比例 · 不在图上标出所求值';
 }else if(kind==='reflection'){
  const {A,B}=f,Aprime=[A[0],-A[1]],t=-Aprime[1]/(B[1]-Aprime[1]),mid=[Aprime[0]+t*(B[0]-Aprime[0]),0];objects=[S([-2,0],[Math.max(A[0],B[0])+2,0],'x',true),P(A,'P'),P(B,'Q'),P(Aprime,"P′"),P(mid,'M'),S(A,mid),S(mid,B),S(Aprime,B,'',true),S(A,Aprime,'',true)];title='轴上最短折线路径的反射构造';
 }else if(kind==='conic')return conicScene(f.conic,f.a,f.b);
 else if(kind==='side-pyramid'){
  const a=f.a,A=[0,0,0],B=[a,0,0],C=[a,a,0],D=[0,a,0],V=[0,a/2,a*Math.sqrt(3)/2],M=[0,a/2,0];objects=[poly([A,B,C,D,A].map(project)),...[A,B,C,D].map(p=>S(project(p),project(V))),S(project(V),project(M),'',true),...[A,B,C,D,V,M].map((p,i)=>P(project(p),['A','B','C','D','V','M'][i]))];title='等边侧面垂直于正方形底面的棱锥';note=`底边长 ${a} · 侧面 VAD ⟂ 底面 ABCD`;
 }else if(kind==='ellipse-focus-line'){
  const t=f.t;objects=conicScene('ellipse',Math.sqrt(2)*t,t).objects;objects.push(S([-t,-2*t],[2*t,t]),P([0,-t],'A'),P([2*t,t],'P'),P([t,0],'F₁'));title='椭圆上的焦点弦';
 }else if(kind==='ellipse-tangent'){
  const {a,b,k}=f,m=Math.sqrt(b*b+k*k*a*a),x=-a*a*k/m,y=b*b/m;objects=conicScene('ellipse',a,b).objects;objects.push(S([x-a,y-k*a],[x+a,y+k*a]),P([x,y],'T'));title='固定斜率的椭圆切线（上方一条）';
 }else if(kind==='cube-plane'||kind==='cube-face-distance'){
  const scene=cubeScene(f.a);objects=scene.objects;const {points:p}=scene;
  if(kind==='cube-plane'){const E=scene.vertices[4],C=scene.vertices[2],G=scene.vertices[6],d=C.map((v,i)=>v-E[i]),t=G.reduce((n,v,i)=>n+(v-E[i])*d[i],0)/d.reduce((n,v)=>n+v*v,0),M=E.map((v,i)=>v+t*d[i]);objects.push(poly([p[1],p[3],p[6]],true),S(p[4],p[2],'',true),P(project(M),'M'),S(p[6],project(M),'',true));for(let i=0;i<8;i++){const o=objects.find(o=>o.type==='point'&&o.label===['A','B','C','D','A₁','B₁','C₁','D₁'][i]);if(o)o.label=['A','B','C','D','E','F','G','H'][i];}title='正方体截面与体对角线';}
  else{const pt=project([f.a,f.a*.65,f.a*.4]);objects.push(poly([p[1],p[2],p[6],p[5]],true),P(pt,'P'),S(p[4],pt));title='正方体侧面上的动点';}
 }else if(kind==='ellipse-circle'){
  const t=f.t,Q=[3*t/Math.sqrt(5),4*t/Math.sqrt(5)],M=[6*t/Math.sqrt(5),-2*t/Math.sqrt(5)],F1=[-Math.sqrt(5)*t,0],F2=[Math.sqrt(5)*t,0];objects=conicScene('ellipse',3*t,2*t).objects;objects.push(E([0,0],Math.sqrt(5)*t,Math.sqrt(5)*t),P(Q,'Q'),P(M,'M'),S(Q,M),S(M,F1),S(Q,F1),P(F1,'F₁'),P(F2,'F₂'));title='椭圆、焦点直径圆与焦点弦';
 }else if(kind==='bisector'||kind==='diameter-circle'){
  const {A,B}=f,C=A.map((v,i)=>(v+B[i])/2),u=B.map((v,i)=>v-A[i]),v=[-u[1]/2,u[0]/2];objects=[S(A,B),P(A,'A'),P(B,'B'),P(C,'C'),S([C[0]-v[0],C[1]-v[1]],[C[0]+v[0],C[1]+v[1]],'等距轨迹',true)];if(kind==='diameter-circle'){const r=Math.hypot(...u)/2;objects.push(E(C,r,r));}title='垂直平分线与两定点';
 }else if(kind==='cone'||kind==='cone-cut'){
  const {r,h}=f;objects=[E([0,0],r,r*.2),S([-r,0],[0,h]),S([r,0],[0,h]),S([0,0],[0,h],'h',true),S([0,0],[r,0],`r = ${r}`),P([0,h],'V')];if(kind==='cone-cut'){const ratio=f.ratio;objects.push(E([0,h*(1-ratio)],r*ratio,r*ratio*.2));}title='圆锥及其轴线';
 }else if(kind==='cut-rectangle'){
  const {w,h}=f;objects=[poly([[0,0],[w,0],[w,h],[0,h],[0,0]]),S([w/2,0],[w/2,h],'',true),S([0,h/2],[w,h/2],'',true),S([0,0],[w,0],String(w)),S([0,0],[0,h],String(h))];title='矩形沿边中点等分切割';
 }else if(kind==='unit-chord'){
  const p=deg=>[Math.cos(deg*Math.PI/180),Math.sin(deg*Math.PI/180)],A=p(f.alpha),B=p(f.beta);objects=[...axes(1.2,1.2),E([0,0],1,1),P(A,'P'),P(B,'Q'),S(A,B),S([0,0],A),S([0,0],B)];title='单位圆上的两向量与弦';
 }else throw Error('Unknown expansion figure '+kind);
 return {title,objects,note};
}
export const expansionSVG=figure=>sceneSVG(expansionScene(figure));
