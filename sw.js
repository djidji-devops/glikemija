var CACHE = 'glikemija-v1';
var LJUSKA = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(LJUSKA); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (k) {
      return Promise.all(k.filter(function (x) { return x !== CACHE; })
        .map(function (x) { return caches.delete(x); }));
    })
  );
  self.clients.claim();
});

// Mreža prvo, keš samo kao rezerva (aplikacija sama živi na Google serveru)
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var kopija = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopija); });
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (r) {
        return r || caches.match('./index.html');
      });
    })
  );
});
