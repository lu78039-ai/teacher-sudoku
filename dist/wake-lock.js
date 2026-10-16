const screenAwake = {lock:null,pending:false,enabled:true,retryAfter:0};
function gameNeedsScreen() {
  return screenAwake.enabled && document.visibilityState === 'visible' && !won && !failed &&
    (typeof mobileGameIsActive !== 'function' || mobileGameIsActive());
}
function screenAwakeStatus(text) {
  const status = document.querySelector('#wake-status');
  if (status) status.textContent = text;
}
async function syncWakeLock() {
  if (typeof navigator === 'undefined' || !navigator.wakeLock) {
    screenAwakeStatus('此瀏覽器不支援保持亮屏，可調整手機的螢幕逾時設定。');return;
  }
  if (!gameNeedsScreen()) {
    const previous = screenAwake.lock;screenAwake.lock=null;
    if (previous && !previous.released) try { await previous.release(); } catch {}
    screenAwakeStatus(screenAwake.enabled?'進入遊戲後嘗試保持螢幕亮著。':'已關閉保持亮屏。');return;
  }
  if (screenAwake.pending || (screenAwake.lock && !screenAwake.lock.released) || Date.now()<screenAwake.retryAfter) return;
  screenAwake.pending=true;
  try {
    const lock=await navigator.wakeLock.request('screen');
    if (!gameNeedsScreen()) { await lock.release();return; }
    screenAwake.lock=lock;
    screenAwakeStatus('遊玩時保持亮屏已啟用。');
    lock.addEventListener('release',()=>{
      if(screenAwake.lock===lock)screenAwake.lock=null;
      screenAwakeStatus('系統已釋放亮屏保護；回到遊戲時會再次嘗試。');
    });
  } catch {
    screenAwake.retryAfter=Date.now()+30000;
    screenAwakeStatus('系統目前不允許保持亮屏，請檢查省電模式與螢幕逾時設定。');
  } finally { screenAwake.pending=false; }
}
(() => {
  try { screenAwake.enabled=localStorage.getItem('teacher-keep-awake')!=='false'; } catch {}
  const toggle=document.querySelector('#keep-awake');
  if(toggle){toggle.checked=screenAwake.enabled;toggle.onchange=()=>{
    screenAwake.enabled=toggle.checked;screenAwake.retryAfter=0;
    try{localStorage.setItem('teacher-keep-awake',String(toggle.checked))}catch{}
    syncWakeLock();
  };}
  document.addEventListener('visibilitychange',()=>{screenAwake.retryAfter=0;syncWakeLock()});
  document.addEventListener('pointerdown',syncWakeLock,{passive:true});
  window.addEventListener('pagehide',()=>{screenAwake.lock?.release().catch(()=>{})});
  syncWakeLock();
})();
