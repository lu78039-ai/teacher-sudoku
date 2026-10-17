const FAILURE_LINES=[
'班導還沒找到，眼淚先報到了。擦乾眼淚，再來！',
'這次不是你輸了，是班導太會躲了。再找一次！',
'三顆愛心下課了，你的推理還沒放學！',
'班導：你剛剛是在找我，還是在亂點名？再試一次！',
'差一點就成功了……好吧，還差幾格。慢慢推理！',
'班導躲到都笑出來了，快用刪去法反擊！',
'今天的手速滿分，推理先補個考。再挑戰！',
'愛心碎了，班導還在。深呼吸，重整旗鼓！',
'你成功找到了三個錯誤答案，也算排除不少了！',
'這局先讓班導贏，下局換你漂亮過關！'
];
let failureShown=false;
function showFailure(){if(failureShown)return;if(typeof playGameSound==='function')playGameSound('fail');failureShown=true;hideCelebration();$('#failure-phrase').textContent=FAILURE_LINES[Math.floor(Math.random()*FAILURE_LINES.length)];const dialog=$('#failure-dialog');$('#failure-retry').onclick=()=>load(idx);$('#failure-view').onclick=()=>{dialog.close();$('#reset').focus()};dialog.showModal();}
const PRAISE=['厲害了！','完全正確！','太棒了，你成功了！','班導為你喝采！','推理高手就是你！','完美過關，漂亮！','所有班導都找到位置了！','你的觀察力真敏銳！','腦力滿分，班導滿意！','這一關，被你征服了！','班導們為你跳支舞！','好厲害的邏輯小天才！'];
let celebrationTimer=null,celebrationReady=false,errorTimer=null;
function showMistakeFeedback(){if(errorTimer!==null)clearTimeout(errorTimer);const feedback=$('#error-feedback');feedback.hidden=false;feedback.replaceChildren();const heart=document.createElement('span');heart.className='error-heart';heart.textContent='💔';feedback.append(heart);errorTimer=setTimeout(()=>{feedback.hidden=true;errorTimer=null},2000);}
function hideCelebration(){if(celebrationTimer!==null)clearTimeout(celebrationTimer);celebrationTimer=null;$('#celebration').hidden=true;}
function celebrate(){if(typeof playGameSound==='function')playGameSound('win');hideCelebration();$('#celebration-avatar').src='assets/teacher-pixel-victory.png?v=victory-1';$('#praise').textContent=PRAISE[Math.floor(Math.random()*PRAISE.length)];$('#celebration').hidden=false;const clearedLevel=idx;celebrationTimer=setTimeout(()=>{hideCelebration();if(won&&idx===clearedLevel){if(levelNumber(idx)<levelOrder.length)load(levelOrder[levelNumber(idx)]);else $('#message').textContent=`🏆 全部關卡完成！你是尋找班導大師！可選擇關卡再次挑戰。`}},5000);}
const renderStats={boardBuilds:0,cellUpdates:0,pickerBuilds:0};let renderedLevel=-1,renderedValues=[],renderedBad=[],pickerVersion='',pickerGroup=null,crossingPasses=[];
const levelOrder=typeof LEVEL_ORDER!=='undefined'?LEVEL_ORDER:LEVELS.map((_,i)=>i).sort((a,b)=>LEVELS[a].n-LEVELS[b].n||a-b);
const levelNumber=i=>levelOrder.indexOf(i)+1;
const HINTS_ENABLED=false;let bestTimes={};
try{const stored=JSON.parse(localStorage.getItem('teacher-best-times')||'{}');if(stored&&typeof stored==='object'&&!Array.isArray(stored))for(const [id,value] of Object.entries(stored))if(Number.isInteger(+id)&&LEVELS[+id]&&Number.isFinite(value)&&value>=0)bestTimes[id]=Math.floor(value)}catch{}
function clockText(value){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0')}
const $=s=>document.querySelector(s),colors=typeof BoardPalette==='undefined'?[]:BoardPalette.LEGACY;let drag=null,suppressClickUntil=-1;let lastTap=null;let hintsUsed=0,mistakeCells=new Set(),pendingLevel=null;let idx=levelOrder[0],mode=1,cells=[],seconds=0,won=false,completed=[],mistakes=0,failed=false;
try{const s=JSON.parse(localStorage.getItem('find-homeroom-teacher')||localStorage.getItem('woof-sudoku'));if(s&&Number.isInteger(s.idx)&&LEVELS[s.idx]){idx=s.idx;if(Array.isArray(s.mistakeCells))mistakeCells=new Set(s.mistakeCells.filter(i=>Number.isInteger(i)&&i>=0&&i<LEVELS[idx].n**2));hintsUsed=Number.isInteger(s.hintsUsed)?Math.max(0,Math.min(3,s.hintsUsed)):0;mistakes=Number.isInteger(s.mistakes)?Math.max(0,Math.min(3,s.mistakes)):0;failed=mistakes>=3;if(Array.isArray(s.cells)&&s.cells.length===LEVELS[idx].n**2&&s.cells.every(v=>[0,1,2,3].includes(v)))cells=s.cells;seconds=Number.isFinite(s.seconds)?Math.max(0,s.seconds):0;completed=Array.isArray(s.completed)?[...new Set(s.completed.filter(i=>Number.isInteger(i)&&LEVELS[i]))]:[]}}catch{}
// Revalidate old saves: earlier versions allowed teachers outside the unique solution.
let restoredErrors=0;
cells.forEach((value,i)=>{if(value===1&&LEVELS[idx].solution[Math.floor(i/LEVELS[idx].n)]!==i%LEVELS[idx].n){cells[i]=3;restoredErrors++}});
if(restoredErrors){mistakes=Math.min(3,mistakes+restoredErrors);failed=mistakes>=3;}
cells.forEach((v,i)=>{if(v===3)mistakeCells.add(i)});mistakeCells.forEach(i=>cells[i]=3);
function save(){try{localStorage.setItem('find-homeroom-teacher',JSON.stringify({idx,cells,seconds,completed,mistakes,hintsUsed,mistakeCells:[...mistakeCells]}))}catch{}}
function conflicts(){let p=LEVELS[idx],n=p.n,teachers=cells.flatMap((v,i)=>v===1?[i]:[]),bad=new Set();teachers.forEach((a,k)=>teachers.slice(k+1).forEach(b=>{let ar=Math.floor(a/n),br=Math.floor(b/n),ac=a%n,bc=b%n;if(ar===br||ac===bc||p.regions[a]===p.regions[b]||(Math.abs(ar-br)<=1&&Math.abs(ac-bc)<=1)){bad.add(a);bad.add(b)}}));return bad}
function time(){ $('#timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function render(persist=true){
  const started=typeof performance!=='undefined'?performance.now():0;
  const wasWon=won,p=LEVELS[idx],n=p.n,bad=conflicts(),count=cells.filter(v=>v===1).length,board=$('#board');
  won=!failed&&count===n&&!bad.size;
  $('#mistakes').textContent=`${mistakes} / 3`;$('#hearts').textContent='❤️'.repeat(3-mistakes)+'💔'.repeat(mistakes);
  $('#count').textContent=count+' / '+n;$('#tag').textContent=`第 ${levelNumber(idx)} 關`;
  if(won&&!completed.includes(idx))completed.push(idx);
  if(won&&!wasWon&&(bestTimes[idx]===undefined||seconds<bestTimes[idx])){bestTimes[idx]=seconds;try{localStorage.setItem('teacher-best-times',JSON.stringify(bestTimes))}catch{}}
  $('#best-time').textContent=bestTimes[idx]===undefined?'--:--':clockText(bestTimes[idx]);
  const hint=$('#hint');hint.hidden=!HINTS_ENABLED;hint.disabled=!HINTS_ENABLED||hintsUsed>=3||won||failed;hint.textContent=`☀ 提示（${3-hintsUsed}/3）`;
  renderLevelPicker();
  if(renderedLevel!==idx||board.children.length!==n*n){
    board.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;board.style.gridTemplateRows=`repeat(${n},minmax(0,1fr))`;
    board.replaceChildren();renderedValues=[];renderedBad=[];renderedLevel=idx;renderStats.boardBuilds++;
    const palette=typeof BoardPalette==='undefined'?colors:BoardPalette.colorsFor(p,typeof location!=='undefined'&&new URLSearchParams(location.search).get('palette')==='v2');
    for(let i=0;i<n*n;i++){
      const b=document.createElement('button');b.type='button';b.dataset.index=i;
      b.style.background=palette[p.regions[i]];b.style.setProperty?.('--region-color',palette[p.regions[i]]);
      b.onclick=e=>clickCell(i,e);b.ondblclick=e=>e.preventDefault();
      b.oncontextmenu=e=>{e.preventDefault();if(drag)return;clearTap();edit(i,2)};
      b.onkeydown=e=>{const delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:n,ArrowUp:-n}[e.key];if(delta!==undefined){e.preventDefault();board.children[Math.max(0,Math.min(cells.length-1,i+delta))].focus({preventScroll:true})}};
      board.append(b);
    }
  }
  cells.forEach((v,i)=>{
    const isBad=bad.has(i);if(renderedValues[i]===v&&renderedBad[i]===isBad)return;
    const b=board.children[i];b.className='cell'+(v===2||v===3?' mark':'')+(v===3?' mistake':'')+(isBad?' bad':'')+(i%n<n-1&&p.regions[i]!==p.regions[i+1]?' edge-r':'')+(i+n<n*n&&p.regions[i]!==p.regions[i+n]?' edge-b':'');
    if(renderedValues[i]!==v){
      b.textContent=v===2||v===3?'×':'';
      if(v===1){if(!b.teacherAvatar){const avatar=document.createElement('img');avatar.src='assets/teacher-pixel-avatar.png';avatar.alt='班導';avatar.className='teacher-avatar';avatar.draggable=false;b.teacherAvatar=avatar}b.append(b.teacherAvatar)}
      b.setAttribute('aria-disabled',String(v===3));b.setAttribute('aria-label',`第 ${Math.floor(i/n)+1} 行，第 ${i%n+1} 列，區域 ${p.regions[i]+1}：${v===1?'班導':v===3?'錯誤位置':v===2?'排除':'空白'}`);
    }
    renderedValues[i]=v;renderedBad[i]=isBad;renderStats.cellUpdates++;
  });
  $('#message').className=failed?'failure':won?'win':'';
  $('#message').textContent=failed?'💔 已犯錯 3 次，這局挑戰失敗。點「重來」再試一次！':won?'🎉 全部找到！慶祝 5 秒後，自動進入下一關。':bad.size?'有班導太靠近，或位於同一行、列、區域。':'找出所有的班導吧！';
  time();if(typeof syncWakeLock==='function')syncWakeLock();if(persist)save();if(!won)hideCelebration();else if(!wasWon&&celebrationReady)celebrate();if(failed)showFailure();
  board.dataset.buildCount=String(renderStats.boardBuilds);board.dataset.cellUpdates=String(renderStats.cellUpdates);
  if(typeof performance!=='undefined')board.dataset.renderMs=(performance.now()-started).toFixed(3);
}
// Single taps update immediately; a second tap replaces that edit atomically.
function clearTap(){lastTap=null}
function flushTap(){clearTap()}
function clickCell(i,e){
  if(nativeTouchEnabled&&(e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents))return;
  if(won||failed||cells[i]===3||mistakeCells.has(i)||(e.detail!==0&&e.timeStamp<=suppressClickUntil))return;
  if(e.detail===0){flushTap();edit(i,e.shiftKey?1:2);return}
  const now=e.timeStamp;
  if(lastTap&&lastTap.i===i&&now-lastTap.time<=500){const before=lastTap.before;clearTap();restoreCells(before);edit(i,1);return}
  clearTap();const before=snapshotCells();edit(i,2);lastTap={i,time:now,level:idx,before};
}
function edit(i,m){
  if(won||failed||!Number.isInteger(i)||i<0||i>=cells.length||cells[i]===3||mistakeCells.has(i))return;
  const wrong=m===1&&cells[i]!==1&&LEVELS[idx].solution[Math.floor(i/LEVELS[idx].n)]!==i%LEVELS[idx].n;
  if(wrong&&cells[i]===3&&mistakeCells.has(i)){render();return;}
  crossingPasses[i]=0;
  if(wrong){
    const firstMistake=!mistakeCells.has(i);mistakeCells.add(i);cells[i]=3;
    if(firstMistake)mistakes++;
    failed=mistakes>=3;render();
    if(firstMistake){if(!failed&&typeof playGameSound==='function')playGameSound('error');const heart=document.createElement('span');heart.className='heartbreak';heart.textContent='💔';$('#board').children[i].append(heart);showMistakeFeedback()}
    if(!failed)$('#message').textContent=firstMistake?`💔 這格不是班導的位置，犯錯 ${mistakes} / 3 次。`:'這格已記錄過錯誤，不重複扣愛心。';
  }else{cells[i]=cells[i]===m?0:m;render();if(!won&&typeof playGameSound==='function')playGameSound(cells[i]===1?'teacher':'mark')}
  $('#board').children[i].focus({preventScroll:true});
}
function load(i){if(!Number.isInteger(i)||!LEVELS[i])return;pendingLevel=null;$('#level-confirm').close();pickerGroup=null;clearTap();hintsUsed=0;mistakeCells=new Set();crossingPasses=[];failureShown=false;$('#failure-dialog').close();if(errorTimer!==null)clearTimeout(errorTimer);errorTimer=null;$('#error-feedback').hidden=true;hideCelebration();mistakes=0;failed=false;drag=null;suppressClickUntil=-1;lastTap=null;idx=i;cells=Array(LEVELS[i].n**2).fill(0);seconds=0;won=false;render()}
$('#reset').onclick=()=>load(idx);function applyHint(){flushTap();if(!HINTS_ENABLED||won||failed||hintsUsed>=3)return;const p=LEVELS[idx],r=p.solution.findIndex((c,r)=>cells[r*p.n+c]!==1);if(r<0)return;hintsUsed++;const i=r*p.n+p.solution[r];cells[i]=1;crossingPasses[i]=0;render();if(!won)$('#message').textContent=`☀ 第 ${r+1} 行的班導找到位置了！剩餘提示 ${3-hintsUsed} 次。`};$('#hint').onclick=applyHint;$('#help').onclick=()=>$('#rules').showModal();$('#close').onclick=$('#start').onclick=()=>$('#rules').close();setInterval(()=>{if(!won&&!failed&&!$('#level-confirm').open&&document.visibilityState==='visible'&&(typeof mobileGameIsActive==='undefined'||mobileGameIsActive())){seconds++;time();save()}},1000);if(!cells.length)cells=Array(LEVELS[idx].n**2).fill(0);render();if(restoredErrors&&!failed)$('#message').textContent=`💔 已核對舊進度：${restoredErrors} 位班導位置錯誤，已改為紅色 ×；犯錯 ${mistakes} / 3。`;celebrationReady=true;


// Per-cell crossing rule: preserve an existing X once, clear it on its next stroke.
function snapshotCells(){const state=[...cells];state.crossings=[...crossingPasses];return state}
function restoreCells(state){cells=[...state];mistakeCells.forEach(i=>cells[i]=3);crossingPasses=state.crossings?[...state.crossings]:[]}
function paintExcluded(indices,visited=new Set()){
  let changed=false;
  for(const i of indices){
    if(!Number.isInteger(i)||i<0||i>=cells.length||visited.has(i))continue;
    visited.add(i);
    if(cells[i]===0){cells[i]=2;crossingPasses[i]=0;changed=true}
    else if(cells[i]===2){
      if(crossingPasses[i]===1){cells[i]=0;crossingPasses[i]=0}
      else crossingPasses[i]=1;
      changed=true;
    }
  }
  return changed;
}
const board=$('#board');
const nativeTouchEnabled=typeof window!=='undefined'&&'ontouchstart' in window&&!!board.addEventListener;
board.onpointerdown=e=>{
  if(nativeTouchEnabled&&e.pointerType==='touch'&&!e.nativeTouch)return;
  if(won||failed||e.button!==0||e.isPrimary===false||!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return;
  const tile=e.target.closest('.cell');if(!tile)return;
  let geometry=null;const n=LEVELS[idx].n,first=board.children[0],next=board.children[1];
  if(first?.getBoundingClientRect&&next?.getBoundingClientRect){const r=first.getBoundingClientRect(),q=next.getBoundingClientRect();const pitch=q.x-r.x;if(Number.isFinite(r.x)&&Number.isFinite(r.y)&&Number.isFinite(pitch)&&pitch>0)geometry={x:r.x,y:r.y,pitch,n}}
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:+tile.dataset.index,active:false,changed:false,visited:new Set(),geometry,nativeTouch:!!e.nativeTouch};
};
function pathIndex(x,y,d){
  if(d.geometry){const g=d.geometry,c=Math.floor((x-g.x)/g.pitch),r=Math.floor((y-g.y)/g.pitch);return c>=0&&r>=0&&c<g.n&&r<g.n?r*g.n+c:-1}
  const tile=document.elementFromPoint(x,y)?.closest('.cell');return tile&&board.contains(tile)?+tile.dataset.index:-1;
}
board.onpointermove=e=>{
  if(!drag||drag.id!==e.pointerId||!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return;
  const d=drag,dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!Number.isFinite(Math.hypot(dx,dy)))return;
  if(!d.active&&Math.hypot(dx,dy)<(e.pointerType==='touch'?Math.min(12,Math.max(8,(d.geometry?.pitch||40)*.22)):8))return;
  if(!d.active){clearTap();d.active=true;if(!d.nativeTouch)board.setPointerCapture(e.pointerId)}
  e.preventDefault();const indices=[d.start],step=d.geometry?Math.max(4,d.geometry.pitch/3):8,steps=Math.min(128,Math.max(1,Math.ceil(Math.hypot(dx,dy)/step)));
  for(let k=0;k<=steps;k++)indices.push(pathIndex(d.x+dx*k/steps,d.y+dy*k/steps,d));
  if(paintExcluded(indices,d.visited)){d.changed=true;render(false)}
  d.x=e.clientX;d.y=e.clientY;
};
function finishDrag(e,cancelled=false){
  if(!drag||drag.id!==e.pointerId)return;
  const d=drag;drag=null;const stamp=Number.isFinite(e.timeStamp)?e.timeStamp:0;
  if(d.active){
    suppressClickUntil=stamp+350;lastTap=null;
    if(!d.nativeTouch&&board.hasPointerCapture(e.pointerId))board.releasePointerCapture(e.pointerId);
    if(d.changed){save();if(!cancelled&&typeof playGameSound==='function')playGameSound('mark')}
  }
}
board.onpointerup=e=>{if(nativeTouchEnabled&&e.pointerType==='touch'&&!e.nativeTouch)return;if(drag?.active)board.onpointermove(e);finishDrag(e)};
board.onpointercancel=e=>{if(nativeTouchEnabled&&e.pointerType==='touch'&&!e.nativeTouch)return;finishDrag(e,true)};
// Touch browsers implicitly capture on the pressed cell. Its bubbled loss
// while capture transfers to the board must not terminate the active stroke.
board.onlostpointercapture=e=>{if(!drag?.nativeTouch&&e.target===board&&!board.hasPointerCapture(e.pointerId))finishDrag(e,true)};

// Native touch events avoid platform-specific pointer capture transitions.
// Use only one input route for fingers; mouse/pen keep the pointer route.
if(nativeTouchEnabled){
  const adapt=(e,t)=>({button:0,isPrimary:true,pointerId:t.identifier,pointerType:'touch',nativeTouch:true,clientX:t.clientX,clientY:t.clientY,timeStamp:e.timeStamp,target:e.target,preventDefault:()=>e.preventDefault()});
  board.addEventListener('touchstart',e=>{if(e.touches.length!==1){if(drag?.nativeTouch)finishDrag({pointerId:drag.id,timeStamp:e.timeStamp},true);e.preventDefault();return}const t=e.changedTouches[0];if(!t)return;e.preventDefault();board.onpointerdown(adapt(e,t))},{passive:false});
  board.addEventListener('touchmove',e=>{if(!drag?.nativeTouch)return;e.preventDefault();const t=Array.from(e.touches).find(t=>t.identifier===drag.id);if(t)board.onpointermove(adapt(e,t))},{passive:false});
  board.addEventListener('touchend',e=>{if(!drag?.nativeTouch)return;const t=Array.from(e.changedTouches).find(t=>t.identifier===drag.id);if(!t)return;e.preventDefault();const d=drag,event=adapt(e,t);if(d.active)board.onpointerup(event);else{finishDrag(event);clickCell(d.start,{detail:1,timeStamp:e.timeStamp})}},{passive:false});
  board.addEventListener('touchcancel',e=>{if(drag?.nativeTouch){e.preventDefault();finishDrag({pointerId:drag.id,timeStamp:e.timeStamp},true)}},{passive:false});
}

function difficultyOf(i){return LEVELS[i].difficulty??Math.floor(i/6)}
function groupLevels(d){return LEVELS.flatMap((p,i)=>difficultyOf(i)===d?[i]:[])}
function renderLevelPicker(){
  const ranges=$('#level-group'),list=$('#level-select'),size=25,total=Math.ceil(levelOrder.length/size);
  if(ranges.children.length!==total){ranges.replaceChildren();for(let group=0;group<total;group++){const option=document.createElement('option');option.value=String(group);option.textContent=`${group*size+1}–${Math.min((group+1)*size,levelOrder.length)} 關`;ranges.append(option)}}
  const group=pickerGroup??Math.floor((levelNumber(idx)-1)/size),start=group*size,ids=levelOrder.slice(start,start+size),version=group+':'+LEVELS.length+':'+completed.join(',');
  if(pickerVersion!==version){
    list.replaceChildren();const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='選擇關卡';placeholder.disabled=true;placeholder.hidden=true;list.append(placeholder);
    ids.forEach((id,offset)=>{const option=document.createElement('option');option.value=String(id);option.textContent=`${completed.includes(id)?'✓ ':''}第 ${start+offset+1} 關`;list.append(option)});
    pickerVersion=version;renderStats.pickerBuilds++;list.dataset.buildCount=String(renderStats.pickerBuilds);
  }
  ranges.value=String(group);list.value=ids.includes(idx)?String(idx):'';
  ranges.onchange=()=>{const next=Number(ranges.value);if(Number.isInteger(next)&&next>=0&&next<total){pickerGroup=next;renderLevelPicker()}};
  list.onchange=()=>{if(list.value==='')return;const chosen=Number(list.value);if(Number.isInteger(chosen)&&ids.includes(chosen))requestLevelSwitch(chosen)};
}

function requestLevelSwitch(chosen){if(!Number.isInteger(chosen)||!LEVELS[chosen]||chosen===idx){renderLevelPicker();return}clearTap();pendingLevel=chosen;if(won)hideCelebration();$('#level-confirm-text').textContent='結束本局並前往第 '+levelNumber(chosen)+' 關嗎？';$('#level-confirm').showModal();renderLevelPicker()}
function cancelLevelSwitch(){pendingLevel=null;$('#level-confirm').close();pickerGroup=null;renderLevelPicker();if(won)celebrate()}
$('#level-confirm-cancel').onclick=cancelLevelSwitch;$('#level-confirm').oncancel=e=>{e.preventDefault();cancelLevelSwitch()};$('#level-confirm-accept').onclick=()=>{const chosen=pendingLevel;pendingLevel=null;$('#level-confirm').close();if(chosen!==null)load(chosen)};
