/* Board colors are defined here only. V2 colors remain opt-in pending approval. */
const BoardPalette=(()=>{
const V2=Object.freeze(['#ED94BA','#9CCBE7','#AD96DC','#79D0CF','#F6D66D','#FFB584','#72875F','#E9877B','#BD916F','#829BC5','#6FAF9B','#C58EAD']);
const NAMES=['粉紅','天空藍','薰衣草紫','薄荷綠','奶油黃','蜜桃橘','鼠尾草綠','珊瑚紅','焦糖棕','霧霾藍','柔霧青綠','灰紫玫瑰'];
const LEGACY=Object.freeze(['#9bcce9','#f291bc','#f5d35d','#78d4d3','#ac94e5','#a3d989','#ffb77c','#77bca0','#cc9b78','#aab9ec']);
const BACKGROUND='#F8F5F0';
function rgb(hex){return hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255)}
function lab(hex){const [r,g,b]=rgb(hex).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const f=v=>v>.008856?Math.cbrt(v):7.787*v+16/116;const x=f((.4124564*r+.3575761*g+.1804375*b)/.95047),y=f(.2126729*r+.7151522*g+.072175*b),z=f((.0193339*r+.119192*g+.9503041*b)/1.08883);return [116*y-16,500*(x-y),200*(y-z)]}
function delta(a,b){const x=lab(a),y=lab(b);return Math.hypot(...x.map((v,i)=>v-y[i]))}
function adjacency(p){const pairs=new Set();for(let r=0;r<p.n;r++)for(let c=0;c<p.n;c++){const i=r*p.n+c,a=p.regions[i];for(const j of [c+1<p.n?i+1:-1,r+1<p.n?i+p.n:-1])if(j>=0&&a!==p.regions[j])pairs.add([a,p.regions[j]].sort((a,b)=>a-b).join(':'))}return [...pairs].map(v=>v.split(':').map(Number))}
// Keep a one-to-one region-ID mapping. Deterministic swaps improve the weakest borders.
function mapping(p,optimize=true){const ids=[...new Set(p.regions)].sort((a,b)=>a-b);if(ids.length>12)throw Error('Palette supports at most 12 regions');const map=Array.from({length:Math.max(...ids)+1},(_,i)=>i%12),edges=adjacency(p);const quality=m=>edges.map(([a,b])=>delta(V2[m[a]],V2[m[b]])).sort((a,b)=>a-b);const better=(a,b)=>{for(let i=0;i<a.length;i++){if(Math.abs(a[i]-b[i])>.001)return a[i]>b[i]}return false};if(optimize){let current=quality(map);for(let pass=0;pass<16;pass++){let best=current,swap=null;for(const a of ids)for(let color=0;color<12;color++){const b=ids.find(id=>map[id]===color),copy=[...map];if(b===a)continue;copy[a]=color;if(b!==undefined)copy[b]=map[a];const q=quality(copy);if(better(q,best)){best=q;swap=copy}}if(!swap)break;map.splice(0,map.length,...swap);current=best}}return map}
function colorsFor(p,preview=false){return preview?mapping(p).map(i=>V2[i]):[...LEGACY,...V2.slice(10)]}
function audit(p,optimize=true){const m=mapping(p,optimize);return adjacency(p).map(([a,b])=>({a,b,colorA:m[a],colorB:m[b],deltaE76:+delta(V2[m[a]],V2[m[b]]).toFixed(2)})).sort((a,b)=>a.deltaE76-b.deltaE76)}
// Full-severity matrix approximations; not a clinical color-vision test.
function simulate(hex,mode){const matrices={protan:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],deutan:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]],tritan:[[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.3039]]};const linear=rgb(hex).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4),m=matrices[mode];const out=mode==='gray'?Array(3).fill(.2126*linear[0]+.7152*linear[1]+.0722*linear[2]):m?m.map(row=>row.reduce((sum,v,i)=>sum+v*linear[i],0)):linear;return '#'+out.map(v=>{v=Math.max(0,Math.min(1,v));return Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055)).toString(16).padStart(2,'0')}).join('')}
return {V2,NAMES,LEGACY,BACKGROUND,lab,delta,adjacency,mapping,colorsFor,audit,simulate};
})();
