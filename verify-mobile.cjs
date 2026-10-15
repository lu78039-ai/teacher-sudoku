const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const nodes = new Map(), storage = new Map(), session = new Map();
function element() {
  return {style:{},dataset:{},children:[],hidden:false,classList:{toggle(){}},
    setAttribute(){},focus(){},append(x){this.children.push(x)},replaceChildren(){this.children=[]},
    showModal(){this.open=true},close(){this.open=false},setPointerCapture(){},
    hasPointerCapture(){return false},contains(){return true}};
}
const body = element();
let clockTick;
const context = vm.createContext({
  document:{body, visibilityState:'visible', querySelector(s){if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)},
    querySelectorAll(){return []},createElement:element,
    elementFromPoint(x){return {closest(){return {dataset:{index:Math.floor(x/40)}}}}}},
  window:{matchMedia(){return {matches:true}},scrollTo(){}},
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v)},
  setInterval(fn){clockTick=fn},setTimeout(){return 1},clearTimeout(){},console
});
const run = code => vm.runInContext(code,context);
run(fs.readFileSync('dist/levels.js','utf8')+fs.readFileSync('dist/app.js','utf8')+fs.readFileSync('dist/mobile-ui.js','utf8'));
run('load(20);edit(0,2)');
const saved = storage.get('find-homeroom-teacher');
assert.equal(body.dataset.mobileView,'home');
const paused = run('seconds');clockTick();assert.equal(run('seconds'),paused);
run("$('#mobile-begin').onclick()");assert.equal(body.dataset.mobileView,'game');
assert.equal(storage.get('find-homeroom-teacher'),saved);
clockTick();assert.equal(run('seconds'),paused+1);
run("$('#mobile-back').onclick()");const pausedAgain=run('seconds');clockTick();assert.equal(run('seconds'),pausedAgain);
assert.equal(run('idx'),20);assert.equal(run('cells[0]'),2);
run("$('#mobile-begin').onclick();$('#mobile-settings').onclick()");assert.equal(run("$('#mobile-settings-dialog').open"),true);
run("$('#settings-rules').onclick()");assert.equal(run("$('#rules').open"),true);assert.equal(run("$('#mobile-settings-dialog').open"),false);
run("$('#mobile-motion').checked=true;$('#mobile-motion').onchange()");assert.equal(storage.get('teacher-reduced-motion'),'true');
for (const n of [5,6,7,8,9,10]) {
  run(`load(LEVELS.findIndex(p=>p.n===${n}));cells[LEVELS[idx].solution[0]]=1;render();`);
  const before=run('JSON.stringify(cells)');
  run(`board.onpointerdown({button:0,isPrimary:true,pointerId:1,pointerType:'touch',clientX:20,clientY:20,target:{closest:()=>({dataset:{index:0}})}});
    board.onpointermove({pointerId:1,pointerType:'touch',clientX:${n*40-20},clientY:20,preventDefault(){}});
    board.onpointermove({pointerId:1,pointerType:'touch',clientX:20,clientY:20,preventDefault(){}});
    board.onpointerup({pointerId:1,pointerType:'touch',clientX:20,clientY:20,timeStamp:10000,preventDefault(){}});`);
  assert.equal(run('cells.filter(v=>v===2).length'),n-1);
  assert.equal(run('cells.filter(v=>v===1).length'),1);
  assert.equal(run('history.length'),1);
  run("$('#undo').onclick()");assert.equal(run('JSON.stringify(cells)'),before);
}
assert.equal(require('node:crypto').createHash('sha256').update(run("'const LEVELS='+JSON.stringify(LEVELS.slice(0,148))+';'")).digest('hex'),'e930e1f2e87ac42b8660f4fbc24177e5c74080dae19e69d5098d995ccab7018d');
console.log('PASS: mobile navigation preserves progress, home pauses timer, settings/rules work, touch swipes and atomic undo for 5x5–10x10, original 148 puzzles unchanged.');
