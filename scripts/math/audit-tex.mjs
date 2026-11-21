import assert from 'node:assert/strict';
export function value(input,vars={}){
 let tex=input.replace(/\\cos(\d+)\^\\circ/g,(_,n)=>'('+String(Math.cos(+n*Math.PI/180))+')').replace(/\\(?:left|right|,|;|!|quad)/g,'').replace(/\\cdot/g,'*').replace(/\\ /g,'').replace(/\s/g,'');let i=0;
 const group=()=>{assert.equal(tex[i++],'{',input);const v=add();assert.equal(tex[i++],'}',input);return v;};
 // TeX unbraced fraction/root arguments consist of one token.
 const arg=()=>tex[i]==='{'?group():/\d/.test(tex[i]||'')?+tex[i++]:atom();
 function atom(){let v;
  if(tex.startsWith('\\frac',i)){i+=5;v=arg()/arg();}
  else if(tex.startsWith('\\sqrt',i)){i+=5;v=Math.sqrt(arg());}
  else if(tex.startsWith('\\pi',i)){i+=3;v=Math.PI;}
  else if(tex.startsWith('\\ln',i)){i+=3;v=Math.log(atom());}
  else if(tex.startsWith('\\cos',i)){i+=4;v=Math.cos(atom());}
  else if(tex.startsWith('\\sin',i)){i+=4;v=Math.sin(atom());}
  else if(tex[i]==='{')v=group();
  else if(tex[i]==='('){i++;v=add();assert.equal(tex[i++],')',input);}
  else if(/[\d.]/.test(tex[i]||'')){const m=tex.slice(i).match(/^\d+(?:\.\d+)?(?:e[+-]?\d+)?/);assert.ok(m,input);v=+m[0];i+=m[0].length;}
  else {const c=tex[i++];v={e:Math.E,...vars}[c];assert.notEqual(v,undefined,input+' unknown '+c);}
  if(tex[i]==='^'){i++;v**=tex[i]==='{'?group():unary();}return v;
 }
 function unary(){if(tex[i]==='-'){i++;return -unary();}if(tex[i]==='+'){i++;return unary();}return atom();}
 function mul(){let v=unary();while(i<tex.length&&!/[+\-})=,]/.test(tex[i])){if(tex[i]==='/'){i++;v/=unary();}else{if(tex[i]==='*')i++;v*=unary();}}return v;}
 function add(){let v=mul();while(tex[i]==='+'||tex[i]==='-'){const sign=tex[i++];v+=(sign==='+'?1:-1)*mul();}return v;}
 const n=add();assert.equal(i,tex.length,input+' incomplete');assert.ok(Number.isFinite(n),input);return n;
}
export const close=(a,b)=>Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b));
export const near=(a,b,message)=>assert.ok(close(a,b),`${message}: ${a} != ${b}`);
export function numeric(q,expected,cases=[{}],transform=x=>x){
 const values=q.options.map(tex=>cases.map(vars=>value(transform(tex),vars))),targets=cases.map(v=>typeof expected==='function'?expected(v):expected),valid=values.map(row=>row.every((v,i)=>close(v,targets[i])));
 assert.equal(valid.filter(Boolean).length,1,q.id+' ambiguous answer');assert.ok(valid[q.answer],q.id+' incorrect answer');
 for(let i=0;i<4;i++)for(let j=0;j<i;j++)assert.ok(values[i].some((v,k)=>!close(v,values[j][k])),q.id+' equivalent choices');
}
export function predicate(q,fn){const valid=q.options.map(fn);assert.equal(valid.filter(Boolean).length,1,q.id+' predicate ambiguous');assert.ok(valid[q.answer],q.id+' predicate incorrect');}
export const coord=tex=>tex.replace(/\\(?:quad|,)/g,'').replace(/[()]/g,'').split(',').map(x=>value(x));
export function integrate(fn,a,b,n=400){let total=fn(a)+fn(b),h=(b-a)/n;for(let i=1;i<n;i++)total+=(i%2?4:2)*fn(a+i*h);return total*h/3;}
export function choose(n,k){if(k<0||k>n)return 0;let row=[1];for(let i=0;i<n;i++){const next=Array(i+2).fill(0);row.forEach((v,j)=>{next[j]+=v;next[j+1]+=v;});row=next;}return row[k];}
export function bernoulli(ps){let row=[1];for(const p of ps){const next=Array(row.length+1).fill(0);row.forEach((v,j)=>{next[j]+=v*(1-p);next[j+1]+=v*p;});row=next;}return row;}
