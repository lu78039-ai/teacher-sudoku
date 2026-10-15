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
function showFailure(){if(failureShown)return;failureShown=true;hideCelebration();$('#failure-phrase').textContent=FAILURE_LINES[Math.floor(Math.random()*FAILURE_LINES.length)];const dialog=$('#failure-dialog');$('#failure-retry').onclick=()=>load(idx);$('#failure-view').onclick=()=>{dialog.close();$('#reset').focus()};dialog.showModal();}
const PRAISE=['厲害了！','完全正確！','太棒了，你成功了！','班導為你喝采！','推理高手就是你！','完美過關，漂亮！','所有班導都找到位置了！','你的觀察力真敏銳！','腦力滿分，班導滿意！','這一關，被你征服了！','班導們為你跳支舞！','好厲害的邏輯小天才！'];
let celebrationTimer=null,celebrationReady=false,errorTimer=null;
function showMistakeFeedback(){if(errorTimer!==null)clearTimeout(errorTimer);const feedback=$('#error-feedback');feedback.hidden=false;feedback.replaceChildren();const heart=document.createElement('span');heart.className='error-heart';heart.textContent='💔';feedback.append(heart);errorTimer=setTimeout(()=>{feedback.hidden=true;errorTimer=null},2000);}
function hideCelebration(){if(celebrationTimer!==null)clearTimeout(celebrationTimer);celebrationTimer=null;$('#celebration').hidden=true;}
function celebrate(){hideCelebration();$('#celebration-avatar').src='assets/teacher-pixel-victory.png?v=victory-1';$('#praise').textContent=PRAISE[Math.floor(Math.random()*PRAISE.length)];$('#celebration').hidden=false;const clearedLevel=idx;celebrationTimer=setTimeout(()=>{hideCelebration();if(won&&idx===clearedLevel){if(idx<LEVELS.length-1)load(idx+1);else $('#message').textContent=`🏆 全部 ${LEVELS.length} 關完成！你是尋找班導大師！可選擇關卡再次挑戰。`}},5000);}
const renderStats={boardBuilds:0,cellUpdates:0,pickerBuilds:0};let renderedLevel=-1,renderedValues=[],renderedBad=[],pickerVersion='',lastStroke=null;
const $=s=>document.querySelector(s),colors=['#9bcce9','#f291bc','#f5d35d','#78d4d3','#ac94e5','#a3d989','#ffb77c','#77bca0','#cc9b78','#aab9ec'];let drag=null,suppressClickUntil=-1;let lastTap=null;let idx=0,mode=1,cells=[],history=[],seconds=0,won=false,completed=[],mistakes=0,failed=false;
try{const s=JSON.parse(localStorage.getItem('find-homeroom-teacher')||localStorage.getItem('woof-sudoku'));if(s&&Number.isInteger(s.idx)&&LEVELS[s.idx]){idx=s.idx;mistakes=Number.isInteger(s.mistakes)?Math.max(0,Math.min(3,s.mistakes)):0;failed=mistakes>=3;if(Array.isArray(s.cells)&&s.cells.length===LEVELS[idx].n**2&&s.cells.every(v=>[0,1,2,3].includes(v)))cells=s.cells;seconds=Number.isFinite(s.seconds)?Math.max(0,s.seconds):0;completed=Array.isArray(s.completed)?s.completed:[]}}catch{}
// Revalidate old saves: earlier versions allowed teachers outside the unique solution.
let restoredErrors=0;
cells.forEach((value,i)=>{if(value===1&&LEVELS[idx].solution[Math.floor(i/LEVELS[idx].n)]!==i%LEVELS[idx].n){cells[i]=3;restoredErrors++}});
if(restoredErrors){mistakes=Math.min(3,mistakes+restoredErrors);failed=mistakes>=3;}
function save(){try{localStorage.setItem('find-homeroom-teacher',JSON.stringify({idx,cells,seconds,completed,mistakes}))}catch{}}
function conflicts(){let p=LEVELS[idx],n=p.n,teachers=cells.flatMap((v,i)=>v===1?[i]:[]),bad=new Set();teachers.forEach((a,k)=>teachers.slice(k+1).forEach(b=>{let ar=Math.floor(a/n),br=Math.floor(b/n),ac=a%n,bc=b%n;if(ar===br||ac===bc||p.regions[a]===p.regions[b]||(Math.abs(ar-br)<=1&&Math.abs(ac-bc)<=1)){bad.add(a);bad.add(b)}}));return bad}
function time(){ $('#timer').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
function render(persist=true){
  const started=typeof performance!=='undefined'?performance.now():0;
  const wasWon=won,p=LEVELS[idx],n=p.n,bad=conflicts(),count=cells.filter(v=>v===1).length,board=$('#board');
  won=!failed&&count===n&&!bad.size;
  $('#mistakes').textContent=`${mistakes} / 3`;$('#hearts').textContent='❤️'.repeat(3-mistakes)+'💔'.repeat(mistakes);
  $('#count').textContent=count+' / '+n;$('#tag').textContent=`第 ${idx+1} / ${LEVELS.length} 關`;
  if(won&&!completed.includes(idx))completed.push(idx);
  renderLevelPicker();
  if(renderedLevel!==idx||board.children.length!==n*n){
    board.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;board.style.gridTemplateRows=`repeat(${n},minmax(0,1fr))`;
    board.replaceChildren();renderedValues=[];renderedBad=[];renderedLevel=idx;renderStats.boardBuilds++;
    for(let i=0;i<n*n;i++){
      const b=document.createElement('button');b.type='button';b.dataset.index=i;
      b.style.background=colors[p.regions[i]];b.style.setProperty?.('--region-color',colors[p.regions[i]]);
      b.onclick=e=>clickCell(i,e);b.ondblclick=e=>e.preventDefault();
      b.oncontextmenu=e=>{e.preventDefault();if(drag)return;lastTap=null;lastStroke=null;edit(i,2)};
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
      b.setAttribute('aria-label',`第 ${Math.floor(i/n)+1} 行，第 ${i%n+1} 列，區域 ${p.regions[i]+1}：${v===1?'班導':v===3?'錯誤位置':v===2?'排除':'空白'}`);
    }
    renderedValues[i]=v;renderedBad[i]=isBad;renderStats.cellUpdates++;
  });
  $('#message').className=failed?'failure':won?'win':'';
  $('#message').textContent=failed?'💔 已犯錯 3 次，這局挑戰失敗。點「重來」再試一次！':won?'🎉 全部找到！慶祝 5 秒後，自動進入下一關。':bad.size?'有班導太靠近，或位於同一行、列、區域。':'讓所有班導找到自己的位置吧！';
  time();if(persist)save();if(!won)hideCelebration();else if(!wasWon&&celebrationReady)celebrate();if(failed)showFailure();
  board.dataset.buildCount=String(renderStats.boardBuilds);board.dataset.cellUpdates=String(renderStats.cellUpdates);
  if(typeof performance!=='undefined')board.dataset.renderMs=(performance.now()-started).toFixed(3);
}
function clickCell(i,e){if(won||failed||(e.detail!==0&&e.timeStamp<=suppressClickUntil))return;lastStroke=null;if(e.detail===0){lastTap=null;edit(i,e.shiftKey?1:2);return}const now=e.timeStamp;if(lastTap&&lastTap.i===i&&now-lastTap.time<=350){cells=lastTap.before;history.pop();lastTap=null;edit(i,1)}else{const before=[...cells];edit(i,2);lastTap={i,time:now,before}}}
function edit(i,m){if(won||failed)return;history.push([...cells]);if(m===1&&cells[i]!==1&&LEVELS[idx].solution[Math.floor(i/LEVELS[idx].n)]!==i%LEVELS[idx].n){cells[i]=3;mistakes++;failed=mistakes>=3;render();const tile=$('#board').children[i];const heart=document.createElement('span');heart.className='heartbreak';heart.textContent='💔';tile.append(heart);showMistakeFeedback();if(!failed)$('#message').textContent=`💔 這格不是班導的位置，犯錯 ${mistakes} / 3 次。`}else{cells[i]=cells[i]===m?0:m;render();}$('#board').children[i].focus({preventScroll:true})}
function load(i){lastStroke=null;failureShown=false;$('#failure-dialog').close();if(errorTimer!==null)clearTimeout(errorTimer);errorTimer=null;$('#error-feedback').hidden=true;hideCelebration();mistakes=0;failed=false;drag=null;suppressClickUntil=-1;lastTap=null;idx=i;cells=Array(LEVELS[i].n**2).fill(0);history=[];seconds=0;won=false;render()}
$('#undo').onclick=()=>{if(failed)return;lastTap=null;lastStroke=null;if(history.length){cells=history.pop();render()}};$('#reset').onclick=()=>load(idx);function applyHint(){lastTap=null;if(won||failed)return;let p=LEVELS[idx],wrong=cells.findIndex((v,i)=>v===1&&p.solution[Math.floor(i/p.n)]!==i%p.n);history.push([...cells]);if(wrong>=0){cells[wrong]=2;render();$('#message').textContent='☀ 這個位置不適合班導，已替你做上排除記號。';return}let r=p.solution.findIndex((c,r)=>cells[r*p.n+c]!==1);if(r>=0){let i=r*p.n+p.solution[r];cells[i]=1;render();if(!won)$('#message').textContent=`☀ 第 ${r+1} 行的班導找到位置了！`}};$('#hint').onclick=applyHint;$('#help').onclick=()=>$('#rules').showModal();$('#close').onclick=$('#start').onclick=()=>$('#rules').close();setInterval(()=>{if(!won&&!failed&&document.visibilityState==='visible'&&(typeof mobileGameIsActive==='undefined'||mobileGameIsActive())){seconds++;time();save()}},1000);if(!cells.length)cells=Array(LEVELS[idx].n**2).fill(0);render();if(restoredErrors&&!failed)$('#message').textContent=`💔 已核對舊進度：${restoredErrors} 位班導位置錯誤，已改為紅色 ×；犯錯 ${mistakes} / 3。`;celebrationReady=true;


