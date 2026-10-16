const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),storage=new Map();let writes=0,created=0,ctx;
function element(){created++;let text='';return {style:{setProperty(k,v){this[k]=v}},dataset:{},children:[],classList:{toggle(){}},set textContent(v){text=v;this.children=[]},get textContent(){return text},setAttribute(){},focus(){},append(x){this.children.push(x)},replaceChildren(){this.children=[]},showModal(){this.open=true},close(){this.open=false},setPointerCapture(){},hasPointerCapture(){return false},contains(){return true}}}
ctx=vm.createContext({console,performance,document:{visibilityState:'visible',querySelector(s){if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)},createElement:element,elementFromPoint(x,y){const n=vm.runInContext('LEVELS[idx].n',ctx);return {closest:()=>({dataset:{index:Math.floor(y/40)*n+Math.floor(x/40)}})}}},localStorage:{getItem:k=>storage.get(k),setItem(k,v){writes++;storage.set(k,v)}},setInterval(){},setTimeout(){return 1},clearTimeout(){}});
const run=s=>vm.runInContext(s,ctx);
run(fs.readFileSync('dist/levels.js','utf8')+fs.readFileSync('dist/app.js','utf8'));
function stroke(indices,t,hold=0,cancel=false){
  const n=run('LEVELS[idx].n'),point=i=>({x:(i%n)*40+20,y:Math.floor(i/n)*40+20});
  const p=point(indices[0]);
  ctx.event={button:0,isPrimary:true,pointerId:9,pointerType:'touch',clientX:p.x,clientY:p.y,timeStamp:t,target:{closest:()=>({dataset:{index:indices[0]}})}};
  run('board.onpointerdown(event)');
  indices.slice(1).forEach((i,k)=>{const p=point(i);ctx.event={pointerId:9,pointerType:'touch',clientX:p.x,clientY:p.y,timeStamp:t+hold+30+k*20,preventDefault(){}};run('board.onpointermove(event)')});
  const last=point(indices.at(-1));ctx.event={pointerId:9,pointerType:'touch',clientX:last.x,clientY:last.y,timeStamp:t+hold+100,preventDefault(){}};
  run(cancel?'board.onpointercancel(event)':'board.onpointerup(event)');
}
run('load(0)');stroke([0,1,2],1000);assert.equal(run('cells.slice(0,3).join()'),'2,2,2');
stroke([1,6,11],1500);assert.equal(run('cells[1]'),2);assert.equal(run('cells[6]'),2);assert.equal(run('cells[11]'),2);
stroke([1,6,11],1900);assert.equal(run('[cells[1],cells[6],cells[11]].join()'),'0,2,2');
run('load(0);cells[0]=2;cells[1]=2;render()');stroke([0,1],4000,500);assert.equal(run('cells.slice(0,2).join()'),'2,2');stroke([0,1],50000);assert.equal(run('cells.slice(0,2).join()'),'0,0');run("$('#undo').onclick()");assert.equal(run('cells.slice(0,2).join()'),'2,2');stroke([0,1],90000);assert.equal(run('cells.slice(0,2).join()'),'0,0');
run('load(0)');stroke([0,1,2],1000);stroke([0,1,2],5000);assert.equal(run('cells.slice(0,3).join()'),'2,2,2');
stroke([0,1,2],5300,0,true);assert.equal(run('cells.slice(0,3).join()'),'0,0,0');
run('load(0)');const before=run('JSON.stringify(cells)'),writesBefore=writes;
stroke([0,1,2,1,0],10000);assert.equal(run('cells.slice(0,3).join()'),'2,2,2');assert.equal(writes-writesBefore,1);
run("$('#undo').onclick()");assert.equal(run('JSON.stringify(cells)'),before);
run('load(148)');const tiles=[...nodes.get('#board').children],options=[...nodes.get('#level-select').children];
const buildBefore=run('renderStats.boardBuilds'),pickerBefore=run('renderStats.pickerBuilds'),createdBefore=created;
for(let i=0;i<100;i++)run('edit(0,2)');
assert.equal(run('renderStats.boardBuilds'),buildBefore);assert.equal(run('renderStats.pickerBuilds'),pickerBefore);
assert.equal(created,createdBefore);assert.ok(tiles.every((tile,i)=>tile===nodes.get('#board').children[i]));assert.ok(options.every((option,i)=>option===nodes.get('#level-select').children[i]));
run('load(0)');const correct=run('LEVELS[0].solution[0]'),color=nodes.get('#board').children[correct].style.background;
run(`edit(${correct},1)`);assert.equal(nodes.get('#board').children[correct].style.background,color);
const sizes=run('Array.from({length:10},(_,z)=>LEVELS[148].regions.filter(v=>v===z).length)');assert.ok(sizes.filter(n=>n===1).length>=2);
console.log('PASS: crossings preserve X, per-cell second crossing erases regardless of path/time, long-hold preserves first crossing, cancel is safe, one save per stroke, atomic undo.');
console.log('PASS: 100 clicks create zero new DOM nodes, keep board/options identity, preserve teacher-cell color, and accept multiple singleton regions on 10x10.');

