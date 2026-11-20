(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MathKnowledge=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 'use strict';
 const groups=[
  ['foundations','集合、逻辑与代数基础',['sets','logic','complex','inequalities']],
  ['functions','函数与方程',['quadratic','domain','properties','exp-log','piecewise']],
  ['trigonometry','三角函数与解三角形',['trig-function','trig-identity','triangle']],
  ['sequences','数列',['arithmetic','geometric','recurrence']],
  ['geometry','平面向量与解析几何',['vectors','line-circle','ellipse','hyperbola','parabola']],
  ['space','空间向量与立体几何',['space','solid']],
  ['probability','计数、概率与统计',['counting','probability','conditional','random-variable','statistics']],
  ['calculus','导数与微积分',['derivative','derivative-use','integral']]
 ];
 const names={
  sets:['交集与元素计数','整数集合计数','容斥原理','子集计数','集合包含与参数','有序集合对计数'],
  logic:['充分必要条件','含量词命题的否定','全称命题与参数','充分条件与区间包含','存在命题与最值','多重量词与最值'],
  complex:['复数的模','共轭复数','复数除法与实部','复数方程与虚部','圆轨迹与模的最值','等距轨迹与交点'],
  inequalities:['基本不等式求最小值','不等式与符号','平移换元求最值','定和求积的最大值','柯西不等式','倒数约束与换元'],
  quadratic:['顶点与最值','韦达定理','区间上的二次函数最值','判别式与实根','两根落在指定区间','平移与正根条件'],
  domain:['根式函数定义域','分式函数定义域','对数与根式的交集','根式与分母限制','对数换元与定义域','区间有定义与参数'],
  properties:['偶函数的判断','奇函数的判断','平移与奇偶性','周期性求函数值','奇偶性与单调性','复合函数比较'],
  'exp-log':['指数运算','对数运算','对数运算法则','对数方程与换元','对数不等式','指数绝对值与根数'],
  piecewise:['绝对值计算','分段函数求值','分段函数复合','绝对值方程','绝对值方程的根数','分段图像与交点'],
  'trig-function':['最小正周期','振幅与最大值','三角方程的根数','辅助角公式','三角换元与根数','三角不等式恒成立'],
  'trig-identity':['二倍角公式','同角三角恒等式','正切与二倍角','正弦余弦和的计算','和积换元与根数','三角分式的值域'],
  triangle:['勾股定理','正弦定理与外接圆','余弦定理','三角形面积','内切圆半径的最值','内切圆与周长'],
  vectors:['向量加法','向量数量积','垂直与数量积','向量和的模','向量线性组合与参数','动点与数量积最值'],
  arithmetic:['等差数列通项','等差数列求和','由已知项求和','等差数列对称项','前项和与不等式','前项和的最大值'],
  geometric:['等比数列通项','等比数列求和','指数增长与轮次','等比中项','负公比与求和','由项的关系求和'],
  recurrence:['由通项求数列项','加法递推','线性递推','裂项相消求和','分式递推与求和','错位相减与有限和'],
  'line-circle':['直线斜率','圆的半径','点到直线的距离','圆的弦长','过定点的弦与最值','圆的切线与接触弦'],
  ellipse:['椭圆长轴','椭圆焦距','椭圆离心率','椭圆定义与焦距和','焦点三角形面积','焦点弦与倒数和'],
  hyperbola:['双曲线实轴','双曲线渐近线','双曲线焦距','双曲线离心率','焦点三角形','点到渐近线的距离积'],
  parabola:['抛物线焦点','抛物线准线','抛物线切线','焦半径','直线与抛物线交点','焦点弦长'],
  space:['空间向量数量积','平面法向量','直线与平面的夹角','点到平面的距离','点到直线距离的最值','二面角与参数'],
  solid:['正方体体积','球的表面积','棱锥体积','圆台体积','正四面体内切球','圆锥内接圆柱最值'],
  counting:['组合计数','排列计数','相邻排列与捆绑','二项式系数','不相邻选择','多项式系数'],
  probability:['等可能事件','随机抽球','不放回抽样','对立事件','条件概率与抽样','排列事件的容斥'],
  conditional:['条件概率公式','独立事件','贝叶斯公式','全概率公式','检测与后验概率','后验抽样概率'],
  'random-variable':['二项分布的期望','二项分布的方差','二项分布概率','正态分布的对称性','二项分布参数与阶乘矩','随机变量变换与方差'],
  statistics:['平均数','中位数','方差计算','线性回归预测','新增数据与方差','最小二乘与残差'],
  derivative:['幂函数求导','指数复合函数求导','乘积求导','曲线切线','过定点的切线条数','函数关系与求导'],
  'derivative-use':['导数与单调性','函数最小值点','极大值与极小值','对数函数最值','三次方程根的分布','对数方程根数与参数'],
  integral:['幂函数不定积分','指数函数不定积分','对数型换元积分','三角函数换元积分','多项式除法积分','分式分解与积分']
 };
 const levels={easy:'简单',medium:'中等',hard:'困难',hell:'地狱'};
 function familyName(q){if(q.strategy)return q.strategy;const match=q.family.match(/-(easy|medium|hard)-([12])$/);return match?names[q.topic]?.[['easy','medium','hard'].indexOf(match[1])*2+Number(match[2])-1]||q.family:q.family;}
 function build(questions,topics){
  const topicNodes=topics.map(topic=>{const families=new Map();for(const q of questions.filter(q=>q.topic===topic.id)){if(!families.has(q.family))families.set(q.family,{id:'family:'+q.family,title:familyName(q),kind:'family',difficulty:q.difficulty,children:[]});families.get(q.family).children.push({id:q.id,title:q.id,kind:'question',question:q,ids:[q.id]});}return {id:'topic:'+topic.id,title:topic.name,kind:'topic',topic:topic.id,children:[...families.values()]};});
  const assigned=new Set(groups.flatMap(group=>group[2])),nodes=groups.map(([id,title,ids])=>({id:'group:'+id,title,kind:'group',children:ids.map(id=>topicNodes.find(topic=>topic.topic===id)).filter(Boolean)}));
  const other=topicNodes.filter(topic=>!assigned.has(topic.topic));if(other.length)nodes.push({id:'group:other',title:'其他知识模块',kind:'group',children:other});
  function collect(node){if(node.children)node.ids=node.children.flatMap(collect);return node.ids;}
  nodes.forEach(collect);return nodes.filter(node=>node.ids.length);
 }
 function mount(container,{questions,topics,selectable=false,onChange=()=>{},onOpen}={}){
  const roots=build(questions,topics),allIds=questions.map(q=>q.id),byId=new Map(),views=new Map();let selected=new Set(allIds),visible=new Set(allIds);
  const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
  const visit=node=>{byId.set(node.id,node);node.children?.forEach(visit);};roots.forEach(visit);
  container.classList.add('knowledge-tree');
  function update(){for(const [id,{input,count,item}]of views){const node=byId.get(id),ids=node.ids.filter(id=>visible.has(id)),total=ids.length,chosen=ids.filter(id=>selected.has(id)).length;item.hidden=total===0;if(input){input.checked=total>0&&chosen===total;input.indeterminate=chosen>0&&chosen<total;}if(count)count.textContent=selectable?`${chosen} / ${total} 题`:`${total} 题`;}empty.hidden=visible.size>0;}
  function choose(node,checked){for(const id of node.ids)checked?selected.add(id):selected.delete(id);update();onChange();}
  function checkbox(node){const input=el('input');input.type='checkbox';input.value=node.kind==='topic'?node.topic:node.id;input.dataset.kind=node.kind;input.setAttribute('aria-label',`选择${node.title}`);input.addEventListener('change',()=>choose(node,input.checked));return input;}
  function render(node,list){
   const item=el('li');list.append(item);
   if(node.kind==='question'){
    const row=el('div',undefined,'knowledge-question');row.dataset.questionId=node.id;
    const copy=el('div',undefined,'knowledge-question-copy'),link=el('a',`${node.id} · ${levels[node.question.difficulty]}`,'knowledge-question-link');link.href=(selectable?'index.html':'')+'#'+node.id;
    if(onOpen)link.addEventListener('click',event=>{event.preventDefault();onOpen(node.question);});
    const stem=el('div',node.question.stem,'math-copy knowledge-stem');copy.append(link,stem);
    const input=selectable?checkbox(node):null;if(input)row.append(input);row.append(copy);item.append(row);views.set(node.id,{input,item});window.renderPracticeMath?.(stem);return;
   }
   const details=el('details',undefined,'knowledge-branch'),summary=el('summary'),label=el('label',undefined,'knowledge-label'),title=el('span',node.title,'knowledge-title'),count=el('small'),input=selectable?checkbox(node):null;
   details.dataset.nodeId=node.id;details.dataset.kind=node.kind;
   if(input){label.append(input);label.addEventListener('click',event=>event.stopPropagation());}
   label.append(title);summary.append(label);if(node.difficulty)summary.append(el('span',levels[node.difficulty],'knowledge-level'));summary.append(count);details.append(summary);item.append(details);views.set(node.id,{input,count,item});
   let loaded=false;function load(){if(loaded)return;loaded=true;const children=el('ul');details.append(children);for(const child of node.children)render(child,children);update();}
   details.addEventListener('toggle',()=>{if(details.open)load();});details.loadChildren=load;
  }
  const list=el('ul'),empty=el('p','没有符合当前条件的题目，试试调整难度、练习范围或搜索词。','note knowledge-empty');empty.setAttribute('role','status');container.replaceChildren(list,empty);roots.forEach(node=>render(node,list));update();
  function openNode(node){const view=container.querySelector(`[data-node-id="${node.id}"]`);if(view){view.loadChildren();view.open=true;}}
  return {
   selection:()=>selected.size===allIds.length?undefined:allIds.filter(id=>selected.has(id)),
   topics:()=>topics.filter(topic=>questions.some(q=>q.topic===topic.id&&selected.has(q.id))).map(topic=>topic.id),
   setSelection(config){const allowed=config.questionIds===undefined?new Set(allIds):new Set(config.questionIds),topicSet=new Set(config.topics);selected=new Set(questions.filter(q=>topicSet.has(q.topic)&&allowed.has(q.id)).map(q=>q.id));update();},
   selectAll(checked){selected=new Set(checked?allIds:[]);update();onChange();},
   filter(ids){const next=new Set(ids.filter(id=>byId.has(id)));if(next.size===visible.size&&[...next].every(id=>visible.has(id)))return;visible=next;update();},
   collapse(){container.querySelectorAll('details').forEach(details=>details.open=false);},
   reveal(id){function walk(nodes){for(const node of nodes){if(!node.ids.includes(id))continue;openNode(node);if(node.children)walk(node.children);}}walk(roots);update();},
   openModules(){for(const root of roots)openNode(root);update();}
  };
 }
 return {groups,familyName,build,mount};
});
