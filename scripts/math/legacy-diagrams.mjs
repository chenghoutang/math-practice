import {sceneSVG,segment as S,point as P,poly,ellipse as E,curve,axes,project,cubeScene,conicScene} from './geometry.mjs';
export function legacyScene(q){
 const a=q.variant+1,f=q.family,v=Number(f.at(-1)),s=q.variant-1;
 let objects=[],title=q.topicName,note='';
 if(f.startsWith('triangle-')){
  let A=[0,0],B,C;
  if(f==='triangle-easy-1'){B=[3*a,0];C=[0,4*a];objects=[S(A,B,String(3*a)),S(A,C,String(4*a)),S(B,C),P(A,'A'),P(B,'B'),P(C,'C')];}
  else if(f==='triangle-easy-2'){
   const R=a,B=[-a,0],C=[a,0],A=[R*Math.cos(Math.PI/6),R*Math.sin(Math.PI/6)];
   objects=[E([0,0],R,R),poly([A,B,C,A]),P(A,'A = 30°'),P(B,'B'),P(C,'C'),S(B,C,`a = ${a}`),P([0,0],'O')];
   // Chord a subtends 30 degrees: use endpoints separated by 60 degrees.
   objects=[E([0,0],a,a),poly([[a,0],[a/2,a*Math.sqrt(3)/2],[-a,0],[a,0]]),P([-a,0],'A = 30°'),P([a,0],'B'),P([a/2,a*Math.sqrt(3)/2],'C'),S([a,0],[a/2,a*Math.sqrt(3)/2],`a = ${a}`),P([0,0],'O')];
  }else if(f==='triangle-medium-1'){B=[a+1,0];C=[(a+1)/2,Math.sqrt(a*a-(a+1)**2/4)];objects=[S(A,B,String(a+1)),S(A,C,String(a)),S(B,C,String(a)),P(A,'A'),P(B,'B'),P(C,'C')];}
  else{B=[a*1.4,0];C=[a*.6*Math.cos(Math.PI/3),a*.6*Math.sin(Math.PI/3)];if(f==='triangle-medium-2'){B=[a,0];C=[(a+1)/2,(a+1)*Math.sqrt(3)/2];}objects=[poly([A,B,C,A]),P(A,'A = 60°'),P(B,'B'),P(C,'C')];if(f==='triangle-medium-2')objects.push(S(A,B,String(a)),S(A,C,String(a+1)));else note=f==='triangle-hard-1'?`AB + AC = ${2*a}；图为可行构型`:`内切圆半径 r = ${a}；形状示意`;
   if(f.includes('hard')){let b=Math.hypot(...C),c=B[0],aa=Math.hypot(C[0]-B[0],C[1]),sum=aa+b+c,I=[(b*B[0]+c*C[0])/sum,c*C[1]/sum],r=I[1];if(f==='triangle-hard-2'){const scale=a/r;objects=objects.map(o=>({...o,points:o.points.map(p=>p.map(v=>v*scale))}));I=I.map(v=>v*scale);r=a;}objects.push(E(I,r,r),P(I,'I'));}
  }
 }else if(f.startsWith('vectors-')){
  let u=[a,a],w=[1,a];if(f==='vectors-easy-2'){u=[a,1];w=[1,a];}if(f==='vectors-medium-1'){u=[a,1];w=[a,-a*a];}if(f==='vectors-medium-2'){u=[a,0];w=[1,Math.sqrt(a*a-1)];}if(f==='vectors-hard-1'){u=[1,0];w=[.5,Math.sqrt(3)/2];}
  if(f==='vectors-hard-2'){objects=[...axes(2.4*a,2.4*a),E([0,0],a,a),P([2*a,0],'A'),P([0,2*a],'B'),P([a*.6,a*.8],'P'),S([a*.6,a*.8],[2*a,0]),S([a*.6,a*.8],[0,2*a])];}
  else objects=[...axes(Math.max(Math.abs(u[0]),Math.abs(w[0]))*1.3,Math.max(Math.abs(u[1]),Math.abs(w[1]))*1.3),S([0,0],u),S([0,0],w),P(u,'u'),P(w,'v')];
 }else if(f.startsWith('line-circle-')){
  if(f==='line-circle-easy-1')objects=[...axes(a*1.4,(2*a+1)*1.2),S([-a,1-2*a],[a,1+2*a]),P([0,1],'(0, 1)'),P([a,2*a+1],`(${a}, ${2*a+1})`)];
  if(f==='line-circle-easy-2')objects=[...axes(2*a+2,a+3),E([a,-1],a+1,a+1),P([a,-1],`C(${a}, −1)`)];
  if(f==='line-circle-medium-1'){const pt=[a,0],t=(3*a+2*a)/25,H=[a-3*t,-4*t];objects=[P(pt,'P'),P(H,'H'),S(pt,H,'',true),S([H[0]-4*a,H[1]+3*a],[H[0]+4*a,H[1]-3*a]),P([0,0],'O')];}
  if(f==='line-circle-medium-2'){const r=Math.sqrt(a*a+9);objects=[...axes(r*1.2,r*1.2),E([0,0],r,r),S([-r*1.2,a],[r*1.2,a]),P([-3,a],'A'),P([3,a],'B')];}
  if(f==='line-circle-hard-1'){const angle=.9,c=Math.cos(angle),sn=Math.sin(angle),D=Math.sqrt(4*a*a-a*a*sn*sn),t1=-a*c-D,t2=-a*c+D,A=[a+t1*c,t1*sn],B=[a+t2*c,t2*sn];objects=[E([0,0],2*a,2*a),S(A,B),P(A,'A'),P(B,'B'),P([a,0],'P'),P([0,0],'O')];}
  if(f==='line-circle-hard-2'){const h=Math.sqrt(3)*a/2,A=[a/2,h],B=[a/2,-h],pt=[2*a,0];objects=[E([0,0],a,a),S(pt,A),S(pt,B),S(A,B),S([0,0],[a/2,0],'',true),P(A,'A'),P(B,'B'),P(pt,'P'),P([0,0],'O')];}
 }else if(f.startsWith('ellipse-')){
  let A=a+2,b=a;if(f==='ellipse-easy-2'||f.includes('hard')||f==='ellipse-medium-2'){A=Math.sqrt(a*a+1);b=1;}if(f==='ellipse-medium-1'){A=2*a;b=Math.sqrt(3)*a;}
  const c=Math.sqrt(A*A-b*b);objects=conicScene('ellipse',A,b).objects;
  if(f==='ellipse-medium-2'||f==='ellipse-hard-1'){let pt=[A*Math.cos(.9),b*Math.sin(.9)];if(f==='ellipse-hard-1')pt=[Math.sqrt((a*a+1)*(a*a-1)/(a*a)),1/a];objects.push(P(pt,'P'),S([-c,0],pt),S([c,0],pt));}
  if(f==='ellipse-hard-2'){const slope=.55,AA=1/(A*A)+slope*slope/(b*b),BB=-2*slope*slope*c/(b*b),CC=slope*slope*c*c/(b*b)-1,D=BB*BB-4*AA*CC,x1=(-BB+Math.sqrt(D))/(2*AA),x2=(-BB-Math.sqrt(D))/(2*AA);objects.push(S([x1,slope*(x1-c)],[x2,slope*(x2-c)]),P([x1,slope*(x1-c)],'A'),P([x2,slope*(x2-c)],'B'));}
 }else if(f.startsWith('hyperbola-')){
  let A=a,b=1;if(f==='hyperbola-easy-2')b=a+2;if(f==='hyperbola-medium-1'){A=1;b=Math.sqrt(a*a-1);}if(f==='hyperbola-medium-2')b=Math.sqrt(3)*a;if(f==='hyperbola-hard-2'){A=1;b=a;}
  objects=conicScene('hyperbola',A,b).objects;
  if(f==='hyperbola-hard-1'){const c=Math.hypot(a,1),pt=[a*Math.sqrt((a*a+2)/(a*a+1)),1/c];objects.push(P(pt,'P'),S([-c,0],pt),S([c,0],pt));}
  if(f==='hyperbola-hard-2'){const pt=[Math.cosh(.8),a*Math.sinh(.8)];objects.push(P(pt,'P'));for(const m of [a,-a]){const t=(pt[0]+m*pt[1])/(1+m*m);objects.push(S(pt,[t,m*t],'',true));}}
 }else if(f.startsWith('parabola-')){
  objects=conicScene('parabola',a).objects;
  if(f==='parabola-medium-1'){const pt=[a,2*a];objects.push(P(pt,'P'),S([-a,0],[3*a,4*a]));}
  if(f==='parabola-medium-2'){const x=a+1,pt=[x,Math.sqrt(4*a*x)];objects.push(P(pt,'P'),S(pt,[a,0]));}
  if(f==='parabola-hard-1'){const k=-12,D=16*a*a-4*k*8*a*a,ys=[(4*a+Math.sqrt(D))/(2*k),(4*a-Math.sqrt(D))/(2*k)],pts=ys.map(y=>[y*y/(4*a),y]);objects.push(S(pts[0],pts[1]),...pts.map((p,i)=>P(p,['A','B'][i])),S([a,0],pts[0]),S([a,0],pts[1]));}
  if(f==='parabola-hard-2'){const m=1/Math.sqrt(3),r1=2*a/(1-.5),r2=2*a/(1+.5),A=[a+r1*.5,r1*Math.sqrt(3)/2],B=[a-r2*.5,-r2*Math.sqrt(3)/2];objects.push(S(A,B),P(A,'A'),P(B,'B'));}
 }else if(f.startsWith('space-')){
  if(f==='space-easy-1'){const u=project([a,1,2]),v=project([1,2,1]);objects=[...axes(a*1.3,3),S([0,0],u),S([0,0],v),P(u,'u'),P(v,'v')];}
  else if(f==='space-medium-1')objects=[poly([[-2,-.6],[1,-.6],[2,.6],[-1,.6]],true),S([0,0],[1.3,0],'投影',true),S([0,0],[0,2],'n',true),S([0,0],[1.3,2],'直线')];
  else if(f==='space-hard-1'){const pt=[a,a/2,0],t=(pt[0]+pt[1])/3,H=[t,t,t];objects=[S(project([-a,-a,-a]),project([2*a,2*a,2*a]),'l'),S(project(pt),project(H),'',true),P(project(pt),'P（示例）'),P(project(H),'H')];}
  else if(f==='space-hard-2'){
   const m=Math.sqrt(2*(a*a+2)/(3*a*a-2)),n1=[1,1,a],n2=[1,-1,m],cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],unit=u=>u.map(v=>v/Math.hypot(...u)),u=unit(cross(n1,n2)),v1=unit(cross(u,n1)),v2=unit(cross(u,n2)),center=[.5,-.5,0],view=([x,y,z])=>[x*Math.cos(.8)+y*Math.sin(.8),-x*Math.sin(.8)*Math.sin(.6)+y*Math.cos(.8)*Math.sin(.6)+z*Math.cos(.6)],pt=(v,t,w)=>view(center.map((c,i)=>c+t*u[i]+w*v[i]));
   // Draw two visible half-planes meeting along their common line. Opaque
   // full plane patches can project on top of each other and hide the hinge.
   const edge=pt(v1,2,0).map((x,i)=>x-pt(v1,-2,0)[i]),det=v=>{const p=pt(v,0,1),o=pt(v,0,0);return edge[0]*(p[1]-o[1])-edge[1]*(p[0]-o[0]);},side=det(v1)*det(v2)>0?-1.5:1.5;
   objects=[poly([pt(v1,-2,0),pt(v1,2,0),pt(v1,2,1.5),pt(v1,-2,1.5)],true),poly([pt(v2,-2,0),pt(v2,2,0),pt(v2,2,side),pt(v2,-2,side)],true),S(pt(v1,-2,0),pt(v1,2,0),'交线'),P(pt(v1,0,1),'Π₁'),P(pt(v2,0,side*.7),'Π₂')];
  }
  else{const coeff=f==='space-easy-2'?[1,2,a]:[1,2,2],D=f==='space-easy-2'?1:0,pts=[[-a,-a],[a,-a],[a,a],[-a,a]].map(([x,y])=>project([x,y,(D-coeff[0]*x-coeff[1]*y)/coeff[2]])),n=coeff.map(v=>v*a/4),origin=[0,0,D/coeff[2]];objects=[poly(pts,true),S(project(origin),project(n.map((v,i)=>v+origin[i])),'n',true)];if(f==='space-medium-2'){const t=a/9,H=[a-t,-2*t,-2*t];objects.push(P(project([a,0,0]),'P'),P(project(H),'H'),S(project([a,0,0]),project(H),'',true));}}
 }else if(f.startsWith('solid-')){
  if(f==='solid-easy-1')return cubeScene(a);
  if(f==='solid-easy-2')objects=[E([0,0],a,a),E([0,0],a,a*.28),S([0,0],[a,0],`r = ${a}`),P([0,0],'O')];
  if(f==='solid-medium-1'){const V=project([a/2,(a+1)/2,3]),base=[[0,0,0],[a,0,0],[a,a+1,0],[0,a+1,0]].map(project);objects=[poly([...base,base[0]]),...base.map(p=>S(p,V)),S(V,project([a/2,(a+1)/2,0]),'高 3',true),S(base[0],base[1],String(a)),S(base[1],base[2],String(a+1)),P(V,'V')];}
  if(f==='solid-medium-2')objects=[E([0,0],a+1,(a+1)*.2),E([0,3],a,a*.2),S([-a-1,0],[-a,3]),S([a+1,0],[a,3]),S([0,0],[0,3],'高 3',true),S([0,3],[a,3],String(a)),S([0,0],[a+1,0],String(a+1))];
  if(f==='solid-hard-1'){const base=[[0,0,0],[a,0,0],[a/2,a*Math.sqrt(3)/2,0]],top=[a/2,a*Math.sqrt(3)/6,a*Math.sqrt(2/3)],I=[a/2,a*Math.sqrt(3)/6,a*Math.sqrt(6)/12];objects=[poly([...base,base[0]].map(project)),...base.map(p=>S(project(p),project(top))),E(project(I),a*Math.sqrt(6)/12,a*Math.sqrt(6)/12),P(project(I),'I'),...base.concat([top]).map((p,i)=>P(project(p),['A','B','C','D'][i]))];}
  if(f==='solid-hard-2'){const h=a*.8,r=a-h/2;objects=[E([0,0],a,a*.2),S([-a,0],[0,2*a]),S([a,0],[0,2*a]),E([0,0],r,r*.2),E([0,h],r,r*.2),S([-r,0],[-r,h]),S([r,0],[r,h]),S([0,0],[0,2*a],`高 ${2*a}`,true)];}
 }else if(f==='new-4'){const t=s+1;objects=[...axes(t+4,4),P([t,1],'A'),P([t+2,3],'B'),P([t+1,0],'P'),S([t,1],[t+1,0]),S([t+2,3],[t+1,0])];}
 else if(f==='hell-15'||f==='hell-16'){const t=s+1;objects=conicScene('parabola',t).objects;if(f==='hell-15'){const H=[3*t,0];for(const u of [-1,0,1]){const pt=[t*u*u,2*t*u];objects.push(S(pt,H),P(pt,['A','B','C'][u+1]));}objects.push(P(H,'P(h,k)'));}else{objects.push(E([3*t,0],Math.sqrt(8.5)*t,Math.sqrt(8.5)*t),P([3*t,0],'(h,k)'));}note='示例构型 · 不代表全部情形';}
 else if(f==='hell-17'){const [num,den]=[[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6]][s],p=num/den,y=Math.sqrt(1-p*p),T=[1/p,0];objects=[E([0,0],1,1),S([p,-y],[p,y]),S([p,-y],T),S([p,y],T),P([p,0],'P'),P([p,y],'A'),P([p,-y],'B'),P(T,'T'),P([0,0],'O')];}
 else if(f==='hell-31'){const A=s+2;objects=conicScene('ellipse',A,1).objects;objects.push(poly([0,1.9,4.3,0].map(t=>[A*Math.cos(t),Math.sin(t)])));note='内接三角形的一个示例';}
 else if(f==='hell-47'||f==='new-10'){const a=s+1,base=[[0,0,0],[a,0,0],[a/2,a*Math.sqrt(3)/2,0]],top=[a/2,a*Math.sqrt(3)/6,a*Math.sqrt(2/3)],I=[a/2,a*Math.sqrt(3)/6,a*Math.sqrt(6)/12];objects=[poly([...base,base[0]].map(project)),...base.map(p=>S(project(p),project(top))),P(project(I),f==='hell-47'?'P（示例）':'O')];for(const p of base.concat([top]))objects.push(S(project(I),project(p),'',true));note=f==='hell-47'?'正四面体内点的一个示例':'等号构型的空间示意';}
 if(!objects.length)return null;
 return {title,objects,note};
}
export const legacyDiagram=q=>{const scene=legacyScene(q);return scene?sceneSVG(scene):null;};
