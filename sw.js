/* R2Rnet Community REAL user PWA: never cache authenticated API, clinical or account data. */
const CACHE_PREFIX='r2r-community-restored-auth-';
const CACHE_NAME=CACHE_PREFIX+'20261110-1';
const BASE=self.registration.scope;
const OFFLINE_URL=new URL('offline.html',BASE).href;
const STATIC_ASSETS=[OFFLINE_URL,new URL('ir-mark.svg',BASE).href,
  new URL('pwa/icon-192.png',BASE).href,
  new URL('pwa/icon-512.png',BASE).href];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(
  STATIC_ASSETS.map(url=>new Request(url,{credentials:'omit',cache:'reload'}))
 )).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(names=>Promise.all(names
  .filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME)
  .map(name=>caches.delete(name)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(url.pathname.includes('/api/')||url.pathname.includes('/auth/'))return;
 if(request.mode==='navigate'){
   event.respondWith(fetch(new Request(request,{cache:'no-store'}))
    .catch(async()=>await caches.match(OFFLINE_URL)||new Response(
      'Connection required to use R2Rnet Community.',{status:503})));
   return;
 }
 if(!STATIC_ASSETS.includes(url.href))return;
 event.respondWith(caches.match(url.href).then(hit=>hit||fetch(request)));
});
