var V = 'rudi-af10467873';
var CORE = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
var AUDIO = ["voz/p0.bin", "voz/p1.bin", "voz/p2.bin", "voz/p3.bin"];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () {
    // descarga en segundo plano todas las voces para jugar sin conexión
    return caches.open(V).then(function (c) { AUDIO.forEach(function (u) { c.match(u).then(function (r) { if (!r) c.add(u).catch(function () {}); }); }); });
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request).then(function (resp) {
      if (resp && resp.status === 200 && e.request.url.indexOf(self.location.origin) === 0) { var cp = resp.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); }
      return resp;
    });
  }).catch(function () { return caches.match('index.html'); }));
});
