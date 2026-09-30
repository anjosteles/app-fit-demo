/* Cache restrito a este app e ao seu caminho. Não apagar caches de outros apps. */
const RELEASE = 'v2.4.0-modo-prova';
const ROOT = self.registration.scope;
const PREFIX = 'fps-' + encodeURIComponent(new URL(ROOT).pathname) + '-';
const CACHE = PREFIX + RELEASE;
const PATHS = ['index.html','manifest.webmanifest','assets/logo.png','assets/icon-192.png','assets/icon-512.png'];
const ASSETS = PATHS.map(p => new URL(p, ROOT).href);
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
 const u = new URL(e.request.url);
 if(e.request.method !== 'GET' || u.origin !== self.location.origin) return;
 const isHome = u.pathname === new URL(ROOT).pathname || u.pathname === new URL('index.html',ROOT).pathname;
 if(e.request.mode === 'navigate' && isHome){
  e.respondWith((async () => {
   const cache = await caches.open(CACHE);
   try{const r = await fetch(e.request,{cache:'no-cache'});if(r.ok){await cache.put(new URL('index.html',ROOT).href,r.clone());return r}const saved=await cache.match(new URL('index.html',ROOT).href);return saved||r;}
   catch(err){return await cache.match(new URL('index.html',ROOT).href) || new Response('Conecte-se uma vez para preparar o modo offline.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
  })()); return;
 }
 if(ASSETS.includes(u.href))e.respondWith(caches.open(CACHE).then(async c => (await c.match(e.request)) || fetch(e.request)));
});
