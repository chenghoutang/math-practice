(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MathExam=api;})(typeof window!=='undefined'?window:globalThis,()=>{
 'use strict';
 const blueprint=Object.freeze({easy:4,medium:6,hard:8,hell:2}),durationSeconds=4380;
 const source=q=>q.batch<=6?'foundation':q.batch<=8?'thinking':'new';
 const sources=Object.freeze({foundation:'基础题库',thinking:'思维训练',new:'新增题型'});
 function defaults(questions){return {mode:'custom',count:20,levels:Object.keys(blueprint),topics:[...new Set(questions.map(q=>q.topic))],sources:[...new Set(questions.map(source))]};}
 function allocateCounts(total,weights){
  const levels=Object.keys(blueprint),values=levels.map(level=>weights?.[level]);
  if(!Number.isSafeInteger(total)||total<1||values.some(value=>!Number.isSafeInteger(value)||value<0))throw Error('题目数量与比例须为非负整数，且总题数至少为 1');
  const sum=values.reduce((a,b)=>a+b,0);if(!Number.isSafeInteger(sum)||sum===0)throw Error('请先为至少一种难度填写题目数量');
  const shares=values.map(value=>BigInt(total)*BigInt(value)),divisor=BigInt(sum),counts=shares.map(value=>Number(value/divisor));
  const order=levels.map((level,i)=>i).sort((a,b)=>{const left=shares[a]%divisor,right=shares[b]%divisor;return left===right?a-b:left>right?-1:1;});
  const remaining=total-counts.reduce((a,b)=>a+b,0);for(let i=0;i<remaining;i++)counts[order[i]]++;
  return Object.fromEntries(levels.map((level,i)=>[level,counts[i]]));
 }
 function normalize(questions,options){const all=defaults(questions),result={mode:options?.mode==='standard'?'standard':'custom',count:options?.count??20};
  for(const field of ['levels','topics','sources']){const values=options?.[field]??all[field];if(!Array.isArray(values)||values.some(v=>!all[field].includes(v)))throw Error('出卷范围包含无效标签');result[field]=[...new Set(values)];}
  if(options?.questionIds!==undefined){const ids=options.questionIds,known=new Set(questions.map(q=>q.id));if(!Array.isArray(ids)||ids.some(id=>!known.has(id)))throw Error('出卷范围包含无效题目');result.questionIds=[...new Set(ids)];}
  if(!Number.isInteger(result.count)||result.count<1||result.count>questions.length)throw Error(`题目数量须为 1 至 ${questions.length} 的整数`);
  if(result.mode==='standard')result.count=20;
  else if(options?.difficultyCounts!==undefined){
   const counts=options.difficultyCounts;if(!counts||typeof counts!=='object'||Array.isArray(counts)||Object.keys(counts).some(level=>!Object.hasOwn(blueprint,level)))throw Error('各难度题量格式无效');
   result.difficultyCounts={};for(const level of Object.keys(blueprint)){const count=counts[level];if(!Number.isInteger(count)||count<0||count>questions.length)throw Error('各难度题量须为非负整数');if(count>0&&!result.levels.includes(level))throw Error('未勾选的难度不能分配题目');result.difficultyCounts[level]=count;}
   if(Object.values(result.difficultyCounts).reduce((a,b)=>a+b,0)!==result.count)throw Error('各难度题量之和须等于总题数');
  }
  return result;
 }
 function pool(questions,options){const config=normalize(questions,options),ids=config.questionIds===undefined?null:new Set(config.questionIds);return questions.filter(q=>config.levels.includes(q.difficulty)&&config.topics.includes(q.topic)&&config.sources.includes(source(q))&&(!ids||ids.has(q.id)));}
 function shuffled(values,random=Math.random){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
 function pick(pool,count,random){const candidates=shuffled(pool,random),chosen=[],seen=new Set();for(const q of candidates)if(chosen.length<count&&!seen.has(q.family)){chosen.push(q);seen.add(q.family);}for(const q of candidates)if(chosen.length<count&&!chosen.includes(q))chosen.push(q);return chosen;}
 function create(questions,random=Math.random,options){
  // Calls without options retain the original fixed paper API.
  const config=normalize(questions,options||{mode:'standard'}),available=pool(questions,config);let chosen=[];
  if(!config.levels.length||!config.topics.length||!config.sources.length)throw Error('每组范围至少勾选一个标签');
  if(config.mode==='standard'||config.difficultyCounts)for(const [level,count]of Object.entries(config.mode==='standard'?blueprint:config.difficultyCounts)){const group=available.filter(q=>q.difficulty===level);if(group.length<count)throw Error(`当前范围的${{easy:'简单',medium:'中等',hard:'困难',hell:'地狱'}[level]}题不足 ${count} 道，请调整题量或扩大范围`);chosen.push(...pick(group,count,random));}
  else{if(available.length<config.count)throw Error(`当前范围只有 ${available.length} 道题，请减少题量或扩大范围`);chosen=pick(available,config.count,random);chosen.sort((a,b)=>Object.keys(blueprint).indexOf(a.difficulty)-Object.keys(blueprint).indexOf(b.difficulty));}
  const ids=chosen.map(q=>q.id);return {version:3,ids,config,revisions:Object.fromEntries(chosen.map(q=>[q.id,q.contentRevision||1])),answers:{},elapsed:0,submitted:false,createdAt:Date.now()};
 }
 function restore(raw,questions){
  if(!raw||![2,3].includes(raw.version)||!Array.isArray(raw.ids)||!raw.ids.length||raw.ids.length>questions.length||new Set(raw.ids).size!==raw.ids.length)return null;
  let config;try{config=normalize(questions,raw.version===2?{mode:'standard'}:raw.config);}catch{return null;}
  const byId=new Map(questions.map(q=>[q.id,q])),counts={},available=new Set(pool(questions,config).map(q=>q.id));
  if(raw.ids.length!==config.count)return null;
  for(const id of raw.ids){const q=byId.get(id);if(!q||!available.has(id)||raw.revisions?.[id]!==(q.contentRevision||1))return null;counts[q.difficulty]=(counts[q.difficulty]||0)+1;}
  if(config.mode==='standard'&&Object.entries(blueprint).some(([level,count])=>counts[level]!==count))return null;
  if(config.difficultyCounts&&Object.entries(config.difficultyCounts).some(([level,count])=>(counts[level]||0)!==count))return null;
  const answers={};for(const id of raw.ids){const v=raw.answers?.[id];if(Number.isInteger(v)&&v>=0&&v<4)answers[id]=v;}
  return {version:3,ids:[...raw.ids],config,revisions:Object.fromEntries(raw.ids.map(id=>[id,raw.revisions[id]])),answers,elapsed:Number.isFinite(raw.elapsed)&&raw.elapsed>=0?raw.elapsed:0,submitted:raw.submitted===true,createdAt:Number.isFinite(raw.createdAt)?raw.createdAt:Date.now()};
 }
 function grade(exam,questions){const byId=new Map(questions.map(q=>[q.id,q]));const rows=exam.ids.map(id=>({id,selected:exam.answers[id]??null,correct:exam.answers[id]===byId.get(id).answer})),correct=rows.filter(q=>q.correct).length,unanswered=rows.filter(q=>q.selected===null).length;return {score:Math.round(correct/exam.ids.length*10000)/100,correct,unanswered,wrong:exam.ids.length-correct-unanswered,rows};}
 function target(exam,questions){const byId=new Map(questions.map(q=>[q.id,q]));return exam.ids.reduce((sum,id)=>sum+byId.get(id).targetSeconds,0);}
 return {blueprint,durationSeconds,source,sources,defaults,allocateCounts,normalize,pool,create,restore,grade,target};
});
