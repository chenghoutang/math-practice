import {families as macau25} from './expansion-macau25.mjs';
import {families as macau26} from './expansion-macau26.mjs';
import {families25,families26} from './expansion-supplement.mjs';
import {families as dse} from './expansion-dse.mjs';
import {families as gaokao} from './expansion-gaokao.mjs';
import {expansionSources} from './expansion-core.mjs';
import {reviewedDifficulty} from './difficulty-review.mjs';
export {expansionSources};
export const families=[...macau25,...macau26,...families25,...families26,...dse,...gaokao];
if(families.length!==100)throw Error('Expected 100 expansion families');
export function buildExpansion(batch,topics){
 const start=(batch-13)*20,items=families.slice(start,start+20);
 return items.flatMap((item,j)=>Array.from({length:10},(_,s)=>{
  const f=start+j,q=item.generate(s),source=expansionSources[item.source],baseId=`M${2641+f*10}`,id=`M${2641+f*10+s}`,offset=(f+s)%4,options=q.choices.map((_,i)=>q.choices[(i+offset)%4]);
  const derived=/推论|特例|模型|分类|平方根条件|两代/.test(item.question);
  return {id,batch,topic:item.topic,topicName:topics.find(t=>t.id===item.topic).name,family:`expansion-${f+1}`,strategy:item.name,variant:s+1,contentRevision:1,exam:source.exam,stem:q.stem,options,answer:options.indexOf(q.correct),explanation:q.explanation,params:q.params,
   provenance:{sourceId:source.exam,documentId:item.source,year:source.year,paper:source.paper,question:item.question,page:item.page,url:source.url,checkedDate:source.checkedDate,kind:s?'variant':derived?'derived':'adapted',baseId,adaptation:derived?'依据所列考题的条件或模型自编拓展问题。':'保留所列小题的核心条件，重写题干、选项和解析。'},
   ...reviewedDifficulty(`expansion-${f+1}`,item.level),
   ...(q.figure?{figure:q.figure,diagram:{src:`assets/geometry/${id}.svg`,alt:item.name+'示意图；以题干条件为准',kind:'scene'}}:{})};
 }));
}
