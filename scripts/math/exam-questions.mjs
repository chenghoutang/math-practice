import {L,M,F,Q as makeQ,C,fact,gcd} from './core.mjs';
import {reviewedDifficulty} from './difficulty-review.mjs';
// These explanations already contain display math; the legacy helper only
// normalizes inline prose. Preserve the authored display delimiters intact.
const Q=(stem,answer,explanation,wrong)=>({...makeQ(stem,answer,'解析',wrong),explanation});

export const examSources={
 dse:{label:'香港 DSE',year:2024,paper:'数学必修部分试卷一',title:'HKEAA 2024 HKDSE Mathematics Compulsory Part — Level 5 sample',url:'https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/math/2024-Sample-MATH-CP-Level5-E-976D.pdf',indexUrl:'https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/math/sp/2024_Sample_CP.html',checkedDate:'2026-11-20',note:'官方英文评卷样本中的试题；中文改写并统一为单项选择题。'},
 macau:{label:'澳门四校联考',year:2025,paper:'数学正卷',title:'2025 Joint Admission Examination — Mathematics Standard Paper',url:'https://reg.um.edu.mo/download/admission-local/jae/pastexampaper1/JM01.pdf',indexUrl:'https://reg.um.edu.mo/admissions/macao-students/admission-examination/jae/syllabus-paper/',checkedDate:'2026-11-20',note:'澳门大学官方历届试卷及参考答案；下载路径可能随年份轮换，以试卷封面年份为准。'},
 gaokao:{label:'内地高考',year:2021,paper:'全国卷',title:'2021年高考数学全国卷试题评析：聚焦核心素养 考查关键能力',url:'https://gaokao.neea.edu.cn/html1/report/22012/3061-1.htm',checkedDate:'2026-11-20',note:'教育部教育考试院官网刊载的试题评析，使用其中明确列出的例题；部分开放题、多选题改为单项选择题。'}
};
const worked=(idea,tex,check='代回题设并检查适用条件，得到所求结果。')=>`${idea}\n关键推导\n$$\n${tex}\n$$\n${check}`;
const nQ=(stem,n,explanation,step=1)=>Q(stem,String(n),explanation,[n+step,n-step,n+2*step]);
const fractionQ=(stem,n,d,explanation)=>Q(stem,F(n,d),explanation,[F(n+d,d),F(n,d*2),F(n+d,d*2)]);
const family=(key,exam,topic,strategy,difficulty,question,page,generate,paper)=>({key,exam,topic,strategy,difficulty,question,page,generate,paper});
const shift=(x,s)=>s===0?x:`(${x}-${s})`;
const dec=x=>Number(x.toFixed(5)).toString();
const rootFraction=(n,d)=>{
 let k=Math.floor(Math.sqrt(n));while(n%(k*k))k--;
 n/=k*k;const g=gcd(k,d);k/=g;d/=g;
 if(n===1)return F(k,d);
 const numerator=`${k===1?'':k}\\sqrt{${n}}`;
 return d===1?numerator:L`\frac{${numerator}}{${d}}`;
};

