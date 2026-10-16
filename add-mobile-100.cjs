const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');const {reason}=require('./reasoning.cjs');
const levels=vm.runInNewContext(fs.readFileSync('dist/levels.js','utf8')+';LEVELS');const edition='mobile-reasoning-100';
if(levels.filter(p=>p.edition===edition).length===100){console.log('100 new reasoning levels already present.');process.exit(0)}if(levels.length!==149)throw Error('Expected 149 stable source levels');
let seed=20261016;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n)}
function neighbors(i,n){return[i-n,i+n,...(i%n?[i-1]:[]),...(i%n<n-1?[i+1]:[])].filter(j=>j>=0&&j<n*n)}
function connected(g,n){for(let z=0;z<n;z++){const region=g.flatMap((v,i)=>v===z?[i]:[]);if(!region.length)return false;const set=new Set(region),seen=new Set([region[0]]),stack=[region[0]];while(stack.length)for(const j of neighbors(stack.pop(),n))if(set.has(j)&&!seen.has(j)){seen.add(j);stack.push(j)}if(seen.size!==region.length)return false}return true}
function solve(g,n,limit=2){const out=[],used=new Set(),regions=new Set(),p=[];function go(r){if(out.length>=limit)return;if(r===n){out.push([...p]);return}for(let c=0;c<n;c++){const z=g[r*n+c];if(used.has(c)||regions.has(z)||(r&&Math.abs(p[r-1]-c)<=1))continue;used.add(c);regions.add(z);p.push(c);go(r+1);p.pop();used.delete(c);regions.delete(z)}}go(0);return out}
function canonical(g,n){const all=[];for(let f=0;f<2;f++)for(let t=0;t<4;t++){const out=Array(n*n);for(let r=0;r<n;r++)for(let c=0;c<n;c++){let y=r,x=f?n-1-c:c;for(let k=0;k<t;k++)[y,x]=[x,n-1-y];out[y*n+x]=g[r*n+c]}const ids=new Map();all.push(out.map(v=>{if(!ids.has(v))ids.set(v,ids.size);return ids.get(v)}).join(','))}return n+':'+all.sort()[0]}
const seen=new Set(levels.map(p=>canonical(p.regions,p.n))),added=[],proofs=[];
const baselineHash=crypto.createHash('sha256').update(JSON.stringify(levels)).digest('hex');
// Main progression is phone-sized; advanced 9x9 is retained by user preference.
for(const [n,normal,advanced] of [[5,10,0],[6,20,0],[7,20,5],[8,18,7],[9,12,8]])for(const [style,target] of [['normal',normal],['advanced',advanced]]){
 let count=0,tries=0;while(count<target&&tries++<180000){const pool=[...levels,...added].filter(p=>p.n===n),parent=pool[rnd(pool.length)],g=[...parent.regions],answer=parent.solution;
  const moves=style==='advanced'?3+rnd(n*3):1+rnd(n);for(let k=0;k<moves;k++){const i=rnd(n*n);if(answer[Math.floor(i/n)]===i%n)continue;const near=neighbors(i,n);g[i]=g[near[rnd(near.length)]]}
  if(!connected(g,n))continue;const key=canonical(g,n);if(seen.has(key))continue;const solutions=solve(g,n);if(solutions.length!==1)continue;
  const base=reason(g,n,{probe:false});if(style==='advanced'&&base.solved)continue;const proof=base.solved?base:reason(g,n);if(!proof.solved)continue;
  if(style==='advanced'&&!proof.trace.some(t=>t.rule==='contradiction'))continue;
  seen.add(key);const strategies=[...new Set(proof.trace.map(t=>t.rule))];added.push({n,regions:g,solution:solutions[0],difficulty:n<=5?0:n===6?1:n===7?2:3,edition,strategies,deductionSteps:proof.trace.length,reasoningTier:style});proofs.push({index:149+added.length-1,n,style,strategies,trace:proof.trace});count++;console.log('New '+added.length+'/100: '+n+'x'+n+' '+style+' '+strategies.join(','));
 }
 if(count!==target)throw Error('Could not meet '+n+' '+style+' target: '+count+'/'+target+' in '+tries+' attempts');
}
fs.mkdirSync('qa/new100',{recursive:true});fs.writeFileSync('qa/new100/proofs.json',JSON.stringify({baselineCount:149,baselineHash,total:249,distribution:added.reduce((a,p)=>(a[p.n]=(a[p.n]||0)+1,a),{}),proofs},null,2));fs.writeFileSync('dist/levels.js','const LEVELS='+JSON.stringify([...levels,...added])+';');console.log('PASS: appended 100 unique, connected, independently solved levels; original 149 preserved.');
