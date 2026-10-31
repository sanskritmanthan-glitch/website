/* Sanskrit Manthan service worker — works offline with what you have opened, and with bundles saved from Bodhinī's menu. */
const V='sm-v3', CORE=['/','/index.html','/books.html','/shloka.html','/sutra.html','/kosha.html','/vyakarana.html','/krida.html','/greetings.html','/offline.html',
 '/sri.js','/sri-books.json','/sri-learn.json','/ix.js','/g/slokas.json','/manifest.webmanifest','/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&!k.startsWith('sm-data')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const isData=u=>/\.(json|wasm)$/.test(u.pathname)||/\/(cv|g)\//.test(u.pathname);
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin){ // fonts: cache once
    if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(caches.open('sm-data-fonts').then(c=>c.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok||x.type==='opaque')c.put(r,x.clone());return x}))));
    return}
  if(r.mode==='navigate'){ // pages: network first, cache fallback, offline page last
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(k=>k.put(r,c));return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match(u.pathname+'.html')||caches.match('/offline.html'))));return}
  if(u.pathname.startsWith('/api/'))return;
  if(isData(u)){ // data: cache first (indexes rarely change), refresh in background
    e.respondWith(caches.match(r).then(h=>{const f=fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open('sm-data').then(k=>k.put(r,c))}return x}).catch(()=>h);return h||f}));return}
  e.respondWith(caches.match(r).then(h=>{const f=fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(k=>k.put(r,c))}return x}).catch(()=>h);return h||f}))});
/* bundles for offline use, requested from the page */
self.addEventListener('message',async e=>{const m=e.data||{};if(m.type!=='bundle')return;const c=await caches.open('sm-data');let done=0;
  for(const u of m.urls){try{if(!(await c.match(u))){const x=await fetch(u);if(x.ok)await c.put(u,x)}}catch(err){}done++;if(done%10===0||done===m.urls.length)e.source&&e.source.postMessage({type:'bundle-progress',done,total:m.urls.length,name:m.name})}});