export const families=[
 family('dse-subject','dse','quadratic','公式变形与主项系数','easy','2','试卷第 2 页；PDF 第 3 页',s=>{
  const k=3+s;
  return {...Q(`已知 ${M(L`\frac{Ax+C}{B}=${k}x`)}，其中 ${M(L`B\ne0`)} 且 ${M(L`${k}B\ne A`)}。将 ${M(L`x`)} 表为其他字母的式子。`,L`\frac{C}{${k}B-A}`,worked('先去分母，再把含未知数的项合并，最后除以非零系数。',L`Ax+C=${k}Bx\quad\Longrightarrow\quad C=(${k}B-A)x\quad\Longrightarrow\quad x=\frac{C}{${k}B-A}`),[L`\frac{C}{A-${k}B}`,L`\frac{C}{${k}B+A}`,L`\frac{BC}{${k}-A}`]),params:{k}};
 }),
 family('dse-inequality','dse','inequalities','联立一次不等式求最小整数','easy','4(a)(b)','试卷第 3 页；PDF 第 4 页',s=>{
  const t=1+s,b=4+3*t;
  return {...nQ(`同时满足 ${M(L`\frac{5x+${b}}4-1<2x`)} 与 ${M(L`3x+9\ge0`)} 的最小整数是多少？`,t+1,worked('分别解两个不等式，再取交集；严格不等式的端点不能取到。',L`5x+${b}-4<8x\Longrightarrow x>${t},\qquad3x+9\ge0\Longrightarrow x\ge-3,\qquad x_{\min,\mathbb Z}=${t+1}`)),params:{t,b}};
 }),
 family('dse-profit','dse','quadratic','标价折扣与实际利润','easy','6','试卷第 4 页；PDF 第 5 页',s=>{
  const profit=13+s;
  return {...nQ(`某商品的标价比成本高 ${M(L`40\%`)}，按标价的 ${M(L`75\%`)} 出售后获利 ${M(profit)} 元。该商品的标价是多少元？`,28*profit,worked('把成本设为未知数，将折后售价与成本的差写成利润。',L`0.75\times1.4c-c=${profit}\Longrightarrow0.05c=${profit}\Longrightarrow c=${20*profit},\qquad\text{标价}=1.4c=${28*profit}`),profit),params:{profit}};
 }),
 family('dse-polar','dse','triangle','极坐标中的垂直与三角形周长','medium','7(c)','试卷第 5 页；PDF 第 6 页',s=>{
  const k=10+s,radii=[11,60,144].map(r=>dec(r*k/10)),n=372*k;
  return {...fractionQ(`在同一极坐标系中，${M(L`P(${F(11*k,10)},59^\circ)`)}、${M(L`Q(${F(60*k,10)},149^\circ)`)}、${M(L`R(${F(144*k,10)},239^\circ)`)}。求三角形 ${M(L`PQR`)} 的周长。`,n,10,worked('相邻两条极径互相垂直，另两条极径反向；分别求三条边后相加。',L`k=${F(k,10)},\quad\angle POQ=\angle QOR=90^\circ,\quad PQ=k\sqrt{11^2+60^2}=61k,\quad QR=k\sqrt{60^2+144^2}=156k,\quad PR=155k,\quad PQ+QR+PR=372k=${F(n,10)}`)),params:{scale:k/10,radii},figureKind:'polar'};
 }),
 family('dse-frequency','dse','statistics','频数表与概率反求未知频数','medium','9(a)','试卷第 7 页；PDF 第 8 页',s=>{
  const k=6+s;
  return {...nQ(`一组钥匙数量的频数表为 ${M(L`\begin{array}{c|rrrrrr}\text{数量}&3&4&5&6&7&8\\\hline\text{频数}&10&9&4&3&4&k\end{array}`)}。随机选一组，其钥匙数量超过 ${M(6)} 的概率为 ${M(F(k+4,k+30))}，求 ${M(L`k`)}。`,k,worked('超过给定数量的频数为最后两列之和；分母是全部频数之和。',L`\frac{4+k}{30+k}=${F(k+4,k+30)}\Longrightarrow (${k+30})(4+k)=(${k+4})(30+k)\Longrightarrow 26k=${26*k}\Longrightarrow k=${k}`)),params:{k}};
 }),
 family('dse-linear','dse','properties','部分正比关系与一次函数','medium','10(a)','试卷第 8 页；PDF 第 9 页',s=>{
  const a=3+s,b=-12,y1=-3*a+b,y2=7*a+b,correct=L`${a}x-12`;
  return {...Q(`函数 ${M(L`g(x)=ax+b`)} 中，${M(L`a,b`)} 为常数。已知 ${M(L`g(-3)=${y1}`)}、${M(L`g(7)=${y2}`)}，求 ${M(L`g(x)`)}。`,correct,worked('两点的函数值之差消去常数项，再代回任意一点。',L`a=\frac{${y2}-(${y1})}{7-(-3)}=${a},\qquad b=${y1}+3\times${a}=-12,\qquad g(x)=${correct}`),[L`${a}x+12`,L`${a+1}x-12`,L`${a}x-11`]),params:{a,b,y1,y2}};
 }),
 family('dse-frustum','dse','solid','相似棱锥与棱台体积','hard','13(a)','试卷第 12 页；PDF 第 13 页',s=>{
  const a=64+4*s,H=24,h=18,n=a*a*37;
  return {...fractionQ(`一个底边长为 ${M(a)} 厘米、高为 ${M(H)} 厘米的正四棱锥，被平行于底面的平面分成上部小棱锥 ${M(L`Y`)} 和下部棱台 ${M(L`X`)}。若 ${M(L`Y`)} 的高为 ${M(h)} 厘米，求 ${M(L`X`)} 的体积（立方厘米）。`,n,8,worked('截面平行于底面，小棱锥与原棱锥相似；体积比是高度比的立方。',L`\frac{h}{H}=\frac34,\quad V_{\text{原}}=\frac13\times${a}^2\times24=${8*a*a},\quad V_X=V_{\text{原}}\left[1-\left(\frac34\right)^3\right]=${F(n,8)}`)),params:{a,H,h},figureKind:'pyramid'};
 }),
 family('dse-cups','dse','probability','不放回抽样与恰好一次命中','medium','16(a)','试卷第 17 页；PDF 第 18 页',s=>{
  const red=16+s,white=4,n=white*C(red,4),d=C(red+white,5);
  return {...fractionQ(`箱中有 ${M(red)} 个红杯和 ${M(white)} 个白杯，各杯等可能被抽到。一次随机抽出 ${M(5)} 个杯子且不放回，恰有 ${M(1)} 个白杯的概率是多少？`,n,d,worked('把同时抽样看成等可能的组合；有利情况由一个白杯和四个红杯组成。',L`P=\frac{\binom41\binom{${red}}4}{\binom{${red+4}}5}=\frac{${n}}{${d}}=${F(n,d)}`)),params:{red,white,draw:5}};
 }),
 family('macau-sets','macau','sets','二次不等式与集合交集','easy','I.1','试卷第 2 页',s=>{
  const r=4+s;
  return {...Q(`设 ${M(L`A=\{x\in\mathbb R:x^2+${r-1}x-${r}\ge0\}`)}，${M(L`B=\{-${r},-2,0,3\}`)}。求 ${M(L`A\cap B`)}。`,L`\{-${r},3\}`,worked('将二次式因式分解得到两个区间，再逐个检查有限集合中的元素。',L`x^2+${r-1}x-${r}=(x+${r})(x-1)\ge0\Longleftrightarrow x\le-${r}\ \text{或}\ x\ge1,\qquad A\cap B=\{-${r},3\}`),[L`\{-2,0\}`,L`\{-${r},-2,3\}`,L`\{3\}`]),params:{r}};
 }),
 family('macau-reciprocal','macau','quadratic','倒数根的韦达定理与指数','medium','I.2','试卷第 2 页',s=>{
  const b=2+s;
  return {...nQ(`已知 ${M(L`\frac1\alpha,\frac1\beta`)} 是方程 ${M(L`2x^2+${b}x-1=0`)} 的两个根。求 ${M(L`2^{\alpha+1}\times2^{\beta+1}`)}。`,2**(b+2),worked('先由韦达定理求两倒数根的和与积，再求原数之和，最后合并指数。',L`\frac1\alpha+\frac1\beta=-\frac{${b}}2,\quad\frac1{\alpha\beta}=-\frac12,\quad\alpha+\beta=${b},\quad2^{\alpha+1}2^{\beta+1}=2^{${b+2}}=${2**(b+2)}`),2**b),params:{b}};
 }),
 family('macau-cylinder','macau','solid','圆柱尺寸变化与体积百分比','easy','I.3','试卷第 2 页',s=>{
  const percent=30+s,n=7*(130+s)**2-100000,ans=dec(n/1000);
  return {...Q(`某圆柱的底面半径增加 ${M(L`${percent}\%`)}，高减少 ${M(L`30\%`)}。新体积相对原体积增加了百分之几？`,ans,worked('体积与半径的平方及高成正比，不能直接将两个百分比相减。',L`\frac{V_{\text{新}}}{V_{\text{原}}}=\left(\frac{${130+s}}{100}\right)^2\times\frac7{10},\qquad\frac{V_{\text{新}}-V_{\text{原}}}{V_{\text{原}}}\times100\%=${ans}\%`),[dec(n/2000),String(percent-30),dec(n/1000+10)]),params:{percent}};
 }),
 family('macau-absolute','macau','inequalities','绝对值二次不等式的区间交集','medium','I.6','试卷第 2 页',s=>{
  const left=shift('x',s),right=shift('x',s+5),good=L`(${s-1},${s+2})\cup(${s+3},${s+6})`;
  return {...Q(`不等式 ${M(L`|${left}${right}|<6`)} 的解集为哪一项？`,good,worked('作平移换元，将绝对值不等式拆成上下界，再求两个解集的交集。',L`u=x-${s},\quad-6<u(u-5)<6,\quad(u+1)(u-6)<0,\quad(u-2)(u-3)>0,\quad x\in${good}`),[L`(${s-1},${s+6})`,L`(${s+2},${s+3})`,L`(-\infty,${s-1})\cup(${s+6},+\infty)`]),params:{shift:s}};
 }),
 family('macau-seating','macau','counting','插空法与不相邻排列','medium','I.7','试卷第 2 页',s=>{
  const girls=4+s,boys=3,n=fact(girls)*C(girls+1,boys)*fact(boys);
  return {...nQ(`将 ${M(girls)} 名女生和 ${M(boys)} 名男生排成一行，每个人均不同。若任意两名男生不相邻，共有多少种排法？`,n,worked('先排列女生，产生首尾也可用的空隙；选出不同空隙后排列男生。',L`N=${girls}!\binom{${girls+1}}3\times3!=${n}`, '每个空隙至多放一名男生，且每种符合条件的排列都被恰好计数一次。'),fact(girls)*6),params:{girls,boys}};
 }),
 family('macau-chord','macau','line-circle','圆内定点与最短弦','medium','I.10','试卷第 3 页',s=>{
  const r=(20+s)/10,n=(20+s)**2-200,correct=rootFraction(n,5);
  return {...Q(`圆 ${M(L`(x-2)^2+y^2=${F((20+s)**2,100)}`)} 内有定点 ${M(L`P(1,1)`)}。过 ${M(L`P`)} 的直线与圆交于 ${M(L`A,B`)}。求弦 ${M(L`AB`)} 长度的最小值。`,correct,worked('圆心到弦所在直线的距离越大，弦越短；该距离至多为圆心到定点的距离。',L`C=(2,0),\quad CP=\sqrt2,\quad d\le CP,\quad |AB|=2\sqrt{r^2-d^2}\ge2\sqrt{${F((20+s)**2,100)}-2}=${correct}`, '当弦所在直线与圆心到定点的连线垂直时取等，且定点严格位于圆内。'),[rootFraction(n+100,5),rootFraction(n,10),rootFraction(n+200,5)]),params:{r},figureKind:'circle'};
 }),
 family('macau-focus','macau','parabola','抛物线定义与焦点距离','medium','I.11','试卷第 3 页',s=>{
  const distance=15+s,p=4*(distance-7);
  return {...nQ(`抛物线 ${M(L`x^2=-py`)} 中 ${M(L`p>0`)}。点 ${M(L`A`)} 在抛物线上，到焦点的距离为 ${M(distance)}，到 ${M(L`x`)} 轴的距离为 ${M(7)}。求 ${M(L`p`)}。`,p,worked('抛物线向下开口，点的纵坐标非正。焦点距离等于到准线的距离。',L`F=(0,-p/4),\quad\text{准线}:y=p/4,\quad y_A=-7,\quad AF=7+\frac p4=${distance}\Longrightarrow p=${p}`),4),params:{L:distance,p},figureKind:'parabola'};
 }),
 family('macau-shooters','macau','probability','独立二项分布的卷积','hard','I.12','试卷第 3 页',s=>{
  const a=10+s,p=F(a,30),q=F(2,3),d=30**3*27;
  let n=0;for(let i=1;i<=3;i++){const j=4-i;n+=C(3,i)*a**i*(30-a)**(3-i)*C(3,j)*2**j;}
  return {...fractionQ(`甲每次射击命中概率为 ${M(p)}，乙为 ${M(q)}。两人各射击 ${M(3)} 次，所有射击互相独立。求两人合计恰好命中 ${M(4)} 次的概率。`,n,d,worked('按甲的命中次数分类；不同分类互斥，同一分类中两人的命中次数独立。',L`X\sim B(3,${p}),\quad Y\sim B(3,${q}),\qquad P(X+Y=4)=\sum_{i=1}^{3}\binom3i(${p})^i(1-${p})^{3-i}\binom3{4-i}(${q})^{4-i}(1-${q})^{i-1}=${F(n,d)}`)),params:{pNumerator:a,pDenominator:30,qNumerator:2,qDenominator:3}};
 }),
 family('gaokao-power','gaokao','properties','幂函数的乘法性单调性与导数奇偶','medium','新高考 I 卷第 14 题','评析例 1，第 71 页',s=>{
  const power=2+2*s;
  return {...Q(`从以下幂函数中选出满足全部条件的一项：对任意实数 ${M(L`x_1,x_2`)} 有 ${M(L`f(x_1x_2)=f(x_1)f(x_2)`)}；当 ${M(L`x>0`)} 时 ${M("f'(x)>0")}；导函数 ${M("f'(x)")} 为奇函数${s ? `，且 ${M(L`f(2)=${2**power}`)}` : ''}。`,L`f(x)=x^{${power}}`,worked('正偶数幂满足乘法性，其导数是正系数的正奇数幂；逐一排除其余选项。',L`f(x)=x^{${power}},\quad f(x_1x_2)=x_1^{${power}}x_2^{${power}},\quad f'(x)=${power}x^{${power-1}}>0\ (x>0),\quad f'(-x)=-f'(x)`,'负号破坏乘法性；奇数幂的导数为偶函数；常函数的导数不严格为正。'),[L`f(x)=-x^{${power}}`,L`f(x)=x^{${power+1}}`,L`f(x)=1`]),params:{power}};
 }),
 family('gaokao-triangle','gaokao','triangle','正弦定理与三边成等差的面积','hard','新高考 I 卷第 18 题(1)','评析例 5，第 72 页',s=>{
  const d=1+s,a=4*d,n=15*d*d,correct=L`\frac{${n}\sqrt7}{4}`;
  return {...Q(`三角形 ${M(L`ABC`)} 的内角 ${M(L`A,B,C`)} 的对边为 ${M(L`a,b,c`)}。已知 ${M(L`b=a+${d}`)}、${M(L`c=a+${2*d}`)}，且 ${M(L`2\sin C=3\sin A`)}。求三角形面积。`,correct,worked('正弦定理把角的条件转为边的比例，再由三边求半周长，应用海伦公式。',L`2c=3a,\quad a=${a},\ b=${5*d},\ c=${6*d},\quad t=\frac{a+b+c}{2}=${F(15*d,2)},\quad S=\sqrt{t(t-a)(t-b)(t-c)}=${correct}`,'三边均为正且满足严格三角不等式，所以构成非退化三角形。'),[L`\frac{${n}\sqrt7}{2}`,L`\frac{${n}\sqrt3}{4}`,L`\frac{${n*2}\sqrt7}{3}`]),params:{a,d},figureKind:'triangle'};
 }),
 family('gaokao-locus','gaokao','hyperbola','焦点距离差定义与双曲线方程','medium','新高考 I 卷第 21 题(1)','评析例 6，第 73 页',s=>{
  const c2=17+s,b2=c2-1,correct=L`x^2-\frac{y^2}{${b2}}=1`;
  return {...Q(`已知两定点 ${M(L`F_1(-\sqrt{${c2}},0)`)}、${M(L`F_2(\sqrt{${c2}},0)`)}。动点 ${M(L`M`)} 满足 ${M(L`\bigl||MF_1|-|MF_2|\bigr|=2`)}，求其轨迹方程。`,correct,worked('到两焦点的距离差的绝对值为正常数，且小于焦距，轨迹为双曲线。',L`2a=2\Longrightarrow a=1,\qquad c^2=${c2},\quad b^2=c^2-a^2=${b2},\qquad ${correct}`,'焦点在横轴上，常数严格小于两焦点间距离，轨迹包含左右两支。'),[L`x^2+\frac{y^2}{${b2}}=1`,L`\frac{x^2}{${b2}}-y^2=1`,L`x^2-\frac{y^2}{${c2}}=1`]),params:{c2},figureKind:'hyperbola'};
 }),
 family('gaokao-branching','gaokao','random-variable','离散分布列与后代数量期望','medium','新高考 II 卷第 21 题(1)','评析例 7，第 73 页',s=>{
  const weights=[80-s,60,40,20+s],n=200+3*s;
  return {...fractionQ(`一种动物一只个体的下一代数量 ${M(L`X`)} 的分布列为 ${M(L`\begin{array}{c|rrrr}X&0&1&2&3\\\hline P&${F(weights[0],200)}&${F(weights[1],200)}&${F(weights[2],200)}&${F(weights[3],200)}\end{array}`)}。求 ${M(L`E(X)`)}。`,n,200,worked('检查概率非负且和为一，再用取值与概率的乘积求和。',L`\sum p_i=1,\qquad E(X)=0\times${F(weights[0],200)}+1\times${F(weights[1],200)}+2\times${F(weights[2],200)}+3\times${F(weights[3],200)}=${F(n,200)}`)),params:{weights,denominator:200}};
 }),
 family('gaokao-earthquake','gaokao','exp-log','震级模型与常用对数反解','medium','全国甲卷理科第 4 题／文科第 6 题','评析例 9，第 74 页',s=>{
  const t=-1+s,level=dec(4.9+s/10),good=L`10^{${F(t,10)}}`;
  return {...Q(`采用震级模型 ${M(L`L=5+\lg V`)}，其中 ${M(L`\lg`)} 为常用对数，${M(L`V>0`)}。某次震级为 ${M(level)}，求 ${M(L`V`)} 的精确值。`,good,worked('先将常数移项，再按照常用对数的定义改写为指数形式。',L`\lg V=${level}-5=${F(t,10)}\quad\Longrightarrow\quad V=${good}`),[L`10^{${F(t+10,10)}}`,L`10^{${F(t-10,10)}}`,L`10^{${F(t+5,10)}}`]),params:{t,level}};
 },'全国甲卷'),
 family('gaokao-normal','gaokao','random-variable','正态分布的对称性与区间概率','medium','新高考 II 卷第 6 题','评析例 11，第 74 页',s=>{
  const mu=10+s/10,f=offset=>dec(mu+offset),good=L`P(${f(-.1)}<X<${f(.2)})=P(${f(0)}<X<${f(.3)})`;
  return {...Q(`设 ${M(L`X\sim N(${f(0)},\sigma^2)`)}，${M(L`\sigma>0`)}。以下说法中错误的是哪一项？`,good,worked('正态密度关于均值对称，且随到均值距离增大而严格减小。比较两个等长区间时，可消去重叠部分。',L`P(${f(-.1)}<X<${f(.2)})-P(${f(0)}<X<${f(.3)})=P(${f(-.1)}<X<${f(0)})-P(${f(.2)}<X<${f(.3)})>0`,'靠近均值的等长区间概率严格更大，所以所列等式错误；其余三项均由对称性或标准化得到。'),[L`P(X>${f(0)})=\frac12`,L`P(X<${f(.01)})=P(X>${f(-.01)})`,L`\sigma\text{ 越小，}P(${f(-.1)}<X<${f(.1)})\text{ 越大}`]),params:{mu}};
 }),
 family('gaokao-unit-vectors','gaokao','vectors','单位圆上的向量夹角与数量积','medium','新高考 I 卷第 10 题','评析例 12，第 75 页',s=>{
  const alpha=30+s*3,beta=60+s*2,correct=L`\cos${alpha}^\circ`;
  return {...Q(`单位圆上有 ${M(L`A(1,0)`)}、${M(L`P_1(\cos\alpha,\sin\alpha)`)}、${M(L`P_2(\cos\beta,\sin\beta)`)}、${M(L`P_3(\cos(\alpha+\beta),\sin(\alpha+\beta))`)}。若 ${M(L`\alpha=${alpha}^\circ`)}、${M(L`\beta=${beta}^\circ`)}，则 ${M(L`\overrightarrow{OP_2}\cdot\overrightarrow{OP_3}`)} 等于哪一项？`,correct,worked('两个向量均为单位向量，夹角由两极角相减得到，也可用余弦差公式直接展开。',L`\overrightarrow{OP_2}\cdot\overrightarrow{OP_3}=\cos\beta\cos(\alpha+\beta)+\sin\beta\sin(\alpha+\beta)=\cos\alpha=${correct}`),[L`\cos${beta}^\circ`,L`\cos${alpha+beta}^\circ`,L`-\cos${alpha}^\circ`]),params:{alpha,beta},figureKind:'unit-circle'};
 }),
 family('gaokao-cube','gaokao','space','正方体侧面动点与三角形面积最值','hard','新高考 I 卷第 12 题','评析例 13，第 75 页',s=>{
  const a=1+s,correct=L`\frac{${a*a===1?'':a*a}\sqrt2}{2}`;
  return {...Q(`正方体 ${M(L`ABCD-A_1B_1C_1D_1`)} 的棱长为 ${M(a)}。点 ${M(L`P`)} 满足 ${M(L`\overrightarrow{BP}=\lambda\overrightarrow{BC}+\mu\overrightarrow{BB_1}`)}，其中 ${M(L`0\le\lambda,\mu\le1`)}。求三角形 ${M(L`ABP`)} 面积的最大值。`,correct,worked('以底边为一条坐标轴，动点到这条直线的距离只由另两个坐标决定。面积在两个参数同时取上界时最大。',L`A=(0,0,0),\quad B=(${a},0,0),\quad P=(${a},${a}\lambda,${a}\mu),\quad S=\frac{${a}^2}{2}\sqrt{\lambda^2+\mu^2}\le${correct}`,'当两个参数均为一时取等，即动点到达侧面的对角顶点；边界属于允许范围。'),[L`${a*a===1?'':a*a}\sqrt2`,L`\frac{${a*a===1?'':a*a}\sqrt3}{2}`,L`\frac{${a*a}}2`]),params:{a},figureKind:'cube'};
 })
];

