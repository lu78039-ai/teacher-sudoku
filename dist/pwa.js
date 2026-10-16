// PWA support must not block normal gameplay or file:// previews.
(() => {
  if (!('serviceWorker' in navigator) || !['http:','https:'].includes(location.protocol)) return;
  const scriptURL = new URL('sw.js', document.currentScript.src);
  let registration, accepted = false, reloadOnly = false;
  const box = document.createElement('div');
  box.id = 'pwa-update'; box.hidden = true;
  box.setAttribute('role','status');
  const label = document.createElement('span'); label.textContent = '新版已準備好，進度會保留。';
  const update = document.createElement('button'); update.textContent = '更新';
  const later = document.createElement('button'); later.textContent = '稍後';
  box.append(label,update,later); document.body.append(box);
  function preserveProgress() { if (typeof save === 'function') save(); }
  function offer() { box.hidden = false; }
  update.onclick = () => {
    preserveProgress();
    if (reloadOnly) { location.reload(); return; }
    if (registration?.waiting) { accepted = true; registration.waiting.postMessage({type:'ACTIVATE_UPDATE'}); }
  };
  later.onclick = () => { box.hidden = true; };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (accepted) { accepted = false; preserveProgress(); location.reload(); }
    else if (navigator.serviceWorker.controller && document.body.dataset.pwaReady === 'true') { reloadOnly = true; offer(); }
    document.body.dataset.pwaReady = 'true';
  });
  if (navigator.serviceWorker.controller) document.body.dataset.pwaReady = 'true';
  function connect(reg) {
    if (!reg || registration === reg) return;
    registration = reg;
    if (reg.waiting) offer();
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) offer(); });
    });
  }
  async function check() {
    if (!navigator.onLine) return;
    try {
      // Recover an existing registration even if an offline register() rejected.
      if (!registration) connect(await navigator.serviceWorker.getRegistration(scriptURL.href));
      if (!registration) return;
      await registration.update(); if (registration.waiting) offer();
    } catch (error) { console.info('PWA: update check deferred until online.',error); }
  }
  navigator.serviceWorker.register(scriptURL.href, {scope:new URL('./',scriptURL).href, updateViaCache:'none'}).then(reg => {
    connect(reg);
    check();
  }).catch(error => { console.warn('PWA: service worker registration failed.',error); check(); });
  window.addEventListener('online',check);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
})();
