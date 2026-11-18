var V = 'rudi-9ab1d21b66';
var CORE = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
var AUDIO = ["voz/p0-a6ee6449.bin", "voz/p1-a6ee6449.bin", "voz/p10-a6ee6449.bin", "voz/p11-a6ee6449.bin", "voz/p12-a6ee6449.bin", "voz/p13-a6ee6449.bin", "voz/p14-a6ee6449.bin", "voz/p15-a6ee6449.bin", "voz/p2-a6ee6449.bin", "voz/p3-a6ee6449.bin", "voz/p4-a6ee6449.bin", "voz/p5-a6ee6449.bin", "voz/p6-a6ee6449.bin", "voz/p7-a6ee6449.bin", "voz/p8-a6ee6449.bin", "voz/p9-a6ee6449.bin"];
function fresh(u) { return new Request(u, { cache: 'reload' }); }
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE.map(fresh)); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () {
    // descarga en segundo plano todas las voces para jugar sin conexión
    return caches.open(V).then(function (c) { AUDIO.forEach(function (u) { c.match(u).then(function (r) { if (!r) c.add(fresh(u)).catch(function () {}); }); }); });
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || req.url.indexOf(self.location.origin) !== 0) return;
  var isPage = req.mode === 'navigate' || /\/(index\.html)?(\?.*)?$/.test(req.url) || /sw\.js|manifest\.json/.test(req.url);
  if (isPage) {
    // la página siempre se pide primero a internet: así se ve la versión nueva en cuanto se publica
    e.respondWith(fetch(req, { cache: 'no-store' }).then(function (resp) {
      if (resp && resp.status === 200) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(req, cp); }); }
      return resp;
    }).catch(function () { return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) {
    return r || fetch(req).then(function (resp) {
      if (resp && resp.status === 200) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(req, cp); }); }
      return resp;
    });
  }));
});
