// Presentation-only mobile navigation. Never resets or rewrites game progress.
function mobileGameIsActive() {
  return !window.matchMedia('(max-width: 1199px)').matches || document.body.dataset.mobileView === 'game';
}
(function setupMobileUI() {
  let remembered = 'home';
  try { remembered = sessionStorage.getItem('teacher-mobile-view') || 'home'; } catch {}
  function show(view) {
    document.body.dataset.mobileView = view === 'game' ? 'game' : 'home';
    try { sessionStorage.setItem('teacher-mobile-view', document.body.dataset.mobileView); } catch {}
    window.scrollTo({top: 0, behavior: 'instant'});
    if(typeof syncWakeLock==='function')syncWakeLock();
    if (view === 'game') document.querySelector('#mobile-back').focus({preventScroll: true});
  }
  document.body.dataset.mobileView = remembered === 'game' ? 'game' : 'home';
  document.querySelector('#mobile-begin').onclick = () => show('game');
  document.querySelector('#mobile-back').onclick = () => show('home');
  const settings = document.querySelector('#mobile-settings-dialog');
  const rules = document.querySelector('#rules');
  document.querySelector('#mobile-settings').onclick = () => settings.showModal();
  document.querySelector('#desktop-settings').onclick = () => settings.showModal();
  const sound = document.querySelector('#sound-enabled');
  sound.checked = soundEnabled;
  sound.onchange = () => { soundEnabled = sound.checked; try { localStorage.setItem('teacher-sound', soundEnabled ? 'on' : 'off'); } catch {} if(soundEnabled)playGameSound('teacher'); }; 
  document.querySelector('#mobile-settings-close').onclick = () => settings.close();
  document.querySelector('#toolbar-rules').onclick = () => rules.showModal();
  document.querySelector('#settings-rules').onclick = () => { settings.close(); rules.showModal(); };
  const motion = document.querySelector('#mobile-motion');
  try { motion.checked = localStorage.getItem('teacher-reduced-motion') === 'true'; } catch {}
  document.body.classList.toggle('reduced-motion', motion.checked);
  motion.onchange = () => {
    document.body.classList.toggle('reduced-motion', motion.checked);
    try { localStorage.setItem('teacher-reduced-motion', String(motion.checked)); } catch {}
  };
})();
