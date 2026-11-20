import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const mode=process.argv[2];
if(!['build','check'].includes(mode))throw Error('Usage: node scripts/run-tasks.mjs <build|check>');
const tasks=mode==='build'
    ?Array.from({length:9},(_,i)=>['scripts/build-math-bank.mjs',String(i+1)])
    :['bank','latex','hell','new-types','exam','knowledge'].map(name=>[`scripts/check-math-${name}.mjs`]);
for(const args of tasks){
    const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit',windowsHide:true});
    if(result.error)throw result.error;
    if(result.status!==0)process.exit(result.status||1);
}
