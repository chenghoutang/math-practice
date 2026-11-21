// Shared local figures and source attribution for practice, papers and tree leaves.
(() => {
 'use strict';
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 function mount(container,q,{compact=false}={}){
  container.replaceChildren();container.className='question-assets';
  if(q.provenance){
   const p=q.provenance,source=window.MATH_MANIFEST?.examSources?.[p.sourceId],block=el('div',undefined,'question-provenance');
   block.append(el('span',p.kind==='variant'?'数值变式':p.kind==='derived'?'模型拓展':'考题改编','source-badge'));
   const a=el('a',`${source?.label||p.sourceId} · ${p.year} · ${p.question}`);
   if(/^https:\/\//.test(p.url)){a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';}
   block.append(a);
   if(!compact){block.append(el('span',`${p.paper} · ${p.page}`,'source-location'));if(p.kind==='variant'){const base=el('a',`查看母题 ${p.baseId}`);base.href='index.html#'+p.baseId;block.append(base);}block.append(el('small',p.kind==='variant'?'依据所列考题改编，自编数值与解析。':p.adaptation||'题干与选项经改编，解析为自编；非原卷完整题面。'));}
   container.append(block);
   if(!compact&&q.difficultyReview){const review=el('details',undefined,'difficulty-review'),summary=el('summary',`难度依据 · ${q.difficultyLabel}`);review.append(summary,el('p',q.difficultyReview.reason));container.append(review);}
  }
  if(q.diagram){
   const figure=el('figure',undefined,'question-figure'),img=el('img');img.src=q.diagram.src;img.alt=q.diagram.alt;img.width=420;img.height=325;img.decoding='async';if(compact)img.loading='lazy';
   figure.append(img,el('figcaption','示意图 · 以题干条件为准'));container.append(figure);
  }
  container.hidden=!container.childNodes.length;
 }
 window.MathQuestionAssets={mount};
})();