run('load(0);cells[0]=2;render();board.onpointerdown({button:0,isPrimary:true,pointerId:3,pointerType:"touch",clientX:20,clientY:20,timeStamp:100,target:{closest:()=>({dataset:{index:0}})}});board.children[0].oncontextmenu({preventDefault(){}})');assert.equal(run('cells[0]'),2);assert.equal(run('history.length'),0);console.log('PASS: touch long-press context menu does not cause an extra toggle or undo entry.');

run('load(0);var hitCount=0;document.elementFromPoint=()=>{hitCount++;return null};board.onpointerdown({button:0,isPrimary:true,pointerId:8,clientX:20,clientY:20,target:{closest:()=>({dataset:{index:0}})}});board.onpointermove({pointerId:8,pointerType:"touch",clientX:Infinity,clientY:20,preventDefault(){}})');assert.equal(run('hitCount'),0);run('board.onpointermove({pointerId:8,pointerType:"touch",clientX:1e100,clientY:20,preventDefault(){}})');assert.ok(run('hitCount')<=129);run('board.onpointercancel({pointerId:8,timeStamp:100})');console.log('PASS: non-finite coordinates ignored; extreme pointer movement bounded to 129 hit tests.');

// Reproduce implicit touch capture transferring from a cell to the board.
run('load(0);document.elementFromPoint=(x,y)=>({closest:()=>({dataset:{index:Math.floor(y/40)*LEVELS[idx].n+Math.floor(x/40)}})});board.setPointerCapture=id=>board.onlostpointercapture({pointerId:id,target:board.children[0],timeStamp:100});');
stroke([0,1,2,3,4],120000);assert.equal(run('cells.slice(0,5).join()'),'2,2,2,2,2');assert.equal(run('drag'),null);
console.log('PASS: bubbled lost capture from a touched cell does not terminate the swipe.');
run('load(0);clickCell(4,{detail:1,timeStamp:200000})');assert.equal(run('cells[4]'),2);assert.equal(run('history.length'),1);run('clickCell(4,{detail:2,timeStamp:200100})');assert.equal(run('cells[4]'),1);assert.equal(run('history.length'),1);assert.equal(run('lastTap'),null);
run('load(0);clickCell(0,{detail:1,timeStamp:210000});flushTap()');assert.equal(run('cells[0]'),2);run('clickCell(0,{detail:1,timeStamp:211000});flushTap()');assert.equal(run('cells[0]'),0);
run('clickCell(0,{detail:1,timeStamp:212000});load(1);flushTap()');assert.equal(run('cells[0]'),0);
console.log('PASS: single tap paints X immediately, double tap replaces the first edit with one undo entry, level changes reset tap recognition.');
for(const n of [5,6,7,8,9,10]){run(`load(LEVELS.findIndex(p=>p.n===${n}))`);for(let k=0;k<5;k++)run('applyHint()');assert.equal(run('hintsUsed'),0);assert.equal(run('cells.filter(v=>v===1).length'),0);assert.equal(nodes.get('#hint').hidden,true);assert.equal(nodes.get('#hint').disabled,true)}
console.log('PASS: hints hidden and disabled for every board size.');
