// Local, parameter-driven SVGs. All labels describe givens, never the answer.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text=(x,y,s)=>`<text x="${x}" y="${y}">${esc(s)}</text>`;
const line=(a,b,dashed=false)=>`<path d="M${a.join(',')} L${b.join(',')}"${dashed?' class="aux"':''}/>`;
const polygon=points=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" class="shade"/>`;
const dot=(p,label,dx=7,dy=-8)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3" class="dot"/>${text(p[0]+dx,p[1]+dy,label)}`;
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function diagram(kind,p){
 let body='',title='';
 if(kind==='polar'){
  title='极坐标中的三角形与直角';
  const O=[225,140],point=(r,deg)=>[O[0]+r*1.05*Math.cos(deg*Math.PI/180),O[1]-r*1.05*Math.sin(deg*Math.PI/180)];
  const P=point(11,59),Q=point(60,149),R=point(144,239),u=point(7,59),v=point(7,149),w=[u[0]+v[0]-O[0],u[1]+v[1]-O[1]];
  body=polygon([P,Q,R])+line(P,R)+line(O,Q)+line(u,w)+line(w,v)+dot(O,'O',8,8)+dot(P,'P',5,-12)+dot(Q,'Q',-18,-6)+dot(R,'R',7,12)+text(262,126,`OP = ${p.radii[0]}`)+text(92,91,`OQ = ${p.radii[1]}`)+text(232,234,`OR = ${p.radii[2]}`)+text(54,295,'方位角：59°、149°、239°');
 }else if(kind==='pyramid'){
  title='正四棱锥被平行于底面的平面截得棱台';
  const S=[205,35],base=[[60,220],[215,280],[360,215],[205,155]],cut=base.map(b=>mix(S,b,p.h/p.H));
  body=polygon(base)+polygon(cut);
  for(let i=0;i<4;i++)body+=line(S,base[i],i===3)+line(base[i],base[(i+1)%4],i>=2)+line(cut[i],cut[(i+1)%4],i>=2);
  body+=line(S,[205,218],true)+text(212,48,'S')+text(50,246,`底边 ${p.a} cm`)+text(280,92,`总高 ${p.H} cm`)+text(20,112,`上部高 ${p.h} cm`)+text(168,247,'棱台 X')+text(181,124,'Y');
 }else if(kind==='circle'){
  title='过圆内定点的弦';
  const r=p.r,scale=130/r,map=([x,y])=>[210+(x-2)*scale,165-y*scale],O=[2,0],P=[1,1];
  const t=Math.sqrt(r*r/2-1),A=[1-t,1-t],B=[1+t,1+t];
  body=`<circle cx="210" cy="165" r="130" class="shade"/>`+line(map(A),map(B))+line(map(O),map(P),true)+dot(map(O),'C',8,18)+dot(map(P),'P',-17,-6)+dot(map(A),'A',-14,20)+dot(map(B),'B',6,-7)+text(20,25,`圆心 C(2, 0)，半径 ${r}`)+text(20,316,'P(1, 1)，直线 AB 经过 P');
 }else if(kind==='parabola'){
  title='向下开口抛物线的焦点与准线';
  const scale=210/(p.p/4+15),axisY=35+p.p/4*scale,map=([x,y])=>[210+x*scale,axisY-y*scale],pts=[];
  for(let i=-60;i<=60;i++){const x=i/60*Math.sqrt(p.p*15);pts.push(map([x,-x*x/p.p]));}
  const A=[Math.sqrt(7*p.p),-7],F=[0,-p.p/4],D=[A[0],p.p/4];
  body=line([20,axisY],[400,axisY],true)+line([210,20],[210,300],true)+`<polyline points="${pts.map(a=>a.join(',')).join(' ')}"/>`+line([20,35],[400,35],true)+line(map(A),map(D),true)+line(map(A),map(F))+dot(map(A),'A')+dot(map(F),'F',-18,18)+text(215,axisY-5,'O')+text(385,axisY-8,'x')+text(24,27,'准线')+text(255,280,`AF = ${p.L}`)+text(250,300,'A 到 x 轴距离为 7');
 }else if(kind==='triangle'){
  title='三角形的三边与对应顶点';
  const a=p.a,b=a+p.d,c=a+2*p.d,x=(b*b+c*c-a*a)/(2*c),y=Math.sqrt(b*b-x*x),scale=290/c;
  const A=[60,265],B=[350,265],C=[60+x*scale,265-y*scale];
  body=polygon([A,B,C])+dot(A,'A',-18,10)+dot(B,'B',8,10)+dot(C,'C',0,-12)+text((B[0]+C[0])/2+8,(B[1]+C[1])/2,'a')+text((A[0]+C[0])/2-58,(A[1]+C[1])/2,`a + ${p.d}`)+text(180,292,`a + ${2*p.d}`);
 }else if(kind==='hyperbola'){
  title='双曲线与两焦点';
  const c=Math.sqrt(p.c2),scale=170/(c+1),map=([x,y])=>[210+x*scale,160-y*scale];
  body=line([15,160],[405,160],true)+line([210,15],[210,305],true);
  for(const sign of [-1,1]){const pts=[];for(let i=-60;i<=60;i++){const y=i/60*3.4;pts.push(map([sign*Math.sqrt(1+y*y/(p.c2-1)),y]));}body+=`<polyline points="${pts.map(v=>v.join(',')).join(' ')}"/>`;}
  body+=dot(map([-c,0]),'F₁',-10,22)+dot(map([c,0]),'F₂',-10,22)+text(215,180,'O')+text(396,151,'x')+text(218,23,'y')+text(34,295,`焦点横坐标为 ±√${p.c2}`);
 }else if(kind==='unit-circle'){
  title='单位圆上的角与向量';
  const O=[210,166],point=deg=>[210+110*Math.cos(deg*Math.PI/180),166-110*Math.sin(deg*Math.PI/180)],A=point(0),P1=point(p.alpha),P2=point(p.beta),P3=point(p.alpha+p.beta);
  body=`<circle cx="210" cy="166" r="110" class="shade"/>`+line([65,166],[355,166],true)+line([210,25],[210,305],true);
  for(const v of [A,P1,P2,P3])body+=line(O,v);
  body+=dot(O,'O',5,17)+dot(A,'A',6,15)+dot(P1,'P₁',8,-8)+dot(P2,'P₂',-20,-8)+dot(P3,'P₃',-27,-6)+text(20,305,`α = ${p.alpha}°，β = ${p.beta}°，半径为 1`);
 }else if(kind==='cube'){
  title='正方体侧面上的动点';
  const A=[55,255],B=[265,255],C=[355,185],D=[145,185],up=v=>[v[0],v[1]-140],A1=up(A),B1=up(B),C1=up(C),D1=up(D),P=[319,115];
  body=polygon([B,C,C1,B1])+polygon([A,B,P]);
  for(const [a,b,d]of [[A,B],[B,C],[C,D,true],[D,A,true],[A1,B1],[B1,C1],[C1,D1],[D1,A1],[A,A1],[B,B1],[C,C1],[D,D1,true]])body+=line(a,b,d);
  body+=line(A,P)+line(B,P)+dot(A,'A',-16,16)+dot(B,'B',0,18)+dot(C,'C',10,0)+dot(D,'D',-15,15)+dot(A1,'A₁',-20,-9)+dot(B1,'B₁',-10,-10)+dot(C1,'C₁',3,-8)+dot(D1,'D₁',-10,-10)+dot(P,'P',10,0)+text(115,298,`棱长 ${p.a}；P 在侧面 BB₁C₁C 内运动`);
 }else throw Error('Unknown diagram: '+kind);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 325" role="img" aria-labelledby="title"><title id="title">${title}</title><style>path,polyline,polygon,circle{fill:none;stroke:#795566;stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}.shade{fill:#fff1f6}.aux{stroke:#aa8c99;stroke-dasharray:5 5;stroke-width:1.3}.dot{fill:#a64b72;stroke:none}text{font-family:Arial,'Microsoft YaHei',sans-serif;font-size:13px;fill:#60404f}</style>${body}</svg>\n`;
}