export function buildExamQuestions(batch,topics){
 const exam=['dse','macau','gaokao'][batch-10],items=families.filter(f=>f.exam===exam);
 if(items.length!==8)throw Error('Expected eight sourced families per exam');
 return items.flatMap((item,f)=>Array.from({length:10},(_,s)=>{
  const q=item.generate(s),source=examSources[exam],baseId=`M${2401+(batch-10)*80+f*10}`,id=`M${2401+(batch-10)*80+f*10+s}`;
  const offset=(f+s)%4,options=q.choices.map((_,i)=>q.choices[(i+offset)%4]);
  return {id,batch,topic:item.topic,topicName:topics.find(t=>t.id===item.topic).name,family:item.key,variant:s+1,strategy:item.strategy,contentRevision:1,exam,stem:q.stem,options,answer:options.indexOf(q.correct),explanation:q.explanation,params:q.params,
   provenance:{sourceId:exam,year:source.year,paper:item.paper||(exam==='gaokao'?item.question.split('卷')[0]+'卷':source.paper),question:item.question,page:item.page,url:source.url,checkedDate:source.checkedDate,kind:s===0?'adapted':'variant',baseId},
   ...reviewedDifficulty(item.key,item.difficulty),
   ...(q.figureKind?{diagram:{src:`assets/geometry/${id}.svg`,alt:item.strategy+'示意图；具体条件以题干为准',kind:q.figureKind}}:{})};
 }));
}
