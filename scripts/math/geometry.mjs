// Small SVG scene renderer. Coordinates come from the same mathematical model
// as each question; labels contain givens, not numerical answers.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const segment=(a,b,label='',dash=false)=>({type:'line',points:[a,b],label,dash});
export const point=(p,label)=>({type:'point',points:[p],label});
export const poly=(points,fill=false,dash=false)=>({type:'poly',points,fill,dash});
export const ellipse=(c,rx,ry,label='')=>({type:'ellipse',points:[c],rx,ry,label});
export const curve=(fn,lo,hi,n=140)=>poly(Array.from({length:n+1},(_,i)=>fn(lo+(hi-lo)*i/n)));
export function sceneSVG(scene){
 const {title='几何示意图',objects=[],note=''}=scene;
 const bounds=objects.flatMap(o=>o.type==='ellipse'?[[o.points[0][0]-o.rx,o.points[0][1]-o.ry],[o.points[0][0]+o.rx,o.points[0][1]+o.ry]]:o.points);
 if(!bounds.length||bounds.some(p=>p.some(v=>!Number.isFinite(v))))throw Error('Invalid geometry '+title);
 let xmin=Math.min(...bounds.map(p=>p[0])),xmax=Math.max(...bounds.map(p=>p[0])),ymin=Math.min(...bounds.map(p=>p[1])),ymax=Math.max(...bounds.map(p=>p[1]));
 const scale=Math.min(312/Math.max(xmax-xmin,.1),208/Math.max(ymax-ymin,.1)),cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;
 const map=p=>[210+(p[0]-cx)*scale,155-(p[1]-cy)*scale],xy=p=>map(p).map(x=>+x.toFixed(3)).join(',');
 const label=(p,s,dy=-9)=>{const [x,y]=map(p);return `<text x="${x.toFixed(3)}" y="${(y+dy).toFixed(3)}" text-anchor="middle">${esc(s)}</text>`;};
 let body='';
 for(const o of objects){
  const cls=o.dash?' class="aux"':'';
  if(o.type==='line')body+=`<polyline points="${o.points.map(xy).join(' ')}"${cls}/>`;
  else if(o.type==='poly')body+=`<${o.fill?'polygon':'polyline'} points="${o.points.map(xy).join(' ')}"${o.fill?' class="shade"':cls}/>`;
  else if(o.type==='ellipse')body+=`<ellipse cx="${map(o.points[0])[0]}" cy="${map(o.points[0])[1]}" rx="${o.rx*scale}" ry="${o.ry*scale}"/>`;
  else if(o.type==='point')body+=`<circle cx="${map(o.points[0])[0]}" cy="${map(o.points[0])[1]}" r="2.6" class="dot"/>`;
  if(o.label){const p=o.type==='line'?o.points[0].map((x,i)=>(x+o.points[1][i])/2):o.points[0];body+=label(p,o.label,o.type==='point'?-9:17);}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 325" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><style>polyline,polygon,ellipse{fill:none;stroke:#795566;stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}.shade{fill:#fff1f6}.aux{stroke:#ac8b9b;stroke-dasharray:5 5;stroke-width:1.2}.dot{fill:#a64b72}text{font-family:Arial,'Microsoft YaHei',sans-serif;font-size:14px;fill:#60404f}</style>${body}${note?`<text x="210" y="300" text-anchor="middle">${esc(note)}</text>`:''}</svg>\n`;
}
export const axes=(x,y)=>[segment([-x,0],[x,0],'x',true),segment([0,-y],[0,y],'y',true),point([0,0],'O')];
export const project=([x,y,z])=>[x+.48*y,z+.28*y];
export function cubeScene(a=1){
 const vertices=[[0,0,0],[a,0,0],[a,a,0],[0,a,0],[0,0,a],[a,0,a],[a,a,a],[0,a,a]],points=vertices.map(project),names=['A','B','C','D','A₁','B₁','C₁','D₁'];
 const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
 return {title:'正方体',objects:[...edges.map(([i,j])=>segment(points[i],points[j],i===0&&j===1?String(a):'',[2,3].includes(i)&&j<4||i===3&&j===7)),...points.map((p,i)=>point(p,names[i]))],points,vertices};
}
export function conicScene(kind,a,b=1){
 let objects=axes(a*1.5,b*1.7);
 if(kind==='ellipse'){
  const c=Math.sqrt(Math.max(0,a*a-b*b));objects.push(ellipse([0,0],a,b),point([-c,0],'F₁'),point([c,0],'F₂'));
 }else if(kind==='hyperbola'){
  const c=Math.hypot(a,b);objects=axes(c*1.2,b*2.2);
  for(const sign of [-1,1])objects.push(curve(t=>[sign*a*Math.cosh(t),b*Math.sinh(t)],-1.4,1.4));
  objects.push(segment([-c*1.15,-c*1.15*b/a],[c*1.15,c*1.15*b/a],'',true),segment([-c*1.15,c*1.15*b/a],[c*1.15,-c*1.15*b/a],'',true),point([-c,0],'F₁'),point([c,0],'F₂'));
 }else{
  objects=axes(3*a,3*a);objects.push(curve(t=>[a*t*t,2*a*t],-1.7,1.7),point([a,0],'F'),segment([-a,-3*a],[-a,3*a],'准线',true));
 }
 return {title:{ellipse:'椭圆',hyperbola:'双曲线',parabola:'抛物线'}[kind],objects};
}
