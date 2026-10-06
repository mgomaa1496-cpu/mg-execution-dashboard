const CACHE='mg-exec-v2.4';
const SHELL=['./index.html','./app.js','./manifest.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mg-exec-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.mode==='navigate'){
    const pageUrl=new URL(event.request.url);
    if(pageUrl.pathname.endsWith('/'))pageUrl.pathname+='index.html';
    event.respondWith(fetch(pageUrl.href).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