// Mark first; only a deliberate hold or a repeated matching stroke erases existing marks.
function paintExcluded(indices,visited=new Set(),intent='mark'){
  let changed=false;
  for(const i of indices){
    if(!Number.isInteger(i)||i<0||i>=cells.length||visited.has(i))continue;
    visited.add(i);
    if(intent==='erase'&&cells[i]===2){cells[i]=0;changed=true}
    else if(intent==='mark'&&cells[i]===0){cells[i]=2;changed=true}
  }
  return changed;
}
function repeatedStroke(previous,current,before,stamp){
  if(!previous||stamp-previous.time<0||stamp-previous.time>2500||current.length<2)return false;
  if(!current.every(i=>before[i]===2))return false;
  const a=new Set(previous.indices),b=new Set(current),overlap=[...b].filter(i=>a.has(i)).length;
  return overlap/Math.max(a.size,b.size)>=.8;
}
const board=$('#board');
board.onpointerdown=e=>{
  if(won||failed||e.button!==0||e.isPrimary===false)return;
  const tile=e.target.closest('.cell');if(!tile)return;
  let geometry=null;const n=LEVELS[idx].n,first=board.children[0],next=board.children[1];
  if(first?.getBoundingClientRect&&next?.getBoundingClientRect){const r=first.getBoundingClientRect(),q=next.getBoundingClientRect();geometry={x:r.x,y:r.y,pitch:q.x-r.x,n}}
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:+tile.dataset.index,before:[...cells],active:false,changed:false,visited:new Set(),geometry,downTime:e.timeStamp??0,intent:'mark'};
};
function pathIndex(x,y,d){
  if(d.geometry){const g=d.geometry,c=Math.floor((x-g.x)/g.pitch),r=Math.floor((y-g.y)/g.pitch);return c>=0&&r>=0&&c<g.n&&r<g.n?r*g.n+c:-1}
  const tile=document.elementFromPoint(x,y)?.closest('.cell');return tile&&board.contains(tile)?+tile.dataset.index:-1;
}
board.onpointermove=e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const d=drag,dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!d.active&&Math.hypot(dx,dy)<(e.pointerType==='touch'?4:8))return;
  if(!d.active){d.active=true;lastTap=null;if(d.before[d.start]===2&&(e.timeStamp??0)-d.downTime>=450)d.intent='erase';board.setPointerCapture(e.pointerId)}
  e.preventDefault();const indices=[d.start],step=d.geometry?Math.max(4,d.geometry.pitch/3):8,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/step));
  for(let k=0;k<=steps;k++)indices.push(pathIndex(d.x+dx*k/steps,d.y+dy*k/steps,d));
  if(paintExcluded(indices,d.visited,d.intent)){if(!d.changed){history.push(d.before);d.changed=true}render(false)}
  d.x=e.clientX;d.y=e.clientY;
};
function finishDrag(e,cancelled=false){
  if(!drag||drag.id!==e.pointerId)return;
  const d=drag;drag=null;
  if(d.active){
    const indices=[...d.visited].filter(i=>d.before[i]===0||d.before[i]===2),stamp=e.timeStamp??0;
    if(!cancelled&&d.intent==='mark'&&repeatedStroke(lastStroke,indices,d.before,stamp)){
      if(!d.changed){history.push(d.before);d.changed=true}
      for(const i of indices)if(cells[i]===2)cells[i]=0;
      d.intent='erase';render(false);
    }
    lastStroke=cancelled||d.intent==='erase'?null:{indices,time:stamp};
    suppressClickUntil=stamp+350;lastTap=null;
    if(board.hasPointerCapture(e.pointerId))board.releasePointerCapture(e.pointerId);
    if(d.changed)save();
  }
}
board.onpointerup=e=>{if(drag?.active)board.onpointermove(e);finishDrag(e)};
board.onpointercancel=e=>finishDrag(e,true);
board.onlostpointercapture=e=>finishDrag(e,true);

function difficultyOf(i){return LEVELS[i].difficulty??Math.floor(i/6)}
function groupLevels(d){return LEVELS.flatMap((p,i)=>difficultyOf(i)===d?[i]:[])}
function renderLevelPicker(){
  const list=$('#level-select'),version=LEVELS.length+':'+completed.join(',');
  if(pickerVersion!==version||list.children.length!==LEVELS.length){
    list.replaceChildren();LEVELS.forEach((p,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=`${completed.includes(i)?'✓ ':''}第 ${i+1} / ${LEVELS.length} 關`;list.append(option)});
    pickerVersion=version;renderStats.pickerBuilds++;list.dataset.buildCount=String(renderStats.pickerBuilds);
  }
  list.value=String(idx);list.onchange=()=>{const chosen=Number(list.value);if(Number.isInteger(chosen)&&LEVELS[chosen])load(chosen)};
}
