import {L,M,F,Q as makeQ,C,fact} from './core.mjs';
export {L,M,F,C,fact};
export const Q=(stem,answer,idea,derivation,wrong)=>({...makeQ(stem,answer,'解析',wrong),explanation:`${idea}\n关键推导\n$$\n${derivation}\n$$\n检查题设的定义域、边界及取等条件后，得到所求结果。`});
export const N=(stem,answer,idea,derivation,step=1)=>Q(stem,String(answer),idea,derivation,[answer+step,answer-step,answer+2*step]);
export const R=(stem,n,d,idea,derivation)=>Q(stem,F(n,d),idea,derivation,[F(n+d,d),F(n-d,d),F(n+2*d,d)]);
export const fix=n=>Number(n.toFixed(8)).toString();
export function item(source,question,topic,name,generate,level='medium',page){return {source,question,topic,name,generate,level,page};}
const macauIndex='https://reg.um.edu.mo/admissions/macao-students/admission-examination/jae/syllabus-paper/';
const macau=(year,supp,path)=>({label:'澳门四校联考',year,paper:'数学'+(supp?'附加卷':'正卷'),url:`https://reg.um.edu.mo/download/admission-local/jae/${path}/${supp?'JM02':'JM01'}.pdf`,indexUrl:macauIndex,checkedDate:'2026-11-21',exam:'macau'});
export const expansionSources={
 'macau25':macau(2025,false,'pastexampaper1'),'macau26':macau(2026,false,'pastexampaper2'),
 'macau25s':macau(2025,true,'pastexampaper1'),'macau26s':macau(2026,true,'pastexampaper2'),
 'dse23':{label:'香港 DSE',year:2023,paper:'数学必修部分试卷一',url:'https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/math/2023-Sample-MATH-CP-Level5-E-4792.pdf',indexUrl:'https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/math/sp/2023_Sample_CP.html',checkedDate:'2026-11-21',exam:'dse'},
 'gaokao21':{label:'内地高考',year:2021,paper:'全国卷',url:'https://gaokao.neea.edu.cn/html1/report/22012/3061-1.htm',checkedDate:'2026-11-21',exam:'gaokao'}
};
export const I=(src,q,topic,name,fn,level='medium',page)=>item(src,q,topic,name,fn,level,page);
export const rad=(n,coeff=1)=>`${coeff===1?'':coeff}\\sqrt{${n}}`;
export const data=(q,p,figure)=>({...q,params:p,...(figure?{figure}:{})});
