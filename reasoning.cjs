// Auditable, sound candidate rules. No stored solution is consulted.
function reason(g,n,{probe=true}={}){
 const cells=Array.from({length:n*n},(_,i)=>i),types=['row','column','region'];
 const label=(i,type)=>type==='row'?Math.floor(i/n):type==='column'?i%n:g[i];
 const groups=types.flatMap(type=>Array.from({length:n},(_,k)=>({type,k,indices:cells.filter(i=>label(i,type)===k)})));
 const clash=(a,b)=>Math.floor(a/n)===Math.floor(b/n)||a%n===b%n||g[a]===g[b]||(Math.abs(Math.floor(a/n)-Math.floor(b/n))<=1&&Math.abs(a%n-b%n)<=1);
 const partitions=types.map(type=>groups.filter(t=>t.type===type));
 function propagate(initial,trace){const remaining=new Set(initial);let changed=true;
  const remove=(ids,step)=>{if(!ids.length)return false;ids.forEach(i=>remaining.delete(i));trace?.push({...step,removed:ids});return true};
  while(changed){changed=false;
   const options=groups.map(group=>group.indices.filter(i=>remaining.has(i)));
   const empty=options.findIndex(a=>a.length===0);if(empty>=0)return{contradiction:true,remaining,empty:groups[empty]};
   // A singleton occupies its row/column/region and excludes adjacent cells.
   for(let k=0;k<groups.length;k++)if(options[k].length===1){const a=options[k][0];if(remove([...remaining].filter(i=>i!==a&&clash(i,a)),{rule:'single',group:groups[k].type,options:[a]})){changed=true;break}}
   if(changed)continue;
   // Hall pairs/triples: k disjoint homes confined to k lanes consume those lanes.
   outer:for(const partition of partitions)for(const target of types){if(target===partition[0].type)continue;
    const opts=partition.map(group=>group.indices.filter(i=>remaining.has(i)));
    for(const size of [2,3]){const tuples=[];function choose(from,list){if(list.length===size){tuples.push(list);return}for(let k=from;k<n;k++)choose(k+1,[...list,k])}choose(0,[]);
     for(const tuple of tuples){const lanes=new Set(tuple.flatMap(k=>opts[k].map(i=>label(i,target))));if(lanes.size<size)return{contradiction:true,remaining};if(lanes.size!==size)continue;
      const chosen=new Set(tuple),removed=[...remaining].filter(i=>lanes.has(label(i,target))&&!chosen.has(label(i,partition[0].type)));
      if(remove(removed,{rule:'hall-'+size,source:partition[0].type,target,groups:tuple,lanes:[...lanes]})){changed=true;break outer}
     }
    }
   }
   if(changed)continue;
   // Every candidate of a home blocks a cell: lock, spatial envelope, or common exclusion.
   for(let k=0;k<groups.length;k++){const opts=options[k];if(opts.length<2)continue;const removed=[...remaining].filter(i=>!groups[k].indices.includes(i)&&opts.every(j=>clash(i,j)));if(!removed.length)continue;
    const locked=types.some(type=>type!==groups[k].type&&new Set(opts.map(i=>label(i,type))).size===1);
    const spatial=removed.some(i=>opts.every(j=>Math.abs(Math.floor(i/n)-Math.floor(j/n))<=1&&Math.abs(i%n-j%n)<=1));
    remove(removed,{rule:locked?'locked':spatial?'distance-envelope':'common-exclusion',group:groups[k].type,options:opts});changed=true;break;
   }
  }
  return{contradiction:false,remaining};
 }
 const trace=[];let state=propagate(cells,trace),probes=0;
 while(!state.contradiction&&state.remaining.size>n&&probe){let removed=false;
  for(const i of state.remaining){probes++;const assumed=[...state.remaining].filter(j=>j===i||!clash(i,j));const result=propagate(assumed,null);if(result.contradiction){const next=new Set(state.remaining);next.delete(i);trace.push({rule:'contradiction',assume:i,removed:[i]});state=propagate(next,trace);removed=true;break}}
  if(!removed)break;
 }
 const positions=[...state.remaining];const valid=positions.length===n&&groups.every(group=>group.indices.filter(i=>state.remaining.has(i)).length===1)&&positions.every((a,k)=>positions.slice(k+1).every(b=>!clash(a,b)));
 return{solved:!state.contradiction&&valid,remaining:positions,trace,probes};
}
module.exports={reason};
