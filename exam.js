(() => {
 'use strict';
 const $=id=>document.getElementById(id),key='dengduck-math-exam-v1',settingsKey='dengduck-math-exam-settings-v1',engine=window.MathExam;
 const questions=(window.MATH_BATCHES||[]).flatMap(b=>b.questions),byId=new Map(questions.map(q=>[q.id,q])),labels={easy:'简单',medium:'中等',hard:'困难',hell:'地狱'};
 let exam=null,paused=true,started=0,confirmAction=null,storageOK=true,bankUpdated=false,page=0;
 const pageSize=20,node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const renderMath=el=>window.renderPracticeMath(el);
 const elapsed=()=>exam?exam.elapsed+(!paused&&!exam.submitted?Date.now()-started:0):0;
 const checked=id=>[...$(id).querySelectorAll('input:checked')].map(el=>el.value);
 const levels=Object.keys(labels),countInput=level=>$('count-'+level);
 let ratioWeights=null,enabledLevels=new Set(levels),previousCounts={...engine.blueprint},previousWeights={...engine.blueprint};
 const counts=()=>Object.fromEntries(levels.map(level=>[level,checked('levelTags').includes(level)?countInput(level).value===''?NaN:Number(countInput(level).value):0]));
 const writeCounts=values=>levels.forEach(level=>countInput(level).value=values[level]);
 function sumCounts(){const sum=Object.values(counts()).reduce((a,b)=>a+b,0);$('examCount').value=Number.isFinite(sum)?sum:'';}
 let topicTree;
 const settings=()=>({mode:$('examMode').value,count:Number($('examCount').value),levels:checked('levelTags'),topics:topicTree.topics(),questionIds:topicTree.selection(),sources:checked('sourceTags'),...($('examMode').value==='custom'?{difficultyCounts:counts()}:{})});
 function setSettings(config){
  $('examMode').value=config.mode;$('examCount').value=config.count;for(const [id,field]of [['levelTags','levels'],['sourceTags','sources']])$(id).querySelectorAll('input').forEach(input=>input.checked=config[field].includes(input.value));topicTree.setSelection(config);
  enabledLevels=new Set(config.levels);const weights=Object.fromEntries(levels.map(level=>[level,enabledLevels.has(level)?engine.blueprint[level]:0]));
  writeCounts(config.difficultyCounts||(config.levels.length?engine.allocateCounts(config.count,weights):Object.fromEntries(levels.map(level=>[level,0]))));
  previousCounts={...engine.blueprint,...counts()};$('lockRatio').checked=config.lockRatio===true;
  if($('lockRatio').checked){try{ratioWeights=Object.fromEntries(levels.map(level=>[level,enabledLevels.has(level)?config.ratioWeights?.[level]??counts()[level]:0]));engine.allocateCounts(1,ratioWeights);previousWeights={...ratioWeights};}catch{ratioWeights=null;$('lockRatio').checked=false;}}
 }
 function rangeChanged(){
  const selected=new Set(checked('levelTags')),locked=$('lockRatio').checked;let changed=false;
  for(const level of levels){
   if(enabledLevels.has(level)&&!selected.has(level)){
    const value=Number(countInput(level).value);
    if(Number.isInteger(value)&&value>=0)previousCounts[level]=value;
    if(locked)previousWeights[level]=ratioWeights?.[level]??value;
    countInput(level).value=0;changed=true;
   }else if(!enabledLevels.has(level)&&selected.has(level)){countInput(level).value=previousCounts[level];changed=true;}
  }
  if(changed){
   if(locked){
    ratioWeights=Object.fromEntries(levels.map(level=>{
     if(!selected.has(level))return [level,0];
     const weight=enabledLevels.has(level)?ratioWeights?.[level]??Number(countInput(level).value):previousWeights[level];
     return [level,weight];
    }));
    try{writeCounts(engine.allocateCounts(Number($('examCount').value),ratioWeights));}catch{}
   }else sumCounts();
   enabledLevels=selected;
  }
  updateSettings();
 }
 function tag(container,value,text){const label=node('label',undefined,'tag-option'),input=node('input');input.type='checkbox';input.value=value;input.checked=true;input.addEventListener('change',rangeChanged);label.append(input,node('span',text));$(container).append(label);}
 function updateSettings(){
  const config=settings(),standard=config.mode==='standard',locked=$('lockRatio').checked;
  $('examCount').disabled=standard;$('examCount').readOnly=!standard&&!locked;$('difficultySettings').hidden=standard;if(standard){$('examCount').value=20;config.count=20;}
  for(const level of levels){countInput(level).disabled=standard||!config.levels.includes(level);countInput(level).readOnly=locked;}
  let error='',pool=[];try{pool=engine.pool(questions,{...config,count:1,difficultyCounts:undefined});engine.normalize(questions,config);if(!config.levels.length||!config.topics.length||!config.sources.length)error='每组范围至少勾选一个标签。';else{const needed=standard?engine.blueprint:config.difficultyCounts;const missing=Object.entries(needed).filter(([level,count])=>pool.filter(q=>q.difficulty===level).length<count);if(missing.length)error=`${standard?'经典配比题量不足':'当前范围题量不足'}：${missing.map(([level,count])=>`${labels[level]}需 ${count} 题，当前可选 ${pool.filter(q=>q.difficulty===level).length} 题`).join('；')}。请调整题量或扩大范围。`;}}catch(e){error=e.message;}
  for(const level of levels){const available=pool.filter(q=>q.difficulty===level).length;$('available-'+level).textContent=`可选 ${available} 题`;countInput(level).max=String(available);}
  $('ratioSummary').hidden=standard||!locked;$('ratioSummary').textContent=locked&&ratioWeights?`已锁定 ${levels.map(level=>ratioWeights[level]).join(' : ')}；余数按比例补齐，合计始终等于总题数。`:'';
  $('examCount').max=String(questions.length);$('poolSummary').textContent=`当前范围可选 ${pool.length} 题 · ${Object.keys(labels).map(level=>`${labels[level]} ${pool.filter(q=>q.difficulty===level).length}`).join(' / ')}`;
  $('settingsError').textContent=error;$('settingsError').hidden=!error;$('newExam').disabled=!!error;
  try{localStorage.setItem(settingsKey,JSON.stringify({...config,lockRatio:locked,ratioWeights:locked?ratioWeights:undefined}));}catch{storageOK=false;}
  return !error;
 }
 for(const [level,label]of Object.entries(labels))tag('levelTags',level,label);
 for(const [level,text]of Object.entries(labels)){const label=node('label'),input=node('input'),available=node('small');input.id='count-'+level;input.type='number';input.min='0';input.step='1';input.inputMode='numeric';input.value=engine.blueprint[level];available.id='available-'+level;input.setAttribute('aria-describedby',available.id);input.addEventListener('input',()=>{if(input.readOnly)return;sumCounts();updateSettings();});label.append(node('span',text),input,available);$('difficultyCounts').append(label);}
 topicTree=window.MathKnowledge.mount($('topicTags'),{questions,topics:window.MATH_MANIFEST?.topics||[],selectable:true,onChange:rangeChanged});topicTree.openModules();
 for(const [value,label]of Object.entries(engine.sources))tag('sourceTags',value,label);
 try{const saved=JSON.parse(localStorage.getItem(settingsKey));if(saved)setSettings({...engine.normalize(questions,saved),lockRatio:saved.lockRatio,ratioWeights:saved.ratioWeights});}catch{}
 $('examMode').addEventListener('change',()=>{if($('examMode').value==='custom')sumCounts();updateSettings();});
 $('examCount').addEventListener('input',()=>{if($('examMode').value==='custom'&&$('lockRatio').checked){try{writeCounts(engine.allocateCounts(Number($('examCount').value),ratioWeights));}catch{}}updateSettings();});
 $('lockRatio').addEventListener('change',()=>{if($('lockRatio').checked){try{ratioWeights=counts();engine.allocateCounts(1,ratioWeights);sumCounts();}catch{ratioWeights=null;$('lockRatio').checked=false;}}else{ratioWeights=null;sumCounts();}updateSettings();});
 document.querySelectorAll('[data-group]').forEach(button=>button.addEventListener('click',()=>{if(button.dataset.group==='topicTags'){topicTree.selectAll(button.dataset.select==='all');return;}$(button.dataset.group).querySelectorAll('input').forEach(input=>input.checked=button.dataset.select==='all');rangeChanged();}));
 $('expandTopics').addEventListener('click',()=>topicTree.openModules());$('collapseTopics').addEventListener('click',()=>topicTree.collapse());
 function capture(){if(!exam)return;exam.elapsed=elapsed();started=Date.now();}
 function save(){if(!exam)return;capture();try{localStorage.setItem(key,JSON.stringify(exam));}catch{storageOK=false;}message();}
 function message(){const text=[];if(bankUpdated)text.push('题库或保存的试卷已更新，原试卷无法继续，请重新出卷。');if(exam?.difficultyMigrated)text.push('题目难度已复评，当前试卷已保留原题与作答，并按新难度更新本卷配比。');if(!storageOK)text.push('当前浏览器无法持久保存，请保持页面打开完成试卷。');if(exam&&!exam.submitted&&paused)text.push('计时已暂停，点击“继续计时”接着做。');if(exam&&!exam.submitted&&elapsed()>engine.target(exam,questions)*1000)text.push('已超过建议时间，可以继续作答。');$('examMessage').textContent=text.join(' ');}
 function tick(){if(!exam)return;const seconds=Math.floor(elapsed()/1000);$('examTimer').textContent=`用时 ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;message();}
 function progress(){if(!exam)return;const count=exam.ids.length,answered=Object.keys(exam.answers).length;$('examProgress').textContent=`已答 ${answered} / ${count} · 未答 ${count-answered}`;exam.ids.forEach((id,i)=>{const link=$('examNav').children[i],selected=exam.answers[id];link.classList.toggle('answered',Number.isInteger(selected));link.classList.toggle('nav-wrong',exam.submitted&&selected!==byId.get(id).answer);link.setAttribute('aria-label',`第 ${i+1} 题，${Number.isInteger(selected)?'已答':'未答'}`);});}
 function feedback(card,q){const selected=exam.answers[q.id];card.querySelectorAll('input').forEach(el=>el.disabled=true);card.querySelectorAll('.option').forEach((el,j)=>{el.classList.toggle('correct',j===q.answer);el.classList.toggle('incorrect',j===selected&&j!==q.answer);});const block=node('div',undefined,'exam-feedback');block.append(node('p',`${selected===q.answer?'✓ 答对':Number.isInteger(selected)?'再积累一下':'未作答'} · 你的答案 ${Number.isInteger(selected)?String.fromCharCode(65+selected):'未选'} · 正确答案 ${String.fromCharCode(65+q.answer)}`),node('div',q.explanation,'math-copy explanation'));renderMath(block);card.append(block);}
 function renderQuestions(){
  $('examQuestions').replaceChildren();page=Math.max(0,Math.min(page,Math.ceil(exam.ids.length/pageSize)-1));
  exam.ids.slice(page*pageSize,(page+1)*pageSize).forEach((id,offset)=>{const i=page*pageSize+offset,q=byId.get(id),card=node('section',undefined,'paper exam-question');card.id='exam-q-'+id;const title=node('h2',`${i+1}. ${q.stem}`,'math-copy');title.id='exam-title-'+id;card.setAttribute('aria-labelledby',title.id);card.append(node('p',`${labels[q.difficulty]} · ${q.topicName} · 建议 ${q.targetSeconds<60?q.targetSeconds+' 秒':q.targetSeconds/60+' 分钟'}`,'eyebrow'),title);
   const assets=node('div');window.MathQuestionAssets.mount(assets,q);card.append(assets);
   const field=node('fieldset');field.append(node('legend',`第 ${i+1} 题，请选择一个答案`,'sr-only'));q.options.forEach((option,j)=>{const label=node('label',undefined,'option'),radio=node('input');radio.type='radio';radio.name=id;radio.value=String(j);radio.checked=exam.answers[id]===j;radio.addEventListener('change',()=>{if(exam.submitted)return;exam.answers[id]=j;save();progress();});label.append(radio,node('span',`${String.fromCharCode(65+j)}. $${option}$`));field.append(label);});card.append(field);renderMath(card);if(exam.submitted)feedback(card,q);$('examQuestions').append(card);
  });$('examPageInfo').textContent=`${page+1} / ${Math.ceil(exam.ids.length/pageSize)} 页`;$('examPagePrev').disabled=page===0;$('examPageNext').disabled=(page+1)*pageSize>=exam.ids.length;
 }
 function showResult(){const result=engine.grade(exam,questions);$('examResult').replaceChildren(node('h2',`${result.score} / 100 分`),node('p',`答对 ${result.correct} 题 · 答错 ${result.wrong} 题 · 未答 ${result.unanswered} 题`));const text=Object.keys(labels).map(level=>{const ids=exam.ids.filter(id=>byId.get(id).difficulty===level);return ids.length?`${labels[level]} ${ids.filter(id=>exam.answers[id]===byId.get(id).answer).length}/${ids.length}`:null;}).filter(Boolean).join(' · ');$('examResult').append(node('p',text,'note'));$('examResult').hidden=false;}
 function render(){
  $('examSession').hidden=!exam;if(!exam)return;$('newExam').textContent='按当前设置重新出卷';$('examResult').hidden=true;$('examNav').replaceChildren();$('examPause').disabled=exam.submitted;$('examPause').textContent=paused?'继续计时':'暂停计时';$('finishExam').disabled=exam.submitted;$('finishExam').textContent=exam.submitted?'已交卷':'提交试卷';$('examSubmitHint').textContent=exam.submitted?'可翻页查看每题答案与解析，或重新出卷。':'完成后交卷，查看成绩与解析。';
  $('examTarget').textContent=`建议 ${Math.ceil(engine.target(exam,questions)/60)} 分钟`;$('paperSummary').textContent=`本卷 ${exam.ids.length} 题 · 总分 100 · 每题等权 · ${Object.keys(labels).map(level=>`${labels[level]} ${exam.ids.filter(id=>byId.get(id).difficulty===level).length}`).join(' / ')}`;
  exam.ids.forEach((id,i)=>{const link=node('a',String(i+1),'pill');link.href='#exam-q-'+id;link.addEventListener('click',e=>{e.preventDefault();page=Math.floor(i/pageSize);renderQuestions();document.getElementById('exam-q-'+id)?.scrollIntoView({block:'start'});});$('examNav').append(link);});renderQuestions();progress();if(exam.submitted)showResult();tick();
 }
 function confirm(title,text,action){confirmAction=action;$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('examConfirm').showModal();$('cancelConfirm').focus();}
 function create(){if(!updateSettings())return;try{exam=engine.create(questions,Math.random,settings());page=0;bankUpdated=false;paused=document.hidden;started=Date.now();save();render();}catch(e){$('settingsError').hidden=false;$('settingsError').textContent=e.message;}}
 $('newExam').addEventListener('click',()=>{if(!updateSettings())return;if(exam&&!exam.submitted)confirm('重新出卷？','当前未交卷的试卷将被替换，已选择的答案会清空。',create);else create();});
 $('examForm').addEventListener('submit',e=>{e.preventDefault();if(!exam||exam.submitted)return;const missing=exam.ids.length-Object.keys(exam.answers).length;confirm('确认交卷？',missing?`还有 ${missing} 题未答，交卷后未答题计 0 分。`:`已完成全部 ${exam.ids.length} 题，交卷后显示得分与解析。`,()=>{capture();exam.submitted=true;paused=true;save();render();$('examResult').focus();});});
 $('cancelConfirm').addEventListener('click',()=>{$('examConfirm').close();confirmAction=null;});$('examConfirm').addEventListener('cancel',()=>{confirmAction=null;});$('acceptConfirm').addEventListener('click',()=>{const action=confirmAction;confirmAction=null;$('examConfirm').close();action?.();});
 $('examPause').addEventListener('click',()=>{if(!exam||exam.submitted)return;capture();paused=!paused;started=Date.now();save();$('examPause').textContent=paused?'继续计时':'暂停计时';tick();});
 for(const [id,delta]of [['examPagePrev',-1],['examPageNext',1]])$(id).addEventListener('click',()=>{page+=delta;renderQuestions();$('examPageInfo').scrollIntoView({block:'center'});});
 document.addEventListener('visibilitychange',()=>{if(exam&&!exam.submitted&&document.hidden&&!paused){capture();paused=true;save();$('examPause').textContent='继续计时';tick();}});window.addEventListener('pagehide',save);
 try{const raw=JSON.parse(localStorage.getItem(key));exam=engine.restore(raw,questions);if(raw&&!exam){bankUpdated=true;localStorage.removeItem(key);}}catch{storageOK=false;}
 updateSettings();render();message();setInterval(()=>{tick();if(exam&&!exam.submitted&&!paused)save();},1000);
})();
